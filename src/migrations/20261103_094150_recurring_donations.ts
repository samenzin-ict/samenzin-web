import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recurring_donations_kind" AS ENUM('monthly', 'periodic');
  CREATE TYPE "public"."enum_recurring_donations_status" AS ENUM('draft', 'invited', 'pending', 'active', 'stopped', 'failed', 'completed');
  CREATE TYPE "public"."enum_recurring_donations_interval" AS ENUM('monthly', 'yearly');
  CREATE TYPE "public"."enum_recurring_donations_stopped_by" AS ENUM('donor', 'admin', 'mollie');
  ALTER TYPE "public"."enum_donations_status" ADD VALUE 'charged_back';
  CREATE TABLE "recurring_donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_recurring_donations_kind" DEFAULT 'periodic' NOT NULL,
  	"status" "enum_recurring_donations_status" DEFAULT 'draft' NOT NULL,
  	"agreement_received" boolean DEFAULT false,
  	"agreement_date" timestamp(3) with time zone,
  	"donor_name" varchar,
  	"donor_email" varchar,
  	"amount" numeric NOT NULL,
  	"interval" "enum_recurring_donations_interval" DEFAULT 'monthly' NOT NULL,
  	"project_id" integer,
  	"fund" varchar,
  	"start_date" varchar,
  	"next_payment_date" varchar,
  	"ended_on" varchar,
  	"total_terms" numeric,
  	"stopped_by" "enum_recurring_donations_stopped_by",
  	"stop_reason" varchar,
  	"notified_for" varchar,
  	"mollie_customer_id" varchar,
  	"mollie_mandate_id" varchar,
  	"mollie_subscription_id" varchar,
  	"access_key" varchar,
  	"delete_after" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "donations" ADD COLUMN "recurring_donation_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recurring_donations_id" integer;
  ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "recurring_donations_status_idx" ON "recurring_donations" USING btree ("status");
  CREATE INDEX "recurring_donations_project_idx" ON "recurring_donations" USING btree ("project_id");
  CREATE INDEX "recurring_donations_next_payment_date_idx" ON "recurring_donations" USING btree ("next_payment_date");
  CREATE INDEX "recurring_donations_mollie_customer_id_idx" ON "recurring_donations" USING btree ("mollie_customer_id");
  CREATE UNIQUE INDEX "recurring_donations_mollie_subscription_id_idx" ON "recurring_donations" USING btree ("mollie_subscription_id");
  CREATE UNIQUE INDEX "recurring_donations_access_key_idx" ON "recurring_donations" USING btree ("access_key");
  CREATE INDEX "recurring_donations_updated_at_idx" ON "recurring_donations" USING btree ("updated_at");
  CREATE INDEX "recurring_donations_created_at_idx" ON "recurring_donations" USING btree ("created_at");
  ALTER TABLE "donations" ADD CONSTRAINT "donations_recurring_donation_id_recurring_donations_id_fk" FOREIGN KEY ("recurring_donation_id") REFERENCES "public"."recurring_donations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recurring_donations_fk" FOREIGN KEY ("recurring_donations_id") REFERENCES "public"."recurring_donations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "donations_recurring_donation_idx" ON "donations" USING btree ("recurring_donation_id");
  CREATE INDEX "payload_locked_documents_rels_recurring_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("recurring_donations_id");`)
}

/*
 * Edited by hand. The generated version dropped the table with CASCADE first,
 * which takes the foreign keys with it, and then failed dropping them again.
 * Here the keys go first. A charged-back donation has no status in the old
 * type; it goes back as "failed", the nearest thing that does not count as
 * money received.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "donations" DROP CONSTRAINT "donations_recurring_donation_id_recurring_donations_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_recurring_donations_fk";
  DROP INDEX "donations_recurring_donation_idx";
  DROP INDEX "payload_locked_documents_rels_recurring_donations_id_idx";
  ALTER TABLE "donations" DROP COLUMN "recurring_donation_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "recurring_donations_id";
  DROP TABLE "recurring_donations";
  ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'open'::text;
  UPDATE "donations" SET "status" = 'failed' WHERE "status" = 'charged_back';
  DROP TYPE "public"."enum_donations_status";
  CREATE TYPE "public"."enum_donations_status" AS ENUM('open', 'pending', 'paid', 'canceled', 'expired', 'failed');
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."enum_donations_status";
  ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_donations_status" USING "status"::"public"."enum_donations_status";
  DROP TYPE "public"."enum_recurring_donations_kind";
  DROP TYPE "public"."enum_recurring_donations_status";
  DROP TYPE "public"."enum_recurring_donations_interval";
  DROP TYPE "public"."enum_recurring_donations_stopped_by";`)
}

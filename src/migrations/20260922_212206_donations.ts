import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_donations_status" AS ENUM('open', 'pending', 'paid', 'canceled', 'expired', 'failed');
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mollie_payment_id" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"status" "enum_donations_status" DEFAULT 'open' NOT NULL,
  	"fund" varchar,
  	"anonymous" boolean DEFAULT false,
  	"donor_name" varchar,
  	"donor_email" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "donations_id" integer;
  CREATE UNIQUE INDEX "donations_mollie_payment_id_idx" ON "donations" USING btree ("mollie_payment_id");
  CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "donations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_donations_fk";
  
  DROP INDEX "payload_locked_documents_rels_donations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "donations_id";
  DROP TYPE "public"."enum_donations_status";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_membership_applications_status" AS ENUM('aangevraagd', 'goedgekeurd', 'afgewezen');
  CREATE TABLE "membership_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"motivation" varchar,
  	"status" "enum_membership_applications_status" DEFAULT 'aangevraagd' NOT NULL,
  	"notes" varchar,
  	"delete_after" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_applications_id" integer;
  CREATE INDEX "membership_applications_status_idx" ON "membership_applications" USING btree ("status");
  CREATE INDEX "membership_applications_updated_at_idx" ON "membership_applications" USING btree ("updated_at");
  CREATE INDEX "membership_applications_created_at_idx" ON "membership_applications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_applications_fk" FOREIGN KEY ("membership_applications_id") REFERENCES "public"."membership_applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_membership_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_applications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membership_applications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "membership_applications" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_applications_fk";
  
  DROP INDEX "payload_locked_documents_rels_membership_applications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_applications_id";
  DROP TYPE "public"."enum_membership_applications_status";`)
}

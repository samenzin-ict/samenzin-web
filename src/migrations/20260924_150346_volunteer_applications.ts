import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "volunteer_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"interest_id" integer,
  	"message" varchar,
  	"handled" boolean DEFAULT false,
  	"delete_after" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "volunteer_applications_id" integer;
  ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_interest_id_projects_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "volunteer_applications_interest_idx" ON "volunteer_applications" USING btree ("interest_id");
  CREATE INDEX "volunteer_applications_updated_at_idx" ON "volunteer_applications" USING btree ("updated_at");
  CREATE INDEX "volunteer_applications_created_at_idx" ON "volunteer_applications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_applications_fk" FOREIGN KEY ("volunteer_applications_id") REFERENCES "public"."volunteer_applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_volunteer_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_applications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "volunteer_applications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "volunteer_applications" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_volunteer_applications_fk";
  
  DROP INDEX "payload_locked_documents_rels_volunteer_applications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "volunteer_applications_id";`)
}

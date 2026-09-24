import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_volunteer_hours_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TABLE "volunteer_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"hours" numeric NOT NULL,
  	"activity" varchar NOT NULL,
  	"commission" "enum_volunteer_hours_commission",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "volunteer_hours_id" integer;
  ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "volunteer_hours_member_idx" ON "volunteer_hours" USING btree ("member_id");
  CREATE INDEX "volunteer_hours_date_idx" ON "volunteer_hours" USING btree ("date");
  CREATE INDEX "volunteer_hours_commission_idx" ON "volunteer_hours" USING btree ("commission");
  CREATE INDEX "volunteer_hours_updated_at_idx" ON "volunteer_hours" USING btree ("updated_at");
  CREATE INDEX "volunteer_hours_created_at_idx" ON "volunteer_hours" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_hours_fk" FOREIGN KEY ("volunteer_hours_id") REFERENCES "public"."volunteer_hours"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_volunteer_hours_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_hours_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "volunteer_hours" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "volunteer_hours" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_volunteer_hours_fk";
  
  DROP INDEX "payload_locked_documents_rels_volunteer_hours_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "volunteer_hours_id";
  DROP TYPE "public"."enum_volunteer_hours_commission";`)
}

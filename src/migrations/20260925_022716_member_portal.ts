import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_member_tasks_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_members_member_role" AS ENUM('vrijwilliger', 'lid', 'bestuur');
  CREATE TYPE "public"."enum_members_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TABLE "member_tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"commission" "enum_member_tasks_commission",
  	"due_at" timestamp(3) with time zone,
  	"done" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_enrolments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"progress" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"event_id" integer NOT NULL,
  	"attended" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "members" ADD COLUMN "member_role" "enum_members_member_role" DEFAULT 'vrijwilliger';
  ALTER TABLE "members" ADD COLUMN "commission" "enum_members_commission";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "member_tasks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_enrolments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_registrations_id" integer;
  ALTER TABLE "member_tasks" ADD CONSTRAINT "member_tasks_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_enrolments" ADD CONSTRAINT "course_enrolments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_enrolments" ADD CONSTRAINT "course_enrolments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "member_tasks_member_idx" ON "member_tasks" USING btree ("member_id");
  CREATE INDEX "member_tasks_due_at_idx" ON "member_tasks" USING btree ("due_at");
  CREATE INDEX "member_tasks_done_idx" ON "member_tasks" USING btree ("done");
  CREATE INDEX "member_tasks_updated_at_idx" ON "member_tasks" USING btree ("updated_at");
  CREATE INDEX "member_tasks_created_at_idx" ON "member_tasks" USING btree ("created_at");
  CREATE INDEX "course_enrolments_member_idx" ON "course_enrolments" USING btree ("member_id");
  CREATE INDEX "course_enrolments_course_idx" ON "course_enrolments" USING btree ("course_id");
  CREATE INDEX "course_enrolments_updated_at_idx" ON "course_enrolments" USING btree ("updated_at");
  CREATE INDEX "course_enrolments_created_at_idx" ON "course_enrolments" USING btree ("created_at");
  CREATE INDEX "event_registrations_member_idx" ON "event_registrations" USING btree ("member_id");
  CREATE INDEX "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");
  CREATE INDEX "event_registrations_updated_at_idx" ON "event_registrations" USING btree ("updated_at");
  CREATE INDEX "event_registrations_created_at_idx" ON "event_registrations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_tasks_fk" FOREIGN KEY ("member_tasks_id") REFERENCES "public"."member_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_enrolments_fk" FOREIGN KEY ("course_enrolments_id") REFERENCES "public"."course_enrolments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_registrations_fk" FOREIGN KEY ("event_registrations_id") REFERENCES "public"."event_registrations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_member_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("member_tasks_id");
  CREATE INDEX "payload_locked_documents_rels_course_enrolments_id_idx" ON "payload_locked_documents_rels" USING btree ("course_enrolments_id");
  CREATE INDEX "payload_locked_documents_rels_event_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("event_registrations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "member_tasks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_enrolments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_registrations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "member_tasks" CASCADE;
  DROP TABLE "course_enrolments" CASCADE;
  DROP TABLE "event_registrations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_member_tasks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_enrolments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_registrations_fk";
  
  DROP INDEX "payload_locked_documents_rels_member_tasks_id_idx";
  DROP INDEX "payload_locked_documents_rels_course_enrolments_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_registrations_id_idx";
  ALTER TABLE "members" DROP COLUMN "member_role";
  ALTER TABLE "members" DROP COLUMN "commission";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "member_tasks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_enrolments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_registrations_id";
  DROP TYPE "public"."enum_member_tasks_commission";
  DROP TYPE "public"."enum_members_member_role";
  DROP TYPE "public"."enum_members_commission";`)
}

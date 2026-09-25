import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_volunteer_applications_vog_status" AS ENUM('niet-gestart', 'loopt', 'ok', 'niet-nodig');
  CREATE TYPE "public"."enum_vacancies_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_vacancies_kind" AS ENUM('vrijwillig', 'betaald', 'stage');
  CREATE TYPE "public"."enum_vacancies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__vacancies_v_version_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum__vacancies_v_version_kind" AS ENUM('vrijwillig', 'betaald', 'stage');
  CREATE TYPE "public"."enum__vacancies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__vacancies_v_published_locale" AS ENUM('nl');
  CREATE TABLE "vacancies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"commission" "enum_vacancies_commission",
  	"kind" "enum_vacancies_kind" DEFAULT 'vrijwillig',
  	"hours_per_week" varchar,
  	"closes_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_vacancies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "vacancies_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_vacancies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_commission" "enum__vacancies_v_version_commission",
  	"version_kind" "enum__vacancies_v_version_kind" DEFAULT 'vrijwillig',
  	"version_hours_per_week" varchar,
  	"version_closes_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__vacancies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__vacancies_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_vacancies_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "volunteer_applications" ADD COLUMN "vog_status" "enum_volunteer_applications_vog_status" DEFAULT 'niet-gestart';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vacancies_id" integer;
  ALTER TABLE "vacancies_locales" ADD CONSTRAINT "vacancies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vacancies_v" ADD CONSTRAINT "_vacancies_v_parent_id_vacancies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vacancies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vacancies_v_locales" ADD CONSTRAINT "_vacancies_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vacancies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "vacancies_commission_idx" ON "vacancies" USING btree ("commission");
  CREATE INDEX "vacancies_updated_at_idx" ON "vacancies" USING btree ("updated_at");
  CREATE INDEX "vacancies_created_at_idx" ON "vacancies" USING btree ("created_at");
  CREATE INDEX "vacancies__status_idx" ON "vacancies" USING btree ("_status");
  CREATE UNIQUE INDEX "vacancies_locales_locale_parent_id_unique" ON "vacancies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_vacancies_v_parent_idx" ON "_vacancies_v" USING btree ("parent_id");
  CREATE INDEX "_vacancies_v_version_version_commission_idx" ON "_vacancies_v" USING btree ("version_commission");
  CREATE INDEX "_vacancies_v_version_version_updated_at_idx" ON "_vacancies_v" USING btree ("version_updated_at");
  CREATE INDEX "_vacancies_v_version_version_created_at_idx" ON "_vacancies_v" USING btree ("version_created_at");
  CREATE INDEX "_vacancies_v_version_version__status_idx" ON "_vacancies_v" USING btree ("version__status");
  CREATE INDEX "_vacancies_v_created_at_idx" ON "_vacancies_v" USING btree ("created_at");
  CREATE INDEX "_vacancies_v_updated_at_idx" ON "_vacancies_v" USING btree ("updated_at");
  CREATE INDEX "_vacancies_v_snapshot_idx" ON "_vacancies_v" USING btree ("snapshot");
  CREATE INDEX "_vacancies_v_published_locale_idx" ON "_vacancies_v" USING btree ("published_locale");
  CREATE INDEX "_vacancies_v_latest_idx" ON "_vacancies_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_vacancies_v_locales_locale_parent_id_unique" ON "_vacancies_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vacancies_fk" FOREIGN KEY ("vacancies_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "volunteer_applications_vog_status_idx" ON "volunteer_applications" USING btree ("vog_status");
  CREATE INDEX "payload_locked_documents_rels_vacancies_id_idx" ON "payload_locked_documents_rels" USING btree ("vacancies_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vacancies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vacancies_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vacancies_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vacancies_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "vacancies" CASCADE;
  DROP TABLE "vacancies_locales" CASCADE;
  DROP TABLE "_vacancies_v" CASCADE;
  DROP TABLE "_vacancies_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vacancies_fk";
  
  DROP INDEX "volunteer_applications_vog_status_idx";
  DROP INDEX "payload_locked_documents_rels_vacancies_id_idx";
  ALTER TABLE "volunteer_applications" DROP COLUMN "vog_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vacancies_id";
  DROP TYPE "public"."enum_volunteer_applications_vog_status";
  DROP TYPE "public"."enum_vacancies_commission";
  DROP TYPE "public"."enum_vacancies_kind";
  DROP TYPE "public"."enum_vacancies_status";
  DROP TYPE "public"."enum__vacancies_v_version_commission";
  DROP TYPE "public"."enum__vacancies_v_version_kind";
  DROP TYPE "public"."enum__vacancies_v_version_status";
  DROP TYPE "public"."enum__vacancies_v_published_locale";`)
}

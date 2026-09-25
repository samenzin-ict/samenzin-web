import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_volunteer_applications_interests" AS ENUM('taalmaatje', 'onderwijs', 'evenementen', 'fondsenwerving', 'media', 'dames-activiteiten');
  CREATE TYPE "public"."enum_volunteer_applications_skills" AS ENUM('ontwerp', 'sociale-media', 'teksten-schrijven', 'taalcoaching', 'evenementenbeheer');
  CREATE TYPE "public"."enum_volunteer_applications_availability" AS ENUM('ma-ochtend', 'ma-middag', 'ma-avond', 'di-ochtend', 'di-middag', 'di-avond', 'wo-ochtend', 'wo-middag', 'wo-avond', 'do-ochtend', 'do-middag', 'do-avond', 'vr-ochtend', 'vr-middag', 'vr-avond', 'za-ochtend', 'za-middag', 'za-avond', 'zo-ochtend', 'zo-middag', 'zo-avond');
  CREATE TYPE "public"."enum_volunteer_applications_city" AS ENUM('tilburg', 'schiedam', 'rotterdam');
  CREATE TYPE "public"."enum_volunteer_applications_language_level" AS ENUM('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'moedertaal');
  CREATE TABLE "volunteer_applications_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteer_applications_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "volunteer_applications_skills" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteer_applications_skills",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "volunteer_applications_availability" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteer_applications_availability",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "volunteer_applications" ADD COLUMN "phone" varchar;
  ALTER TABLE "volunteer_applications" ADD COLUMN "city" "enum_volunteer_applications_city";
  ALTER TABLE "volunteer_applications" ADD COLUMN "language_level" "enum_volunteer_applications_language_level";
  ALTER TABLE "volunteer_applications_interests" ADD CONSTRAINT "volunteer_applications_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteer_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteer_applications_skills" ADD CONSTRAINT "volunteer_applications_skills_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteer_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteer_applications_availability" ADD CONSTRAINT "volunteer_applications_availability_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteer_applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "volunteer_applications_interests_order_idx" ON "volunteer_applications_interests" USING btree ("order");
  CREATE INDEX "volunteer_applications_interests_parent_idx" ON "volunteer_applications_interests" USING btree ("parent_id");
  CREATE INDEX "volunteer_applications_interests_value_idx" ON "volunteer_applications_interests" USING btree ("value");
  CREATE INDEX "volunteer_applications_skills_order_idx" ON "volunteer_applications_skills" USING btree ("order");
  CREATE INDEX "volunteer_applications_skills_parent_idx" ON "volunteer_applications_skills" USING btree ("parent_id");
  CREATE INDEX "volunteer_applications_availability_order_idx" ON "volunteer_applications_availability" USING btree ("order");
  CREATE INDEX "volunteer_applications_availability_parent_idx" ON "volunteer_applications_availability" USING btree ("parent_id");
  CREATE INDEX "volunteer_applications_city_idx" ON "volunteer_applications" USING btree ("city");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "volunteer_applications_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_applications_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_applications_availability" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "volunteer_applications_interests" CASCADE;
  DROP TABLE "volunteer_applications_skills" CASCADE;
  DROP TABLE "volunteer_applications_availability" CASCADE;
  DROP INDEX "volunteer_applications_city_idx";
  ALTER TABLE "volunteer_applications" DROP COLUMN "phone";
  ALTER TABLE "volunteer_applications" DROP COLUMN "city";
  ALTER TABLE "volunteer_applications" DROP COLUMN "language_level";
  DROP TYPE "public"."enum_volunteer_applications_interests";
  DROP TYPE "public"."enum_volunteer_applications_skills";
  DROP TYPE "public"."enum_volunteer_applications_availability";
  DROP TYPE "public"."enum_volunteer_applications_city";
  DROP TYPE "public"."enum_volunteer_applications_language_level";`)
}

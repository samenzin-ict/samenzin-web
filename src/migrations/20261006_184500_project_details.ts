import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The short labelled lines a project's text ends with — "Voor wie:",
 * "Agenda:", "Meedoen:" — held apart from the body so the page can put them
 * where a reader will find them.
 *
 * Additive: two new tables, one for the published rows and one for drafts.
 * Nothing existing is touched.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "projects_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "_projects_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "projects_details" ADD CONSTRAINT "projects_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_details" ADD CONSTRAINT "_projects_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_details_order_idx" ON "projects_details" USING btree ("_order");
  CREATE INDEX "projects_details_parent_id_idx" ON "projects_details" USING btree ("_parent_id");
  CREATE INDEX "projects_details_locale_idx" ON "projects_details" USING btree ("_locale");
  CREATE INDEX "_projects_v_version_details_order_idx" ON "_projects_v_version_details" USING btree ("_order");
  CREATE INDEX "_projects_v_version_details_parent_id_idx" ON "_projects_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_details_locale_idx" ON "_projects_v_version_details" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_details" CASCADE;
  DROP TABLE "_projects_v_version_details" CASCADE;`)
}

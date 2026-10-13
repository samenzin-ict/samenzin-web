import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Two page blocks: a titled section of text, and a list of named points drawn
 * as rows or cards. Over ons is built from them.
 *
 * Additive: new tables and enum types for the two blocks and their drafts.
 * No existing table is altered, so no existing page changes by running this.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_section_layout" AS ENUM('rail', 'lead');
  CREATE TYPE "public"."enum_pages_blocks_section_tone" AS ENUM('plain', 'soft');
  CREATE TYPE "public"."enum_pages_blocks_highlights_layout" AS ENUM('cards', 'rows');
  CREATE TYPE "public"."enum_pages_blocks_highlights_tone" AS ENUM('plain', 'soft', 'strong');
  CREATE TYPE "public"."enum__pages_v_blocks_section_layout" AS ENUM('rail', 'lead');
  CREATE TYPE "public"."enum__pages_v_blocks_section_tone" AS ENUM('plain', 'soft');
  CREATE TYPE "public"."enum__pages_v_blocks_highlights_layout" AS ENUM('cards', 'rows');
  CREATE TYPE "public"."enum__pages_v_blocks_highlights_tone" AS ENUM('plain', 'soft', 'strong');
  CREATE TABLE "pages_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"layout" "enum_pages_blocks_section_layout" DEFAULT 'rail',
  	"tone" "enum_pages_blocks_section_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"outro" varchar,
  	"layout" "enum_pages_blocks_highlights_layout" DEFAULT 'cards',
  	"tone" "enum_pages_blocks_highlights_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"layout" "enum__pages_v_blocks_section_layout" DEFAULT 'rail',
  	"tone" "enum__pages_v_blocks_section_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"outro" varchar,
  	"layout" "enum__pages_v_blocks_highlights_layout" DEFAULT 'cards',
  	"tone" "enum__pages_v_blocks_highlights_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_highlights_items" ADD CONSTRAINT "pages_blocks_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_highlights" ADD CONSTRAINT "pages_blocks_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_highlights_items" ADD CONSTRAINT "_pages_v_blocks_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_highlights" ADD CONSTRAINT "_pages_v_blocks_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_section_order_idx" ON "pages_blocks_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_parent_id_idx" ON "pages_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_path_idx" ON "pages_blocks_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_section_locale_idx" ON "pages_blocks_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_highlights_items_order_idx" ON "pages_blocks_highlights_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_highlights_items_parent_id_idx" ON "pages_blocks_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_highlights_items_locale_idx" ON "pages_blocks_highlights_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_highlights_order_idx" ON "pages_blocks_highlights" USING btree ("_order");
  CREATE INDEX "pages_blocks_highlights_parent_id_idx" ON "pages_blocks_highlights" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_highlights_path_idx" ON "pages_blocks_highlights" USING btree ("_path");
  CREATE INDEX "pages_blocks_highlights_locale_idx" ON "pages_blocks_highlights" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_section_order_idx" ON "_pages_v_blocks_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_parent_id_idx" ON "_pages_v_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_path_idx" ON "_pages_v_blocks_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_section_locale_idx" ON "_pages_v_blocks_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_highlights_items_order_idx" ON "_pages_v_blocks_highlights_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_highlights_items_parent_id_idx" ON "_pages_v_blocks_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_highlights_items_locale_idx" ON "_pages_v_blocks_highlights_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_highlights_order_idx" ON "_pages_v_blocks_highlights" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_highlights_parent_id_idx" ON "_pages_v_blocks_highlights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_highlights_path_idx" ON "_pages_v_blocks_highlights" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_highlights_locale_idx" ON "_pages_v_blocks_highlights" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_section" CASCADE;
  DROP TABLE "pages_blocks_highlights_items" CASCADE;
  DROP TABLE "pages_blocks_highlights" CASCADE;
  DROP TABLE "_pages_v_blocks_section" CASCADE;
  DROP TABLE "_pages_v_blocks_highlights_items" CASCADE;
  DROP TABLE "_pages_v_blocks_highlights" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_section_layout";
  DROP TYPE "public"."enum_pages_blocks_section_tone";
  DROP TYPE "public"."enum_pages_blocks_highlights_layout";
  DROP TYPE "public"."enum_pages_blocks_highlights_tone";
  DROP TYPE "public"."enum__pages_v_blocks_section_layout";
  DROP TYPE "public"."enum__pages_v_blocks_section_tone";
  DROP TYPE "public"."enum__pages_v_blocks_highlights_layout";
  DROP TYPE "public"."enum__pages_v_blocks_highlights_tone";`)
}

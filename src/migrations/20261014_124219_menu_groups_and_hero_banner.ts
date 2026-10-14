import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_main_navigation_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings_main_navigation" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "text_in_image" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "text_in_image" boolean DEFAULT false;
  ALTER TABLE "site_settings_main_navigation_children" ADD CONSTRAINT "site_settings_main_navigation_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_main_navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_main_navigation_children_order_idx" ON "site_settings_main_navigation_children" USING btree ("_order");
  CREATE INDEX "site_settings_main_navigation_children_parent_id_idx" ON "site_settings_main_navigation_children" USING btree ("_parent_id");
  CREATE INDEX "site_settings_main_navigation_children_locale_idx" ON "site_settings_main_navigation_children" USING btree ("_locale");
  ALTER TABLE "pages_blocks_featured_items_items" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_featured_items_items" DROP COLUMN "link_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_main_navigation_children" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_main_navigation_children" CASCADE;
  ALTER TABLE "site_settings_main_navigation" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "pages_blocks_featured_items_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_featured_items_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "text_in_image";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "text_in_image";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * A photograph and a biography per bestuurslid, and the Over ons block that
 * shows them (ROADMAP 2.5).
 *
 * Entirely additive: two new tables for the block, two nullable columns on the
 * board rows, and a foreign key that sets photo_id to null if the image is ever
 * deleted. Nothing is dropped, retyped or tightened, so no existing row can be
 * lost by running it.
 *
 * The names stay where they already were, in anbi_gegevens_board_members. The
 * ANBI page and Over ons read the same rows, which is what keeps one spelling
 * of a name across both pages.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_board" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_board" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "anbi_gegevens_board_members" ADD COLUMN "photo_id" integer;
  ALTER TABLE "anbi_gegevens_board_members_locales" ADD COLUMN "bio" jsonb;
  ALTER TABLE "pages_blocks_board" ADD CONSTRAINT "pages_blocks_board_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_board" ADD CONSTRAINT "_pages_v_blocks_board_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_board_order_idx" ON "pages_blocks_board" USING btree ("_order");
  CREATE INDEX "pages_blocks_board_parent_id_idx" ON "pages_blocks_board" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_board_path_idx" ON "pages_blocks_board" USING btree ("_path");
  CREATE INDEX "pages_blocks_board_locale_idx" ON "pages_blocks_board" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_board_order_idx" ON "_pages_v_blocks_board" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_board_parent_id_idx" ON "_pages_v_blocks_board" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_board_path_idx" ON "_pages_v_blocks_board" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_board_locale_idx" ON "_pages_v_blocks_board" USING btree ("_locale");
  ALTER TABLE "anbi_gegevens_board_members" ADD CONSTRAINT "anbi_gegevens_board_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "anbi_gegevens_board_members_photo_idx" ON "anbi_gegevens_board_members" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_board" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_board" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_board" CASCADE;
  DROP TABLE "_pages_v_blocks_board" CASCADE;
  ALTER TABLE "anbi_gegevens_board_members" DROP CONSTRAINT "anbi_gegevens_board_members_photo_id_media_id_fk";
  
  DROP INDEX "anbi_gegevens_board_members_photo_idx";
  ALTER TABLE "anbi_gegevens_board_members" DROP COLUMN "photo_id";
  ALTER TABLE "anbi_gegevens_board_members_locales" DROP COLUMN "bio";`)
}

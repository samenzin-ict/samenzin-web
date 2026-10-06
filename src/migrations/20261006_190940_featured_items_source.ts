import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Lets the homepage's card row read the projects instead of repeating them.
 *
 * Additive: two enum types and two nullable columns, mirrored on the drafts
 * table. ADD COLUMN with a DEFAULT fills the rows that already exist, so the
 * card row on every page moves to the automatic source in this migration. That
 * is the point of it — the cards on the live homepage still named projects
 * that had been rewritten and two of their three links were dead — and it is
 * the same thing 20260923_051853_events did for the agenda block.
 *
 * Nothing is lost by it. The hand-typed cards stay in pages_blocks_featured_items
 * rows of their own; setting the block back to "Handmatig" shows them again.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_featured_items_source" AS ENUM('projects', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_items_source" AS ENUM('projects', 'manual');
  ALTER TABLE "pages_blocks_featured_items" ADD COLUMN "source" "enum_pages_blocks_featured_items_source" DEFAULT 'projects';
  ALTER TABLE "pages_blocks_featured_items" ADD COLUMN "limit" numeric DEFAULT 3;
  ALTER TABLE "_pages_v_blocks_featured_items" ADD COLUMN "source" "enum__pages_v_blocks_featured_items_source" DEFAULT 'projects';
  ALTER TABLE "_pages_v_blocks_featured_items" ADD COLUMN "limit" numeric DEFAULT 3;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_featured_items" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_featured_items" DROP COLUMN "limit";
  ALTER TABLE "_pages_v_blocks_featured_items" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_featured_items" DROP COLUMN "limit";
  DROP TYPE "public"."enum_pages_blocks_featured_items_source";
  DROP TYPE "public"."enum__pages_v_blocks_featured_items_source";`)
}

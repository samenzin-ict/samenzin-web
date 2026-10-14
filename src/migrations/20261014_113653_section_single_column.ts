import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_section" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "layout";
  DROP TYPE "public"."enum_pages_blocks_section_layout";
  DROP TYPE "public"."enum__pages_v_blocks_section_layout";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_section_layout" AS ENUM('rail', 'lead');
  CREATE TYPE "public"."enum__pages_v_blocks_section_layout" AS ENUM('rail', 'lead');
  ALTER TABLE "pages_blocks_section" ADD COLUMN "layout" "enum_pages_blocks_section_layout" DEFAULT 'rail';
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "layout" "enum__pages_v_blocks_section_layout" DEFAULT 'rail';`)
}

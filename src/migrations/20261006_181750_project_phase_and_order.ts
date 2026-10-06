import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Whether a project is running or still being prepared, a note beside it, and
 * the order the overview puts them in (ROADMAP 2.2).
 *
 * Additive: two new enum types and three nullable columns, each mirrored on the
 * drafts table. Nothing is dropped, retyped or tightened.
 *
 * ADD COLUMN with a DEFAULT fills the rows that are already there, so every
 * existing project comes out of this as "loopt". That is the right assumption
 * for a page where everything currently reads as if it were running, and it is
 * exactly the claim that has to be corrected for studentenhuisvesting —
 * scripts/load-projecten.ts sets each project's phase explicitly straight
 * afterwards.
 *
 * The field is `phase` and not `status` because Payload's drafts already own
 * that name: `_status` holds draft or published and takes enum_projects_status
 * with it.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_phase" AS ENUM('loopt', 'in-voorbereiding');
  CREATE TYPE "public"."enum__projects_v_version_phase" AS ENUM('loopt', 'in-voorbereiding');
  ALTER TABLE "projects" ADD COLUMN "phase" "enum_projects_phase" DEFAULT 'loopt';
  ALTER TABLE "projects" ADD COLUMN "order" numeric;
  ALTER TABLE "projects_locales" ADD COLUMN "phase_note" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_phase" "enum__projects_v_version_phase" DEFAULT 'loopt';
  ALTER TABLE "_projects_v" ADD COLUMN "version_order" numeric;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_phase_note" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "phase";
  ALTER TABLE "projects" DROP COLUMN "order";
  ALTER TABLE "projects_locales" DROP COLUMN "phase_note";
  ALTER TABLE "_projects_v" DROP COLUMN "version_phase";
  ALTER TABLE "_projects_v" DROP COLUMN "version_order";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_phase_note";
  DROP TYPE "public"."enum_projects_phase";
  DROP TYPE "public"."enum__projects_v_version_phase";`)
}

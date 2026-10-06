import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_enrolments" ADD COLUMN "completed_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "certificate_signatory_name" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "certificate_statement" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "certificate_signatory_role" varchar;

  -- The one destructive statement in this migration, and deliberate.
  --
  -- "handled" predates the status field on volunteer applications. Once status
  -- existed it meant nothing more than "goedgekeurd or afgewezen", nothing read
  -- it, and two sources of truth for one fact is how they drift. Dropped now,
  -- while production holds no volunteer application at all, because dropping it
  -- after real ones arrive is a migration that destroys an answer somebody gave.
  --
  -- Checked before writing this: 0 rows in production, 4 invented rows on dev.
  ALTER TABLE "volunteer_applications" DROP COLUMN "handled";

  -- Added by hand, not generated.
  --
  -- An enrolment already at 100% would otherwise have no completion date, and
  -- a certificate is only offered once that date exists — so somebody who had
  -- finished a course could not get one until a coordinator happened to re-save
  -- the record. Backfilled from updated_at, which is the closest thing to when
  -- the progress was last set, and the date is shown on the certificate itself
  -- so it can be corrected if it is wrong.
  UPDATE "course_enrolments"
     SET "completed_at" = "updated_at"
   WHERE "progress" >= 100
     AND "completed_at" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "volunteer_applications" ADD COLUMN "handled" boolean DEFAULT false;
  ALTER TABLE "course_enrolments" DROP COLUMN "completed_at";
  ALTER TABLE "site_settings" DROP COLUMN "certificate_signatory_name";
  ALTER TABLE "site_settings_locales" DROP COLUMN "certificate_statement";
  ALTER TABLE "site_settings_locales" DROP COLUMN "certificate_signatory_role";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" ADD COLUMN "delete_after" timestamp(3) with time zone;

  -- Added by hand, not generated.
  --
  -- Messages that arrived before this column existed would have no delete-by
  -- date, and the clear-out skips rows without one on purpose: that absence is
  -- how a record is marked "keep". So every existing message would have been
  -- kept for ever, while the privacyverklaring promises they are deleted
  -- automatically after at most a year. Backfilled from when each one arrived,
  -- which is the date the promise is counted from.
  UPDATE "contact_submissions"
     SET "delete_after" = "created_at" + interval '12 months'
   WHERE "delete_after" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" DROP COLUMN "delete_after";`)
}

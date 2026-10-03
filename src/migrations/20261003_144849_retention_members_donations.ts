import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members" ADD COLUMN "delete_after" timestamp(3) with time zone;
  ALTER TABLE "donations" ADD COLUMN "delete_after" timestamp(3) with time zone;

  -- Both backfills added by hand, not generated.
  --
  -- Without them every record that already exists would have no delete-by
  -- date, and the clear-out skips rows without one on purpose: that absence is
  -- how a record is marked "keep". So they would all be kept for ever, while
  -- the published privacyverklaring promises otherwise.

  -- A membership that has already ended. The statement promises two years
  -- after the account ends, and nothing recorded when that was, so updated_at
  -- stands in for it. It is the closest thing available and it errs the safe
  -- way: a record edited since it ended is kept longer, never shorter.
  UPDATE "members"
     SET "delete_after" = "updated_at" + interval '24 months'
   WHERE "status" = 'beeindigd'
     AND "delete_after" IS NULL;

  -- Donations, counted from the end of the year of the gift, which is how the
  -- seven-year fiscal obligation runs: date_trunc gives 1 January of that
  -- year, and seven full years later plus that one makes eight. A gift in 2026
  -- is kept through 2033 and its name comes off from 1 January 2034.
  UPDATE "donations"
     SET "delete_after" = date_trunc('year', "created_at") + interval '8 years'
   WHERE "delete_after" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members" DROP COLUMN "delete_after";
  ALTER TABLE "donations" DROP COLUMN "delete_after";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_volunteer_applications_status" AS ENUM('aangemeld', 'in-gesprek', 'goedgekeurd', 'afgewezen');
  ALTER TABLE "volunteer_applications" ADD COLUMN "status" "enum_volunteer_applications_status" DEFAULT 'aangemeld' NOT NULL;
  CREATE INDEX "volunteer_applications_status_idx" ON "volunteer_applications" USING btree ("status");

  -- No backfill, deliberately.
  --
  -- Every existing application becomes "aangemeld", including ones already
  -- ticked as afgehandeld. That looks inconsistent and is still the right
  -- answer: "afgehandeld" means a coordinator dealt with it, which says
  -- nothing about whether the person was taken on. Guessing a decision here
  -- would put words in the board's mouth, and "goedgekeurd" is now a status
  -- that writes to the applicant.`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "volunteer_applications_status_idx";
  ALTER TABLE "volunteer_applications" DROP COLUMN "status";
  DROP TYPE "public"."enum_volunteer_applications_status";`)
}

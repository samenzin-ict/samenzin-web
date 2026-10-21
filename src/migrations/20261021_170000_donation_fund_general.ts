import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Data only, no schema change. A general gift used to be stored with an empty
 * Bestemming, which read in the admin as if something was missing; the
 * donation action now writes "Algemeen". This brings the earlier records in
 * line. Gifts earmarked for a project already carry its title.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "donations" SET "fund" = 'Algemeen'
    WHERE "project_id" IS NULL AND ("fund" IS NULL OR "fund" = '');
  `)
}

/*
 * Nothing to undo. Records that were written as "Algemeen" in the first place
 * cannot be told apart from the ones filled in here, and the value is right
 * either way.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {}

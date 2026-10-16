import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Splits Nieuws & artikelen into two rubrieken.
 *
 * Edited by hand: the generated version swapped the category type first,
 * which fails on any row still holding 'nieuws' or 'artikel', and it left
 * the new rubriek empty. The order here is:
 *
 *   1. add the rubriek and fill it from the old category — nieuws, verslag
 *      and project are news; artikel, interview and vrijwilliger are
 *      artikelen;
 *   2. clear the two categories the rubriek replaces;
 *   3. only then narrow the category type.
 *
 * Down reverses it, putting 'nieuws' or 'artikel' back where the category
 * was left empty. It goes through text rather than ALTER TYPE ... ADD VALUE,
 * because a value added that way cannot be used in the same transaction.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_articles_section" AS ENUM('nieuws', 'artikelen');
  CREATE TYPE "public"."enum__articles_v_version_section" AS ENUM('nieuws', 'artikelen');
  ALTER TABLE "articles" ADD COLUMN "section" "enum_articles_section";
  ALTER TABLE "_articles_v" ADD COLUMN "version_section" "enum__articles_v_version_section";

  UPDATE "articles" SET "section" = CASE
    WHEN "category"::text IN ('nieuws', 'verslag', 'project') THEN 'nieuws'::"enum_articles_section"
    ELSE 'artikelen'::"enum_articles_section" END;
  UPDATE "_articles_v" SET "version_section" = CASE
    WHEN "version_category"::text IN ('nieuws', 'verslag', 'project') THEN 'nieuws'::"enum__articles_v_version_section"
    ELSE 'artikelen'::"enum__articles_v_version_section" END;

  ALTER TABLE "articles" ALTER COLUMN "category" DROP DEFAULT;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" DROP DEFAULT;
  ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  UPDATE "articles" SET "category" = NULL WHERE "category" IN ('nieuws', 'artikel');
  UPDATE "_articles_v" SET "version_category" = NULL WHERE "version_category" IN ('nieuws', 'artikel');

  DROP TYPE "public"."enum_articles_category";
  CREATE TYPE "public"."enum_articles_category" AS ENUM('interview', 'verslag', 'project', 'vrijwilliger');
  ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE "public"."enum_articles_category" USING "category"::"public"."enum_articles_category";
  DROP TYPE "public"."enum__articles_v_version_category";
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('interview', 'verslag', 'project', 'vrijwilliger');
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__articles_v_version_category" USING "version_category"::"public"."enum__articles_v_version_category";

  CREATE INDEX "articles_section_idx" ON "articles" USING btree ("section");
  CREATE INDEX "_articles_v_version_version_section_idx" ON "_articles_v" USING btree ("version_section");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  UPDATE "articles" SET "category" = CASE WHEN "section" = 'nieuws' THEN 'nieuws' ELSE 'artikel' END WHERE "category" IS NULL;
  UPDATE "_articles_v" SET "version_category" = CASE WHEN "version_section" = 'nieuws' THEN 'nieuws' ELSE 'artikel' END WHERE "version_category" IS NULL;

  DROP TYPE "public"."enum_articles_category";
  CREATE TYPE "public"."enum_articles_category" AS ENUM('nieuws', 'artikel', 'interview', 'verslag', 'project', 'vrijwilliger');
  ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE "public"."enum_articles_category" USING "category"::"public"."enum_articles_category";
  ALTER TABLE "articles" ALTER COLUMN "category" SET DEFAULT 'nieuws';
  DROP TYPE "public"."enum__articles_v_version_category";
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('nieuws', 'artikel', 'interview', 'verslag', 'project', 'vrijwilliger');
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__articles_v_version_category" USING "version_category"::"public"."enum__articles_v_version_category";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DEFAULT 'nieuws';

  DROP INDEX "articles_section_idx";
  DROP INDEX "_articles_v_version_version_section_idx";
  ALTER TABLE "articles" DROP COLUMN "section";
  ALTER TABLE "_articles_v" DROP COLUMN "version_section";
  DROP TYPE "public"."enum_articles_section";
  DROP TYPE "public"."enum__articles_v_version_section";`)
}

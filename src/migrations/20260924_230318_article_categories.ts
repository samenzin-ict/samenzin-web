import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_articles_category" ADD VALUE 'project';
  ALTER TYPE "public"."enum_articles_category" ADD VALUE 'vrijwilliger';
  ALTER TYPE "public"."enum__articles_v_version_category" ADD VALUE 'project';
  ALTER TYPE "public"."enum__articles_v_version_category" ADD VALUE 'vrijwilliger';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "articles" ALTER COLUMN "category" SET DEFAULT 'nieuws'::text;
  DROP TYPE "public"."enum_articles_category";
  CREATE TYPE "public"."enum_articles_category" AS ENUM('nieuws', 'artikel', 'interview', 'verslag');
  ALTER TABLE "articles" ALTER COLUMN "category" SET DEFAULT 'nieuws'::"public"."enum_articles_category";
  ALTER TABLE "articles" ALTER COLUMN "category" SET DATA TYPE "public"."enum_articles_category" USING "category"::"public"."enum_articles_category";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DEFAULT 'nieuws'::text;
  DROP TYPE "public"."enum__articles_v_version_category";
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('nieuws', 'artikel', 'interview', 'verslag');
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DEFAULT 'nieuws'::"public"."enum__articles_v_version_category";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__articles_v_version_category" USING "version_category"::"public"."enum__articles_v_version_category";`)
}

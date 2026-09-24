import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum__pages_v_version_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_projects_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum__projects_v_version_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_articles_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum__articles_v_version_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_events_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum__events_v_version_commission" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TYPE "public"."enum_users_commissions" AS ENUM('onderwijs', 'vrijwilligers', 'evenementen', 'media', 'ict', 'fondsenwerving', 'vrouwenwerking', 'huisvesting');
  CREATE TABLE "users_commissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_commissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN "commission" "enum_pages_commission";
  ALTER TABLE "_pages_v" ADD COLUMN "version_commission" "enum__pages_v_version_commission";
  ALTER TABLE "projects" ADD COLUMN "commission" "enum_projects_commission";
  ALTER TABLE "_projects_v" ADD COLUMN "version_commission" "enum__projects_v_version_commission";
  ALTER TABLE "articles" ADD COLUMN "commission" "enum_articles_commission";
  ALTER TABLE "_articles_v" ADD COLUMN "version_commission" "enum__articles_v_version_commission";
  ALTER TABLE "events" ADD COLUMN "commission" "enum_events_commission";
  ALTER TABLE "_events_v" ADD COLUMN "version_commission" "enum__events_v_version_commission";
  ALTER TABLE "users_commissions" ADD CONSTRAINT "users_commissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_commissions_order_idx" ON "users_commissions" USING btree ("order");
  CREATE INDEX "users_commissions_parent_idx" ON "users_commissions" USING btree ("parent_id");
  CREATE INDEX "pages_commission_idx" ON "pages" USING btree ("commission");
  CREATE INDEX "_pages_v_version_version_commission_idx" ON "_pages_v" USING btree ("version_commission");
  CREATE INDEX "projects_commission_idx" ON "projects" USING btree ("commission");
  CREATE INDEX "_projects_v_version_version_commission_idx" ON "_projects_v" USING btree ("version_commission");
  CREATE INDEX "articles_commission_idx" ON "articles" USING btree ("commission");
  CREATE INDEX "_articles_v_version_version_commission_idx" ON "_articles_v" USING btree ("version_commission");
  CREATE INDEX "events_commission_idx" ON "events" USING btree ("commission");
  CREATE INDEX "_events_v_version_version_commission_idx" ON "_events_v" USING btree ("version_commission");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_commissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_commissions" CASCADE;
  DROP INDEX "pages_commission_idx";
  DROP INDEX "_pages_v_version_version_commission_idx";
  DROP INDEX "projects_commission_idx";
  DROP INDEX "_projects_v_version_version_commission_idx";
  DROP INDEX "articles_commission_idx";
  DROP INDEX "_articles_v_version_version_commission_idx";
  DROP INDEX "events_commission_idx";
  DROP INDEX "_events_v_version_version_commission_idx";
  ALTER TABLE "pages" DROP COLUMN "commission";
  ALTER TABLE "_pages_v" DROP COLUMN "version_commission";
  ALTER TABLE "projects" DROP COLUMN "commission";
  ALTER TABLE "_projects_v" DROP COLUMN "version_commission";
  ALTER TABLE "articles" DROP COLUMN "commission";
  ALTER TABLE "_articles_v" DROP COLUMN "version_commission";
  ALTER TABLE "events" DROP COLUMN "commission";
  ALTER TABLE "_events_v" DROP COLUMN "version_commission";
  DROP TYPE "public"."enum_pages_commission";
  DROP TYPE "public"."enum__pages_v_version_commission";
  DROP TYPE "public"."enum_projects_commission";
  DROP TYPE "public"."enum__projects_v_version_commission";
  DROP TYPE "public"."enum_articles_commission";
  DROP TYPE "public"."enum__articles_v_version_commission";
  DROP TYPE "public"."enum_events_commission";
  DROP TYPE "public"."enum__events_v_version_commission";
  DROP TYPE "public"."enum_users_commissions";`)
}

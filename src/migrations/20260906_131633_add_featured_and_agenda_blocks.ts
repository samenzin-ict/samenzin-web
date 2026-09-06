import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_featured_items_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_agenda_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"title" varchar NOT NULL,
  	"location" varchar,
  	"badge" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_agenda" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_featured_items_items" ADD CONSTRAINT "pages_blocks_featured_items_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_items_items" ADD CONSTRAINT "pages_blocks_featured_items_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featured_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_items" ADD CONSTRAINT "pages_blocks_featured_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agenda_items" ADD CONSTRAINT "pages_blocks_agenda_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_agenda"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_agenda" ADD CONSTRAINT "pages_blocks_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_featured_items_items_order_idx" ON "pages_blocks_featured_items_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_items_items_parent_id_idx" ON "pages_blocks_featured_items_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_items_items_locale_idx" ON "pages_blocks_featured_items_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_featured_items_items_image_idx" ON "pages_blocks_featured_items_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_featured_items_order_idx" ON "pages_blocks_featured_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_items_parent_id_idx" ON "pages_blocks_featured_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_items_path_idx" ON "pages_blocks_featured_items" USING btree ("_path");
  CREATE INDEX "pages_blocks_featured_items_locale_idx" ON "pages_blocks_featured_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_agenda_items_order_idx" ON "pages_blocks_agenda_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_agenda_items_parent_id_idx" ON "pages_blocks_agenda_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_agenda_items_locale_idx" ON "pages_blocks_agenda_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_agenda_order_idx" ON "pages_blocks_agenda" USING btree ("_order");
  CREATE INDEX "pages_blocks_agenda_parent_id_idx" ON "pages_blocks_agenda" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_agenda_path_idx" ON "pages_blocks_agenda" USING btree ("_path");
  CREATE INDEX "pages_blocks_agenda_locale_idx" ON "pages_blocks_agenda" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_featured_items_items" CASCADE;
  DROP TABLE "pages_blocks_featured_items" CASCADE;
  DROP TABLE "pages_blocks_agenda_items" CASCADE;
  DROP TABLE "pages_blocks_agenda" CASCADE;`)
}

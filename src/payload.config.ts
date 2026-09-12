import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nl } from '@payloadcms/translations/languages/nl'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { ContactSubmissions } from './collections/ContactSubmissions'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { AnbiGegevens, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Samenleving en Zingeving',
    },
  },
  /*
   * The admin panel itself is in Dutch, because volunteers use it
   * (CLAUDE.md, "Language conventions"). Only Dutch is offered, so there is no
   * language switcher to confuse anyone. Adding English later is one entry in
   * supportedLanguages.
   *
   * This is the language of the panel's own chrome. It is unrelated to
   * localization, which is about the content itself.
   */
  i18n: {
    supportedLanguages: { nl },
    fallbackLanguage: 'nl',
  },
  /*
   * Localization is switched on from day one with Dutch as the only locale.
   *
   * This is deliberate and is required by ROADMAP.md: turning localization on
   * after content exists means migrating every entry, because Payload moves
   * localized fields into separate per-locale tables. Enabling it now with one
   * locale costs nothing and makes adding a second locale a one-line change.
   *
   * Which fields carry `localized: true` is the part that matters. Text a
   * visitor reads is localized; identifiers, numbers, URLs and references are
   * not. Adding the flag to a field later is itself a migration, so it is set
   * now even though there is only one locale to fill in.
   *
   * fallback: true means a field left empty in a future locale falls back to
   * the Dutch text rather than rendering blank.
   */
  localization: {
    locales: [
      {
        label: 'Nederlands',
        code: 'nl',
      },
    ],
    defaultLocale: 'nl',
    fallback: true,
  },
  /*
   * Sidebar grouping follows docs/design/09-admin-panel-dashboard.png:
   * Content, Mensen, Programma, Financieel, Systeem. Each collection and
   * global names its own group in admin.group. Only Content, Financieel and
   * Systeem have anything in them in phase 1; the other two appear when their
   * collections do.
   *
   * Payload orders the groups by first appearance and always lists collections
   * before globals, and offers no way to set the order explicitly. Financieel
   * therefore renders after Systeem instead of before it. Reordering would
   * mean replacing the whole Nav component, which is not worth maintaining
   * across upgrades for two groups; docs/design/README.md asks for the
   * information architecture, not a pixel-exact rebuild.
   */
  collections: [Pages, Media, ContactSubmissions, Users],
  globals: [SiteSettings, AnbiGegevens],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    /*
     * Push the schema straight to the database in development, so a change to
     * a collection shows up without a migration for every experiment.
     *
     * Never in production. There a deploy runs the reviewed migrations in
     * src/migrations, so the change made to the live database is exactly the
     * one that was read in the pull request, and it can be rolled back.
     */
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    /*
     * Uploads go to Vercel Blob in production.
     *
     * The serverless filesystem is read-only apart from /tmp and is discarded
     * between invocations, so writing to the media directory there would lose
     * every file a volunteer uploads. Blob storage is the only way uploads
     * survive on this platform.
     *
     * Switched on by the presence of the token, which Vercel sets when a Blob
     * store is connected. Without it, development keeps writing to ./media so
     * a local clone needs no cloud account.
     */
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})

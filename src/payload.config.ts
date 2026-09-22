import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nl } from '@payloadcms/translations/languages/nl'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Donations } from './collections/Donations'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { AnbiGegevens, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/*
 * Object storage is optional. All four variables must be present before it is
 * used, so a half-configured environment falls back to the local disk instead
 * of failing at the first upload.
 */
const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
)

/*
 * Fail loudly when the connection string is missing.
 *
 * Without this, an unset variable becomes an empty string, pg falls back to
 * 127.0.0.1:5432, and the error is "connect ECONNREFUSED 127.0.0.1:5432" —
 * which on a build server sends you looking for a database that was never
 * supposed to be there. The real problem is a variable nobody set.
 */
const databaseUri = process.env.DATABASE_URI?.trim()

if (!databaseUri) {
  throw new Error(
    'DATABASE_URI is not set.\n' +
      '  Locally:  copy .env.example to .env and run `docker compose up -d`.\n' +
      '  Vercel:   Settings > Environment Variables. Set it for the environment\n' +
      '            being built, using the Neon pooled connection string (the host\n' +
      '            ends in -pooler). See docs/environments.md.',
  )
}

/** Public base URL of the bucket: an r2.dev address or a custom domain. */
const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')

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
  collections: [Pages, Projects, Articles, Media, ContactSubmissions, Donations, Users],
  globals: [SiteSettings, AnbiGegevens],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
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
     * Uploads go to Cloudflare R2 in every deployed environment.
     *
     * The serverless filesystem is read-only apart from /tmp and is discarded
     * between invocations, so writing to the media directory there would lose
     * every file a volunteer uploads.
     *
     * Switched on only when all four R2 variables are present. Without them
     * development keeps writing to ./media, so a local clone needs no cloud
     * account and no credentials.
     *
     * One bucket is shared by production, preview and any local machine that
     * opts in, with no per-environment prefix. That is deliberate: Payload
     * stores a file's prefix per document, so an environment-specific prefix
     * would make a database copied from production resolve to paths that do
     * not exist. Sharing one namespace means a database dump works anywhere
     * without also copying files. Media is public content, so the isolation
     * being given up is small; if it is ever needed, use a separate bucket
     * with its own credentials rather than a prefix.
     */
    s3Storage({
      enabled: r2Enabled,
      bucket: process.env.R2_BUCKET ?? '',
      collections: {
        media: r2PublicUrl
          ? {
              /*
               * Serve files straight from R2 rather than proxying them
               * through this application. Media is already publicly readable,
               * so routing every image through a serverless function would
               * add latency and cost for nothing.
               */
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) =>
                `${r2PublicUrl}/${prefix ? `${prefix}/` : ''}${filename}`,
            }
          : true,
      },
      config: {
        // R2 has no regions; the SDK still requires the field to be set.
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        },
      },
    }),
  ],
})

import { cache } from 'react'

import config from '@payload-config'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'

/**
 * Reading content from server components.
 *
 * Payload runs inside this application, so pages talk to it directly through
 * the local API rather than over HTTP to our own REST endpoint. That skips a
 * network round trip and the access-control layer we would then have to
 * re-authenticate against.
 *
 * Every function is wrapped in React's cache, so a layout and a page asking
 * for the same global in one request hit the database once.
 */
export const getPayloadClient = cache(async () => getPayload({ config }))

export const getSiteSettings = cache(async (locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'site-settings',
    // One level is enough to resolve the logo upload.
    depth: 1,
    locale,
  })
})

export const getAnbiGegevens = cache(async (locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'anbi-gegevens',
    depth: 1,
    locale,
  })
})

/**
 * A single page by its slug, or null when there is none.
 *
 * Returns null rather than throwing so a route can render notFound() and give
 * the visitor the 404 page instead of an error.
 */
export const getPageBySlug = cache(async (slug: string, locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    // Blocks reference media and the media needs its own fields resolved.
    depth: 2,
    limit: 1,
    locale,
  })

  return docs[0] ?? null
})

/** Every page slug, for the sitemap and for static generation. */
export const getAllPageSlugs = cache(async (locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    locale,
    select: { slug: true, updatedAt: true },
  })

  return docs
})

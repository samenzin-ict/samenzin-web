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
 *
 * `overrideAccess: false` is the important argument. The Payload local API
 * skips access control unless told not to, so without it this would happily
 * return an unpublished page to anybody. With it, the rule on the collection
 * applies and an anonymous caller only ever sees published documents.
 *
 * In draft mode the opposite is wanted: the caller has already been checked by
 * the preview route, so access is overridden and the newest draft returned.
 */
export const getPageBySlug = cache(
  async (slug: string, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      // Blocks reference media and the media needs its own fields resolved.
      depth: 2,
      limit: 1,
      locale,
      draft,
      overrideAccess: draft,
    })

    return docs[0] ?? null
  },
)

/**
 * Every published page slug, for the sitemap.
 *
 * Never includes drafts, whatever the caller is doing: an unpublished page
 * must not be advertised to a search engine.
 */
export const getAllPageSlugs = cache(async (locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    locale,
    overrideAccess: false,
    select: { slug: true, updatedAt: true },
  })

  return docs
})

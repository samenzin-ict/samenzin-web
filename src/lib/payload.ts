import { cache } from 'react'

import config from '@payload-config'
import { getPayload, type Where } from 'payload'

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
 * Published projects, newest first.
 *
 * `overrideAccess: false` for the same reason as pages: the local API skips
 * access control unless told not to, and without it drafts would be listed.
 */
export const getProjects = cache(async (locale: Locale = defaultLocale, draft = false) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    locale,
    draft,
    overrideAccess: draft,
    sort: '-createdAt',
  })

  return docs
})

/** A single project by its slug, or null when there is none. */
export const getProjectBySlug = cache(
  async (slug: string, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      locale,
      draft,
      overrideAccess: draft,
    })

    return docs[0] ?? null
  },
)

/** Published articles, newest first by their own date. */
export const getArticles = cache(async (locale: Locale = defaultLocale, draft = false) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'articles',
    depth: 1,
    limit: 100,
    locale,
    draft,
    overrideAccess: draft,
    sort: '-publishedAt',
  })

  return docs
})

/** A single article by its slug, or null when there is none. */
export const getArticleBySlug = cache(
  async (slug: string, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
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
 * The "meer lezen" row: the newest articles other than this one.
 *
 * Chosen by date rather than by subject. Matching on tags would look cleverer
 * and would regularly return nothing, which is worse than showing something
 * recent.
 */
export const getRelatedArticles = cache(
  async (excludeId: number, locale: Locale = defaultLocale, limit = 3) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'articles',
      where: { id: { not_equals: excludeId } },
      depth: 1,
      limit,
      locale,
      overrideAccess: false,
      sort: '-publishedAt',
    })

    return docs
  },
)

export type EventFilters = {
  /** Anything starting from now counts as upcoming. */
  period?: 'upcoming' | 'past'
  city?: string
  theme?: string
  audience?: string
}

/**
 * Published events, filtered and ordered.
 *
 * Upcoming events read forwards, so the next thing to happen is first. Past
 * events read backwards, so the most recent is first; a visitor looking at
 * what has been is not looking for the oldest item on the list.
 */
export const getEvents = cache(
  async (filters: EventFilters = {}, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()
    const now = new Date().toISOString()
    const isPast = filters.period === 'past'

    const where: Where[] = [
      isPast ? { startsAt: { less_than: now } } : { startsAt: { greater_than_equal: now } },
    ]

    if (filters.city) where.push({ city: { equals: filters.city } })
    if (filters.theme) where.push({ theme: { equals: filters.theme } })
    if (filters.audience) where.push({ audience: { equals: filters.audience } })

    const { docs } = await payload.find({
      collection: 'events',
      where: { and: where },
      depth: 1,
      limit: 200,
      locale,
      draft,
      overrideAccess: draft,
      sort: isPast ? '-startsAt' : 'startsAt',
    })

    return docs
  },
)

/** A single event by its slug, or null when there is none. */
export const getEventBySlug = cache(
  async (slug: string, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug } },
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
 * The values to offer in the filter dropdowns.
 *
 * Taken from the published events themselves, so a dropdown can never offer a
 * choice that returns nothing. That is worth one extra query: a filter that
 * leads to an empty page reads as a broken site.
 */
export const getEventFilterOptions = cache(async (locale: Locale = defaultLocale) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 500,
    locale,
    overrideAccess: false,
    select: { city: true, theme: true, audience: true },
  })

  const unique = (values: (string | null | undefined)[]) =>
    [...new Set(values.filter((value): value is string => Boolean(value?.trim())))].sort((a, b) =>
      a.localeCompare(b, locale),
    )

  return {
    cities: unique(docs.map((doc) => doc.city)),
    themes: unique(docs.map((doc) => doc.theme)),
    audiences: unique(docs.map((doc) => doc.audience)),
  }
})

/** Published courses. Ones with a start date come first, soonest first. */
export const getCourses = cache(async (locale: Locale = defaultLocale, draft = false) => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'courses',
    depth: 1,
    limit: 100,
    locale,
    draft,
    overrideAccess: draft,
    sort: 'startsAt',
  })

  return docs
})

/** A single course by its slug, or null when there is none. */
export const getCourseBySlug = cache(
  async (slug: string, locale: Locale = defaultLocale, draft = false) => {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'courses',
      where: { slug: { equals: slug } },
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

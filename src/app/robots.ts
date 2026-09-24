import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site-url'

/**
 * Crawling rules, required for phase 1 (ROADMAP.md).
 *
 * The public site is meant to be indexed: the ANBI application and Google for
 * Nonprofits both depend on it being findable. The admin panel and the API are
 * not public content and are kept out, and so is Mijn omgeving: nothing
 * behind the member login is public, and indexing the login page serves nobody.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/mijn'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

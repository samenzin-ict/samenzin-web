import type { MetadataRoute } from 'next'

import { getAllPageSlugs } from '@/lib/payload'
import { getSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

/**
 * The sitemap, required for phase 1 (ROADMAP.md).
 *
 * Built from the pages that actually exist rather than a hardcoded list, so a
 * page a volunteer adds is found by search engines without anyone touching the
 * code. The page with the slug "home" becomes the root URL rather than /home,
 * which is the address it is actually served at.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const pages = await getAllPageSlugs()

  const entries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: page.slug === 'home' ? siteUrl : `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
    priority: page.slug === 'home' ? 1 : 0.7,
  }))

  // The ANBI page is its own route and has no Pages entry to be found through.
  entries.push({ url: `${siteUrl}/anbi`, priority: 0.8 })

  return entries
}

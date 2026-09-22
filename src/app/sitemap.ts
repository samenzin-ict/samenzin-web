import type { MetadataRoute } from 'next'

import { getAllPageSlugs, getProjects } from '@/lib/payload'
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
  const [pages, projects] = await Promise.all([getAllPageSlugs(), getProjects()])

  const entries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: page.slug === 'home' ? siteUrl : `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
    priority: page.slug === 'home' ? 1 : 0.7,
  }))

  // Routes that are not Pages documents and would otherwise be missed.
  entries.push({ url: `${siteUrl}/anbi`, priority: 0.8 })
  entries.push({ url: `${siteUrl}/projecten`, priority: 0.7 })

  for (const project of projects) {
    entries.push({
      url: `${siteUrl}/projecten/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : undefined,
      priority: 0.6,
    })
  }

  return entries
}

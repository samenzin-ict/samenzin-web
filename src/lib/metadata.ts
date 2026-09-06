import type { Metadata } from 'next'

import type { Media, Page, SiteSetting } from '@/payload-types'

/**
 * The tags that decide how a page looks in Google and when it is shared.
 *
 * Falls back from the SEO fields to the page's own title, so a volunteer who
 * fills in nothing still gets something sensible rather than an untitled
 * result.
 */
export function buildPageMetadata({
  page,
  settings,
}: {
  page: Pick<Page, 'title' | 'meta'>
  settings: Pick<SiteSetting, 'organisationName' | 'tagline'>
}): Metadata {
  const title = page.meta?.title || page.title
  const description = page.meta?.description || settings.tagline || undefined
  const image = typeof page.meta?.image === 'object' ? (page.meta.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: image?.alt ?? '' }]
        : undefined,
    },
  }
}

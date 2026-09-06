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
  fallbackTitle,
}: {
  page: Pick<Page, 'title' | 'meta'>
  settings: Pick<SiteSetting, 'organisationName' | 'tagline'>
  /*
   * Used by the homepage, whose own title is usually "Home". That is a useless
   * search result and a useless share preview, so the homepage passes the
   * organisation name and tagline instead. Only applies when the editor has
   * not entered an explicit SEO title.
   */
  fallbackTitle?: string
}): Metadata {
  const title = page.meta?.title || fallbackTitle || page.title
  const description = page.meta?.description || settings.tagline || undefined
  const image = typeof page.meta?.image === 'object' ? (page.meta.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    /*
     * Absolute, so the layout's "%s — organisation name" template does not
     * append the organisation name to a title that already ends with it.
     */
    title: fallbackTitle && !page.meta?.title ? { absolute: title } : title,
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

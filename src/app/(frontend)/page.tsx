import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

/*
 * Rendered per request rather than at build time. The container image is built
 * in GitHub Actions, where the database is not reachable, so prerendering
 * would fail the build. It also means an edit in the CMS is live immediately,
 * which is what a volunteer expects after pressing save.
 */
export const dynamic = 'force-dynamic'

/** The homepage is the page with the slug "home". */
const HOME_SLUG = 'home'

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const [page, settings] = await Promise.all([getPageBySlug(HOME_SLUG, undefined, isDraft), getSiteSettings()])

  const siteTitle = [settings.organisationName, settings.tagline].filter(Boolean).join(' — ')

  if (!page) return { title: { absolute: siteTitle } }

  return buildPageMetadata({ page, settings, fallbackTitle: siteTitle })
}

export default async function HomePage() {
  const { isEnabled: isDraft } = await draftMode()
  const page = await getPageBySlug(HOME_SLUG, undefined, isDraft)

  /*
   * A fresh installation has no pages yet. Saying so, and pointing at the
   * admin panel, is more use to whoever is setting the site up than a 404 that
   * looks like something is broken.
   */
  if (!page) {
    const messages = getMessages()

    return (
      <Container className="py-16 md:py-24">
        <div className="max-w-prose space-y-4">
          <h1 className="font-heading text-3xl">{messages.emptyHomeTitle}</h1>
          <p>{messages.emptyHomeBody}</p>
          <Button asChild>
            <Link href="/admin">{messages.emptyHomeAction}</Link>
          </Button>
        </div>
      </Container>
    )
  }

  return <RenderBlocks blocks={page.body} />
}

import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string[] }> }

/*
 * A catch-all rather than a single segment, so a URL of any depth still lands
 * inside this route group and gets the site's own 404 with header and footer.
 * With a single-segment route, /een/twee/drie fell through to Next's built-in
 * error page, which carries none of the branding.
 *
 * Pages are one segment deep, so anything longer is not a page.
 */
const resolveSlug = (segments: string[]): string | null =>
  segments.length === 1 ? segments[0] : null

/*
 * Slugs the CMS must not take over, because a dedicated route already answers
 * them. Without this an editor could create a page called "anbi" and quietly
 * shadow the statutory ANBI page.
 */
const RESERVED_SLUGS = new Set(['home', 'admin', 'api', 'anbi', 'projecten', 'nieuws', 'preview'])

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const { slug } = await params
  const resolved = resolveSlug(slug)

  if (!resolved) return {}

  const [page, settings] = await Promise.all([getPageBySlug(resolved, undefined, isDraft), getSiteSettings()])

  if (!page) return {}

  return buildPageMetadata({ page, settings })
}

export default async function ContentPage({ params }: Params) {
  const { isEnabled: isDraft } = await draftMode()
  const { slug } = await params
  const resolved = resolveSlug(slug)

  if (!resolved || RESERVED_SLUGS.has(resolved)) notFound()

  const page = await getPageBySlug(resolved, undefined, isDraft)

  if (!page) notFound()

  const hasHero = page.body?.[0]?.blockType === 'hero'

  return (
    <>
      {/*
        A page that does not open with a hero still needs an h1, or the
        document has no top-level heading and the outline is broken.
      */}
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">{page.title}</h1>
        </Container>
      ) : null}

      <RenderBlocks blocks={page.body} />
    </>
  )
}

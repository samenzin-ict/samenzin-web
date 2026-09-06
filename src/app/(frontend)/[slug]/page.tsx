import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

/*
 * Slugs the CMS must not take over, because a dedicated route already answers
 * them. Without this an editor could create a page called "anbi" and quietly
 * shadow the statutory ANBI page.
 */
const RESERVED_SLUGS = new Set(['home', 'admin', 'api', 'anbi'])

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [page, settings] = await Promise.all([getPageBySlug(slug), getSiteSettings()])

  if (!page) return {}

  return buildPageMetadata({ page, settings })
}

export default async function ContentPage({ params }: Params) {
  const { slug } = await params

  if (RESERVED_SLUGS.has(slug)) notFound()

  const page = await getPageBySlug(slug)

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

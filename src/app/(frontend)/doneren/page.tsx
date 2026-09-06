import type { Metadata } from 'next'
import Link from 'next/link'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const DONATE_SLUG = 'doneren'

/**
 * The donation page, shipped without a payment step.
 *
 * ROADMAP.md says to ship /doneren in a clear "binnenkort mogelijk" state
 * rather than hold the whole site back, because Mollie cannot be registered
 * until the foundation's bank account exists.
 *
 * There is deliberately no amount picker or form. Drawing the controls from
 * docs/design/04-doneren.png and leaving them inert would waste the goodwill
 * of somebody who arrived here meaning to give; saying plainly that it is not
 * ready yet, and offering a way to reach the foundation, does not.
 *
 * When the Mollie flow is built the notice below is replaced by the form. See
 * ARCHITECTURE.md, "Donation flow" — the webhook plus a server-side re-fetch
 * is the only source of truth, never the return URL.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(DONATE_SLUG), getSiteSettings()])
  const messages = getMessages()

  if (!page) return { title: messages.donateTitle }

  return buildPageMetadata({ page, settings })
}

export default async function DonatePage() {
  const page = await getPageBySlug(DONATE_SLUG)
  const messages = getMessages()

  const hasHero = page?.body?.[0]?.blockType === 'hero'

  return (
    <>
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {page?.title ?? messages.donateTitle}
          </h1>
        </Container>
      ) : null}

      <Container className="pt-6">
        <div className="max-w-prose space-y-4">
          <Notice title={messages.donateUnavailableTitle}>
            <p>{messages.donateUnavailableBody}</p>
            <Button asChild variant="default" size="sm">
              <Link href="/contact">{messages.donateUnavailableAction}</Link>
            </Button>
          </Notice>

          <p className="text-sm">{messages.donateAnbiNote}</p>
        </div>
      </Container>

      <RenderBlocks blocks={page?.body} />
    </>
  )
}

import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { DonationForm } from '@/components/donate/DonationForm'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { Notice } from '@/components/ui/notice'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { isDonationEnabled } from '@/lib/mollie'
import { getPageBySlug, getProjects, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const DONATE_SLUG = 'doneren'

/**
 * The donation page, built to docs/design/04-doneren.png.
 *
 * The whole page is here, including the form, whether or not Mollie is
 * configured. Setting MOLLIE_API_KEY is the only thing standing between this
 * and a working donation: the server action, the webhook and the Donations
 * collection are already in place. Until then a notice says so and the pay
 * button is disabled, so nobody is sent into a payment that cannot complete.
 *
 * The funds in the dropdown are the published projects, so the board decides
 * what a gift can be earmarked for by publishing a project rather than by
 * asking for a code change.
 *
 * See ARCHITECTURE.md, "Donation flow" — the webhook plus a server-side
 * re-fetch is the only source of truth, never the return URL.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const [page, settings] = await Promise.all([getPageBySlug(DONATE_SLUG, undefined, isDraft), getSiteSettings()])
  const messages = getMessages()

  if (!page) return { title: messages.donateTitle }

  return buildPageMetadata({ page, settings })
}

export default async function DonatePage() {
  const { isEnabled: isDraft } = await draftMode()
  const [page, projects] = await Promise.all([
    getPageBySlug(DONATE_SLUG, undefined, isDraft),
    getProjects(),
  ])
  const messages = getMessages()

  const hasHero = page?.body?.[0]?.blockType === 'hero'
  const donationsEnabled = isDonationEnabled()
  const funds = projects.map((project) => project.title).filter(Boolean)

  return (
    <>
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {page?.title ?? messages.donateTitle}
          </h1>
        </Container>
      ) : null}

      <Container className="py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          {/* The card on the left of the mockup. */}
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-6 font-heading text-2xl sm:text-3xl">
              {messages.donateFormTitle}
            </h2>

            {!donationsEnabled ? (
              <div className="mb-6">
                <Notice title={messages.donateNotLiveTitle}>
                  <p>{messages.donateNotLiveBody}</p>
                </Notice>
              </div>
            ) : null}

            <DonationForm messages={messages} funds={funds} enabled={donationsEnabled} />
          </div>

          {/* The column on the right: why give periodically, and the ANBI note. */}
          <div className="space-y-6">
            <section className="rounded-lg bg-primary p-6 text-primary-foreground">
              <h2 className="font-heading text-xl text-primary-foreground">
                {messages.donateWhyPeriodicTitle}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>{messages.donateWhyPeriodicOne}</li>
                <li>{messages.donateWhyPeriodicTwo}</li>
                <li>{messages.donateWhyPeriodicThree}</li>
              </ul>
            </section>

            <section className="rounded-lg border border-border bg-card p-6 text-center">
              <p className="rounded-md bg-muted py-8 font-heading text-3xl tracking-wide text-primary">
                ANBI
              </p>
              <p className="mt-4">{messages.donateAnbiDeductible}</p>
              <p className="mt-2 text-sm">{messages.donateAnbiNote}</p>
            </section>
          </div>
        </div>
      </Container>

      <RenderBlocks blocks={page?.body} />
    </>
  )
}

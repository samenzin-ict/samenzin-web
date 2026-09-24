import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { MembershipForm } from '@/components/membership/MembershipForm'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const MEMBERSHIP_SLUG = 'lid-worden'

/**
 * Where somebody applies for membership. ROADMAP 3.1.
 *
 * A fixed route rather than a plain CMS page, because the form has to live
 * somewhere. An editor can still add an introduction, the conditions of
 * membership or the fee by creating a page with the slug "lid-worden"; its
 * blocks render above the form.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const [page, settings] = await Promise.all([
    getPageBySlug(MEMBERSHIP_SLUG, undefined, isDraft),
    getSiteSettings(),
  ])
  const messages = getMessages()

  if (!page) {
    return {
      title: messages.membershipTitle,
      description: messages.membershipIntro,
      alternates: { canonical: '/lid-worden' },
    }
  }

  return buildPageMetadata({ page, settings })
}

export default async function MembershipPage() {
  const { isEnabled: isDraft } = await draftMode()
  const page = await getPageBySlug(MEMBERSHIP_SLUG, undefined, isDraft)
  const messages = getMessages()

  const hasHero = page?.body?.[0]?.blockType === 'hero'

  return (
    <>
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {page?.title ?? messages.membershipTitle}
          </h1>
        </Container>
      ) : null}

      <RenderBlocks blocks={page?.body} />

      <Container className="py-10 md:py-14">
        <div className="max-w-prose space-y-6">
          {!page ? <p>{messages.membershipIntro}</p> : null}

          <p className="text-sm">{messages.membershipNoPaymentNotice}</p>

          <MembershipForm messages={messages} />
        </div>
      </Container>
    </>
  )
}

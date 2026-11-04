import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { stopMonthlyGift } from '@/app/(frontend)/doneren/recurring-actions'
import { RecurringFacts } from '@/components/donate/RecurringFacts'
import { RecurringLinkForm } from '@/components/donate/RecurringLinkForm'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { findRecurringByKey } from '@/lib/donations'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Where "stopzetten" in every e-mail about a monthly gift leads.
 *
 * Stopping must be as easy as starting (docs/SEPA_otomatik_incasso.pdf, B5):
 * one button, no login, no reason asked. A periodic gift is bound by its
 * signed agreement, so for one of those the page explains instead.
 */
export const metadata: Metadata = {
  title: 'Gift stopzetten',
  robots: { index: false, follow: false },
}

export default async function StopGiftPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const messages = getMessages()
  const recurring = await findRecurringByKey(await getPayloadClient(), key)

  if (!recurring) notFound()

  const running = recurring.status === 'active' || recurring.status === 'pending'

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-prose space-y-6">
        <h1 className="font-heading text-3xl sm:text-4xl">
          {recurring.kind === 'periodic' ? messages.donatePeriodic : messages.stopTitle}
        </h1>

        {!running ? (
          <p>{messages.recurringNotRunning}</p>
        ) : recurring.kind === 'periodic' ? (
          <>
            <RecurringFacts recurring={recurring} messages={messages} showNext />
            <p>{messages.stopPeriodic}</p>
          </>
        ) : (
          <>
            <RecurringLinkForm
              action={stopMonthlyGift.bind(null, key)}
              submitLabel={messages.stopSubmit}
              pendingLabel={messages.donateSubmitting}
              done={{ title: messages.stopDoneTitle, body: messages.stopDoneBody }}
            >
              <p>{messages.stopIntro}</p>
              <RecurringFacts recurring={recurring} messages={messages} showNext />
            </RecurringLinkForm>
          </>
        )}
      </div>
    </Container>
  )
}

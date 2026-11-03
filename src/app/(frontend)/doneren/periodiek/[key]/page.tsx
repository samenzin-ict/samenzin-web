import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { startPeriodicGift } from '@/app/(frontend)/doneren/recurring-actions'
import { RecurringFacts } from '@/components/donate/RecurringFacts'
import { RecurringLinkForm } from '@/components/donate/RecurringLinkForm'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { findRecurringByKey, formatEuro } from '@/lib/donations'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Where the link in the periodic-gift invitation leads (src/lib/donations.ts).
 *
 * Only reachable after an administrator has recorded the signed agreement and
 * sent the link, so nothing is collected before the agreement exists. The
 * donor pays the first term here, which lays down the mandate.
 */
export const metadata: Metadata = {
  title: 'Periodieke gift',
  // A personal link: never indexed, never followed.
  robots: { index: false, follow: false },
}

export default async function PeriodicStartPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const messages = getMessages()
  const recurring = await findRecurringByKey(await getPayloadClient(), key)

  if (!recurring || recurring.kind !== 'periodic') notFound()

  const canStart = recurring.status === 'invited' || recurring.status === 'pending'
  const running = recurring.status === 'active' || recurring.status === 'completed'

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-prose space-y-6">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.periodicStartTitle}</h1>

        {canStart ? (
          <>
            <p>{messages.periodicStartIntro}</p>
            <RecurringFacts recurring={recurring} messages={messages} />
            <RecurringLinkForm
              action={startPeriodicGift.bind(null, key)}
              consent={messages.periodicStartConsent}
              submitLabel={messages.periodicStartSubmit.replace('%s', formatEuro(recurring.amount))}
              pendingLabel={messages.donateSubmitting}
            />
          </>
        ) : (
          <p>{running ? messages.periodicStartRunning : messages.recurringNotRunning}</p>
        )}
      </div>
    </Container>
  )
}

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { getMessages, type Messages } from '@/i18n'
import { DONATION_COOKIE, getMollieClient } from '@/lib/mollie'

export const dynamic = 'force-dynamic'

/**
 * Where Mollie sends the visitor back to.
 *
 * It says how the visitor's own payment went: thanks for a paid gift, and a
 * way back to the form for one that was cancelled, failed or expired. The
 * payment is found through a cookie the donation action set, holding only the
 * Mollie id, and its status is fetched from Mollie here.
 *
 * That is for what this page shows and nothing else. It never writes to the
 * donation record: only the webhook, after its own re-fetch, does that
 * (ARCHITECTURE.md). Without the cookie, for instance when the bank app
 * returned the visitor in another browser, the page falls back to wording that
 * thanks them without asserting an outcome, as it always did.
 */
export const metadata: Metadata = {
  title: 'Bedankt',
  // Nothing to find here, and it should not turn up in search results.
  robots: { index: false, follow: false },
}

type Outcome = 'paid' | 'canceled' | 'failed' | 'expired' | 'unknown'

type Result = { outcome: Outcome; project: string | null }

const readResult = async (): Promise<Result> => {
  const paymentId = (await cookies()).get(DONATION_COOKIE)?.value
  const mollie = getMollieClient()

  // Mollie's payment ids start with tr_; anything else did not come from us.
  if (!paymentId?.startsWith('tr_') || !mollie) return { outcome: 'unknown', project: null }

  try {
    const payment = await mollie.payments.get(paymentId)
    const metadata = payment.metadata as { project?: unknown } | null
    const project = typeof metadata?.project === 'string' ? metadata.project : null
    const status = payment.status as string

    if (status === 'paid' || status === 'canceled' || status === 'failed' || status === 'expired') {
      return { outcome: status, project }
    }

    // Open, pending or authorized: the money may still come.
    return { outcome: 'unknown', project }
  } catch (error) {
    console.error('Could not look up the returning payment', error)
    return { outcome: 'unknown', project: null }
  }
}

const texts = (messages: Messages): Record<Outcome, { title: string; body: string }> => ({
  paid: { title: messages.donatePaidTitle, body: messages.donatePaidBody },
  canceled: { title: messages.donateCanceledTitle, body: messages.donateCanceledBody },
  failed: { title: messages.donateFailedTitle, body: messages.donateFailedBody },
  expired: { title: messages.donateExpiredTitle, body: messages.donateExpiredBody },
  unknown: { title: messages.donateThanksTitle, body: messages.donateThanksBody },
})

export default async function DonationThanksPage() {
  const messages = getMessages()
  const { outcome, project } = await readResult()
  const { title, body } = texts(messages)[outcome]
  const retry = outcome === 'canceled' || outcome === 'failed' || outcome === 'expired'
  const retryHref = project ? `/doneren?project=${encodeURIComponent(project)}` : '/doneren'

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-prose space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl">{title}</h1>
        <p>{body}</p>
        <div className="flex flex-wrap gap-3">
          {retry ? (
            <Button asChild variant="cta">
              <Link href={retryHref}>{messages.donateRetry}</Link>
            </Button>
          ) : null}
          <Button asChild variant={retry ? 'outline' : 'default'}>
            <Link href="/">{messages.donateThanksAction}</Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}

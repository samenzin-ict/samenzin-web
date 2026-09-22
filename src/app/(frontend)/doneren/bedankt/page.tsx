import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'

export const dynamic = 'force-dynamic'

/**
 * Where Mollie sends the visitor back to.
 *
 * It deliberately confirms nothing. Arriving here means the visitor finished
 * at Mollie, not that the money arrived: anyone can open this address. Only
 * the webhook, after re-fetching the payment, marks a donation paid
 * (ARCHITECTURE.md). The wording thanks them without asserting an outcome.
 */
export const metadata: Metadata = {
  title: 'Bedankt',
  // Nothing to find here, and it should not turn up in search results.
  robots: { index: false, follow: false },
}

export default function DonationThanksPage() {
  const messages = getMessages()

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-prose space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.donateThanksTitle}</h1>
        <p>{messages.donateThanksBody}</p>
        <Button asChild>
          <Link href="/">{messages.donateThanksAction}</Link>
        </Button>
      </div>
    </Container>
  )
}

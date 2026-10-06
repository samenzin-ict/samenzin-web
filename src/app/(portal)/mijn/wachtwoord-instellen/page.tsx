import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { ResetPasswordForm } from '@/components/portal/ResetPasswordForm'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wachtwoord instellen',
  robots: { index: false, follow: false },
}

/**
 * Where a reset link lands, both the one in the welcome message and the one
 * from "wachtwoord vergeten".
 *
 * The token arrives as a query parameter because that is the only thing a link
 * in an email can carry. It is read here and handed to the form as a hidden
 * field, so one place knows where it comes from.
 *
 * Nothing here checks whether the token is any good. It cannot without
 * spending it: Payload verifies and consumes it in the same operation. So a
 * link that has expired produces this page, then one error, which is the
 * message that offers a new link.
 */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const [{ token }, settings, messages] = [
    await searchParams,
    await getSiteSettings(),
    getMessages(),
  ]

  return (
    <main id="inhoud" className="flex-1 py-10 md:py-16">
      <Container>
        <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="space-y-2">
            <p className="font-heading text-lg text-primary">{settings.organisationName}</p>
            <h1 className="font-heading text-2xl sm:text-3xl">
              {token ? messages.portalResetTitle : messages.portalResetInvalidTitle}
            </h1>
            <p className="text-sm">
              {token ? messages.portalResetIntro : messages.portalResetInvalidBody}
            </p>
          </div>

          {token ? (
            <ResetPasswordForm messages={messages} token={token} />
          ) : (
            <Button asChild variant="cta">
              <Link href="/mijn/wachtwoord-vergeten">{messages.portalResetRequestNew}</Link>
            </Button>
          )}
        </div>
      </Container>
    </main>
  )
}

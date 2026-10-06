import type { Metadata } from 'next'

import { Container } from '@/components/layout/Container'
import { ForgotPasswordForm } from '@/components/portal/ForgotPasswordForm'
import { getMessages } from '@/i18n'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wachtwoord vergeten',
  // Never indexed. It is a form that makes the site send mail, and it has
  // nothing on it a search engine should offer anybody.
  robots: { index: false, follow: false },
}

/**
 * Asks for a password-reset link.
 *
 * Outside the (beveiligd) group, like the login page: a member who has lost
 * their password cannot be signed in. Unlike the login page it does not
 * redirect a signed-in member away, because somebody who is signed in on one
 * device and locked out on another has a good reason to be here.
 */
export default async function ForgotPasswordPage() {
  const [settings, messages] = [await getSiteSettings(), getMessages()]

  return (
    <main id="inhoud" className="flex-1 py-10 md:py-16">
      <Container>
        <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="space-y-2">
            <p className="font-heading text-lg text-primary">{settings.organisationName}</p>
            <h1 className="font-heading text-2xl sm:text-3xl">{messages.portalForgotTitle}</h1>
            <p className="text-sm">{messages.portalForgotIntro}</p>
          </div>

          <ForgotPasswordForm messages={messages} />
        </div>
      </Container>
    </main>
  )
}

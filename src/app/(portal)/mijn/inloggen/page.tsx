import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { LoginForm } from '@/components/portal/LoginForm'
import { getMessages } from '@/i18n'
import { getMember } from '@/lib/member-auth'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Inloggen',
  robots: { index: false, follow: false },
}

/**
 * The member login. ROADMAP 3.2.
 *
 * Outside the (beveiligd) group, so it is the one page in Mijn omgeving that
 * does not require a session.
 */
export default async function LoginPage() {
  const member = await getMember()

  if (member) redirect('/mijn')

  const [settings, messages] = [await getSiteSettings(), getMessages()]

  return (
    <main id="inhoud" className="flex-1 py-10 md:py-16">
      <Container>
        <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="space-y-2">
            <p className="font-heading text-lg text-primary">{settings.organisationName}</p>
            <h1 className="font-heading text-2xl sm:text-3xl">{messages.portalLoginTitle}</h1>
            <p className="text-sm">{messages.portalLoginIntro}</p>
          </div>

          <LoginForm messages={messages} />

          <p className="text-sm">{messages.portalLoginNoAccount}</p>
        </div>
      </Container>
    </main>
  )
}

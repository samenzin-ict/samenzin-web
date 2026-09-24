import type { Metadata } from 'next'

import { DetailsForm } from '@/components/portal/DetailsForm'
import { PasswordForm } from '@/components/portal/PasswordForm'
import { getMessages } from '@/i18n'
import { requireMember } from '@/lib/member-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn gegevens',
  robots: { index: false, follow: false },
}

/** Contact details and password. ROADMAP 3.2. */
export default async function PortalDetailsPage() {
  const member = await requireMember()
  const messages = getMessages()

  return (
    <div className="max-w-prose space-y-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl">{messages.portalDetailsTitle}</h1>
          <p className="text-sm">{messages.portalDetailsIntro}</p>
        </div>

        <DetailsForm messages={messages} member={member} />
      </section>

      <section className="space-y-6 border-t border-border pt-10">
        <h2 className="font-heading text-2xl">{messages.portalPasswordTitle}</h2>

        <PasswordForm messages={messages} />
      </section>
    </div>
  )
}

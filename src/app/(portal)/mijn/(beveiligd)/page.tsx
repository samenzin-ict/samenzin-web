import type { Metadata } from 'next'

import { getMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import { requireMember } from '@/lib/member-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn omgeving',
  robots: { index: false, follow: false },
}

/**
 * The member's landing page. ROADMAP 3.2.
 *
 * Deliberately thin. The mockup fills it with tasks, courses and hours, which
 * are ROADMAP 3.4 and 3.5; inventing placeholder counts here would put numbers
 * on the screen that mean nothing.
 */
export default async function PortalHomePage() {
  const member = await requireMember()
  const messages = getMessages()

  return (
    <>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">
          {messages.portalGreeting} {member.name}
        </h1>
        {member.memberSince ? (
          <p className="text-sm">
            {messages.portalMemberSince} {formatLongDate(member.memberSince)}
          </p>
        ) : null}
      </div>

      <p className="max-w-prose">{messages.portalOverviewIntro}</p>
    </>
  )
}

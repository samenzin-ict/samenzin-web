import type { Metadata } from 'next'
import Link from 'next/link'

import { getMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import { getMemberHours, sumHoursForYear } from '@/lib/hours'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn omgeving',
  robots: { index: false, follow: false },
}

/**
 * The member's landing page. ROADMAP 3.2, with the hours card from 3.5.
 *
 * The mockup also has cards for open tasks and completed tasks. Those are not
 * built, so they are not shown: a card reading "0" would look like a fact
 * rather than an absence.
 */
export default async function PortalHomePage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()

  const entries = await getMemberHours(payload, member)
  const thisYear = sumHoursForYear(entries, new Date().getFullYear())

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

      <Link
        href="/mijn/uren"
        className="block max-w-xs rounded-lg border border-border bg-card p-4 hover:border-accent"
      >
        <span className="text-sm">{messages.portalHoursTotalThisYear}</span>
        <span className="block font-heading text-3xl text-primary">
          {thisYear} {messages.portalHoursUnit}
        </span>
      </Link>

      <p className="max-w-prose">{messages.portalOverviewIntro}</p>
    </>
  )
}

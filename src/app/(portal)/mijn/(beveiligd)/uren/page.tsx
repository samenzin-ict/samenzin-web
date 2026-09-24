import type { Metadata } from 'next'

import { HoursForm } from '@/components/portal/HoursForm'
import { HoursList } from '@/components/portal/HoursList'
import { getMessages } from '@/i18n'
import { getMemberHours, sumHours, sumHoursForYear } from '@/lib/hours'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn uren',
  robots: { index: false, follow: false },
}

/** Hour registration for volunteers. ROADMAP 3.5. */
export default async function PortalHoursPage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()

  const entries = await getMemberHours(payload, member)
  const now = new Date()
  const thisYear = sumHoursForYear(entries, now.getFullYear())
  const allTime = sumHours(entries)

  // The date input wants YYYY-MM-DD in the visitor's own day, not UTC.
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.portalHoursTitle}</h1>
        <p className="max-w-prose text-sm">{messages.portalHoursIntro}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm">{messages.portalHoursTotalThisYear}</dt>
          <dd className="font-heading text-2xl text-primary">
            {thisYear} {messages.portalHoursUnit}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm">{messages.portalHoursTotalAll}</dt>
          <dd className="font-heading text-2xl text-primary">
            {allTime} {messages.portalHoursUnit}
          </dd>
        </div>
      </dl>

      <section className="max-w-prose space-y-6">
        <h2 className="font-heading text-2xl">{messages.portalHoursAddTitle}</h2>
        <HoursForm messages={messages} today={today} />
      </section>

      <section className="space-y-6 border-t border-border pt-10">
        <h2 className="font-heading text-2xl">{messages.portalHoursTitle}</h2>
        <HoursList messages={messages} entries={entries} />
      </section>
    </div>
  )
}

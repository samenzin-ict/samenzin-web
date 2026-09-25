import type { Metadata } from 'next'

import { EventList } from '@/components/portal/EventList'
import { getMessages } from '@/i18n'
import { getRegistrations } from '@/lib/portal'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn evenementen',
  robots: { index: false, follow: false },
}

/** The events this member is signed up for. */
export default async function PortalEventsPage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()
  const registrations = await getRegistrations(payload, member)

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl">{messages.portalEventsTitle}</h1>
      <EventList messages={messages} registrations={registrations} />
    </section>
  )
}

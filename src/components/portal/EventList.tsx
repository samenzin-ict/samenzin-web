import Link from 'next/link'

import type { Messages } from '@/i18n'
import { formatLongDate, formatTimeRange } from '@/lib/dates'
import type { DatedRegistration } from '@/lib/portal'

/** The "Mijn evenementen" tab: what this member is signed up for. */
export function EventList({
  messages,
  registrations,
}: {
  messages: Messages
  registrations: DatedRegistration[]
}) {
  if (registrations.length === 0) return <p>{messages.portalEventsEmpty}</p>

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {registrations.map(({ registration, isPast }) => {
        const event = typeof registration.event === 'object' ? registration.event : null

        if (!event) return null

        return (
          <li key={registration.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="flex-1">
              <Link
                href={`/agenda/${event.slug}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {event.title}
              </Link>
              <span className="mt-1 block text-sm">
                {formatLongDate(event.startsAt)} · {event.locationName}, {event.city} ·{' '}
                {formatTimeRange(event.startsAt, event.endsAt)}
              </span>
            </span>

            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              {isPast ? messages.portalEventsPast : messages.portalEventsUpcoming}
            </span>
            {registration.attended ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
                {messages.portalEventsAttended}
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

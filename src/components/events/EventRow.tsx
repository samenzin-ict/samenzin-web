import Link from 'next/link'

import { EventDateBlock } from '@/components/events/EventDateBlock'
import { PriceBadge } from '@/components/events/PriceBadge'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { formatLongDate, formatTimeRange } from '@/lib/dates'
import type { Event } from '@/payload-types'

/**
 * One row in the agenda: date block, title, where and when, price, and the
 * sign-up button.
 *
 * The sign-up button carries the event title in its accessible name. A list of
 * eight buttons all called "Aanmelden" tells somebody listening to the page
 * nothing about which one they are on.
 */
export function EventRow({ event }: { event: Event }) {
  const messages = getMessages()
  const place = [event.locationName, event.city].filter(Boolean).join(', ')
  const time = formatTimeRange(event.startsAt, event.endsAt)

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
      <EventDateBlock startsAt={event.startsAt} />

      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-lg text-primary">
          <Link href={`/agenda/${event.slug}`} className="underline-offset-4 hover:underline">
            {event.title}
          </Link>
        </h2>
        <p className="text-sm">
          <time dateTime={event.startsAt}>{formatLongDate(event.startsAt)}</time>
          {place ? ` · ${place}` : ''}
          {time ? ` · ${time}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <PriceBadge price={event.price} />

        {event.registrationUrl ? (
          <Button asChild variant="cta" size="sm">
            <Link href={event.registrationUrl}>
              {messages.eventsRegister}
              <span className="sr-only"> voor {event.title}</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </li>
  )
}

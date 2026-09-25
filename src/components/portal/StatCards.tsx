import Link from 'next/link'

import type { Messages } from '@/i18n'

/** The four figures across the top of docs/design/08. */
export function StatCards({
  messages,
  open,
  thisWeek,
  done,
  hours,
}: {
  messages: Messages
  open: number
  thisWeek: number
  done: number
  hours: number
}) {
  const cards = [
    { label: messages.portalStatOpenTasks, value: open, tone: 'text-destructive' },
    { label: messages.portalStatThisWeek, value: thisWeek, tone: 'text-cta' },
    { label: messages.portalStatDone, value: done, tone: 'text-accent' },
    { label: messages.portalStatHours, value: hours, tone: 'text-primary', href: '/mijn/uren' },
  ]

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const body = (
          <>
            <dt className="text-sm">{card.label}</dt>
            <dd className={`font-heading text-3xl ${card.tone}`}>{card.value}</dd>
          </>
        )

        return card.href ? (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-border bg-card p-4 text-center hover:border-accent"
          >
            {body}
          </Link>
        ) : (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4 text-center">
            {body}
          </div>
        )
      })}
    </dl>
  )
}

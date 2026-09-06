import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { defaultLocale } from '@/i18n'

type Item = {
  date: string
  title: string
  location?: string | null
  badge?: string | null
  url?: string | null
  id?: string | null
}

/*
 * The date block on the left of each row in the mockup: day number over the
 * abbreviated month. Formatted in the site locale rather than the server's, so
 * the month reads "sep" and not "Sep" in whatever the container happens to be
 * set to.
 */
const dayFormatter = new Intl.DateTimeFormat(defaultLocale, { day: 'numeric' })
const monthFormatter = new Intl.DateTimeFormat(defaultLocale, { month: 'short' })

/**
 * The agenda list from the homepage mockup.
 *
 * Each row is a date block, a title and a location, with an optional label on
 * the right for a price or "Gratis".
 */
export function AgendaBlock({ heading, items }: { heading: string; items?: Item[] | null }) {
  if (!items || items.length === 0) return null

  return (
    <Container className="py-10 md:py-14">
      <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const date = new Date(item.date)

          return (
            <li
              key={item.id ?? `${item.date}-${item.title}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              {/*
                aria-hidden with a readable date in the title below: a screen
                reader should hear "15 september", not "15 sep" split across
                two lines.
              */}
              <div
                aria-hidden
                className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                <span className="font-heading text-lg leading-none">{dayFormatter.format(date)}</span>
                <span className="text-xs uppercase">{monthFormatter.format(date)}</span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-base text-primary">
                  {item.url ? (
                    <Link href={item.url} className="underline-offset-4 hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="text-sm">
                  <time dateTime={item.date}>
                    {new Intl.DateTimeFormat(defaultLocale, {
                      day: 'numeric',
                      month: 'long',
                    }).format(date)}
                  </time>
                  {item.location ? ` · ${item.location}` : ''}
                </p>
              </div>

              {item.badge ? (
                <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {item.badge}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

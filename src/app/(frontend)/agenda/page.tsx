import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { EventFilters } from '@/components/events/EventFilters'
import { EventRow } from '@/components/events/EventRow'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getEventFilterOptions, getEvents, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const messages = getMessages()

  return {
    title: messages.eventsTitle,
    description: messages.eventsIntro,
    alternates: { canonical: '/agenda' },
    openGraph: {
      title: messages.eventsTitle,
      description: messages.eventsIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

/** Query parameters are Dutch, like the rest of the addresses on this site. */
const readParam = (
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined => {
  const value = params[key]
  const single = Array.isArray(value) ? value[0] : value
  return single?.trim() ? single : undefined
}

export default async function EventsPage({ searchParams }: Params) {
  const params = await searchParams
  const { isEnabled: isDraft } = await draftMode()
  const messages = getMessages()

  const period = readParam(params, 'periode') === 'afgelopen' ? 'past' : 'upcoming'
  const filters = {
    period,
    city: readParam(params, 'stad'),
    theme: readParam(params, 'thema'),
    audience: readParam(params, 'doelgroep'),
  } as const

  const [events, options] = await Promise.all([
    getEvents(filters, undefined, isDraft),
    getEventFilterOptions(),
  ])

  const isFiltered = Boolean(filters.city || filters.theme || filters.audience)
  const emptyMessage = isFiltered
    ? messages.eventsEmptyFiltered
    : period === 'past'
      ? messages.eventsEmptyPast
      : messages.eventsEmptyUpcoming

  return (
    <Container className="py-10 md:py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.eventsTitle}</h1>
        <p>{messages.eventsIntro}</p>
      </div>

      <EventFilters options={options} active={filters} />

      {events.length === 0 ? (
        <p className="mt-8">{emptyMessage}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </Container>
  )
}

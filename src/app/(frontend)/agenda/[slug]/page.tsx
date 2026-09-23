import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { PriceBadge } from '@/components/events/PriceBadge'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { formatLongDate, formatTimeRange } from '@/lib/dates'
import { getEventBySlug, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const [event, settings] = await Promise.all([
    getEventBySlug(slug, undefined, isDraft),
    getSiteSettings(),
  ])

  if (!event) return {}

  const image = typeof event.image === 'object' ? (event.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    title: event.title,
    description: event.excerpt ?? undefined,
    alternates: { canonical: `/agenda/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.excerpt ?? undefined,
      siteName: settings.organisationName,
      type: 'article',
      locale: 'nl_NL',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: image?.alt ?? '' }] : undefined,
    },
  }
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const event = await getEventBySlug(slug, undefined, isDraft)

  if (!event) notFound()

  const messages = getMessages()
  const media = typeof event.image === 'object' ? (event.image as Media | null) : null
  const place = [event.locationName, event.city].filter(Boolean).join(', ')
  const time = formatTimeRange(event.startsAt, event.endsAt)

  const facts = [
    { icon: CalendarDays, label: messages.eventsDate, value: formatLongDate(event.startsAt) },
    { icon: Clock, label: messages.eventsTime, value: time || null },
    { icon: MapPin, label: messages.eventsLocation, value: place || null },
    {
      icon: Users,
      label: messages.eventsCapacity,
      value: event.capacity ? `${event.capacity} ${messages.eventsPeople}` : null,
    },
  ].filter((fact): fact is typeof fact & { value: string } => Boolean(fact.value))

  return (
    <>
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 1600}
          height={media.height ?? 600}
          priority
          sizes="100vw"
          className="h-48 w-full object-cover sm:h-64 md:h-80"
        />
      ) : null}

      <Container className="py-10 md:py-14">
        <h1 className="font-heading text-3xl sm:text-4xl">{event.title}</h1>

        {facts.length > 0 ? (
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                  <fact.icon aria-hidden className="size-5" />
                </span>
                <div>
                  <dt className="text-sm">{fact.label}</dt>
                  <dd className="font-medium text-primary">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <RichTextContent data={event.body} />
          </div>

          <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <span className="text-sm">{messages.eventsPrice}:</span>
              <PriceBadge price={event.price} />
            </div>

            {event.registrationUrl ? (
              <Button asChild variant="cta" className="w-full">
                <Link href={event.registrationUrl}>{messages.eventsRegister}</Link>
              </Button>
            ) : null}

            {typeof event.spotsAvailable === 'number' ? (
              <p className="text-sm">
                {event.spotsAvailable} {messages.eventsSpotsLeft}
              </p>
            ) : null}
          </aside>
        </div>

        <p className="mt-10">
          <Link href="/agenda" className="text-accent underline underline-offset-4">
            {messages.eventsBackToOverview}
          </Link>
        </p>
      </Container>
    </>
  )
}

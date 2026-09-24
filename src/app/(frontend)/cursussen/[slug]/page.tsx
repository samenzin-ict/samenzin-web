import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { LEVEL_LABELS } from '@/components/courses/CourseCard'
import { PriceBadge } from '@/components/events/PriceBadge'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import { getCourseBySlug, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const [course, settings] = await Promise.all([
    getCourseBySlug(slug, undefined, isDraft),
    getSiteSettings(),
  ])

  if (!course) return {}

  const image = typeof course.image === 'object' ? (course.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    title: course.title,
    description: course.excerpt ?? undefined,
    alternates: { canonical: `/cursussen/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.excerpt ?? undefined,
      siteName: settings.organisationName,
      type: 'article',
      locale: 'nl_NL',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: image?.alt ?? '' }] : undefined,
    },
  }
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const course = await getCourseBySlug(slug, undefined, isDraft)

  if (!course) notFound()

  const messages = getMessages()
  const media = typeof course.image === 'object' ? (course.image as Media | null) : null
  const starts = formatLongDate(course.startsAt)

  type Fact = { label: string; value: React.ReactNode }

  const facts: Fact[] = ([
    course.level ? { label: messages.coursesLevel, value: LEVEL_LABELS[course.level] } : null,
    {
      label: messages.coursesStarts,
      value:
        starts && course.startsAt ? (
          <time dateTime={course.startsAt}>{starts}</time>
        ) : (
          messages.coursesStartsRolling
        ),
    },
    course.duration ? { label: messages.coursesDuration, value: course.duration } : null,
  ] as (Fact | null)[]).filter((fact): fact is Fact => fact !== null)

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
        <h1 className="font-heading text-3xl sm:text-4xl">{course.title}</h1>

        <div className="mt-8 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <RichTextContent data={course.body} />
          </div>

          <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
            <dl className="space-y-3">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm">{fact.label}</dt>
                  <dd className="font-medium text-primary">{fact.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-sm">{messages.coursesPrice}</dt>
                <dd className="mt-1">
                  <PriceBadge price={course.price} />
                </dd>
              </div>
            </dl>

            {/*
              A link, not an enrolment. Enrolment needs a member identity,
              which is ROADMAP 3.2 and still undecided.
            */}
            {course.registrationUrl ? (
              <Button asChild variant="cta" className="w-full">
                <Link href={course.registrationUrl}>{messages.coursesRegister}</Link>
              </Button>
            ) : null}
          </aside>
        </div>

        <p className="mt-10">
          <Link href="/cursussen" className="text-accent underline underline-offset-4">
            {messages.coursesBackToOverview}
          </Link>
        </p>
      </Container>
    </>
  )
}

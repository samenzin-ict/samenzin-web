import Image from 'next/image'
import Link from 'next/link'

import { PriceBadge } from '@/components/events/PriceBadge'
import { getMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import type { Course, Media } from '@/payload-types'

export const LEVEL_LABELS: Record<NonNullable<Course['level']>, string> = {
  iedereen: 'Voor iedereen',
  beginner: 'Beginners',
  gevorderd: 'Gevorderden',
}

/** A course in the catalogue. Only the title links, as elsewhere. */
export function CourseCard({ course }: { course: Course }) {
  const messages = getMessages()
  const media = typeof course.image === 'object' ? (course.image as Media | null) : null
  const starts = formatLongDate(course.startsAt)

  return (
    <li className="flex flex-col rounded-lg border border-border bg-card p-3">
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 600}
          height={media.height ?? 400}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/2] w-full rounded-md object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {course.level ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary">
              {LEVEL_LABELS[course.level]}
            </span>
          ) : null}
          <PriceBadge price={course.price} />
        </div>

        <h2 className="font-heading text-xl text-primary">
          <Link href={`/cursussen/${course.slug}`} className="underline-offset-4 hover:underline">
            {course.title}
          </Link>
        </h2>

        {course.excerpt ? <p className="flex-1 text-sm">{course.excerpt}</p> : null}

        <p className="text-sm">
          {messages.coursesStarts}:{' '}
          {starts && course.startsAt ? (
            <time dateTime={course.startsAt}>{starts}</time>
          ) : (
            messages.coursesStartsRolling
          )}
          {course.duration ? ` · ${course.duration}` : ''}
        </p>
      </div>
    </li>
  )
}

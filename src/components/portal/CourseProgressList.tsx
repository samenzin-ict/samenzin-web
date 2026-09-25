import Image from 'next/image'
import Link from 'next/link'

import type { Messages } from '@/i18n'
import type { CourseEnrolment } from '@/payload-types'

/** The "Mijn cursussen" row of docs/design/08: a card each, with a progress bar. */
export function CourseProgressList({
  messages,
  enrolments,
}: {
  messages: Messages
  enrolments: CourseEnrolment[]
}) {
  if (enrolments.length === 0) return <p>{messages.portalCoursesEmpty}</p>

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enrolments.map((enrolment) => {
        const course = typeof enrolment.course === 'object' ? enrolment.course : null

        if (!course) return null

        const image = typeof course.image === 'object' ? course.image : null
        const progress = Math.max(0, Math.min(100, enrolment.progress ?? 0))

        return (
          <li
            key={enrolment.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.alt ?? ''}
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span aria-hidden className="size-16 shrink-0 rounded-md bg-muted" />
              )}

              <span className="flex-1">
                <Link
                  href={`/cursussen/${course.slug}`}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {course.title}
                </Link>
                {course.excerpt ? (
                  <span className="mt-1 block text-sm">{course.excerpt}</span>
                ) : null}
              </span>
            </div>

            {/*
              The bar is decoration: the figure beside it is the real content,
              and it carries the label. A native <progress> would announce its
              value as well, so a screen reader would hear the percentage
              twice; aria-hidden leaves one clear reading.
            */}
            <div className="flex items-center gap-3">
              <progress
                aria-hidden
                value={progress}
                max={100}
                className="h-2 flex-1 overflow-hidden rounded-full [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-accent"
              />
              <span className="text-sm">
                <span className="sr-only">{messages.portalCoursesProgress}: </span>
                {progress}%
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

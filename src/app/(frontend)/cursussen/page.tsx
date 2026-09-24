import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { CourseCard } from '@/components/courses/CourseCard'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getCourses, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const messages = getMessages()

  return {
    title: messages.coursesTitle,
    description: messages.coursesIntro,
    alternates: { canonical: '/cursussen' },
    openGraph: {
      title: messages.coursesTitle,
      description: messages.coursesIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

export default async function CoursesPage() {
  const { isEnabled: isDraft } = await draftMode()
  const courses = await getCourses(undefined, isDraft)
  const messages = getMessages()

  return (
    <Container className="py-10 md:py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.coursesTitle}</h1>
        <p>{messages.coursesIntro}</p>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8">{messages.coursesEmpty}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ul>
      )}
    </Container>
  )
}

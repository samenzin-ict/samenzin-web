import type { Metadata } from 'next'

import { CourseProgressList } from '@/components/portal/CourseProgressList'
import { getMessages } from '@/i18n'
import { getEnrolments } from '@/lib/portal'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn cursussen',
  robots: { index: false, follow: false },
}

/** The courses this member is following, with progress. ROADMAP 3.4. */
export default async function PortalCoursesPage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()
  const enrolments = await getEnrolments(payload, member)

  return (
    <section className="space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl">{messages.portalCoursesTitle}</h1>
      <CourseProgressList messages={messages} enrolments={enrolments} />
    </section>
  )
}

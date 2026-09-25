import type { Metadata } from 'next'

import { CourseProgressList } from '@/components/portal/CourseProgressList'
import { StatCards } from '@/components/portal/StatCards'
import { TaskList } from '@/components/portal/TaskList'
import { COMMISSION_OPTIONS } from '@/fields/commissions'
import { getMessages } from '@/i18n'
import { getEnrolments, getTasks, taskCounts } from '@/lib/portal'
import { getMemberHours, sumHoursForYear } from '@/lib/hours'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn taken',
  robots: { index: false, follow: false },
}

const ROLE_LABELS = {
  vrijwilliger: 'portalRoleVrijwilliger',
  lid: 'portalRoleLid',
  bestuur: 'portalRoleBestuur',
} as const

/**
 * Mijn taken, the screen of docs/design/08-ledenportaal-mijn-taken.png.
 *
 * Greeting, the line about who this person is, the four figures, the task list
 * and the course row. Everything on it is the member's own; nothing here reads
 * another member's records.
 */
export default async function PortalHomePage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()

  const [tasks, enrolments, hours] = await Promise.all([
    getTasks(payload, member),
    getEnrolments(payload, member),
    getMemberHours(payload, member),
  ])

  const counts = taskCounts(tasks)
  const thisYear = sumHoursForYear(hours, new Date().getFullYear())

  const commission = COMMISSION_OPTIONS.find((o) => o.value === member.commission)?.label
  const subtitle = [
    member.memberRole ? messages[ROLE_LABELS[member.memberRole]] : null,
    commission ? `${messages.portalCommissionPrefix} ${commission}` : null,
    member.city,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <div className="space-y-1">
        <h1 className="font-heading text-3xl sm:text-4xl">
          {messages.portalGreeting} {member.name}
        </h1>
        {subtitle ? <p className="text-sm">{subtitle}</p> : null}
      </div>

      <StatCards
        messages={messages}
        open={counts.open}
        thisWeek={counts.thisWeek}
        done={counts.done}
        hours={thisYear}
      />

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">{messages.portalTasksTitle}</h2>
        <TaskList messages={messages} tasks={tasks} memberName={member.name} />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">{messages.portalCoursesTitle}</h2>
        <CourseProgressList messages={messages} enrolments={enrolments} />
      </section>
    </>
  )
}

import 'server-only'

import type { Payload } from 'payload'

import type { CourseEnrolment, EventRegistration, Member, MemberTask } from '@/payload-types'

/**
 * Everything Mijn omgeving shows about one member, per
 * docs/design/08-ledenportaal-mijn-taken.png.
 *
 * Every query passes `overrideAccess: false` with the member, so the access
 * rule folds "member equals this member" into the SQL. Nothing here re-checks
 * ownership by hand, which means there is no second copy of that rule to drift.
 */

const LIMIT = 200

export async function getTasks(payload: Payload, member: Member): Promise<MemberTask[]> {
  const { docs } = await payload.find({
    collection: 'member-tasks',
    overrideAccess: false,
    user: member,
    // Open work first, soonest deadline first within that, which is the order
    // the mockup shows and the order somebody actually wants to read.
    sort: ['done', 'dueAt'],
    limit: LIMIT,
    depth: 0,
  })

  return docs
}

export async function getEnrolments(
  payload: Payload,
  member: Member,
): Promise<CourseEnrolment[]> {
  const { docs } = await payload.find({
    collection: 'course-enrolments',
    overrideAccess: false,
    user: member,
    // One level, to resolve the course title and image.
    depth: 2,
    limit: LIMIT,
  })

  return docs
}

/**
 * Registrations, each already marked as past or upcoming.
 *
 * The comparison with the clock happens here rather than in the component.
 * Reading the time while rendering is impure: the same props could produce a
 * different result on a re-render, which the lint rule that flagged this is
 * there to prevent.
 */
export type DatedRegistration = { registration: EventRegistration; isPast: boolean }

export async function getRegistrations(
  payload: Payload,
  member: Member,
): Promise<DatedRegistration[]> {
  const { docs } = await payload.find({
    collection: 'event-registrations',
    overrideAccess: false,
    user: member,
    depth: 2,
    limit: LIMIT,
  })

  const now = Date.now()

  return docs.map((registration) => {
    const event = typeof registration.event === 'object' ? registration.event : null

    return {
      registration,
      isPast: event ? new Date(event.startsAt).getTime() < now : false,
    }
  })
}

const startOfDay = (value: Date): Date => {
  const copy = new Date(value)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Whole days from today to the deadline. Negative means overdue. */
export const daysUntil = (due: string): number => {
  const today = startOfDay(new Date()).getTime()
  const target = startOfDay(new Date(due)).getTime()

  return Math.round((target - today) / (24 * 60 * 60 * 1000))
}

/** The four numbers across the top of the mockup. */
export function taskCounts(tasks: MemberTask[]) {
  const open = tasks.filter((task) => !task.done)

  return {
    open: open.length,
    thisWeek: open.filter((task) => {
      if (!task.dueAt) return false
      const days = daysUntil(task.dueAt)
      return days >= 0 && days <= 7
    }).length,
    done: tasks.filter((task) => task.done).length,
  }
}

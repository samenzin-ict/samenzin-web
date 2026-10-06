import 'server-only'

import type { Payload } from 'payload'

import type { CourseEnrolment, Event, EventRegistration, Member } from '@/payload-types'

/**
 * What a course or event page needs to know about the signed-in member, and
 * how full an event is. ROADMAP 3.4.
 *
 * Both lookups pass `overrideAccess: false` with the member, so the access
 * rule folds "member equals this member" into the query and another member's
 * enrolment is never loaded. Same discipline as src/lib/portal.ts.
 */

export async function getCourseEnrolment(
  payload: Payload,
  member: Member,
  courseId: number,
): Promise<CourseEnrolment | null> {
  const { docs } = await payload.find({
    collection: 'course-enrolments',
    where: { course: { equals: courseId } },
    overrideAccess: false,
    user: member,
    limit: 1,
    depth: 0,
  })

  return docs[0] ?? null
}

export async function getEventRegistration(
  payload: Payload,
  member: Member,
  eventId: number,
): Promise<EventRegistration | null> {
  const { docs } = await payload.find({
    collection: 'event-registrations',
    where: { event: { equals: eventId } },
    overrideAccess: false,
    user: member,
    limit: 1,
    depth: 0,
  })

  return docs[0] ?? null
}

/**
 * How many people are registered for an event.
 *
 * Counted with access overridden, which is the one place that is necessary: a
 * visitor may be told that eight of twenty places are gone without being
 * allowed to know whose. Only the number leaves this function.
 */
export async function countEventRegistrations(
  payload: Payload,
  eventId: number,
): Promise<number> {
  const { totalDocs } = await payload.count({
    collection: 'event-registrations',
    where: { event: { equals: eventId } },
    overrideAccess: true,
  })

  return totalDocs
}

export type Places = {
  /** Null when the event has no capacity, which means no limit is published. */
  remaining: number | null
  isFull: boolean
}

/**
 * The places left.
 *
 * Derived from the registrations when the editor has set a capacity, which is
 * the whole point of taking registrations on the site: the number on the page
 * is now a fact rather than something somebody remembered to decrement.
 *
 * `spotsAvailable` is the fallback for an event whose capacity is left empty,
 * so the hand-maintained number on existing events keeps working. It is never
 * trusted to decide whether the event is full, because nothing keeps it true.
 */
export const placesLeft = (event: Event, registered: number): Places => {
  if (typeof event.capacity === 'number' && event.capacity > 0) {
    const remaining = Math.max(event.capacity - registered, 0)

    return { remaining, isFull: remaining === 0 }
  }

  return {
    remaining: typeof event.spotsAvailable === 'number' ? event.spotsAvailable : null,
    isFull: false,
  }
}

/** Whether the event has already started, in which case registering is over. */
export const hasStarted = (event: Event, now = Date.now()): boolean =>
  new Date(event.startsAt).getTime() <= now

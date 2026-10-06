import 'server-only'

import type { Payload } from 'payload'

import type { Course, CourseEnrolment, Member } from '@/payload-types'

/**
 * Certificates for courses a member has finished. ROADMAP 3.6.
 *
 * There is no certificate collection and deliberately so. A certificate is not
 * a thing the foundation stores; it is a view of an enrolment that reached
 * 100%, dated with `completedAt`. Storing one as well would mean two records
 * that could disagree about whether somebody passed, and a row to keep in step
 * every time a coordinator corrects a progress figure.
 *
 * Which is also why the access rule on course-enrolments refuses to let a
 * member delete one they have progress on: the enrolment *is* the evidence.
 *
 * Every query passes `overrideAccess: false` with the member, so the rule folds
 * "member equals this member" into the SQL and another member's result is never
 * loaded, let alone rendered onto a certificate with the wrong name on it.
 */

export type Certificate = {
  id: number
  course: Course
  completedAt: string
}

/** Narrows an enrolment to one that can actually produce a certificate. */
const toCertificate = (enrolment: CourseEnrolment): Certificate | null => {
  const course = typeof enrolment.course === 'object' ? enrolment.course : null

  if (!course || !enrolment.completedAt) return null

  return { id: enrolment.id, course, completedAt: enrolment.completedAt }
}

export async function getCertificates(
  payload: Payload,
  member: Member,
): Promise<Certificate[]> {
  const { docs } = await payload.find({
    collection: 'course-enrolments',
    where: { completedAt: { exists: true } },
    overrideAccess: false,
    user: member,
    // One level, to resolve the course title and its duration.
    depth: 1,
    limit: 200,
    sort: '-completedAt',
  })

  return docs.map(toCertificate).filter((item): item is Certificate => item !== null)
}

/** One certificate, or null when it is not this member's or not finished. */
export async function getCertificate(
  payload: Payload,
  member: Member,
  id: number,
): Promise<Certificate | null> {
  try {
    const enrolment = await payload.findByID({
      collection: 'course-enrolments',
      id,
      overrideAccess: false,
      user: member,
      depth: 1,
    })

    return toCertificate(enrolment)
  } catch {
    /*
     * Another member's enrolment, or one that does not exist. Payload throws
     * for both and the page turns either into a 404 — telling the difference
     * would say whether an id exists, which is not the member's business.
     */
    return null
  }
}

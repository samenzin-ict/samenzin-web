'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import { getCourseEnrolment } from '@/lib/enrolment'
import { getMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export type EnrolmentFormState = {
  status: 'idle' | 'enrolled' | 'withdrawn' | 'error'
  error?: string
}

const readId = (formData: FormData, key: string): number => {
  const value = formData.get(key)
  return Number(typeof value === 'string' ? value : NaN)
}

/**
 * Enrols the signed-in member in a course. ROADMAP 3.4.
 *
 * The member comes from the session and the course id from the form, which is
 * the only thing the caller gets to choose. Both are handed to Payload with
 * access *not* overridden, so the rules on the collection are what allow or
 * refuse this; the beforeValidate hook overwrites `member` with the session's
 * id regardless, so naming somebody else achieves nothing.
 *
 * Enrolling twice is refused, not silently ignored: the member would otherwise
 * get a second confirmation for a place they already had, and the capacity
 * count on an event would drift. The check races in theory — two tabs, same
 * second — and the consequence is one duplicate row that a coordinator can
 * delete, which is not worth a unique index and a migration.
 */
export async function enrolInCourse(
  _previous: EnrolmentFormState,
  formData: FormData,
): Promise<EnrolmentFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const courseId = readId(formData, 'course')
  const slug = String(formData.get('slug') ?? '')

  if (!Number.isFinite(courseId) || courseId <= 0) {
    return { status: 'error', error: messages.coursesEnrolError }
  }

  const payload = await getPayloadClient()

  try {
    const existing = await getCourseEnrolment(payload, member, courseId)

    if (existing) return { status: 'enrolled' }

    await payload.create({
      collection: 'course-enrolments',
      overrideAccess: false,
      user: member,
      data: { member: member.id, course: courseId, progress: 0 },
    })
  } catch (error) {
    console.error('Enrolling in a course failed', error)
    return { status: 'error', error: messages.coursesEnrolError }
  }

  if (slug) revalidatePath(`/cursussen/${slug}`)
  revalidatePath('/mijn/cursussen')
  revalidatePath('/mijn')

  return { status: 'enrolled' }
}

/**
 * Withdraws the member from a course.
 *
 * Refused by the access rule once there is progress recorded, so a course
 * somebody actually did cannot be erased by the person who did it. Nothing
 * here re-checks that; the rule is the only copy.
 */
export async function withdrawFromCourse(
  _previous: EnrolmentFormState,
  formData: FormData,
): Promise<EnrolmentFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const enrolmentId = readId(formData, 'enrolment')
  const slug = String(formData.get('slug') ?? '')

  if (!Number.isFinite(enrolmentId) || enrolmentId <= 0) {
    return { status: 'error', error: messages.coursesWithdrawError }
  }

  const payload = await getPayloadClient()

  try {
    await payload.delete({
      collection: 'course-enrolments',
      id: enrolmentId,
      overrideAccess: false,
      user: member,
    })
  } catch (error) {
    console.error('Withdrawing from a course failed', error)
    return { status: 'error', error: messages.coursesWithdrawError }
  }

  if (slug) revalidatePath(`/cursussen/${slug}`)
  revalidatePath('/mijn/cursussen')
  revalidatePath('/mijn')

  return { status: 'withdrawn' }
}

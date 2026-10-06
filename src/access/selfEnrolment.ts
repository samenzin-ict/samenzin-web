import type { Access, Where } from 'payload'

import { isAdminPanelUser, isMemberUser } from './userCollections'

/**
 * Signing yourself up, and signing yourself off again. ROADMAP 3.4 and the
 * event registrations beside it.
 *
 * Both collections used to be administrator-only, because the comment on them
 * said the website takes no sign-ups from the open web: that is personal data
 * arriving from strangers and it needs a processing register entry first. That
 * reasoning still holds and these rules do not weaken it. A signed-in member
 * is not a stranger — the foundation already holds their record, granted by
 * the board — and an enrolment adds no new personal data at all. It is two
 * foreign keys: this member, that course.
 *
 * Which is why none of this is open to the public. A visitor who is not a
 * member cannot enrol, and the detail page says so and offers the login.
 */

/** Everyone who coordinates volunteers, who need the lists. */
const isCoordinator = (user: Parameters<Access>[0]['req']['user']): boolean => {
  if (!isAdminPanelUser(user)) return false
  if (user.role === 'admin') return true

  return (user.commissions ?? []).includes('vrijwilligers')
}

/** A member may create one, for themselves; a coordinator for anybody. */
export const canEnrolSelf: Access = ({ req: { user } }) => {
  if (isCoordinator(user)) return true

  /*
   * True rather than a constraint, because Payload has no document to match a
   * query against on create. What stops a member enrolling somebody else is
   * the beforeValidate hook on the collection, which overwrites `member` with
   * the id from the session whatever the request said.
   */
  return isMemberUser(user)
}

/**
 * Cancelling.
 *
 * A member may withdraw from something they have not started, and nothing
 * else. Deleting the record is the honest meaning of "afmelden" for a place
 * nobody has taken yet, and it keeps the capacity count right.
 *
 * Once there is something to show for it the record stops being the member's
 * to remove: an event they attended and a course they made progress on are
 * part of what the foundation did, and for a certificate later on (ROADMAP
 * 3.6) the enrolment is the evidence. Both rules are expressed as a query
 * constraint rather than checked in the server action, so the REST endpoint
 * is bound by them too and there is no second copy to drift.
 */
const ownAnd = (memberId: number | string, extra: Where): Where => ({
  and: [{ member: { equals: memberId } }, extra],
})

export const canCancelEventRegistration: Access = ({ req: { user } }) => {
  if (isCoordinator(user)) return true
  if (!isMemberUser(user)) return false

  // Not once somebody has been ticked off as having been there.
  return ownAnd(user.id, { attended: { not_equals: true } })
}

export const canCancelCourseEnrolment: Access = ({ req: { user } }) => {
  if (isCoordinator(user)) return true
  if (!isMemberUser(user)) return false

  // Not once there is progress recorded against it.
  return ownAnd(user.id, { progress: { less_than_equal: 0 } })
}

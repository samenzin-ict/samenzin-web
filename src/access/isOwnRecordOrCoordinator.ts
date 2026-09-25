import type { Access, Where } from 'payload'

import { isAdminPanelUser, isMemberUser } from './userCollections'

/**
 * Who may see a record that belongs to one member: their registered hours,
 * their tasks, their course enrolments, their event registrations.
 *
 * A member sees their own and nobody else's. Administrators and editors in the
 * vrijwilligers commission see all of them, the same people who already handle
 * volunteer applications: whoever coordinates volunteers needs the totals, and
 * no other editor has any business reading who worked when.
 *
 * Returns a query constraint for a member rather than a boolean, so Payload
 * folds it into the database query and another member's hours are never
 * loaded at all.
 */
export const isOwnRecordOrCoordinator: Access = ({ req: { user } }) => {
  if (isAdminPanelUser(user)) {
    if (user.role === 'admin') return true

    return (user.commissions ?? []).includes('vrijwilligers')
  }

  if (!isMemberUser(user)) return false

  // Every collection this guards has a `member` relationship, which is what
  // makes one rule enough for all of them.
  const own: Where = { member: { equals: user.id } }

  return own
}

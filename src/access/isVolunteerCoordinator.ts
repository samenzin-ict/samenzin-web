import type { Access } from 'payload'

/**
 * Who may read and handle volunteer applications.
 *
 * Administrators, and editors in the vrijwilligers commission. A volunteer
 * coordinator should be able to do their job without an administrator account,
 * and no other editor has any business reading applicants' details.
 *
 * This is the only place a commission grants access to a whole collection
 * rather than to individual documents, which is why it is its own rule rather
 * than a reuse of isEditorOfCommission.
 */
export const isVolunteerCoordinator: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  return (user.commissions ?? []).includes('vrijwilligers')
}

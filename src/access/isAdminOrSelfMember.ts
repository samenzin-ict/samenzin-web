import type { Access } from 'payload'

import { isAdminPanelUser, isMemberUser } from './userCollections'

/**
 * An administrator, or the member looking at their own record (ROADMAP 3.2).
 *
 * Editors get nothing here. A membership register is personal data and an
 * editor has no reason to read it; only administrators and the member
 * themselves do.
 *
 * The collection is checked before the id is compared, because `users` and
 * `members` have separate id sequences and an id on its own means nothing.
 * See isAdminPanelUser.
 */
export const isAdminOrSelfMember: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdminPanelUser(user)) return user.role === 'admin'
  if (!isMemberUser(user)) return false

  return {
    id: {
      equals: user.id,
    },
  }
}

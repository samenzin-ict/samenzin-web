import type { Access } from 'payload'

import { isAdminPanelUser } from './userCollections'

/**
 * An administrator, or the signed-in admin panel user looking at their own
 * account.
 *
 * Editors must be able to read and update their own record or the admin panel
 * cannot show who is signed in and they cannot change their own password. The
 * role field is guarded separately with isAdminFieldLevel, so this does not let
 * an editor promote themselves.
 *
 * Returns a query constraint rather than a boolean for the non-admin case;
 * Payload merges it into the database query.
 *
 * The collection check is not decoration. This rule is used on `users`, and it
 * compares ids. Members live in their own table with their own id sequence, so
 * without it a member holding id 1 would match user id 1 and could take over
 * that account. See isAdminPanelUser.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!isAdminPanelUser(user)) return false
  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id,
    },
  }
}

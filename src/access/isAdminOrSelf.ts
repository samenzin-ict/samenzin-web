import type { Access } from 'payload'

/**
 * An administrator, or the signed-in user looking at their own account.
 *
 * Editors must be able to read and update their own record or the admin panel
 * cannot show who is signed in and they cannot change their own password. The
 * role field is guarded separately with isAdminFieldLevel, so this does not let
 * an editor promote themselves.
 *
 * Returns a query constraint rather than a boolean for the non-admin case;
 * Payload merges it into the database query.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id,
    },
  }
}

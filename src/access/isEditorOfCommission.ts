import type { Access, Where } from 'payload'

import { isAdminPanelUser } from './userCollections'

/**
 * Who may change a piece of content (ROADMAP 2.8).
 *
 * An administrator may change anything. An editor may change content their
 * commission owns, and content no commission owns.
 *
 * Returning a query constraint rather than a boolean matters here. Payload
 * folds it into the database query, so a document belonging to another
 * commission is not fetched at all. A boolean check would have to load the
 * document first, and would have to be repeated in every list, count and
 * bulk operation.
 *
 * Unowned content stays editable by everyone on purpose. Anything written
 * before commissions existed has no commission, and locking all of it to
 * administrators would have turned a permissions feature into an outage.
 */
export const isEditorOfCommission: Access = ({ req: { user } }) => {
  if (!isAdminPanelUser(user)) return false
  if (user.role === 'admin') return true
  if (user.role !== 'editor') return false

  const commissions = user.commissions ?? []

  // Annotated so the two shapes widen to Where rather than to a union
  // TypeScript then refuses to accept as an access result.
  const sharedOnly: Where = { commission: { exists: false } }

  if (commissions.length === 0) {
    // An editor with no commission works on shared content only.
    return sharedOnly
  }

  const ownOrShared: Where = {
    or: [sharedOnly, { commission: { in: commissions } }],
  }

  return ownOrShared
}

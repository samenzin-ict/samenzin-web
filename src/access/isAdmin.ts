import type { Access, FieldAccess } from 'payload'

import { isAdminPanelUser } from './userCollections'

/**
 * Only an administrator. Use for users, settings and anything holding
 * personal or financial data.
 *
 * This file is the executable form of one row of toegangsmatrix.md in the
 * samenzin-ict repository. When one changes, change the other.
 *
 * The collection is checked as well as the role, so that a field named `role`
 * appearing on some future auth collection cannot satisfy this rule. See
 * isAdminPanelUser.
 */
export const isAdmin: Access = ({ req: { user } }) =>
  isAdminPanelUser(user) && user?.role === 'admin'

/**
 * The same rule at field level. Payload keeps collection and field access
 * separate, so a field that only an administrator may change needs this
 * rather than isAdmin.
 */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  isAdminPanelUser(user) && user?.role === 'admin'

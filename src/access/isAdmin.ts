import type { Access, FieldAccess } from 'payload'

/**
 * Only an administrator. Use for users, settings and anything holding
 * personal or financial data.
 *
 * This file is the executable form of one row of toegangsmatrix.md in the
 * samenzin-ict repository. When one changes, change the other.
 */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

/**
 * The same rule at field level. Payload keeps collection and field access
 * separate, so a field that only an administrator may change needs this
 * rather than isAdmin.
 */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

import type { PayloadRequest } from 'payload'

/**
 * An administrator or an editor. This is the rule for editable content:
 * pages, media and the site texts a volunteer maintains.
 *
 * Typed to return a plain boolean rather than as Payload's Access type.
 * Payload's access.admin, which decides who may open the admin panel, accepts
 * only a boolean and not a query constraint. A boolean-returning function is
 * still assignable to Access, so this works in both places.
 */
export const isAdminOrEditor = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  user?.role === 'admin' || user?.role === 'editor'

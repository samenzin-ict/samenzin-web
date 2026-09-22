import type { Access } from 'payload'

/**
 * Visitors see published documents; anyone signed in sees everything.
 *
 * This is the rule that makes drafts safe. It returns a query constraint
 * rather than a boolean, so Payload folds it into the database query and an
 * unpublished document is never loaded, let alone rendered.
 *
 * The `exists: false` clause covers documents created before drafts were
 * switched on, which have no `_status` at all. Without it every page that
 * already existed would vanish from the public site the moment drafts were
 * enabled. Those documents get a real status the first time an editor saves
 * them, so the clause matters less as time passes; it is kept because the
 * failure it prevents is worse than the oddity of having it.
 *
 * Note that the Payload local API skips access control unless it is asked not
 * to. Read helpers in src/lib/payload.ts pass `overrideAccess: false` on
 * purpose so this rule actually applies.
 */
export const isPublishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    or: [{ _status: { equals: 'published' } }, { _status: { exists: false } }],
  }
}

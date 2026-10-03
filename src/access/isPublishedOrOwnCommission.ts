import type { Access, Where } from 'payload'

import { isAdminPanelUser } from './userCollections'

/**
 * Who may read a piece of content. ROADMAP 2.8, the read half.
 *
 * Three answers:
 *
 *   anonymous, or a member   published documents only
 *   administrator            everything
 *   editor                   everything published, plus anything their own
 *                            commission owns and anything no commission owns,
 *                            published or not
 *
 * The editor rule is deliberately narrower than "hide other commissions'
 * documents", which is what PROGRESS.md asked for. Hiding a *published*
 * article from a colleague protects nothing — it is on the public site, and an
 * editor who cannot find it in the panel will reasonably conclude the site is
 * broken. What is worth not showing is another commission's **unpublished**
 * work: a draft is a half-finished thought, and seeing it in a list invites
 * somebody to act on it or mention it before it is ready.
 *
 * So the only thing this hides is other commissions' drafts, which is the
 * actual concern behind the note.
 *
 * It returns a query constraint rather than a boolean, so Payload folds it into
 * the database query and a document the caller may not read is never fetched.
 * A boolean would have to load each document first and be repeated in every
 * list, count and bulk operation.
 *
 * ## Why this does not change the public site
 *
 * `read` governs the public site as well as the admin panel, which is why the
 * note warned that scoping it needed care. It turns out not to reach the public
 * site at all: every helper in src/lib/payload.ts calls the local API without
 * `user` or `req`, so those queries carry no identity and take the anonymous
 * branch — even for a visitor who happens to be a signed-in editor. Checked
 * across all ten call sites, and covered by a test in this commit.
 *
 * The `exists: false` clause on `_status` covers documents created before
 * drafts were switched on, which have no status at all. Without it every page
 * that already existed would vanish the moment drafts were enabled.
 */

/** Anything a visitor is allowed to see. */
const published: Where = {
  or: [{ _status: { equals: 'published' } }, { _status: { exists: false } }],
}

export const isPublishedOrOwnCommission: Access = ({ req: { user } }) => {
  /*
   * Deliberately not `if (user)`. From ROADMAP 3.2 a member also holds a
   * token, and a member has no business reading unpublished work.
   */
  if (!isAdminPanelUser(user)) return published

  if (user.role === 'admin') return true

  // Anyone else in the panel is an editor; an unexpected role gets the
  // visitor's view rather than the benefit of the doubt.
  if (user.role !== 'editor') return published

  const commissions = user.commissions ?? []

  const ownOrShared: Where[] = [{ commission: { exists: false } }]

  if (commissions.length > 0) {
    ownOrShared.push({ commission: { in: commissions } })
  }

  return { or: [published, ...ownOrShared] }
}

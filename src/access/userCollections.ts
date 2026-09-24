import type { TypedUser } from 'payload'

import type { Member, User } from '@/payload-types'

/**
 * The slug of the one collection that may open the admin panel. Payload
 * enforces this through `admin.user` in the config; this constant exists so
 * the access rules can say the same thing.
 */
export const ADMIN_USER_COLLECTION = 'users'

/** Members, who have a login but never reach the admin panel. ROADMAP 3.2. */
export const MEMBER_COLLECTION = 'members'

/**
 * A member as Payload hands them back from an authenticated request. `_sid`
 * identifies which of the member's live sessions this token belongs to; it is
 * attached at runtime by the JWT strategy and so is not part of the generated
 * document type.
 */
export type AuthenticatedMember = Member & { _sid?: string }

/**
 * Payload sets `collection` on the authenticated user at runtime, but the
 * generated `TypedUser` union is a plain union of document types and carries no
 * discriminant. Reading it through this narrow structural type keeps the check
 * honest without reaching for `any`.
 */
type MaybeWithCollection = { collection?: string } | null | undefined

/**
 * Is this request authenticated as an admin panel account, rather than as a
 * member?
 *
 * From ROADMAP 3.2 there are two auth-enabled collections, `users` and
 * `members`, and `req.user` can be either. Every rule that grants something
 * has to say which of the two it means, because two things that used to be
 * safe stopped being safe the moment members could hold a token:
 *
 *   - "anyone signed in" would have included members, so a member could have
 *     read unpublished drafts through the REST and GraphQL APIs.
 *   - "the signed-in user looking at their own record" compared ids only.
 *     `users` and `members` are separate tables with separate id sequences, so
 *     member 1 and user 1 both exist. Without this check, member 1 could have
 *     read and updated user 1 — including setting that administrator's
 *     password.
 *
 * Payload puts the collection on the user, so this is a cheap check with no
 * extra database read.
 */
export const isAdminPanelUser = (user: TypedUser | null | undefined): user is User =>
  (user as MaybeWithCollection)?.collection === ADMIN_USER_COLLECTION

/** The mirror image: authenticated as a member. */
export const isMemberUser = (
  user: TypedUser | null | undefined,
): user is AuthenticatedMember =>
  (user as MaybeWithCollection)?.collection === MEMBER_COLLECTION

import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Payload } from 'payload'

import { isMemberUser } from '@/access'
import type { Member } from '@/payload-types'
import { TOKEN_EXPIRATION_SECONDS } from '@/collections/Members'
import { getPayloadClient } from '@/lib/payload'

/**
 * The member session cookie.
 *
 * Deliberately not Payload's own cookie. Payload names it `${cookiePrefix}-token`
 * with nothing in it to say which collection it belongs to, so `users` and
 * `members` would share one cookie: signing in to Mijn omgeving would throw a
 * board member out of the admin panel, and signing out of one would sign them
 * out of both. Verified in payload 3.88.0, dist/auth/cookies.js.
 *
 * Holding the member token separately keeps the two sessions independent. The
 * token itself is an ordinary Payload JWT and is handed back to Payload on
 * every request, so nothing about how it is checked is homegrown.
 */
export const MEMBER_COOKIE = 'samenzin-member-token'

/**
 * Payload's JWT strategy reads `Authorization: JWT <token>` and resolves the
 * collection from the token itself, so a members token can only ever produce a
 * members user. Verified in dist/auth/extractJWT.js; `jwtOrder` puts the header
 * ahead of the cookie by default.
 *
 * The header is built from scratch rather than forwarded, so an admin panel
 * cookie present in the same browser cannot be picked up by accident.
 */
const authHeaders = (token: string): Headers =>
  new Headers({
    Authorization: `JWT ${token}`,
    // No autoLogin is configured, but saying so costs nothing and the fallback
    // is surprising enough to be worth ruling out explicitly.
    DisableAutologin: 'true',
  })

/**
 * The signed-in member, or null. Safe to call on any page.
 *
 * A member whose status is no longer "actief" is treated as signed out. The
 * check is here rather than only at login so that ending a membership takes
 * effect on the member's next request, instead of whenever their week-long
 * token happens to expire.
 */
export async function getMember(): Promise<Member | null> {
  const token = (await cookies()).get(MEMBER_COOKIE)?.value

  if (!token) return null

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: authHeaders(token) })

  if (!isMemberUser(user)) return null
  if (user.status !== 'actief') return null

  return user
}

/** The signed-in member, or a redirect to the login page. */
export async function requireMember(): Promise<Member> {
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  return member
}

/** Writes the session cookie after a successful login. */
export async function setMemberCookie(token: string): Promise<void> {
  const store = await cookies()

  store.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_EXPIRATION_SECONDS,
  })
}

/**
 * Ends the session: the cookie goes, and the session is revoked server-side so
 * a copy of the token taken beforehand is worthless.
 *
 * Payload keeps a list of live sessions on the member document when
 * `useSessions` is on, which it is by default, and its JWT strategy refuses a
 * token whose session is no longer in that list. Removing the entry is what
 * makes logging out mean something. Mirrors dist/auth/operations/logout.js.
 */
export async function clearMemberSession(payload: Payload): Promise<void> {
  const store = await cookies()
  const token = store.get(MEMBER_COOKIE)?.value

  store.delete(MEMBER_COOKIE)

  if (!token) return

  try {
    const { user } = await payload.auth({ headers: authHeaders(token) })

    if (!isMemberUser(user) || !user._sid) return

    const remaining = (user.sessions ?? []).filter((session) => session.id !== user._sid)

    await payload.update({
      collection: 'members',
      id: user.id,
      overrideAccess: true,
      data: { sessions: remaining },
    })
  } catch (error) {
    // The cookie is already gone, so the visitor is signed out either way.
    console.error('Could not revoke member session', error)
  }
}

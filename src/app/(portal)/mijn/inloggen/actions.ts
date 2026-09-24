'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import { setMemberCookie } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export type LoginFormState = {
  status: 'idle' | 'error'
  error?: string
  email?: string
}

/** For rate limiting only; hashed by the limiter and never stored. */
const getCallerIdentifier = async (): Promise<string> => {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
}

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Signs a member in.
 *
 * Two different defences, on purpose. The rate limiter caps how fast one
 * caller can guess and fails open, because it must never be the reason a
 * member cannot reach their own account. Payload's own maxLoginAttempts locks
 * the individual account after five failures and does not fail open; that is
 * the one that actually stops someone working through a password list.
 *
 * Every failure gives the same message. Saying "no such account" would let
 * anyone test which addresses are members, which is exactly the kind of thing
 * a membership register should not leak.
 */
export async function submitLogin(
  _previous: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const messages = getMessages()
  const email = readField(formData, 'email')
  const password = typeof formData.get('password') === 'string'
    ? String(formData.get('password'))
    : ''

  if (!email || !password) {
    return { status: 'error', error: messages.portalLoginFailed, email }
  }

  const payload = await getPayloadClient()
  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier(), 'member-login')

  if (!allowed) {
    return { status: 'error', error: messages.portalLoginTooMany, email }
  }

  let token: string | undefined

  try {
    const result = await payload.login({
      collection: 'members',
      data: { email, password },
    })

    /*
     * Correct password, but the membership is over. Refused here as well as in
     * getMember, so an ended member is told what is going on instead of being
     * bounced back to the login form by the next page they land on.
     */
    if (result.user?.status !== 'actief') {
      return { status: 'error', error: messages.portalStatusEnded, email }
    }

    token = result.token
  } catch (error) {
    const message = error instanceof Error ? error.message : ''

    // Payload throws a distinct error once the account is locked. Telling a
    // member that is useful and reveals nothing they did not already know.
    if (message.toLowerCase().includes('locked')) {
      return { status: 'error', error: messages.portalLoginLocked, email }
    }

    return { status: 'error', error: messages.portalLoginFailed, email }
  }

  if (!token) {
    return { status: 'error', error: messages.portalLoginFailed, email }
  }

  await setMemberCookie(token)

  // Outside the try: redirect() works by throwing, so catching around it would
  // swallow the navigation and report a login failure instead.
  redirect('/mijn')
}

'use server'

import { getMessages } from '@/i18n'
import { MIN_PASSWORD_LENGTH } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export type ResetPasswordFormState = {
  status: 'idle' | 'success' | 'error'
  error?: string
  /** Set when the link itself is the problem, so the page offers a new one. */
  tokenExpired?: boolean
}

const readSecret = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/**
 * Sets a member's password from a reset link.
 *
 * The token is the whole authorisation. It arrives in the form rather than in
 * a session, because the member is by definition not signed in, and Payload
 * checks it against the hash and the expiry it stored when the link was made.
 * Nothing here decides whether the token is good.
 *
 * No session is started afterwards. Payload's reset operation can return a
 * token to sign the member straight in, and deliberately is not used that way:
 * a reset link that logs you in means anyone who reads the member's mailbox,
 * now or later, lands in the account in one click. The member types the new
 * password once on the login page, which also confirms they remember it.
 */
export async function setPassword(
  _previous: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const messages = getMessages()

  const token = readSecret(formData, 'token').trim()
  const password = readSecret(formData, 'password')
  const repeat = readSecret(formData, 'repeat')

  if (!token) {
    return { status: 'error', error: messages.portalResetErrorToken, tokenExpired: true }
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { status: 'error', error: messages.portalPasswordTooShort }
  }

  if (password !== repeat) {
    return { status: 'error', error: messages.portalPasswordMismatch }
  }

  const payload = await getPayloadClient()

  try {
    await payload.resetPassword({
      collection: 'members',
      data: { password, token },
      /*
       * The caller has no session, so there is no user for an access rule to
       * judge. The token is what stands in for one, and Payload has just
       * verified it.
       */
      overrideAccess: true,
    })
  } catch (error) {
    /*
     * Payload throws the same error for a token that never existed, one that
     * expired and one that was already used. All three mean the same thing to
     * the member: ask for a new link.
     */
    payload.logger.info({ err: error }, 'A password reset token was refused')

    return { status: 'error', error: messages.portalResetErrorToken, tokenExpired: true }
  }

  return { status: 'success' }
}

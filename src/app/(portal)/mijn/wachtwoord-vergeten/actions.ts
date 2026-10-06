'use server'

import { headers } from 'next/headers'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit'

export type ForgotPasswordFormState = {
  status: 'idle' | 'sent' | 'error'
  error?: string
  email?: string
}

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** For rate limiting only; hashed by the limiter and never stored. */
const getCallerIdentifier = async (): Promise<string> => {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
}

/**
 * Asks for a password-reset link.
 *
 * Always reports the same thing, whether or not the address belongs to a
 * member. The alternative tells anybody who asks which addresses are members,
 * which is the one fact a membership register must not hand out. It also means
 * the error path and the success path have to look identical to the visitor,
 * including when the mail server is down.
 *
 * Rate limited under its own scope. Without it this is a way to have the site
 * send mail to any address, repeatedly, which is both a nuisance to the
 * recipient and a fast way onto a spam list.
 *
 * Payload sends the message itself and the Dutch text comes from the
 * forgotPassword block on the Members collection.
 */
export async function requestPasswordReset(
  _previous: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const messages = getMessages()
  const email = readField(formData, 'email')

  // Report success to a bot; telling it what tripped only helps it retry.
  if (readField(formData, HONEYPOT_FIELD)) {
    return { status: 'sent' }
  }

  if (!email) {
    return { status: 'error', error: messages.portalLoginFailed, email }
  }

  const payload = await getPayloadClient()
  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier(), 'member-forgot')

  if (!allowed) {
    return { status: 'error', error: messages.portalForgotTooMany, email }
  }

  try {
    await payload.forgotPassword({
      collection: 'members',
      data: { email },
      /*
       * Payload's own rate limit on this operation, minRequestInterval,
       * throws when the same account asks again too soon. Caught below and
       * reported as success, because a member who clicks twice should not be
       * told they have done something wrong.
       */
      disableEmail: false,
    })
  } catch (error) {
    /*
     * An unknown address, a locked account and a mail server that refused all
     * end up here. None of them changes what the visitor is told; the log is
     * where the maintainer finds out which it was.
     */
    payload.logger.info(
      { err: error },
      'A password reset was requested and could not be completed',
    )
  }

  await pruneRateLimits(payload, 'member-forgot')

  return { status: 'sent' }
}

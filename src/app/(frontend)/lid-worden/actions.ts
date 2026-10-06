'use server'

import { headers } from 'next/headers'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { getEmailMessages, getMessages } from '@/i18n'
import { adminUrlFor, sendMail, sendNotification } from '@/lib/email'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit'

export type MembershipFormState = {
  status: 'idle' | 'success' | 'error'
  errors?: Partial<Record<'name' | 'email' | 'form', string>>
  values?: { name: string; email: string; motivation: string }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
 * Takes an application to become a member. ROADMAP 3.1.
 *
 * The third public form, built like the other two on purpose: the same
 * honeypot instead of a CAPTCHA, the same rate limiter under its own scope so
 * a burst here cannot lock the contact form, and the same refusal to tell the
 * visitor anything about what failed internally.
 *
 * It never grants a membership. The record is created with status
 * "aangevraagd" and the board decides. The applicant gets a confirmation that
 * the aanvraag arrived and nothing more: the decision mail is sent when the
 * board actually makes one, from the collection's own hook.
 */
export async function submitMembershipForm(
  _previous: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  const messages = getMessages()

  const values = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    motivation: readField(formData, 'motivation'),
  }

  // Report success to a bot; telling it what tripped only helps it retry.
  if (readField(formData, HONEYPOT_FIELD)) {
    return { status: 'success' }
  }

  const payload = await getPayloadClient()
  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier(), 'membership')

  if (!allowed) {
    return { status: 'error', errors: { form: messages.membershipErrorTooMany }, values }
  }

  const errors: MembershipFormState['errors'] = {}

  if (!values.name) errors.name = messages.membershipErrorName
  if (!EMAIL_PATTERN.test(values.email)) errors.email = messages.membershipErrorEmail

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  let applicationId: number | string

  try {
    const application = await payload.create({
      collection: 'membership-applications',
      // Validated above; the collection is closed to the API on purpose.
      overrideAccess: true,
      data: {
        name: values.name.slice(0, 200),
        email: values.email,
        motivation: values.motivation.slice(0, 5000) || null,
        // Never anything else from a public form.
        status: 'aangevraagd',
      },
    })

    applicationId = application.id
  } catch (error) {
    console.error('Membership application failed', error)
    return { status: 'error', errors: { form: messages.membershipErrorGeneric }, values }
  }

  // After the record is stored, and never instead of storing it. sendMail
  // does not throw, so a mail server that is down costs a confirmation rather
  // than the application.
  const email = getEmailMessages()

  await sendMail(payload, {
    to: values.email,
    template: email.membershipConfirmation({ name: values.name }),
  })

  await sendNotification(
    payload,
    email.membershipNotification({
      name: values.name,
      email: values.email,
      url: adminUrlFor('membership-applications', applicationId),
    }),
  )

  await pruneRateLimits(payload, 'membership')

  return { status: 'success' }
}

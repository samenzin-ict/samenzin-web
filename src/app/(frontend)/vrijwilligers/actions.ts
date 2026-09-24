'use server'

import { headers } from 'next/headers'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit'

export type VolunteerFormState = {
  status: 'idle' | 'success' | 'error'
  errors?: Partial<Record<'name' | 'email' | 'form', string>>
  values?: { name: string; email: string; message: string; interest: string }
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
 * Takes a volunteer application.
 *
 * Built the same way as the contact form, on purpose: the same honeypot rather
 * than a third-party CAPTCHA, the same rate limiter, the same refusal to tell
 * the visitor anything about what went wrong internally. Two public forms that
 * behave differently are two things to reason about.
 */
export async function submitVolunteerForm(
  _previous: VolunteerFormState,
  formData: FormData,
): Promise<VolunteerFormState> {
  const messages = getMessages()

  const values = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    message: readField(formData, 'message'),
    interest: readField(formData, 'interest'),
  }

  // Report success to a bot; telling it what tripped only helps it retry.
  if (readField(formData, HONEYPOT_FIELD)) {
    return { status: 'success' }
  }

  const payload = await getPayloadClient()
  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier(), 'volunteer')

  if (!allowed) {
    return { status: 'error', errors: { form: messages.volunteerErrorTooMany }, values }
  }

  const errors: VolunteerFormState['errors'] = {}

  if (!values.name) errors.name = messages.volunteerErrorName
  if (!EMAIL_PATTERN.test(values.email)) errors.email = messages.volunteerErrorEmail

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  try {
    const interestId = Number(values.interest)

    await payload.create({
      collection: 'volunteer-applications',
      // Validated above; the collection is closed to the API on purpose.
      overrideAccess: true,
      data: {
        name: values.name.slice(0, 200),
        email: values.email,
        message: values.message.slice(0, 5000) || null,
        interest: Number.isFinite(interestId) && interestId > 0 ? interestId : null,
        handled: false,
      },
    })
  } catch (error) {
    console.error('Volunteer application failed', error)
    return { status: 'error', errors: { form: messages.volunteerErrorGeneric }, values }
  }

  await pruneRateLimits(payload, 'volunteer')

  return { status: 'success' }
}

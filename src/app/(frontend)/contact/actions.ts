'use server'

import { headers } from 'next/headers'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  /** Keyed by field name, so each input can show its own message. */
  errors?: Partial<Record<'name' | 'email' | 'message' | 'form', string>>
  /** Echoed back so a failed submission does not wipe what was typed. */
  values?: { name: string; email: string; message: string }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Who is submitting, for rate limiting only.
 *
 * Caddy sets x-forwarded-for in front of the application. The value is passed
 * straight to the limiter, which hashes it; it is never stored or logged. When
 * no header is present every caller shares one bucket, which is stricter than
 * intended rather than looser, and so fails safe.
 */
const getCallerIdentifier = async (): Promise<string> => {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
}

export async function submitContactForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const messages = getMessages()

  const values = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    message: readField(formData, 'message'),
  }

  /*
   * Report success to a bot rather than an error. Telling it what went wrong
   * only helps it try again with the field left blank.
   */
  if (readField(formData, HONEYPOT_FIELD)) {
    return { status: 'success' }
  }

  const payload = await getPayloadClient()
  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier())

  if (!allowed) {
    return { status: 'error', errors: { form: messages.contactErrorTooMany }, values }
  }

  const errors: ContactFormState['errors'] = {}

  if (!values.name) errors.name = messages.contactErrorName
  if (!EMAIL_PATTERN.test(values.email)) errors.email = messages.contactErrorEmail
  if (!values.message) errors.message = messages.contactErrorMessage

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  try {
    await payload.create({
      collection: 'contact-submissions',
      /*
       * The collection is closed to public creation on purpose, so that
       * nothing can be inserted by posting at the REST endpoint. This action
       * has already validated the input, so it writes with access overridden.
       */
      overrideAccess: true,
      data: {
        name: values.name.slice(0, 200),
        email: values.email,
        message: values.message.slice(0, 5000),
        handled: false,
      },
    })
  } catch (error) {
    /*
     * Logged for the maintainer, never shown to the visitor: the message may
     * name database columns.
     */
    console.error('Contact form submission failed', error)
    return { status: 'error', errors: { form: messages.contactErrorGeneric }, values }
  }

  // Cheap to do here: a successful submission is rare.
  await pruneRateLimits(payload)

  return { status: 'success' }
}

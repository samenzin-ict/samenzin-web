'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import {
  isAvailability,
  isCity,
  isInterest,
  isLanguageLevel,
  isSkill,
} from '@/fields/volunteering'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit'
import { clearDraft, readDraft, saveDraft } from '@/lib/volunteer-draft'

export type StepState = {
  status: 'idle' | 'error'
  errors?: Partial<Record<'name' | 'email' | 'phone' | 'interests' | 'form', string>>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Digits, spaces, dashes, brackets and a leading +. Deliberately generous. */
const PHONE_PATTERN = /^[+()\-\s\d]{6,40}$/

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Keeps only values the guard recognises, and keeps their narrowed type. */
const readList = <T extends string>(
  formData: FormData,
  key: string,
  guard: (v: string) => v is T,
): T[] =>
  formData
    .getAll(key)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(guard)

/** For rate limiting only; hashed by the limiter and never stored. */
const getCallerIdentifier = async (): Promise<string> => {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
}

/**
 * Step 1 — Gegevens.
 *
 * Each step validates its own answers, merges them into the draft and moves
 * on. Nothing is written to the database until the last step, so somebody who
 * gives up halfway leaves no record of themselves behind.
 */
export async function submitDetails(_previous: StepState, formData: FormData): Promise<StepState> {
  const messages = getMessages()

  const name = readField(formData, 'name')
  const email = readField(formData, 'email')
  const phone = readField(formData, 'phone')

  const errors: StepState['errors'] = {}

  if (!name) errors.name = messages.volunteerErrorName
  if (!EMAIL_PATTERN.test(email)) errors.email = messages.volunteerErrorEmail
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = messages.volunteerErrorPhone

  if (Object.keys(errors).length > 0) return { status: 'error', errors }

  const payload = await getPayloadClient()
  await saveDraft(payload, { name, email, phone })

  redirect('/vrijwilligers/interesses')
}

/** Step 2 — Interesses, vaardigheden, taalniveau en locatie. */
export async function submitInterests(
  _previous: StepState,
  formData: FormData,
): Promise<StepState> {
  const messages = getMessages()
  const payload = await getPayloadClient()
  const draft = await readDraft(payload)

  if (!draft.name) return { status: 'error', errors: { form: messages.volunteerErrorStart } }

  const interests = readList(formData, 'interests', isInterest)

  if (interests.length === 0) {
    return { status: 'error', errors: { interests: messages.volunteerErrorInterests } }
  }

  const city = readField(formData, 'city')
  const languageLevel = readField(formData, 'languageLevel')

  await saveDraft(payload, {
    interests,
    skills: readList(formData, 'skills', isSkill),
    city: isCity(city) ? city : undefined,
    languageLevel: isLanguageLevel(languageLevel) ? languageLevel : undefined,
  })

  redirect('/vrijwilligers/beschikbaarheid')
}

/** Step 3 — Beschikbaarheid. Everything here is optional. */
export async function submitAvailability(
  _previous: StepState,
  formData: FormData,
): Promise<StepState> {
  const messages = getMessages()
  const payload = await getPayloadClient()
  const draft = await readDraft(payload)

  if (!draft.name) return { status: 'error', errors: { form: messages.volunteerErrorStart } }

  await saveDraft(payload, {
    availability: readList(formData, 'availability', isAvailability),
    message: readField(formData, 'message').slice(0, 5000),
  })

  redirect('/vrijwilligers/bevestiging')
}

/**
 * Step 4 — Bevestiging. The only step that writes anything.
 *
 * The honeypot and the rate limiter sit here rather than on every step: this
 * is the one request that creates a record, and a bot that filled in four
 * forms to get here has still achieved nothing.
 */
export async function submitApplication(
  _previous: StepState,
  formData: FormData,
): Promise<StepState> {
  const messages = getMessages()
  const payload = await getPayloadClient()

  // Report success to a bot; telling it what tripped only helps it retry.
  if (readField(formData, HONEYPOT_FIELD)) {
    await clearDraft(payload)
    redirect('/vrijwilligers/bevestiging?verzonden=1')
  }

  const draft = await readDraft(payload)

  if (!draft.name || !draft.email) {
    return { status: 'error', errors: { form: messages.volunteerErrorExpired } }
  }

  const { allowed } = await checkRateLimit(payload, await getCallerIdentifier(), 'volunteer')

  if (!allowed) {
    return { status: 'error', errors: { form: messages.volunteerErrorTooMany } }
  }

  const city = draft.city
  const level = draft.languageLevel

  try {
    await payload.create({
      collection: 'volunteer-applications',
      // Validated step by step; the collection is closed to the API on purpose.
      overrideAccess: true,
      data: {
        name: draft.name.slice(0, 200),
        email: draft.email,
        phone: draft.phone?.slice(0, 40) || null,
        // Narrowed by the guards rather than cast; a draft is still just data
        // that came from a form post.
        city: city && isCity(city) ? city : null,
        interests: (draft.interests ?? []).filter(isInterest),
        skills: (draft.skills ?? []).filter(isSkill),
        languageLevel: level && isLanguageLevel(level) ? level : null,
        availability: (draft.availability ?? []).filter(isAvailability),
        message: draft.message?.slice(0, 5000) || null,
        handled: false,
      },
    })
  } catch (error) {
    console.error('Volunteer application failed', error)
    return { status: 'error', errors: { form: messages.volunteerErrorGeneric } }
  }

  await pruneRateLimits(payload, 'volunteer')
  await clearDraft(payload)

  redirect('/vrijwilligers/bevestiging?verzonden=1')
}

import 'server-only'

import { randomBytes } from 'crypto'

import { cookies } from 'next/headers'
import type { Payload } from 'payload'

/**
 * The half-finished volunteer application, carried between the four steps of
 * the form. ROADMAP 2.6, redrawn to
 * docs/design/07-vrijwilliger-aanmeldformulier.png.
 *
 * The answers live in Payload's key-value store and the cookie holds nothing
 * but an opaque id. Keeping them in the cookie itself would have been less
 * code, but it would mean a visitor's name, telephone number and availability
 * riding along on every request to the site, written to any intermediate log
 * that records headers. An id that means nothing on its own does not.
 *
 * The same reasoning as the rate limiter: the store is the only thing every
 * serverless instance shares, so a draft survives the visitor being served by
 * a different instance on the next step.
 */

const COOKIE = 'samenzin-vrijwilliger-concept'
const KEY_PREFIX = 'volunteer-draft:'

/** Long enough to fill in four steps, short enough not to linger. */
const TTL_MS = 2 * 60 * 60 * 1000

export type VolunteerDraft = {
  name?: string
  email?: string
  phone?: string
  city?: string
  interests?: string[]
  skills?: string[]
  languageLevel?: string
  availability?: string[]
  message?: string
  expiresAt?: number
}

const keyFor = (id: string) => `${KEY_PREFIX}${id}`

/** Reads the draft, or an empty one. Never throws: a lost draft is not an error. */
export async function readDraft(payload: Payload): Promise<VolunteerDraft> {
  const id = (await cookies()).get(COOKIE)?.value

  if (!id) return {}

  try {
    const stored = await payload.kv.get<VolunteerDraft>(keyFor(id))

    if (!stored) return {}
    if (stored.expiresAt && stored.expiresAt < Date.now()) return {}

    return stored
  } catch (error) {
    console.error('Could not read the volunteer draft', error)
    return {}
  }
}

/** Merges one step's answers into the draft and returns the merged result. */
export async function saveDraft(
  payload: Payload,
  patch: VolunteerDraft,
): Promise<VolunteerDraft> {
  const store = await cookies()
  let id = store.get(COOKIE)?.value

  if (!id) {
    id = randomBytes(16).toString('hex')
    store.set(COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: TTL_MS / 1000,
    })
  }

  const current = await readDraft(payload)
  const merged: VolunteerDraft = { ...current, ...patch, expiresAt: Date.now() + TTL_MS }

  try {
    await payload.kv.set(keyFor(id), merged)
  } catch (error) {
    // The visitor would lose the step they just filled in, which the caller
    // reports; never crash the form over it.
    console.error('Could not save the volunteer draft', error)
  }

  return merged
}

/** Called once the application has been stored. Leaves nothing behind. */
export async function clearDraft(payload: Payload): Promise<void> {
  const store = await cookies()
  const id = store.get(COOKIE)?.value

  store.delete(COOKIE)

  if (!id) return

  try {
    await payload.kv.delete(keyFor(id))
  } catch (error) {
    console.error('Could not clear the volunteer draft', error)
  }
}

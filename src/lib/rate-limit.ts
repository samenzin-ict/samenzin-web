import { createHash } from 'crypto'

import type { Payload } from 'payload'

/**
 * Rate limiting for the public form.
 *
 * A honeypot stops ordinary bots but not somebody determined, and the contact
 * form writes to the database on every submission. This caps how fast one
 * caller can do that.
 *
 * The counts live in Payload's key-value store, which is backed by the
 * database. An in-memory counter would be close to useless in production:
 * every serverless invocation can be a fresh instance, so each one would allow
 * the whole quota. The database is the only thing all instances share.
 *
 * Privacy: the caller's IP address is never stored, logged or written to a
 * document. It is hashed with the application secret and only the hash is
 * used as a key. ARCHITECTURE.md asks the contact form to keep the minimum,
 * and an address we cannot reverse is the least we can work with while still
 * counting requests.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

/*
 * One namespace per form. Sharing a namespace would mean somebody who filled
 * in the contact form five times could no longer volunteer, which is a
 * connection nobody would guess from the error message.
 */
export type RateLimitScope = 'contact' | 'volunteer'

const keyPrefix = (scope: RateLimitScope) => `${scope}-rate-limit:`

const fingerprint = (identifier: string): string =>
  createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${identifier}`)
    .digest('hex')

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

export async function checkRateLimit(
  payload: Payload,
  identifier: string,
  scope: RateLimitScope = 'contact',
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const key = `${keyPrefix(scope)}${fingerprint(identifier)}`

  let recent: number[] = []

  try {
    const stored = await payload.kv.get<{ hits: number[] }>(key)
    recent = (stored?.hits ?? []).filter((time) => time > windowStart)
  } catch (error) {
    /*
     * Never let the limiter block a genuine message. If the store cannot be
     * read the submission goes through: losing a contact form is worse than
     * missing one rate-limit decision.
     */
    console.error('Rate limit lookup failed; allowing the request', error)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0] ?? now
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    }
  }

  try {
    await payload.kv.set(key, { hits: [...recent, now] })
  } catch (error) {
    console.error('Rate limit write failed; allowing the request', error)
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

/**
 * Removes entries whose window has passed.
 *
 * The store has no expiry of its own, so without this the table grows for
 * every caller that ever submitted. Called after a successful submission,
 * which is rare enough to be a cheap place to do it.
 */
export async function pruneRateLimits(
  payload: Payload,
  scope: RateLimitScope = 'contact',
): Promise<void> {
  try {
    const cutoff = Date.now() - WINDOW_MS
    const keys = (await payload.kv.keys()).filter((key) => key.startsWith(keyPrefix(scope)))

    for (const key of keys) {
      const stored = await payload.kv.get<{ hits: number[] }>(key)

      if (!stored?.hits?.some((time) => time > cutoff)) {
        await payload.kv.delete(key)
      }
    }
  } catch (error) {
    console.error('Pruning rate limit entries failed', error)
  }
}

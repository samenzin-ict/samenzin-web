import { createHash } from 'crypto'

/**
 * A small in-memory rate limiter for the public form.
 *
 * A honeypot stops ordinary bots but not somebody determined, and the contact
 * form writes to the database on every submission. This caps how fast one
 * caller can do that.
 *
 * Privacy: the caller's IP address is never stored, logged or written to the
 * database. It is hashed with the application secret and only the hash is held,
 * in memory, for the length of the window. ARCHITECTURE.md says the contact
 * form stores the minimum, and an address we cannot reverse is the least we can
 * work with while still counting requests.
 *
 * Two limitations a maintainer should know about, both acceptable for a single
 * container on one VPS but not if that ever changes:
 *
 * - The counts live in memory, so a restart clears them.
 * - They are per process, so several instances would each allow the limit.
 *
 * If the deployment ever grows past one instance, move this to the database or
 * put it in front of the application.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

const hits = new Map<string, number[]>()

const fingerprint = (identifier: string): string =>
  createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${identifier}`)
    .digest('hex')

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const key = fingerprint(identifier)
  const windowStart = now - WINDOW_MS

  const recent = (hits.get(key) ?? []).filter((time) => time > windowStart)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0] ?? now
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    }
  }

  recent.push(now)
  hits.set(key, recent)

  /*
   * Drop keys whose window has passed. Without this the map grows for as long
   * as the process lives, which on a long-running server is a slow leak.
   */
  for (const [existingKey, times] of hits) {
    if (times.every((time) => time <= windowStart)) hits.delete(existingKey)
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

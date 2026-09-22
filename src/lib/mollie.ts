import createMollieClient, { type MollieClient } from '@mollie/api-client'

/**
 * The Mollie client, or null when the foundation's account does not exist yet.
 *
 * ROADMAP.md says the donation page ships in a disabled state rather than
 * holding the whole site back, so every caller has to cope with there being no
 * client. Returning null rather than throwing is what makes that possible.
 */
let cached: MollieClient | null = null

export const isDonationEnabled = (): boolean => Boolean(process.env.MOLLIE_API_KEY?.trim())

export const getMollieClient = (): MollieClient | null => {
  const apiKey = process.env.MOLLIE_API_KEY?.trim()

  if (!apiKey) return null
  if (cached) return cached

  cached = createMollieClient({ apiKey })
  return cached
}

/**
 * Mollie wants amounts as a decimal string with exactly two places, and it is
 * strict about it: 10 is rejected where "10.00" is accepted.
 */
export const formatAmount = (euros: number): string => euros.toFixed(2)

/** The amounts offered on the donation page, per docs/design/04-doneren.png. */
export const SUGGESTED_AMOUNTS = [10, 25, 50, 100] as const

export const MIN_AMOUNT = 1
export const MAX_AMOUNT = 10_000

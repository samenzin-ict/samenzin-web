import createMollieClient, { type MollieClient } from '@mollie/api-client'

import { getSiteUrl } from '@/lib/site-url'

/**
 * The Mollie client, or null when the foundation's account does not exist yet.
 *
 * ROADMAP.md says the donation page ships in a disabled state rather than
 * holding the whole site back, so every caller has to cope with there being no
 * client. Returning null rather than throwing is what makes that possible.
 */
let cached: MollieClient | null = null

/**
 * The key, or null when there is none or it is the wrong kind for where this
 * runs.
 *
 * Mollie keys say their mode in their prefix. A live key on the Preview would
 * take real money from somebody testing; a test key in Production would show
 * real visitors a checkout where nothing is paid, while the site thanks them.
 * Either is refused, and the page falls back to its disabled state, which is
 * visible, rather than to a mistake that is not. Locally (no VERCEL_ENV) any
 * key is accepted.
 */
const getApiKey = (): string | null => {
  const apiKey = process.env.MOLLIE_API_KEY?.trim()

  if (!apiKey) return null

  const environment = process.env.VERCEL_ENV
  const isLive = apiKey.startsWith('live_')

  if (environment === 'production' && !isLive) {
    console.error('MOLLIE_API_KEY in Production is not a live key; donations stay switched off')
    return null
  }

  if (environment && environment !== 'production' && isLive) {
    console.error(`MOLLIE_API_KEY on ${environment} is a live key; donations stay switched off`)
    return null
  }

  return apiKey
}

export const isDonationEnabled = (): boolean => getApiKey() !== null

export const getMollieClient = (): MollieClient | null => {
  const apiKey = getApiKey()

  if (!apiKey) return null
  if (cached) return cached

  cached = createMollieClient({ apiKey })
  return cached
}

/**
 * Where Mollie should report a payment's changes, or undefined for none.
 *
 * `MOLLIE_WEBHOOK_URL` wins when set. Otherwise the address is derived from the
 * site's own origin, which is right in Production and is the only thing that
 * works on the Preview, where every deployment has a different hostname.
 *
 * A preview sits behind Vercel's deployment protection, which would answer
 * Mollie with a login page. Vercel's "Protection Bypass for Automation" secret,
 * which it exposes to the deployment as VERCEL_AUTOMATION_BYPASS_SECRET, lets
 * the callback through as a query parameter. It is a preview-only secret and
 * only ever reaches Mollie's test mode.
 *
 * Locally there is none: Mollie cannot reach a laptop and refuses a localhost
 * webhook outright, so the record stays "open".
 */
export const getWebhookUrl = (): string | undefined => {
  const configured = process.env.MOLLIE_WEBHOOK_URL?.trim()

  if (configured) return configured

  const siteUrl = getSiteUrl()

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(siteUrl)) return undefined

  const url = new URL('/api/mollie-webhook', siteUrl)
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()

  if (process.env.VERCEL_ENV === 'preview' && bypass) {
    url.searchParams.set('x-vercel-protection-bypass', bypass)
  }

  return url.toString()
}

/**
 * Mollie wants amounts as a decimal string with exactly two places, and it is
 * strict about it: 10 is rejected where "10.00" is accepted.
 */
export const formatAmount = (euros: number): string => euros.toFixed(2)

/** Holds the id of the visitor's last payment, for the return page. */
export const DONATION_COOKIE = 'donation-payment'

/** The amounts offered on the donation page, per docs/design/04-doneren.png. */
export const SUGGESTED_AMOUNTS = [10, 25, 50, 100] as const

export const MIN_AMOUNT = 1
export const MAX_AMOUNT = 10_000

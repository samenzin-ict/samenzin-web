import { cookies } from 'next/headers'

import { DONATION_COOKIE } from '@/lib/mollie'

/**
 * Lets the return page say how this visitor's own payment went. Only an id,
 * readable by nothing but the server, and gone within the hour. It is
 * functional, not tracking, so it needs no consent banner.
 *
 * In its own module rather than in a 'use server' file, where every export
 * becomes an action a browser can call.
 */
export async function rememberPayment(paymentId: string, siteUrl: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(DONATION_COOKIE, paymentId, {
    httpOnly: true,
    secure: siteUrl.startsWith('https://'),
    // Lax is what lets it come along on the top-level return from Mollie.
    sameSite: 'lax',
    path: '/doneren',
    maxAge: 60 * 60,
  })
}

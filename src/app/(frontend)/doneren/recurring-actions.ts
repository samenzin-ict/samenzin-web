'use server'

import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import { findRecurringByKey, startFirstPayment } from '@/lib/donations'
import { getPayloadClient } from '@/lib/payload'
import { getSiteUrl } from '@/lib/site-url'

import { rememberPayment } from './payment-cookie'

/**
 * The two actions behind the links in a donor's e-mails. The key in the link
 * is the only credential, so each action looks the gift up by it again rather
 * than trusting anything the page posted, and does only what that gift's kind
 * and status allow.
 */

export type LinkActionState = { status: 'idle' | 'error' | 'done'; error?: string }

const findByKey = async (key: string) => findRecurringByKey(await getPayloadClient(), key)

/** Starts a periodic gift once the signed agreement is in. */
export async function startPeriodicGift(
  key: string,
  _previous: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const messages = getMessages()

  if (formData.get('mandate') !== 'on') return { status: 'error', error: messages.donateErrorMandate }

  const recurring = await findByKey(key)

  if (!recurring || recurring.kind !== 'periodic' || !['invited', 'pending'].includes(recurring.status)) {
    return { status: 'error', error: messages.recurringNotRunning }
  }

  let checkoutUrl = ''

  try {
    const payload = await getPayloadClient()
    const started = await startFirstPayment(payload, recurring)

    checkoutUrl = started.checkoutUrl
    await rememberPayment(started.paymentId, getSiteUrl())
  } catch (error) {
    console.error('Could not start a periodic gift', error)
    return { status: 'error', error: messages.donateErrorGeneric }
  }

  if (!checkoutUrl) return { status: 'error', error: messages.donateErrorGeneric }

  redirect(checkoutUrl)
}

/**
 * Stops a monthly gift. The collection's hook revokes the mandate at Mollie
 * before the record may change, and mails the donor a confirmation.
 */
export async function stopMonthlyGift(
  key: string,
  _previous: LinkActionState,
  _formData: FormData,
): Promise<LinkActionState> {
  const messages = getMessages()
  const recurring = await findByKey(key)

  if (!recurring || recurring.kind !== 'monthly') return { status: 'error', error: messages.stopError }

  // Already stopped is what the donor wanted.
  if (['stopped', 'failed', 'completed'].includes(recurring.status)) return { status: 'done' }

  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: 'recurring-donations',
      id: recurring.id,
      overrideAccess: true,
      data: { status: 'stopped' },
      context: { stoppedBy: 'donor' },
    })
  } catch (error) {
    console.error('Could not stop a monthly gift', error)
    return { status: 'error', error: messages.stopError }
  }

  return { status: 'done' }
}

import { getMollieClient } from '@/lib/mollie'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/*
 * Mollie's own statuses. Kept as a set rather than a union so an unfamiliar
 * value from Mollie is ignored instead of being written into the record.
 */
const KNOWN_STATUSES = new Set(['open', 'pending', 'paid', 'canceled', 'expired', 'failed'])

/**
 * Where Mollie tells us a payment changed.
 *
 * The body carries only an id, and that is all it is trusted for. The payment
 * is re-fetched from Mollie over an authenticated connection and the fetched
 * status is what gets written. ARCHITECTURE.md is explicit: the webhook plus a
 * server-side re-fetch is the only source of truth, never the return URL.
 *
 * Anyone can post here, so the endpoint must be safe to call with a made-up
 * id: an unknown payment simply does not match a record and nothing happens.
 *
 * Mollie retries on a non-2xx response, so this answers 200 for anything it
 * has finished handling, including cases with nothing to do. A 500 is reserved
 * for a genuine failure that a retry might fix.
 */
export async function POST(request: Request): Promise<Response> {
  const mollie = getMollieClient()

  if (!mollie) {
    console.error('Mollie webhook called while donations are switched off')
    return new Response('Donations are not enabled', { status: 503 })
  }

  let paymentId: string | null = null

  try {
    const body = await request.formData()
    const id = body.get('id')
    paymentId = typeof id === 'string' ? id : null
  } catch {
    paymentId = null
  }

  if (!paymentId) {
    // Nothing to act on, and no amount of retrying will add an id.
    return new Response('Missing payment id', { status: 400 })
  }

  try {
    const payment = await mollie.payments.get(paymentId)
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'donations',
      where: { molliePaymentId: { equals: payment.id } },
      limit: 1,
      overrideAccess: true,
    })

    const donation = docs[0]

    if (!donation) {
      /*
       * Either an id we never issued, or a record that failed to save. Logged
       * so the second case is visible, and answered with 200 so Mollie stops
       * retrying something we cannot resolve by trying again.
       */
      console.error('Mollie webhook for an unknown payment', payment.id)
      return new Response('Unknown payment', { status: 200 })
    }

    if (!KNOWN_STATUSES.has(payment.status)) {
      console.error('Mollie reported an unrecognised status', payment.status)
      return new Response('Unrecognised status', { status: 200 })
    }

    await payload.update({
      collection: 'donations',
      id: donation.id,
      overrideAccess: true,
      data: {
        status: payment.status as
          | 'open'
          | 'pending'
          | 'paid'
          | 'canceled'
          | 'expired'
          | 'failed',
        paidAt: payment.paidAt ?? null,
      },
    })

    return new Response('OK', { status: 200 })
  } catch (error) {
    // A retry may well succeed, so this is one of the few cases worth a 500.
    console.error('Mollie webhook failed', error)
    return new Response('Could not process the webhook', { status: 500 })
  }
}

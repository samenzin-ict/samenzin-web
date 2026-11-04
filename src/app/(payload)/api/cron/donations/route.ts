import config from '@payload-config'
import { getPayload } from 'payload'

import { sendPreNotifications } from '@/lib/donations'

/**
 * The daily pre-notifications for running gifts, invoked by Vercel Cron. See
 * vercel.json and src/lib/donations.ts.
 *
 * Under the SEPA rules the creditor tells the donor before each collection,
 * and for us that is the foundation, not Mollie. So this is a legal duty
 * rather than a nicety: if it stops running, donors are debited unannounced.
 * A failure therefore answers 500, which the Vercel cron log shows, and every
 * message that could not be sent is also reported to the foundation's mailbox.
 *
 * Same authentication as the retention job: Vercel sends
 * `Authorization: Bearer <CRON_SECRET>`, and without that variable the route
 * refuses to run at all. Safe to run twice: what was announced is stored.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    console.error('CRON_SECRET is not set; refusing to run the pre-notifications.')
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await sendPreNotifications(payload)

  if (result.sent > 0 || result.failed > 0) {
    payload.logger.info(
      `Pre-notifications: ${result.sent} sent, ${result.failed} failed, ${result.late} later than three days ahead`,
    )
  }

  return Response.json(result, { status: result.failed > 0 ? 500 : 200 })
}

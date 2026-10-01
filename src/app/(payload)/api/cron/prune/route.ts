import config from '@payload-config'
import { getPayload } from 'payload'

import { pruneExpired } from '@/lib/retention'

/**
 * The daily clear-out, invoked by Vercel Cron. See vercel.json.
 *
 * The privacyverklaring says contact messages are deleted automatically after
 * at most a year. This endpoint is what makes that sentence true, so it is part
 * of the published promise rather than a convenience.
 *
 * Vercel invokes it with GET and, when CRON_SECRET is set on the project, with
 * `Authorization: Bearer <CRON_SECRET>`. Without that variable the route
 * refuses every request rather than running unauthenticated: an open endpoint
 * that deletes records is worse than one that never runs, because the failure
 * is silent in one direction and loud in the other.
 *
 * Deleting rows that are already past their date is idempotent, which is what
 * Vercel asks for: cron delivery is best effort and can both miss a run and
 * duplicate one. A missed day is caught up by the next run, because the work is
 * derived from the stored dates and not from when this last ran.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    console.error('CRON_SECRET is not set; refusing to run the retention job.')
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const results = await pruneExpired(payload)

  const failed = results.filter((result) => result.error)
  const deleted = results.reduce((total, result) => total + result.deleted, 0)

  for (const result of results) {
    if (result.error) {
      payload.logger.error(`Retention: ${result.collection} failed — ${result.error}`)
    } else if (result.deleted > 0) {
      payload.logger.info(`Retention: deleted ${result.deleted} from ${result.collection}`)
    }
  }

  // A non-2xx makes the failure visible in the Vercel cron log instead of
  // looking like a successful run that quietly deleted nothing.
  return Response.json({ deleted, results }, { status: failed.length > 0 ? 500 : 200 })
}

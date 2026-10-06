import type { Payload } from 'payload'

/**
 * Acting on the retention periods the privacyverklaring promises.
 *
 * Retention is a promise until something enforces it, and the published
 * statement makes several out loud: contact messages are "automatisch
 * verwijderd" after at most a year, a member's data is kept "zolang uw account
 * bestaat en daarna 2 jaar", donation records for seven years because the law
 * says so. This is the thing that makes them true.
 *
 * One implementation, two ways in: a daily Vercel cron job hits
 * /api/cron/prune, and `pnpm prune:expired` runs the same code by hand. They
 * must not drift, which is why neither has its own copy of the rules.
 *
 * The convention is the same everywhere: a `deleteAfter` date is written when
 * the clock starts, and a record with no `deleteAfter` is never touched. That
 * absence is how a record is marked "keep" — an approved membership
 * application, an active member, a donation whose name has already come off.
 */

/**
 * What happens when the date passes.
 *
 * Two kinds, because for a donation the right answer is not deletion. The
 * amount, the date and the payment reference are what the obligation is about
 * and what the accountant and the ANBI figures need; the donor's name and
 * e-mail address are the personal data. Removing those on their own keeps the
 * promise without destroying a financial record.
 */
export type RetentionRule =
  | { collection: 'contact-submissions'; action: 'delete' }
  | { collection: 'volunteer-applications'; action: 'delete' }
  | { collection: 'membership-applications'; action: 'delete' }
  | { collection: 'members'; action: 'delete' }
  | { collection: 'donations'; action: 'anonymise' }

export const RETENTION_RULES: readonly RetentionRule[] = [
  { collection: 'contact-submissions', action: 'delete' },
  { collection: 'volunteer-applications', action: 'delete' },
  { collection: 'membership-applications', action: 'delete' },
  /*
   * Members last of the deletions. Deleting one cascades to their hours,
   * tasks, enrolments and registrations through the beforeDelete hook on the
   * collection, so it is the most expensive and the most worth having already
   * finished the cheap work before.
   */
  { collection: 'members', action: 'delete' },
  { collection: 'donations', action: 'anonymise' },
]

export type RetentionCollection = RetentionRule['collection']

export type PruneResult = {
  collection: RetentionCollection
  action: RetentionRule['action']
  /** Rows deleted, or rows anonymised. */
  affected: number
  error?: string
}

/** How many to take in one pass, so a long backlog cannot run a function out of time. */
const BATCH = 500

/**
 * Deals with everything past its date. Safe to run twice and safe to miss a
 * run: it works from the stored dates rather than from when it last ran, which
 * is what Vercel asks of a cron job, since delivery is best effort and can
 * occasionally duplicate.
 */
export async function pruneExpired(payload: Payload): Promise<PruneResult[]> {
  const now = new Date().toISOString()
  const results: PruneResult[] = []

  for (const rule of RETENTION_RULES) {
    try {
      const { docs } = await payload.find({
        collection: rule.collection,
        where: {
          and: [{ deleteAfter: { exists: true } }, { deleteAfter: { less_than: now } }],
        },
        limit: BATCH,
        depth: 0,
        overrideAccess: true,
      })

      for (const doc of docs) {
        if (rule.action === 'delete') {
          await payload.delete({ collection: rule.collection, id: doc.id, overrideAccess: true })
          continue
        }

        await payload.update({
          collection: rule.collection,
          id: doc.id,
          overrideAccess: true,
          data: {
            donorName: null,
            donorEmail: null,
            /*
             * Marked anonymous so the admin panel and the CSV export read the
             * same as a gift that was given anonymously, and cleared of its
             * date so it is done and does not come up again tomorrow.
             */
            anonymous: true,
            deleteAfter: null,
          },
        })
      }

      results.push({ collection: rule.collection, action: rule.action, affected: docs.length })
    } catch (error) {
      /*
       * One collection failing must not stop the others: a message that should
       * have been deleted staying another day is a broken promise, and the
       * fewer of those the better. The failure is reported, not swallowed.
       */
      results.push({
        collection: rule.collection,
        action: rule.action,
        affected: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

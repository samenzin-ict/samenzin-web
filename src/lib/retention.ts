import type { Payload } from 'payload'

/**
 * Deleting personal data once its retention period has passed.
 *
 * Retention is a promise until something acts on it, and the published
 * privacyverklaring makes that promise out loud: contact messages are
 * "automatisch verwijderd" after at most a year. This is the thing that makes
 * it true.
 *
 * One implementation, two ways in: a daily Vercel cron job hits
 * /api/cron/prune, and `pnpm prune:expired` runs the same code by hand. They
 * must not drift, which is why neither has its own copy of the rules.
 *
 * The convention is the same everywhere: a `deleteAfter` date is written when
 * the record arrives, and a record with no `deleteAfter` is never touched.
 * That absence is how an approved membership application is kept — it is the
 * evidence that a membership was granted.
 */

/** Collections that carry personal data on a clock. */
export const RETENTION_COLLECTIONS = [
  'contact-submissions',
  'volunteer-applications',
  'membership-applications',
] as const

export type RetentionCollection = (typeof RETENTION_COLLECTIONS)[number]

export type PruneResult = {
  collection: RetentionCollection
  deleted: number
  error?: string
}

/** How many to take in one pass, so a long backlog cannot run a function out of time. */
const BATCH = 500

/**
 * Deletes everything past its date. Safe to run twice and safe to miss a run:
 * it works from the stored dates rather than from when it last ran, which is
 * what Vercel asks of a cron job, since delivery is best effort and can
 * occasionally duplicate.
 */
export async function pruneExpired(payload: Payload): Promise<PruneResult[]> {
  const now = new Date().toISOString()
  const results: PruneResult[] = []

  for (const collection of RETENTION_COLLECTIONS) {
    try {
      const { docs } = await payload.find({
        collection,
        where: {
          and: [{ deleteAfter: { exists: true } }, { deleteAfter: { less_than: now } }],
        },
        limit: BATCH,
        depth: 0,
        overrideAccess: true,
      })

      for (const doc of docs) {
        await payload.delete({ collection, id: doc.id, overrideAccess: true })
      }

      results.push({ collection, deleted: docs.length })
    } catch (error) {
      /*
       * One collection failing must not stop the others: a message that should
       * have been deleted staying another day is a broken promise, and the
       * fewer of those the better. The failure is reported, not swallowed.
       */
      results.push({
        collection,
        deleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Deletes applications whose retention period has passed.
 *
 * Retention is a promise until something acts on it. Run this from a scheduled
 * job, or by hand: `pnpm prune:applications`.
 *
 * Deletes by the `deleteAfter` date written when the application arrived, not
 * by recalculating from today, so changing the retention period later does not
 * silently reach back and delete older records early. A record with no
 * `deleteAfter` is never touched: that is how an approved membership
 * application is kept.
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'

const COLLECTIONS: CollectionSlug[] = ['volunteer-applications', 'membership-applications']

const payload = await getPayload({ config })
const now = new Date().toISOString()

let total = 0

for (const collection of COLLECTIONS) {
  const { docs } = await payload.find({
    collection,
    // exists: true keeps records that were deliberately given no delete-by date.
    where: { and: [{ deleteAfter: { exists: true } }, { deleteAfter: { less_than: now } }] },
    limit: 1000,
    overrideAccess: true,
  })

  for (const doc of docs) {
    await payload.delete({ collection, id: doc.id, overrideAccess: true })
  }

  console.log(`${collection}: deleted ${docs.length}`)
  total += docs.length
}

if (total === 0) {
  console.log('Nothing to delete: no application is past its retention date.')
} else {
  console.log(`Deleted ${total} application(s) past their retention date.`)
}

process.exit(0)

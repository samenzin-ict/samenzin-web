/**
 * Deletes volunteer applications whose retention period has passed.
 *
 * Retention is a promise until something acts on it. Run this from a scheduled
 * job, or by hand: `pnpm prune:applications`.
 *
 * Deletes by the `deleteAfter` date written when the application arrived, not
 * by recalculating from today, so changing the retention period later does not
 * silently reach back and delete older records early.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const now = new Date().toISOString()

const { docs } = await payload.find({
  collection: 'volunteer-applications',
  where: { deleteAfter: { less_than: now } },
  limit: 1000,
  overrideAccess: true,
})

if (docs.length === 0) {
  console.log('Nothing to delete: no application is past its retention date.')
  process.exit(0)
}

for (const doc of docs) {
  await payload.delete({ collection: 'volunteer-applications', id: doc.id, overrideAccess: true })
}

console.log(`Deleted ${docs.length} application(s) past their retention date.`)
process.exit(0)

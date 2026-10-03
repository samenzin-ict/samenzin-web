/**
 * Acts on personal data whose retention period has passed: deletes it, or for a
 * donation takes the donor's name off a row that stays.
 *
 * The same code the daily cron job runs; see src/lib/retention.ts. This is the
 * way to run it by hand, or against an environment that has no scheduler:
 *
 *   pnpm prune:expired
 *
 * Against a hosted database, go through `pnpm neon`-style variables rather than
 * pointing DATABASE_URI at it casually, and set NODE_ENV=production so Payload
 * does not connect with schema push enabled.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { pruneExpired } from '../src/lib/retention'

const payload = await getPayload({ config })
const results = await pruneExpired(payload)

let total = 0
let failed = false

for (const result of results) {
  if (result.error) {
    failed = true
    console.error(`  ${result.collection}: FAILED — ${result.error}`)
  } else {
    const verb = result.action === 'delete' ? 'deleted' : 'anonymised'
    console.log(`  ${result.collection}: ${verb} ${result.affected}`)
    total += result.affected
  }
}

console.log(
  total === 0 && !failed
    ? 'Nothing to do: no record is past its retention date.'
    : `Handled ${total} record(s) past their retention date.`,
)

process.exit(failed ? 1 : 0)

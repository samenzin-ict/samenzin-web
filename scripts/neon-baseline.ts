/**
 * Records every migration as already applied, without running any of them.
 *
 * Only for a database whose schema was *pushed* rather than migrated. Payload
 * pushes when it connects with `push: true`, which src/payload.config.ts turns
 * on whenever NODE_ENV is not "production". The schema that arrives is real and
 * correct, but nothing is written to payload_migrations, so the next
 * `payload migrate` tries to create tables that already exist and fails.
 *
 * Payload marks a pushed database with a row named "dev" and batch -1. That row
 * is what makes `payload migrate` warn about data loss. This removes it, once
 * the bookkeeping it stands for has been written properly.
 *
 * Run it only after proving the schema matches. Build a database from the
 * migrations alone and compare information_schema.columns between the two; they
 * must be identical, column for column. If they are not, find out which
 * migration the pushed schema diverges from instead of baselining over it.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { migrations } from '../src/migrations'

const payload = await getPayload({ config })

const db = payload.db as unknown as {
  pool?: {
    query: (q: string, v?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number }>
  }
}

if (!db.pool) throw new Error('No database pool available.')

const query = (sql: string, values?: unknown[]) => db.pool!.query(sql, values)

const before = await query('select name, batch from payload_migrations order by id')
console.log('Recorded now:')
for (const row of before.rows) console.log(`  ${row.name} (batch ${row.batch})`)

const pushed = before.rows.some((row) => row.name === 'dev' && Number(row.batch) === -1)

if (!pushed) {
  console.log('\nNo "dev" marker found. This database was not pushed to, so there is')
  console.log('nothing to baseline. Use `pnpm migrate:prod` instead.')
  process.exit(0)
}

const applied = new Set(before.rows.map((row) => String(row.name)))
const pending = migrations.filter((migration) => !applied.has(migration.name))

console.log(`\nWill record ${pending.length} migration(s) as applied and remove the "dev" marker.`)

const timestamp = new Date().toISOString()

for (const migration of pending) {
  await query(
    'insert into payload_migrations (name, batch, created_at, updated_at) values ($1, $2, $3, $4)',
    [migration.name, 2, timestamp, timestamp],
  )
  console.log(`  recorded ${migration.name}`)
}

const removed = await query("delete from payload_migrations where batch = -1 and name = 'dev'")
console.log(`  removed ${removed.rowCount} "dev" marker row(s)`)

const after = await query('select count(*)::int as n from payload_migrations')
console.log(`\nDone. payload_migrations now holds ${after.rows[0]?.n} row(s).`)
console.log('Check it with `pnpm status:prod`; everything should read Yes.')

process.exit(0)

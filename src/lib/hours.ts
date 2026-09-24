import 'server-only'

import type { Payload } from 'payload'

import type { Member, VolunteerHour } from '@/payload-types'

/**
 * Reading a member's own hours (ROADMAP 3.5).
 *
 * Every query goes through the access rule rather than around it: the calls
 * pass `overrideAccess: false` together with the member, so Payload folds
 * `member equals <id>` into the SQL and another member's rows are never
 * fetched. Passing the id in a `where` clause with `overrideAccess: true`
 * would look identical and rely on this file staying correct forever.
 */

/** The most a member can have registered in a year before the page truncates. */
const MAX_ENTRIES = 500

export async function getMemberHours(
  payload: Payload,
  member: Member,
): Promise<VolunteerHour[]> {
  const { docs } = await payload.find({
    collection: 'volunteer-hours',
    overrideAccess: false,
    user: member,
    sort: '-date',
    limit: MAX_ENTRIES,
    depth: 0,
  })

  return docs
}

/** Total hours in a list, rounded to avoid floating point noise like 7.000001. */
export const sumHours = (entries: VolunteerHour[]): number =>
  Math.round(entries.reduce((total, entry) => total + (entry.hours ?? 0), 0) * 100) / 100

/** Total for one calendar year, which is how the board reports them. */
export const sumHoursForYear = (entries: VolunteerHour[], year: number): number =>
  sumHours(entries.filter((entry) => new Date(entry.date).getFullYear() === year))

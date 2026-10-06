import 'server-only'

import type { Payload } from 'payload'

import type { Project } from '@/payload-types'

/**
 * What a project has actually raised.
 *
 * Two parts, deliberately. `funding.raised` on the project is what came in
 * away from the website — bank transfers, collections, a pledge from a fund —
 * which an editor types in because nothing else knows about it. On top of that
 * come the paid donations earmarked for this project, which are counted here.
 *
 * Only `status: 'paid'` counts. An "open" donation is somebody who reached
 * Mollie's checkout and may never have finished, and showing it on a public
 * progress bar would overstate what the project has.
 *
 * Counted with access overridden. A donation record names the donor, and none
 * of that leaves this module: only a total does.
 */

const PAGE = 500

/** The paid total earmarked for one project, in euro. */
export async function getPaidForProject(payload: Payload, projectId: number): Promise<number> {
  return (await getPaidByProject(payload, [projectId])).get(projectId) ?? 0
}

/**
 * The paid totals for several projects at once, so the overview page makes one
 * query rather than one per card.
 *
 * Summed in this process rather than with SQL, which keeps it inside the
 * Payload API and so inside whatever database this runs on. A foundation's
 * donation table is in the thousands of rows, not the millions; if that ever
 * stops being true this is the place to put a GROUP BY.
 */
export async function getPaidByProject(
  payload: Payload,
  projectIds: number[],
): Promise<Map<number, number>> {
  const totals = new Map<number, number>()

  if (projectIds.length === 0) return totals

  let page = 1

  for (;;) {
    const { docs, hasNextPage } = await payload.find({
      collection: 'donations',
      where: {
        and: [{ status: { equals: 'paid' } }, { project: { in: projectIds } }],
      },
      overrideAccess: true,
      depth: 0,
      limit: PAGE,
      page,
      select: { amount: true, project: true },
    })

    for (const donation of docs) {
      const id = typeof donation.project === 'object' ? donation.project?.id : donation.project

      if (typeof id !== 'number' || typeof donation.amount !== 'number') continue

      totals.set(id, (totals.get(id) ?? 0) + donation.amount)
    }

    if (!hasNextPage) break
    page += 1
  }

  return totals
}

/** The number to show on the progress bar: typed in, plus what came in online. */
export const totalRaised = (project: Project, paidOnline: number): number =>
  Math.max(0, project.funding?.raised ?? 0) + paidOnline

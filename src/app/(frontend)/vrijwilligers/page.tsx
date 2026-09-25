import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { VolunteerShell } from '@/app/(frontend)/vrijwilligers/shell'
import { DetailsStep } from '@/components/volunteer/DetailsStep'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'
import { getPayloadClient } from '@/lib/payload'
import { readDraft } from '@/lib/volunteer-draft'

export const dynamic = 'force-dynamic'

const VOLUNTEER_SLUG = 'vrijwilligers'

/**
 * Step 1 of becoming a volunteer. ROADMAP 2.6, redrawn to docs/design/07.
 *
 * A fixed route rather than a plain CMS page, because the form has to live
 * somewhere. An editor can still change the heading and the introduction by
 * creating a page with the slug "vrijwilligers".
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const [page, settings] = await Promise.all([
    getPageBySlug(VOLUNTEER_SLUG, undefined, isDraft),
    getSiteSettings(),
  ])
  const messages = getMessages()

  if (!page) {
    return {
      title: messages.volunteerTitle,
      description: messages.volunteerIntro,
      alternates: { canonical: '/vrijwilligers' },
    }
  }

  return buildPageMetadata({ page, settings })
}

export default async function VolunteerDetailsPage() {
  const { isEnabled: isDraft } = await draftMode()
  const [page, payload] = await Promise.all([
    getPageBySlug(VOLUNTEER_SLUG, undefined, isDraft),
    getPayloadClient(),
  ])
  const draft = await readDraft(payload)
  const messages = getMessages()

  return (
    <VolunteerShell messages={messages} step={0} title={page?.title}>
      <DetailsStep messages={messages} draft={draft} />
    </VolunteerShell>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { VolunteerShell } from '@/app/(frontend)/vrijwilligers/shell'
import { AvailabilityStep } from '@/components/volunteer/AvailabilityStep'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { readDraft } from '@/lib/volunteer-draft'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Beschikbaarheid',
  robots: { index: false, follow: false },
}

/** Step 3. */
export default async function VolunteerAvailabilityPage() {
  const payload = await getPayloadClient()
  const draft = await readDraft(payload)

  if (!draft.name) redirect('/vrijwilligers')
  if (!draft.interests || draft.interests.length === 0) redirect('/vrijwilligers/interesses')

  const messages = getMessages()

  return (
    <VolunteerShell messages={messages} step={2}>
      <AvailabilityStep messages={messages} draft={draft} />
    </VolunteerShell>
  )
}

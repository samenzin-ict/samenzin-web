import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { VolunteerShell } from '@/app/(frontend)/vrijwilligers/shell'
import { InterestsStep } from '@/components/volunteer/InterestsStep'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { readDraft } from '@/lib/volunteer-draft'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Interesses',
  robots: { index: false, follow: false },
}

/** Step 2. Landing here without step 1 filled in goes back to the start. */
export default async function VolunteerInterestsPage() {
  const payload = await getPayloadClient()
  const draft = await readDraft(payload)

  if (!draft.name) redirect('/vrijwilligers')

  const messages = getMessages()

  return (
    <VolunteerShell messages={messages} step={1}>
      <InterestsStep messages={messages} draft={draft} />
    </VolunteerShell>
  )
}

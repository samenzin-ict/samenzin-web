import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { VolunteerShell } from '@/app/(frontend)/vrijwilligers/shell'
import { ConfirmStep } from '@/components/volunteer/ConfirmStep'
import { getMessages } from '@/i18n'
import { getPayloadClient } from '@/lib/payload'
import { readDraft } from '@/lib/volunteer-draft'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bevestiging',
  robots: { index: false, follow: false },
}

/**
 * Step 4, and the thank-you screen.
 *
 * Both live at the same address. The action clears the draft and redirects
 * back here with ?verzonden=1, so a reload after sending cannot submit a
 * second application: there is no draft left to send.
 */
export default async function VolunteerConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string }>
}) {
  const { verzonden } = await searchParams
  const messages = getMessages()

  if (verzonden) {
    return (
      <VolunteerShell messages={messages} step={3}>
        <div role="status" className="space-y-4">
          <h2 className="font-heading text-2xl">{messages.volunteerSuccess}</h2>
          <p>{messages.volunteerIntakeNotice}</p>
        </div>
      </VolunteerShell>
    )
  }

  const payload = await getPayloadClient()
  const draft = await readDraft(payload)

  if (!draft.name) redirect('/vrijwilligers')
  if (!draft.interests || draft.interests.length === 0) redirect('/vrijwilligers/interesses')

  return (
    <VolunteerShell messages={messages} step={3}>
      <ConfirmStep messages={messages} draft={draft} />
    </VolunteerShell>
  )
}

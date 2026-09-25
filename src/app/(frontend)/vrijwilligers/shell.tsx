import React from 'react'

import { Container } from '@/components/layout/Container'
import { StepIndicator } from '@/components/volunteer/StepIndicator'
import type { Messages } from '@/i18n'

/**
 * The frame every step of the volunteer form shares: the heading, the
 * four-segment progress bar and the card the fields sit in, as drawn in
 * docs/design/07-vrijwilliger-aanmeldformulier.png.
 */
export function VolunteerShell({
  messages,
  step,
  title,
  intro,
  children,
}: {
  messages: Messages
  step: number
  title?: string | null
  intro?: string | null
  children: React.ReactNode
}) {
  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {title ?? messages.volunteerTitle}
          </h1>
          <p className="max-w-prose">{intro ?? messages.volunteerIntro}</p>
        </div>

        <StepIndicator messages={messages} current={step} />

        <div className="rounded-lg border border-border bg-card p-6 md:p-8">{children}</div>
      </div>
    </Container>
  )
}

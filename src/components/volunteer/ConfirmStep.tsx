'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { submitApplication, type StepState } from '@/app/(frontend)/vrijwilligers/actions'
import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { Button } from '@/components/ui/button'
import { IntakeNotice } from '@/components/volunteer/IntakeNotice'
import {
  AVAILABILITY_OPTIONS,
  CITY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  SKILL_OPTIONS,
  labelFor,
} from '@/fields/volunteering'
import type { Messages } from '@/i18n'
import type { VolunteerDraft } from '@/lib/volunteer-draft'
import { cn } from '@/lib/utils'

const initialState: StepState = { status: 'idle' }

/**
 * Step 4 of docs/design/07: read it back, then send.
 *
 * Every row links to the step that owns it, so correcting a typo does not mean
 * walking through the whole form again.
 */
export function ConfirmStep({ messages, draft }: { messages: Messages; draft: VolunteerDraft }) {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const list = (
    values: string[] | undefined,
    options: readonly { label: string; value: string }[],
  ) =>
    values && values.length > 0
      ? values.map((v) => labelFor(options, v)).join(', ')
      : messages.volunteerConfirmNothing

  const rows: { label: string; value: string; href: string }[] = [
    { label: messages.volunteerNameLabel, value: draft.name ?? '', href: '/vrijwilligers' },
    { label: messages.volunteerEmailLabel, value: draft.email ?? '', href: '/vrijwilligers' },
    {
      label: messages.volunteerPhoneLabel,
      value: draft.phone || messages.volunteerConfirmNothing,
      href: '/vrijwilligers',
    },
    {
      label: messages.volunteerInterestsLabel,
      value: list(draft.interests, INTEREST_OPTIONS),
      href: '/vrijwilligers/interesses',
    },
    {
      label: messages.volunteerSkillsLabel,
      value: list(draft.skills, SKILL_OPTIONS),
      href: '/vrijwilligers/interesses',
    },
    {
      label: messages.volunteerLanguageLabel,
      value: draft.languageLevel
        ? labelFor(LANGUAGE_LEVEL_OPTIONS, draft.languageLevel)
        : messages.volunteerConfirmNothing,
      href: '/vrijwilligers/interesses',
    },
    {
      label: messages.volunteerCityLabel,
      value: draft.city
        ? labelFor(CITY_OPTIONS, draft.city)
        : messages.volunteerConfirmNothing,
      href: '/vrijwilligers/interesses',
    },
    {
      label: messages.volunteerAvailabilityLabel,
      value:
        draft.availability && draft.availability.length > 0
          ? list(draft.availability, AVAILABILITY_OPTIONS)
          : messages.volunteerAvailabilityNone,
      href: '/vrijwilligers/beschikbaarheid',
    },
    {
      label: messages.volunteerMessageLabel,
      value: draft.message || messages.volunteerConfirmNothing,
      href: '/vrijwilligers/beschikbaarheid',
    },
  ]

  return (
    <form action={formAction} className="space-y-8">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status !== 'error' && 'sr-only')}
      >
        {state.errors?.form ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.errors.form}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="font-heading text-2xl">{messages.volunteerConfirmTitle}</h2>
        <p className="text-sm">{messages.volunteerConfirmIntro}</p>
      </div>

      <dl className="divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
            <dt className="w-full font-semibold text-primary sm:w-56">{row.label}</dt>
            <dd className="flex-1">{row.value}</dd>
            <Link
              href={row.href}
              className="text-sm text-accent underline underline-offset-4"
            >
              <span aria-hidden>{messages.volunteerConfirmEdit}</span>
              <span className="sr-only">
                {messages.volunteerConfirmEdit}: {row.label}
              </span>
            </Link>
          </div>
        ))}
      </dl>

      {/* The same honeypot as the other forms; see that module for why. */}
      <div aria-hidden className="absolute left-[-9999px] w-px overflow-hidden">
        <label htmlFor={`${HONEYPOT_FIELD}-volunteer`}>Website</label>
        <input
          id={`${HONEYPOT_FIELD}-volunteer`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="text-sm">
        {messages.volunteerPrivacyNotice}{' '}
        <Link href="/privacyverklaring" className="text-accent underline underline-offset-4">
          {messages.volunteerPrivacyLink}
        </Link>
        .
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <IntakeNotice messages={messages} />
        <div className="flex items-center gap-3">
          <Link
            href="/vrijwilligers/beschikbaarheid"
            className="flex min-h-11 items-center px-2 text-primary underline underline-offset-4"
          >
            {messages.volunteerBack}
          </Link>
          <Button type="submit" variant="cta" disabled={isPending}>
            {isPending ? messages.volunteerSubmitting : messages.volunteerConfirmSubmit}
          </Button>
        </div>
      </div>
    </form>
  )
}

'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'

import { submitInterests, type StepState } from '@/app/(frontend)/vrijwilligers/actions'
import { Button } from '@/components/ui/button'
import { FieldError, LabelledCheckbox, PillCheckbox, inputClass } from '@/components/volunteer/fields'
import { IntakeNotice } from '@/components/volunteer/IntakeNotice'
import {
  CITY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  SKILL_OPTIONS,
} from '@/fields/volunteering'
import type { Messages } from '@/i18n'
import type { VolunteerDraft } from '@/lib/volunteer-draft'
import { cn } from '@/lib/utils'

const initialState: StepState = { status: 'idle' }

/** Step 2 of docs/design/07: interests, skills, Dutch level and city. */
export function InterestsStep({ messages, draft }: { messages: Messages; draft: VolunteerDraft }) {
  const [state, formAction, isPending] = useActionState(submitInterests, initialState)
  const statusRef = useRef<HTMLDivElement>(null)
  const ids = {
    interests: useId(),
    interestsHint: useId(),
    skills: useId(),
    skillsHint: useId(),
    language: useId(),
    city: useId(),
  }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const chosen = new Set(draft.interests ?? [])
  const chosenSkills = new Set(draft.skills ?? [])

  return (
    <form action={formAction} noValidate className="space-y-8">
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

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <fieldset
            aria-describedby={`${ids.interestsHint}${state.errors?.interests ? ` ${ids.interests}-e` : ''}`}
          >
            <legend className="mb-1 font-semibold text-primary">
              {messages.volunteerInterestsLabel}{' '}
              <span className="font-normal text-foreground">({messages.volunteerRequired})</span>
            </legend>
            <p id={ids.interestsHint} className="mb-2 text-sm">
              {messages.volunteerInterestsHint}
            </p>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {INTEREST_OPTIONS.map((option) => (
                <LabelledCheckbox
                  key={option.value}
                  name="interests"
                  value={option.value}
                  label={option.label}
                  defaultChecked={chosen.has(option.value)}
                />
              ))}
            </div>
            <FieldError id={`${ids.interests}-e`} message={state.errors?.interests} />
          </fieldset>

          <fieldset aria-describedby={ids.skillsHint}>
            <legend className="mb-1 font-semibold text-primary">
              {messages.volunteerSkillsLabel}
            </legend>
            <p id={ids.skillsHint} className="mb-2 text-sm">
              {messages.volunteerSkillsHint}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((option) => (
                <PillCheckbox
                  key={option.value}
                  name="skills"
                  value={option.value}
                  label={option.label}
                  defaultChecked={chosenSkills.has(option.value)}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-8">
          <div className="space-y-1.5">
            <label htmlFor={ids.language} className="block font-semibold text-primary">
              {messages.volunteerLanguageLabel}
            </label>
            <select
              id={ids.language}
              name="languageLevel"
              defaultValue={draft.languageLevel ?? ''}
              className={inputClass()}
            >
              <option value="">{messages.volunteerLanguagePlaceholder}</option>
              {LANGUAGE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.city} className="block font-semibold text-primary">
              {messages.volunteerCityLabel}
            </label>
            <select
              id={ids.city}
              name="city"
              defaultValue={draft.city ?? ''}
              className={inputClass()}
            >
              <option value="">{messages.volunteerCityPlaceholder}</option>
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <IntakeNotice messages={messages} />
        <div className="flex items-center gap-3">
          <Link
            href="/vrijwilligers"
            className="flex min-h-11 items-center px-2 text-primary underline underline-offset-4"
          >
            {messages.volunteerBack}
          </Link>
          <Button type="submit" variant="cta" disabled={isPending}>
            {isPending ? messages.volunteerSubmitting : messages.volunteerNext}
          </Button>
        </div>
      </div>
    </form>
  )
}

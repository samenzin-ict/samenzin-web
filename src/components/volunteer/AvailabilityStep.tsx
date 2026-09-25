'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'

import { submitAvailability, type StepState } from '@/app/(frontend)/vrijwilligers/actions'
import { Button } from '@/components/ui/button'
import { inputClass } from '@/components/volunteer/fields'
import { IntakeNotice } from '@/components/volunteer/IntakeNotice'
import { AVAILABILITY_DAYS, AVAILABILITY_PARTS } from '@/fields/volunteering'
import type { Messages } from '@/i18n'
import type { VolunteerDraft } from '@/lib/volunteer-draft'
import { cn } from '@/lib/utils'

const initialState: StepState = { status: 'idle' }

/**
 * Step 3 of docs/design/07: the day-part grid.
 *
 * A real table. The mockup draws a grid of bare checkboxes with the days
 * written once along the top, and out of context "checkbox, checked" tells a
 * screen-reader user nothing. As a table with row and column headers, each box
 * is announced with its day and its part of the day, and every box also
 * carries a visually hidden label for browsers that read the label instead.
 */
export function AvailabilityStep({
  messages,
  draft,
}: {
  messages: Messages
  draft: VolunteerDraft
}) {
  const [state, formAction, isPending] = useActionState(submitAvailability, initialState)
  const statusRef = useRef<HTMLDivElement>(null)
  const ids = { hint: useId(), message: useId() }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const chosen = new Set(draft.availability ?? [])

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

      <div className="space-y-2">
        <h2 className="font-semibold text-primary">{messages.volunteerAvailabilityLabel}</h2>
        <p id={ids.hint} className="text-sm">
          {messages.volunteerAvailabilityHint}
        </p>

        <div className="overflow-x-auto">
          <table className="border-collapse">
            <caption className="sr-only">{messages.volunteerAvailabilityLabel}</caption>
            <thead>
              <tr>
                <td />
                {AVAILABILITY_DAYS.map((day) => (
                  <th key={day.value} scope="col" className="px-2 pb-2 text-sm font-semibold">
                    <span aria-hidden>{day.label}</span>
                    <span className="sr-only">{day.full}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AVAILABILITY_PARTS.map((part) => (
                <tr key={part.value}>
                  <th scope="row" className="py-1 pr-4 text-left font-normal">
                    {part.label}
                  </th>
                  {AVAILABILITY_DAYS.map((day) => {
                    const value = `${day.value}-${part.value}`

                    return (
                      <td key={value} className="px-2 py-1 text-center">
                        <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            name="availability"
                            value={value}
                            defaultChecked={chosen.has(value)}
                            className="size-5 accent-[var(--primary)]"
                          />
                          <span className="sr-only">
                            {day.full} {part.label.toLowerCase()}
                          </span>
                        </label>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-prose space-y-1.5">
        <label htmlFor={ids.message} className="block font-semibold text-primary">
          {messages.volunteerMessageLabel}
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={5}
          defaultValue={draft.message ?? ''}
          className={cn(inputClass(), 'min-h-28')}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <IntakeNotice messages={messages} />
        <div className="flex items-center gap-3">
          <Link
            href="/vrijwilligers/interesses"
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

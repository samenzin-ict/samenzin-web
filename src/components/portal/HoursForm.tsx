'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { addHours, type HoursFormState } from '@/app/(portal)/mijn/(beveiligd)/uren/actions'
import { Button } from '@/components/ui/button'
import { COMMISSION_OPTIONS } from '@/fields/commissions'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: HoursFormState = { status: 'idle' }

/**
 * Registering hours. ROADMAP 3.5.
 *
 * Same shape as the other forms in the project: a server action so it works
 * without JavaScript, real labels, aria-invalid and aria-describedby on the
 * fields that failed, and the outcome announced in a live region.
 *
 * The date defaults to today, because that is when somebody sits down to
 * record what they just did.
 */
export function HoursForm({ messages, today }: { messages: Messages; today: string }) {
  const [state, formAction, isPending] = useActionState(addHours, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = { date: useId(), hours: useId(), activity: useId(), commission: useId() }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const fieldError = (key: 'date' | 'hours' | 'activity') => state.errors?.[key]

  const inputClass = (invalid: boolean) =>
    cn(
      'min-h-11 w-full rounded-md border bg-card px-3 py-2 text-foreground',
      invalid ? 'border-destructive' : 'border-input',
    )

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status === 'idle' && 'sr-only')}
      >
        {state.status === 'success' ? (
          <p className="rounded-md border border-accent bg-card p-3">
            {messages.portalHoursSaved}
          </p>
        ) : null}
        {state.status === 'error' && state.errors?.form ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.errors.form}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={ids.date} className="block font-semibold text-primary">
            {messages.portalHoursDateLabel}{' '}
            <span className="font-normal text-foreground">({messages.portalRequired})</span>
          </label>
          <input
            id={ids.date}
            name="date"
            type="date"
            required
            max={today}
            defaultValue={state.values?.date ?? today}
            aria-invalid={Boolean(fieldError('date'))}
            aria-describedby={fieldError('date') ? `${ids.date}-error` : undefined}
            className={inputClass(Boolean(fieldError('date')))}
          />
          {fieldError('date') ? (
            <p id={`${ids.date}-error`} className="text-sm text-destructive">
              {fieldError('date')}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.hours} className="block font-semibold text-primary">
            {messages.portalHoursHoursLabel}{' '}
            <span className="font-normal text-foreground">({messages.portalRequired})</span>
          </label>
          <input
            id={ids.hours}
            name="hours"
            type="number"
            required
            min={0.25}
            max={24}
            step={0.25}
            inputMode="decimal"
            defaultValue={state.values?.hours}
            aria-invalid={Boolean(fieldError('hours'))}
            aria-describedby={fieldError('hours') ? `${ids.hours}-error` : undefined}
            className={inputClass(Boolean(fieldError('hours')))}
          />
          {fieldError('hours') ? (
            <p id={`${ids.hours}-error`} className="text-sm text-destructive">
              {fieldError('hours')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.activity} className="block font-semibold text-primary">
          {messages.portalHoursActivityLabel}{' '}
          <span className="font-normal text-foreground">({messages.portalRequired})</span>
        </label>
        <input
          id={ids.activity}
          name="activity"
          type="text"
          required
          maxLength={200}
          defaultValue={state.values?.activity}
          aria-invalid={Boolean(fieldError('activity'))}
          aria-describedby={fieldError('activity') ? `${ids.activity}-error` : undefined}
          className={inputClass(Boolean(fieldError('activity')))}
        />
        {fieldError('activity') ? (
          <p id={`${ids.activity}-error`} className="text-sm text-destructive">
            {fieldError('activity')}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.commission} className="block font-semibold text-primary">
          {messages.portalHoursCommissionLabel}
        </label>
        <select
          id={ids.commission}
          name="commission"
          defaultValue={state.values?.commission ?? ''}
          className={inputClass(false)}
        >
          <option value="">{messages.portalHoursCommissionNone}</option>
          {COMMISSION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.portalHoursSubmitting : messages.portalHoursSubmit}
      </Button>
    </form>
  )
}

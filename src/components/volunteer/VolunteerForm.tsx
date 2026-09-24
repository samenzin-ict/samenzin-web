'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'

import { submitVolunteerForm, type VolunteerFormState } from '@/app/(frontend)/vrijwilligers/actions'
import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: VolunteerFormState = { status: 'idle' }

type Option = { id: number; title: string }

/**
 * The volunteer sign-up form.
 *
 * Deliberately the same shape as the contact form: a server action so it works
 * without JavaScript, real labels, aria-invalid and aria-describedby on
 * invalid fields, the outcome announced in a live region with focus moved to
 * it, and what was typed echoed back on failure.
 */
export function VolunteerForm({ messages, projects }: { messages: Messages; projects: Option[] }) {
  const [state, formAction, isPending] = useActionState(submitVolunteerForm, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = {
    name: useId(),
    email: useId(),
    interest: useId(),
    message: useId(),
    privacy: useId(),
  }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-accent bg-card p-6"
      >
        <p>{messages.volunteerSuccess}</p>
      </div>
    )
  }

  const fieldError = (key: 'name' | 'email') => state.errors?.[key]

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
        className={cn(state.status !== 'error' && 'sr-only')}
      >
        {state.status === 'error' && state.errors?.form ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.errors.form}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.name} className="block font-semibold text-primary">
          {messages.volunteerNameLabel}{' '}
          <span className="font-normal text-foreground">({messages.volunteerRequired})</span>
        </label>
        <input
          id={ids.name}
          name="name"
          type="text"
          required
          autoComplete="name"
          defaultValue={state.values?.name}
          aria-invalid={Boolean(fieldError('name'))}
          aria-describedby={fieldError('name') ? `${ids.name}-error` : undefined}
          className={inputClass(Boolean(fieldError('name')))}
        />
        {fieldError('name') ? (
          <p id={`${ids.name}-error`} className="text-sm text-destructive">
            {fieldError('name')}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.email} className="block font-semibold text-primary">
          {messages.volunteerEmailLabel}{' '}
          <span className="font-normal text-foreground">({messages.volunteerRequired})</span>
        </label>
        <input
          id={ids.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(fieldError('email'))}
          aria-describedby={fieldError('email') ? `${ids.email}-error` : undefined}
          className={inputClass(Boolean(fieldError('email')))}
        />
        {fieldError('email') ? (
          <p id={`${ids.email}-error`} className="text-sm text-destructive">
            {fieldError('email')}
          </p>
        ) : null}
      </div>

      {projects.length > 0 ? (
        <div className="space-y-1.5">
          <label htmlFor={ids.interest} className="block font-semibold text-primary">
            {messages.volunteerInterestLabel}
          </label>
          <select
            id={ids.interest}
            name="interest"
            defaultValue={state.values?.interest ?? ''}
            className={inputClass(false)}
          >
            <option value="">{messages.volunteerInterestAny}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor={ids.message} className="block font-semibold text-primary">
          {messages.volunteerMessageLabel}
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={5}
          defaultValue={state.values?.message}
          aria-describedby={ids.privacy}
          className={cn(inputClass(false), 'min-h-28')}
        />
      </div>

      {/* The same honeypot as the contact form; see that module for why. */}
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

      <p id={ids.privacy} className="text-sm">
        {messages.volunteerPrivacyNotice}{' '}
        <Link href="/privacyverklaring" className="text-accent underline underline-offset-4">
          {messages.volunteerPrivacyLink}
        </Link>
        .
      </p>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.volunteerSubmitting : messages.volunteerSubmit}
      </Button>
    </form>
  )
}

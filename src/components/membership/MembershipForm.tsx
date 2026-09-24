'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'

import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import {
  submitMembershipForm,
  type MembershipFormState,
} from '@/app/(frontend)/lid-worden/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: MembershipFormState = { status: 'idle' }

/**
 * The membership application form.
 *
 * The same shape as the volunteer form: a server action so it works without
 * JavaScript, real labels, aria-invalid and aria-describedby on invalid
 * fields, the outcome announced in a live region with focus moved to it, and
 * what was typed echoed back on failure.
 *
 * The confirmation says in so many words that the visitor is not a member yet.
 * A form that reads as if it completed something it did not is the kind of
 * thing that ends in an awkward conversation.
 */
export function MembershipForm({ messages }: { messages: Messages }) {
  const [state, formAction, isPending] = useActionState(submitMembershipForm, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = {
    name: useId(),
    email: useId(),
    motivation: useId(),
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
        <p>{messages.membershipSuccess}</p>
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
          {messages.membershipNameLabel}{' '}
          <span className="font-normal text-foreground">({messages.membershipRequired})</span>
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
          {messages.membershipEmailLabel}{' '}
          <span className="font-normal text-foreground">({messages.membershipRequired})</span>
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

      <div className="space-y-1.5">
        <label htmlFor={ids.motivation} className="block font-semibold text-primary">
          {messages.membershipMotivationLabel}
        </label>
        <textarea
          id={ids.motivation}
          name="motivation"
          rows={5}
          defaultValue={state.values?.motivation}
          aria-describedby={ids.privacy}
          className={cn(inputClass(false), 'min-h-28')}
        />
      </div>

      {/* The same honeypot as the other two forms; see that module for why. */}
      <div aria-hidden className="absolute left-[-9999px] w-px overflow-hidden">
        <label htmlFor={`${HONEYPOT_FIELD}-membership`}>Website</label>
        <input
          id={`${HONEYPOT_FIELD}-membership`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p id={ids.privacy} className="text-sm">
        {messages.membershipPrivacyNotice}{' '}
        <Link href="/privacyverklaring" className="text-accent underline underline-offset-4">
          {messages.membershipPrivacyLink}
        </Link>
        .
      </p>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.membershipSubmitting : messages.membershipSubmit}
      </Button>
    </form>
  )
}

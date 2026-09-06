'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'

import { submitContactForm, type ContactFormState } from '@/app/(frontend)/contact/actions'
import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: ContactFormState = { status: 'idle' }

/**
 * The contact form.
 *
 * Built on a server action, so it still submits when JavaScript has not loaded
 * or has failed. That is not a nicety: a form is the only way some visitors
 * can reach the foundation.
 *
 * Accessibility, all of it required by CLAUDE.md rule 6:
 * every input has a real label rather than a placeholder standing in for one,
 * invalid fields are marked with aria-invalid and point at their message with
 * aria-describedby, the result is announced through a live region, and focus
 * moves to that result so a screen reader user is not left wondering whether
 * anything happened.
 */
export function ContactForm({ messages }: { messages: Messages }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const statusRef = useRef<HTMLDivElement>(null)
  const ids = {
    name: useId(),
    email: useId(),
    message: useId(),
    privacy: useId(),
  }

  // Move attention to the outcome once the server has replied.
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
        <p>{messages.contactSuccess}</p>
      </div>
    )
  }

  const fieldError = (key: 'name' | 'email' | 'message') => state.errors?.[key]

  const inputClass = (key: 'name' | 'email' | 'message') =>
    cn(
      'min-h-11 w-full rounded-md border bg-card px-3 py-2 text-foreground',
      fieldError(key) ? 'border-destructive' : 'border-input',
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
        {state.status === 'error' ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.errors?.form ?? messages.contactErrorSummary}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.name} className="block font-semibold text-primary">
          {messages.contactNameLabel}{' '}
          <span className="font-normal text-foreground">({messages.contactRequired})</span>
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
          className={inputClass('name')}
        />
        {fieldError('name') ? (
          <p id={`${ids.name}-error`} className="text-sm text-destructive">
            {fieldError('name')}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.email} className="block font-semibold text-primary">
          {messages.contactEmailLabel}{' '}
          <span className="font-normal text-foreground">({messages.contactRequired})</span>
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
          className={inputClass('email')}
        />
        {fieldError('email') ? (
          <p id={`${ids.email}-error`} className="text-sm text-destructive">
            {fieldError('email')}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.message} className="block font-semibold text-primary">
          {messages.contactMessageLabel}{' '}
          <span className="font-normal text-foreground">({messages.contactRequired})</span>
        </label>
        <textarea
          id={ids.message}
          name="message"
          required
          rows={6}
          defaultValue={state.values?.message}
          aria-invalid={Boolean(fieldError('message'))}
          aria-describedby={fieldError('message') ? `${ids.message}-error` : ids.privacy}
          className={cn(inputClass('message'), 'min-h-32')}
        />
        {fieldError('message') ? (
          <p id={`${ids.message}-error`} className="text-sm text-destructive">
            {fieldError('message')}
          </p>
        ) : null}
      </div>

      {/*
        The honeypot. Hidden from sight and from screen readers, and skipped in
        the tab order, so no person ever meets it. See actions.ts.
      */}
      <div aria-hidden className="absolute left-[-9999px] w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p id={ids.privacy} className="text-sm">
        {messages.contactPrivacyNotice}{' '}
        <Link href="/privacyverklaring" className="text-accent underline underline-offset-4">
          {messages.contactPrivacyLink}
        </Link>
        .
      </p>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.contactSubmitting : messages.contactSubmit}
      </Button>
    </form>
  )
}

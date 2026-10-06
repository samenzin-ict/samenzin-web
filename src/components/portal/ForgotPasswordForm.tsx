'use client'

import Link from 'next/link'
import { useActionState, useEffect, useId, useRef } from 'react'

import {
  requestPasswordReset,
  type ForgotPasswordFormState,
} from '@/app/(portal)/mijn/wachtwoord-vergeten/actions'
import { HONEYPOT_FIELD } from '@/app/(frontend)/contact/honeypot'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: ForgotPasswordFormState = { status: 'idle' }

/**
 * Asks for a reset link.
 *
 * Replaced by the confirmation once it has been sent, rather than keeping the
 * form on screen with a message above it. Leaving a filled-in form there
 * invites a second and a third submission, each of which sends another mail.
 */
export function ForgotPasswordForm({ messages }: { messages: Messages }) {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const emailId = useId()

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  if (state.status === 'sent') {
    return (
      <div className="space-y-4">
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="rounded-md border border-border bg-secondary p-4"
        >
          <p>{messages.portalForgotSent}</p>
        </div>

        <Link href="/mijn/inloggen" className="text-accent underline underline-offset-4">
          {messages.portalForgotBackToLogin}
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status !== 'error' && 'sr-only')}
      >
        {state.status === 'error' && state.error ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={emailId} className="block font-semibold text-primary">
          {messages.portalForgotEmailLabel}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className="min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-foreground"
        />
      </div>

      {/*
        The same honeypot as the public forms. This one sends mail to an
        address a stranger types in, so it is worth the few lines.
      */}
      <div aria-hidden className="absolute left-[-9999px] w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="cta" disabled={isPending}>
          {isPending ? messages.portalForgotSubmitting : messages.portalForgotSubmit}
        </Button>

        <Link href="/mijn/inloggen" className="text-accent underline underline-offset-4">
          {messages.portalForgotBackToLogin}
        </Link>
      </div>
    </form>
  )
}

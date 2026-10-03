'use client'

import Link from 'next/link'
import { useActionState, useEffect, useId, useRef } from 'react'

import {
  setPassword,
  type ResetPasswordFormState,
} from '@/app/(portal)/mijn/wachtwoord-instellen/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: ResetPasswordFormState = { status: 'idle' }

/**
 * Chooses a new password, with the reset token carried in a hidden field.
 *
 * The token is in the form and not in a session because the member is not
 * signed in; it came out of the link they followed. It is deliberately not
 * read from the URL by this component: the page has already read it, so there
 * is one place that knows where it comes from.
 */
export function ResetPasswordForm({ messages, token }: { messages: Messages; token: string }) {
  const [state, formAction, isPending] = useActionState(setPassword, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = { password: useId(), repeat: useId(), hint: useId() }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const inputClass =
    'min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-foreground'

  if (state.status === 'success') {
    return (
      <div className="space-y-4">
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="rounded-md border border-border bg-secondary p-4"
        >
          <p>{messages.portalResetSuccess}</p>
        </div>

        <Button asChild variant="cta">
          <Link href="/mijn/inloggen">{messages.portalResetToLogin}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status !== 'error' && 'sr-only')}
      >
        {state.status === 'error' && state.error ? (
          <div className="space-y-2 rounded-md border border-destructive bg-card p-3">
            <p className="text-destructive">{state.error}</p>
            {state.tokenExpired ? (
              <Link
                href="/mijn/wachtwoord-vergeten"
                className="text-accent underline underline-offset-4"
              >
                {messages.portalResetRequestNew}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.password} className="block font-semibold text-primary">
          {messages.portalPasswordNewLabel}
        </label>
        <input
          id={ids.password}
          name="password"
          type="password"
          required
          autoComplete="new-password"
          aria-describedby={ids.hint}
          className={inputClass}
        />
        <p id={ids.hint} className="text-sm">
          {messages.portalPasswordHint}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.repeat} className="block font-semibold text-primary">
          {messages.portalPasswordRepeatLabel}
        </label>
        <input
          id={ids.repeat}
          name="repeat"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.portalResetSubmitting : messages.portalResetSubmit}
      </Button>
    </form>
  )
}

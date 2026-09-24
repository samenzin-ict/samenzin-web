'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { changePassword, type PasswordFormState } from '@/app/(portal)/mijn/(beveiligd)/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: PasswordFormState = { status: 'idle' }

export function PasswordForm({ messages }: { messages: Messages }) {
  const [state, formAction, isPending] = useActionState(changePassword, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = { current: useId(), next: useId(), repeat: useId(), hint: useId() }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const inputClass = 'min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-foreground'

  return (
    <form action={formAction} className="space-y-5">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status === 'idle' && 'sr-only')}
      >
        {state.status === 'success' ? (
          <p className="rounded-md border border-accent bg-card p-3">
            {messages.portalPasswordSaved}
          </p>
        ) : null}
        {state.status === 'error' ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.current} className="block font-semibold text-primary">
          {messages.portalPasswordCurrentLabel}
        </label>
        <input
          id={ids.current}
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.next} className="block font-semibold text-primary">
          {messages.portalPasswordNewLabel}
        </label>
        <input
          id={ids.next}
          name="newPassword"
          type="password"
          required
          minLength={12}
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
          name="repeatPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.portalPasswordSubmitting : messages.portalPasswordSubmit}
      </Button>
    </form>
  )
}

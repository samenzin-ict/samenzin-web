'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { submitLogin, type LoginFormState } from '@/app/(portal)/mijn/inloggen/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

const initialState: LoginFormState = { status: 'idle' }

export function LoginForm({ messages }: { messages: Messages }) {
  const [state, formAction, isPending] = useActionState(submitLogin, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = { email: useId(), password: useId() }

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
        className={cn(state.status !== 'error' && 'sr-only')}
      >
        {state.status === 'error' && state.error ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.email} className="block font-semibold text-primary">
          {messages.portalLoginEmailLabel}
        </label>
        <input
          id={ids.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.password} className="block font-semibold text-primary">
          {messages.portalLoginPasswordLabel}
        </label>
        <input
          id={ids.password}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.portalLoginSubmitting : messages.portalLoginSubmit}
      </Button>
    </form>
  )
}

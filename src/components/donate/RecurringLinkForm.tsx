'use client'

import { useActionState, useId, type ReactNode } from 'react'

import type { LinkActionState } from '@/app/(frontend)/doneren/recurring-actions'
import { Button } from '@/components/ui/button'

const initialState: LinkActionState = { status: 'idle' }

/**
 * The one-button forms behind the links in a donor's e-mail: start a periodic
 * gift, or stop a monthly one. With `consent`, the donor must tick it first,
 * and the action checks it again.
 */
export function RecurringLinkForm({
  action,
  submitLabel,
  pendingLabel,
  consent,
  done,
  children,
}: {
  action: (state: LinkActionState, formData: FormData) => Promise<LinkActionState>
  submitLabel: string
  pendingLabel: string
  consent?: string
  /** Shown in place of the form once the action has succeeded. */
  done?: { title: string; body: string }
  /** Shown above the form, and gone once it has succeeded: details that no longer hold. */
  children?: ReactNode
}) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const consentId = useId()
  const errorId = useId()

  if (state.status === 'done' && done) {
    return (
      <div role="status" className="space-y-2 rounded-md border border-border bg-muted p-4">
        <p className="font-semibold text-primary">{done.title}</p>
        <p>{done.body}</p>
      </div>
    )
  }

  return (
    <>
      {children}
      <form action={formAction} noValidate className="space-y-4">
        {consent ? (
          <div className="flex items-start gap-2">
            <input
              id={consentId}
              name="mandate"
              type="checkbox"
              required
              aria-describedby={state.error ? errorId : undefined}
              className="mt-1 size-5"
            />
            <label htmlFor={consentId} className="font-semibold text-primary">
              {consent}
            </label>
          </div>
        ) : null}

        {state.error ? (
          <p id={errorId} role="alert" className="text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" variant="cta" size="lg" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </form>
    </>
  )
}

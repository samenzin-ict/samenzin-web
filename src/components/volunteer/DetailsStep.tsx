'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { submitDetails, type StepState } from '@/app/(frontend)/vrijwilligers/actions'
import { Button } from '@/components/ui/button'
import { FieldError, inputClass } from '@/components/volunteer/fields'
import { IntakeNotice } from '@/components/volunteer/IntakeNotice'
import type { Messages } from '@/i18n'
import type { VolunteerDraft } from '@/lib/volunteer-draft'
import { cn } from '@/lib/utils'

const initialState: StepState = { status: 'idle' }

/** Step 1 of docs/design/07: who you are. */
export function DetailsStep({ messages, draft }: { messages: Messages; draft: VolunteerDraft }) {
  const [state, formAction, isPending] = useActionState(submitDetails, initialState)
  const statusRef = useRef<HTMLDivElement>(null)
  const ids = { name: useId(), email: useId(), phone: useId() }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const err = (k: 'name' | 'email' | 'phone') => state.errors?.[k]

  return (
    <form action={formAction} noValidate className="space-y-6">
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
          defaultValue={draft.name ?? ''}
          aria-invalid={Boolean(err('name'))}
          aria-describedby={err('name') ? `${ids.name}-e` : undefined}
          className={inputClass(Boolean(err('name')))}
        />
        <FieldError id={`${ids.name}-e`} message={err('name')} />
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
          defaultValue={draft.email ?? ''}
          aria-invalid={Boolean(err('email'))}
          aria-describedby={err('email') ? `${ids.email}-e` : undefined}
          className={inputClass(Boolean(err('email')))}
        />
        <FieldError id={`${ids.email}-e`} message={err('email')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.phone} className="block font-semibold text-primary">
          {messages.volunteerPhoneLabel}
        </label>
        <input
          id={ids.phone}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={draft.phone ?? ''}
          aria-invalid={Boolean(err('phone'))}
          aria-describedby={err('phone') ? `${ids.phone}-e` : undefined}
          className={inputClass(Boolean(err('phone')))}
        />
        <FieldError id={`${ids.phone}-e`} message={err('phone')} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <IntakeNotice messages={messages} />
        <Button type="submit" variant="cta" disabled={isPending}>
          {isPending ? messages.volunteerSubmitting : messages.volunteerNext}
        </Button>
      </div>
    </form>
  )
}

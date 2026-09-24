'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { saveDetails, type DetailsFormState } from '@/app/(portal)/mijn/(beveiligd)/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import type { Member } from '@/payload-types'
import { cn } from '@/lib/utils'

const initialState: DetailsFormState = { status: 'idle' }

/**
 * The contact details a member maintains themselves.
 *
 * Name and e-mail are shown but not editable. The e-mail address is the login,
 * and changing it without being able to send a confirmation would be a way to
 * lock yourself out of your own account with one typo.
 */
export function DetailsForm({ messages, member }: { messages: Messages; member: Member }) {
  const [state, formAction, isPending] = useActionState(saveDetails, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  const ids = {
    name: useId(),
    email: useId(),
    emailHint: useId(),
    phone: useId(),
    street: useId(),
    postalCode: useId(),
    city: useId(),
  }

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  const inputClass = 'min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-foreground'
  const readOnlyClass = 'min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2'

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
            {messages.portalDetailsSaved}
          </p>
        ) : null}
        {state.status === 'error' ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.name} className="block font-semibold text-primary">
          {messages.portalDetailsNameLabel}
        </label>
        <input id={ids.name} type="text" value={member.name} readOnly className={readOnlyClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.email} className="block font-semibold text-primary">
          {messages.portalDetailsEmailLabel}
        </label>
        <input
          id={ids.email}
          type="email"
          value={member.email}
          readOnly
          aria-describedby={ids.emailHint}
          className={readOnlyClass}
        />
        <p id={ids.emailHint} className="text-sm">
          {messages.portalDetailsEmailFixed}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.phone} className="block font-semibold text-primary">
          {messages.portalDetailsPhoneLabel}
        </label>
        <input
          id={ids.phone}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={member.phone ?? ''}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.street} className="block font-semibold text-primary">
          {messages.portalDetailsStreetLabel}
        </label>
        <input
          id={ids.street}
          name="street"
          type="text"
          autoComplete="street-address"
          defaultValue={member.street ?? ''}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={ids.postalCode} className="block font-semibold text-primary">
            {messages.portalDetailsPostalCodeLabel}
          </label>
          <input
            id={ids.postalCode}
            name="postalCode"
            type="text"
            autoComplete="postal-code"
            defaultValue={member.postalCode ?? ''}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.city} className="block font-semibold text-primary">
            {messages.portalDetailsCityLabel}
          </label>
          <input
            id={ids.city}
            name="city"
            type="text"
            autoComplete="address-level2"
            defaultValue={member.city ?? ''}
            className={inputClass}
          />
        </div>
      </div>

      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? messages.portalDetailsSaving : messages.portalDetailsSave}
      </Button>
    </form>
  )
}

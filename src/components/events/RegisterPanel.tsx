'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'

import {
  cancelRegistration,
  registerForEvent,
  type RegistrationFormState,
} from '@/app/(frontend)/agenda/[slug]/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'

const initialState: RegistrationFormState = { status: 'idle' }

type Props = {
  messages: Messages
  eventId: number
  slug: string
  /** The member's own registration, or null when they have none. */
  registration: { id: number; attended: boolean } | null
  isMember: boolean
  isFull: boolean
  hasStarted: boolean
}

/**
 * Registering for an event, and cancelling again.
 *
 * Which state a visitor sees is decided on the server. An event that is full
 * or has already started shows why there is no button, rather than a button
 * that fails; a member who is already registered sees that, and may cancel
 * until somebody has ticked them as having been there.
 */
export function RegisterPanel({
  messages,
  eventId,
  slug,
  registration,
  isMember,
  isFull,
  hasStarted,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    registration ? cancelRegistration : registerForEvent,
    initialState,
  )
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  // Nothing to offer once it has happened, not even to somebody registered:
  // the record stays in Mijn omgeving and there is no place left to free.
  if (hasStarted) {
    return registration?.attended ? (
      <p className="rounded-md border border-border bg-secondary p-3 text-sm">
        {messages.eventsAttended}
      </p>
    ) : null
  }

  if (!isMember) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-secondary p-4">
        <p className="font-semibold text-primary">{messages.eventsRegisterLoginTitle}</p>
        <p className="text-sm">{messages.eventsRegisterLoginBody}</p>
        <Button asChild variant="cta" className="w-full">
          <Link href="/mijn/inloggen">{messages.eventsRegisterLogin}</Link>
        </Button>
      </div>
    )
  }

  const showForm = registration !== null || !isFull

  return (
    <div className="space-y-3">
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        {state.status === 'error' && state.error ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}

        {registration && state.status !== 'cancelled' ? (
          <p className="rounded-md border border-border bg-secondary p-3 text-sm">
            {messages.eventsRegistered}
          </p>
        ) : null}

        {state.status === 'cancelled' ? (
          <p className="rounded-md border border-border bg-secondary p-3 text-sm">
            {messages.eventsCancelled}
          </p>
        ) : null}
      </div>

      {!registration && isFull ? (
        <p className="rounded-md border border-border bg-muted p-3 text-sm">
          {messages.eventsRegisterFull}
        </p>
      ) : null}

      {showForm ? (
        <form action={formAction}>
          <input type="hidden" name="slug" value={slug} />
          {registration ? (
            <input type="hidden" name="registration" value={registration.id} />
          ) : (
            <input type="hidden" name="event" value={eventId} />
          )}

          <Button
            type="submit"
            variant={registration ? 'outline' : 'cta'}
            className="w-full"
            disabled={isPending}
          >
            {registration
              ? isPending
                ? messages.eventsCancelling
                : messages.eventsCancel
              : isPending
                ? messages.eventsRegistering
                : messages.eventsRegisterSelf}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

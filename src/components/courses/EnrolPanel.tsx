'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'

import {
  enrolInCourse,
  withdrawFromCourse,
  type EnrolmentFormState,
} from '@/app/(frontend)/cursussen/[slug]/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'

const initialState: EnrolmentFormState = { status: 'idle' }

type Props = {
  messages: Messages
  courseId: number
  slug: string
  /** The member's own enrolment, or null when they have none. */
  enrolment: { id: number; progress: number } | null
  /** False for a visitor who is not signed in as a member. */
  isMember: boolean
}

/**
 * Enrolling in a course, and withdrawing again. ROADMAP 3.4.
 *
 * Three states, and which one a visitor sees is decided on the server: not a
 * member, a member who is not enrolled, a member who is. A visitor who is not
 * a member is told why rather than shown a button that would bounce them to a
 * login.
 *
 * Withdrawing disappears once there is progress, because the access rule
 * refuses it and offering a button that always fails is worse than offering
 * none. The reason is spelled out instead.
 */
export function EnrolPanel({ messages, courseId, slug, enrolment, isMember }: Props) {
  const [state, formAction, isPending] = useActionState(
    enrolment ? withdrawFromCourse : enrolInCourse,
    initialState,
  )
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  if (!isMember) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-secondary p-4">
        <p className="font-semibold text-primary">{messages.coursesEnrolLoginTitle}</p>
        <p className="text-sm">{messages.coursesEnrolLoginBody}</p>
        <Button asChild variant="cta" className="w-full">
          <Link href="/mijn/inloggen">{messages.coursesEnrolLogin}</Link>
        </Button>
      </div>
    )
  }

  const started = enrolment !== null && enrolment.progress > 0

  return (
    <div className="space-y-3">
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        {state.status === 'error' && state.error ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}

        {enrolment && state.status !== 'withdrawn' ? (
          <p className="rounded-md border border-border bg-secondary p-3 text-sm">
            {messages.coursesEnrolled}
            {started ? ` ${messages.coursesEnrolProgress}: ${enrolment.progress}%.` : ''}
          </p>
        ) : null}

        {state.status === 'withdrawn' ? (
          <p className="rounded-md border border-border bg-secondary p-3 text-sm">
            {messages.coursesWithdrawn}
          </p>
        ) : null}
      </div>

      {enrolment && started ? (
        <p className="text-sm">{messages.coursesEnrolStarted}</p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="slug" value={slug} />
          {enrolment ? (
            <input type="hidden" name="enrolment" value={enrolment.id} />
          ) : (
            <input type="hidden" name="course" value={courseId} />
          )}

          <Button
            type="submit"
            variant={enrolment ? 'outline' : 'cta'}
            className="w-full"
            disabled={isPending}
          >
            {enrolment
              ? isPending
                ? messages.coursesWithdrawing
                : messages.coursesWithdraw
              : isPending
                ? messages.coursesEnrolling
                : messages.coursesEnrol}
          </Button>
        </form>
      )}
    </div>
  )
}

'use client'

import { useActionState, useEffect, useRef } from 'react'

import { toggleTask, type TaskToggleState } from '@/app/(portal)/mijn/(beveiligd)/actions'
import type { Messages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import type { MemberTask } from '@/payload-types'
import { cn } from '@/lib/utils'

const initialState: TaskToggleState = { status: 'idle' }

/** Turns a deadline into the badge the mockup shows: Morgen, Deze week, 12 september. */
function dueBadge(task: MemberTask, messages: Messages) {
  if (task.done) return { label: messages.portalTasksDone, tone: 'bg-muted text-muted-foreground' }
  if (!task.dueAt) return { label: messages.portalTasksNoDeadline, tone: 'bg-muted text-muted-foreground' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.dueAt)
  due.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (days < 0) return { label: messages.portalTasksOverdue, tone: 'bg-destructive text-white' }
  if (days === 0) return { label: messages.portalTasksDueToday, tone: 'bg-destructive text-white' }
  if (days === 1) return { label: messages.portalTasksDueTomorrow, tone: 'bg-destructive text-white' }
  if (days <= 7) return { label: messages.portalTasksDueThisWeek, tone: 'bg-cta text-cta-foreground' }

  return { label: formatLongDate(task.dueAt) ?? '', tone: 'bg-accent text-accent-foreground' }
}

/**
 * The task list of docs/design/08.
 *
 * Each row is its own form with a submit button, so ticking a task off works
 * without JavaScript. A checkbox that only acts on change would do nothing at
 * all with scripting turned off, which is why the box is drawn but the button
 * is what submits.
 */
export function TaskList({
  messages,
  tasks,
  memberName,
}: {
  messages: Messages
  tasks: MemberTask[]
  memberName: string
}) {
  const [state, formAction] = useActionState(toggleTask, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  if (tasks.length === 0) return <p>{messages.portalTasksEmpty}</p>

  return (
    <div className="space-y-3">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status === 'idle' && 'sr-only')}
      >
        {state.error ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {tasks.map((task) => {
          const badge = dueBadge(task, messages)

          return (
            <li key={task.id} className="flex flex-wrap items-center gap-3 p-4">
              <form action={formAction} className="flex flex-1 items-center gap-3">
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="done" value={String(!task.done)} />
                <button
                  type="submit"
                  aria-pressed={Boolean(task.done)}
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded border-2',
                    task.done ? 'border-accent bg-accent text-white' : 'border-input bg-card',
                  )}
                >
                  <span aria-hidden>{task.done ? '✓' : ''}</span>
                  <span className="sr-only">
                    {task.done ? messages.portalTasksToggleOpen : messages.portalTasksToggleDone}:{' '}
                    {task.title}
                  </span>
                </button>

                <span className="flex-1">
                  <span className={cn('block font-semibold', task.done && 'line-through opacity-70')}>
                    {task.title}
                  </span>
                  {task.description ? (
                    <span className="block text-sm">{task.description}</span>
                  ) : null}
                </span>
              </form>

              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                {messages.portalTasksAssignedTo} {memberName}
              </span>
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium', badge.tone)}>
                {badge.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

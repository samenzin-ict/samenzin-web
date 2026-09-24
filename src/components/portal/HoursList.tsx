'use client'

import { useActionState, useEffect, useRef } from 'react'

import { deleteHours, type HoursFormState } from '@/app/(portal)/mijn/(beveiligd)/uren/actions'
import { COMMISSION_OPTIONS } from '@/fields/commissions'
import { formatLongDate } from '@/lib/dates'
import type { Messages } from '@/i18n'
import type { VolunteerHour } from '@/payload-types'
import { cn } from '@/lib/utils'

const initialState: HoursFormState = { status: 'idle' }

const commissionLabel = (value: string | null | undefined): string =>
  COMMISSION_OPTIONS.find((option) => option.value === value)?.label ?? '—'

/*
 * Intl runs the same on the server and in the browser, so the date is
 * formatted here rather than handed down from the page: a function cannot
 * cross the server/client boundary as a prop.
 */
const day = (value: string): string => formatLongDate(value) ?? value

/**
 * A member's own registered hours. ROADMAP 3.5.
 *
 * A real table, because this is tabular data: a screen reader can then
 * announce "Datum, 3 maart" rather than reading four unlabelled lines. Each
 * row's delete button names the entry it belongs to, so twenty buttons all
 * called "Verwijderen" are still tellable apart out of context.
 */
export function HoursList({
  messages,
  entries,
}: {
  messages: Messages
  entries: VolunteerHour[]
}) {
  const [state, formAction] = useActionState(deleteHours, initialState)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status === 'idle') return
    statusRef.current?.focus()
  }, [state])

  return (
    <div className="space-y-4">
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={cn(state.status === 'idle' && 'sr-only')}
      >
        {state.status === 'deleted' ? (
          <p className="rounded-md border border-accent bg-card p-3">
            {messages.portalHoursDeleted}
          </p>
        ) : null}
        {state.status === 'error' && state.errors?.form ? (
          <p className="rounded-md border border-destructive bg-card p-3 text-destructive">
            {state.errors.form}
          </p>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p>{messages.portalHoursEmpty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold text-primary">
                  {messages.portalHoursTableDate}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-primary">
                  {messages.portalHoursTableHours}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-primary">
                  {messages.portalHoursTableActivity}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-primary">
                  {messages.portalHoursTableCommission}
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">{messages.portalHoursTableActions}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">{day(entry.date)}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{entry.hours}</td>
                  <td className="py-3 pr-4">{entry.activity}</td>
                  <td className="py-3 pr-4">{commissionLabel(entry.commission)}</td>
                  <td className="py-3">
                    <form action={formAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <button
                        type="submit"
                        className="min-h-11 rounded-md px-2 text-sm text-destructive underline underline-offset-4"
                      >
                        <span aria-hidden>{messages.portalHoursDelete}</span>
                        <span className="sr-only">
                          {messages.portalHoursDeleteLabel} {day(entry.date)},{' '}
                          {entry.activity}
                        </span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

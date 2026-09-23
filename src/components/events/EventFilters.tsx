import Link from 'next/link'

import { getMessages } from '@/i18n'
import { cn } from '@/lib/utils'

type Options = { cities: string[]; themes: string[]; audiences: string[] }
type Active = { period: 'upcoming' | 'past'; city?: string; theme?: string; audience?: string }

/**
 * The filters above the agenda.
 *
 * Deliberately plain HTML: two links for the period and a GET form for the
 * three dropdowns, with a submit button. No JavaScript is involved, so the
 * agenda is filterable on a slow connection, in a locked-down browser, and
 * before hydration.
 *
 * That also means every filtered view has its own address, which can be
 * bookmarked and shared. A dropdown that filters on change would be a little
 * slicker and would lose all of that.
 */
export function EventFilters({ options, active }: { options: Options; active: Active }) {
  const messages = getMessages()

  const periodHref = (period: 'upcoming' | 'past') => {
    const params = new URLSearchParams()
    if (period === 'past') params.set('periode', 'afgelopen')
    // Filters are kept when switching period; losing them is surprising.
    if (active.city) params.set('stad', active.city)
    if (active.theme) params.set('thema', active.theme)
    if (active.audience) params.set('doelgroep', active.audience)

    const query = params.toString()
    return query ? `/agenda?${query}` : '/agenda'
  }

  const hasFilters = Boolean(active.city || active.theme || active.audience)

  const select = (name: string, label: string, values: string[], current?: string) => {
    if (values.length === 0) return null

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={`filter-${name}`} className="text-sm font-medium text-primary">
          {label}
        </label>
        <select
          id={`filter-${name}`}
          name={name}
          defaultValue={current ?? ''}
          className="min-h-11 rounded-md border border-input bg-card px-3"
        >
          <option value="">{messages.eventsFilterAll}</option>
          {values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <nav aria-label={messages.eventsPeriodLabel}>
        <ul className="flex gap-2">
          {(['upcoming', 'past'] as const).map((period) => {
            const isActive = active.period === period

            return (
              <li key={period}>
                <Link
                  href={periodHref(period)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-primary',
                  )}
                >
                  {period === 'upcoming' ? messages.eventsUpcoming : messages.eventsPast}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <form method="get" action="/agenda">
        {/* Keeps the chosen period when the form is submitted. */}
        {active.period === 'past' ? <input type="hidden" name="periode" value="afgelopen" /> : null}

        <fieldset className="flex flex-wrap items-end gap-3">
          <legend className="sr-only">{messages.eventsFilterLegend}</legend>

          {select('stad', messages.eventsFilterCity, options.cities, active.city)}
          {select('thema', messages.eventsFilterTheme, options.themes, active.theme)}
          {select('doelgroep', messages.eventsFilterAudience, options.audiences, active.audience)}

          <button
            type="submit"
            className="min-h-11 rounded-md bg-primary px-5 font-medium text-primary-foreground"
          >
            {messages.eventsFilterApply}
          </button>

          {hasFilters ? (
            <Link
              href={active.period === 'past' ? '/agenda?periode=afgelopen' : '/agenda'}
              className="min-h-11 content-center text-sm underline underline-offset-4"
            >
              {messages.eventsFilterReset}
            </Link>
          ) : null}
        </fieldset>
      </form>
    </div>
  )
}

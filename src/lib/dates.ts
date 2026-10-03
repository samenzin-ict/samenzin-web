import { defaultLocale } from '@/i18n'

/**
 * The foundation's own timezone, pinned on every formatter here.
 *
 * Without it a formatter uses the timezone of whatever machine renders the
 * page. That is Europe/Amsterdam on a developer's laptop and UTC on Vercel, so
 * an event stored as 20:00 Amsterdam rendered as 20:00 locally and 18:00 in
 * production — the agenda on the live site was showing every summer event two
 * hours early, and a date near midnight could land on the wrong day.
 *
 * Hardcoded rather than configurable. A Dutch foundation holding events in
 * Tilburg, Schiedam and Rotterdam publishes Dutch local time; making it a
 * setting would invite somebody to change it by accident.
 */
export const TIME_ZONE = 'Europe/Amsterdam'

/**
 * Dates as a Dutch reader expects them: 10 juni 2026.
 *
 * Built once at module level rather than per render; constructing an
 * Intl formatter is not free and these are used in lists.
 */
const longDate = new Intl.DateTimeFormat(defaultLocale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

export const formatLongDate = (value?: string | null): string | null =>
  value ? longDate.format(new Date(value)) : null

const dayNumber = new Intl.DateTimeFormat(defaultLocale, {
  day: 'numeric',
  timeZone: TIME_ZONE,
})
const monthShort = new Intl.DateTimeFormat(defaultLocale, {
  month: 'short',
  timeZone: TIME_ZONE,
})
const timeOfDay = new Intl.DateTimeFormat(defaultLocale, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})

const dayAndMonth = new Intl.DateTimeFormat(defaultLocale, {
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
})

/** "10 juni", for a row where the year is obvious from context. */
export const formatDayMonth = (value?: string | null): string | null =>
  value ? dayAndMonth.format(new Date(value)) : null

/** The date block on an agenda row: 20 over MRT. */
export const formatDayBlock = (value: string) => {
  const date = new Date(value)
  return { day: dayNumber.format(date), month: monthShort.format(date) }
}

export const formatTime = (value?: string | null): string | null =>
  value ? timeOfDay.format(new Date(value)) : null

/** "10:00 - 16:00", or just the start when there is no end. */
export const formatTimeRange = (start: string, end?: string | null): string => {
  const from = formatTime(start)
  const to = formatTime(end)
  return to ? `${from} - ${to}` : (from ?? '')
}

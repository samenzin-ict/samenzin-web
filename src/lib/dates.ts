import { defaultLocale } from '@/i18n'

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
})

export const formatLongDate = (value?: string | null): string | null =>
  value ? longDate.format(new Date(value)) : null

const dayNumber = new Intl.DateTimeFormat(defaultLocale, { day: 'numeric' })
const monthShort = new Intl.DateTimeFormat(defaultLocale, { month: 'short' })
const timeOfDay = new Intl.DateTimeFormat(defaultLocale, { hour: '2-digit', minute: '2-digit' })

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

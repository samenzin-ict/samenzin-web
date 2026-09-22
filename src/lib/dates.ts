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

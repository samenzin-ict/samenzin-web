import { nl } from './locales/nl'
import type { Messages } from './locales/nl'

/**
 * The locales the site can serve. This must stay in step with the
 * localization block in payload.config.ts.
 *
 * Only Dutch is active. Adding a second locale means adding it here, adding a
 * dictionary next to nl.ts, and adding it to the Payload config. No migration
 * is involved, because localization is already switched on.
 */
export const locales = ['nl'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'nl'

const dictionaries: Record<Locale, Messages> = { nl }

/**
 * The interface strings for a locale. Deliberately not a runtime lookup by
 * key: returning the whole typed object means a missing string is a
 * compile-time error rather than a blank space on the page.
 */
export const getMessages = (locale: Locale = defaultLocale): Messages => dictionaries[locale]

export type { Messages }

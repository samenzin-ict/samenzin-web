import { nl } from './locales/nl'
import type { Messages } from './locales/nl'
import { nlEmail } from './locales/nl-email'
import type { EmailMessages } from './locales/nl-email'

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

const emailDictionaries: Record<Locale, EmailMessages> = { nl: nlEmail }

/**
 * The text of the messages the site sends by e-mail.
 *
 * Separate from getMessages because these are templates rather than labels:
 * each one is a function that takes the name of the person it is written to.
 * Keeping them apart stops the interface dictionary turning into a mixture of
 * strings and functions.
 */
export const getEmailMessages = (locale: Locale = defaultLocale): EmailMessages =>
  emailDictionaries[locale]

export type { Messages, EmailMessages }

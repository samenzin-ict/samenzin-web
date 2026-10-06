/**
 * The shape of a message, kept separate from the renderers so the Dutch
 * templates in src/i18n/locales/nl-email.ts can be typed without importing
 * anything server-only.
 */

/** A paragraph, a heading, a button or a list, as an email can render them. */
export type EmailBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'button'; label: string; url: string }
  | { type: 'facts'; items: { label: string; value: string }[] }
  | { type: 'quote'; text: string }

/** One rendered message, before the shell is wrapped around it. */
export type EmailContent = {
  /** Shown under the subject in most inboxes, so it is worth filling in. */
  preview: string
  blocks: EmailBlock[]
  /** The foundation's own name and site, from SiteSettings. */
  organisation: string
  siteUrl: string
}

/** What every template returns: a subject line and the body to render. */
export type EmailTemplate = {
  subject: string
  preview: string
  blocks: EmailBlock[]
}

import type { PayloadRequest } from 'payload'

import { getEmailMessages } from '@/i18n'
import { renderTemplate } from '@/lib/email'
import { getSiteUrl } from '@/lib/site-url'

/**
 * The password-reset message, for the two collections that can sign in.
 *
 * Payload sends this one itself, from inside the forgotPassword operation, so
 * it asks the collection for HTML and a subject instead of being handed a
 * message to send. Both collections route through here so there is one Dutch
 * reset mail rather than two, and so neither falls back to Payload's own
 * English default.
 *
 * The two differ only in where the link goes: a member sets their password on
 * the public site, an administrator inside the admin panel, which has its own
 * reset screen at /admin/reset/<token>.
 *
 * Not marked server-only: see the note in ./send.ts.
 */

type GeneratorArgs = {
  req?: PayloadRequest
  token?: string
  user?: unknown
}

/** The recipient's own name, when the document has one worth greeting. */
const nameOf = (user: unknown): string => {
  if (user && typeof user === 'object' && 'name' in user) {
    const { name } = user as { name?: unknown }
    if (typeof name === 'string' && name.trim()) return name.trim()
  }

  return 'lid of medewerker'
}

export const resetPasswordEmail = (buildUrl: (token: string) => string) => ({
  /*
   * The template is built to read one field off it. The subject does not
   * depend on the link, which is why an empty one is passed; Payload asks for
   * the subject and the body through two separate callbacks, so there is
   * nothing to share between them.
   */
  generateEmailSubject: (args?: GeneratorArgs): string =>
    getEmailMessages().passwordReset({ name: nameOf(args?.user), url: '' }).subject,

  generateEmailHTML: async (args?: GeneratorArgs): Promise<string> => {
    const token = args?.token

    /*
     * No token means no usable link, so send nothing rather than a message
     * with a dead button in it. Payload types the argument as optional, which
     * is why this is a real case and not defensive noise.
     */
    if (!token || !args?.req) return ''

    const template = getEmailMessages().passwordReset({
      name: nameOf(args.user),
      url: buildUrl(token),
    })

    const { html } = await renderTemplate(args.req.payload, template)

    return html
  },
})

/** Where a member sets a password: a page on the public site. */
export const memberResetUrl = (token: string): string =>
  `${getSiteUrl()}/mijn/wachtwoord-instellen?token=${encodeURIComponent(token)}`

/** Where an administrator sets one: Payload's own screen in the panel. */
export const adminResetUrl = (token: string): string =>
  `${getSiteUrl()}/admin/reset/${encodeURIComponent(token)}`

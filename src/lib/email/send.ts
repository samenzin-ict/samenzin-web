/*
 * No `import 'server-only'` in this file or in ./auth.ts, deliberately.
 *
 * Collection configs call these, and the configs are loaded by the `payload`
 * CLI — `payload migrate`, which the Vercel build runs before `next build`,
 * and `payload run` for the seed and the retention script. Those run on plain
 * Node with no Next bundler, where the `server-only` package does not resolve
 * at all: adding the marker makes every one of them fail with
 * ERR_MODULE_NOT_FOUND. The sibling modules that do carry it, such as
 * src/lib/member-auth.ts, are only ever reached from a request.
 */

import type { Payload } from 'payload'

import { getSiteUrl } from '@/lib/site-url'

import { isEmailConfigured } from './adapter'
import { renderEmailHtml, renderEmailText } from './layout'
import type { EmailTemplate } from './types'

/**
 * Sending a message.
 *
 * Two rules hold everywhere this is used:
 *
 * 1. **It never throws.** Every caller is in the middle of something that
 *    matters more than the email: a visitor submitting a form, the board
 *    approving a member, a cron job. A mail server that is down, slow or
 *    misconfigured must not turn any of those into an error, so the result is
 *    returned rather than raised and the caller logs it and carries on.
 * 2. **It is the only way mail leaves this application.** Nothing else calls
 *    `payload.sendEmail`, so the provider, the from address and the shell are
 *    decided in one place. See ./adapter.ts.
 */

export type SendResult = { sent: boolean; reason?: string }

/** The organisation's own name and address, for the footer of every message. */
type Sender = { organisation: string; siteUrl: string; notifyAddress: string | null }

/*
 * Read straight from Payload rather than through getSiteSettings(), which is
 * wrapped in React's cache(). This runs inside collection hooks as well as
 * server actions, and cache() wants a React request context that a hook fired
 * by the admin panel's REST call does not necessarily have.
 */
const getSender = async (payload: Payload): Promise<Sender> => {
  const fallback = {
    organisation: 'Stichting Samenleving en Zingeving',
    siteUrl: getSiteUrl(),
    notifyAddress: process.env.EMAIL_NOTIFY_ADDRESS?.trim() || null,
  }

  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

    return {
      organisation: settings.organisationName?.trim() || fallback.organisation,
      siteUrl: fallback.siteUrl,
      /*
       * Where internal notifications go. The address in Instellingen is the
       * default, so a volunteer changes it themselves without a deploy;
       * EMAIL_NOTIFY_ADDRESS overrides it when the board wants notifications
       * somewhere other than the public contact address.
       */
      notifyAddress: fallback.notifyAddress ?? settings.email?.trim() ?? null,
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not read Instellingen for an email')
    return fallback
  }
}

/** Sends one message to one recipient. */
export async function sendMail(
  payload: Payload,
  { to, template }: { to: string; template: EmailTemplate },
): Promise<SendResult> {
  if (!to.trim()) return { sent: false, reason: 'no recipient' }

  const sender = await getSender(payload)

  const content = {
    preview: template.preview,
    blocks: template.blocks,
    organisation: sender.organisation,
    siteUrl: sender.siteUrl,
  }

  /*
   * Without SMTP settings Payload logs the recipient and the subject instead
   * of sending, which is the behaviour we want locally. Saying so explicitly
   * means the caller's log line reads "not configured" rather than "sent",
   * and nobody goes looking for a message that was never going to arrive.
   */
  if (!isEmailConfigured()) {
    payload.logger.info(
      `E-mail not configured, so nothing was sent. To: ${to}, subject: ${template.subject}`,
    )
    return { sent: false, reason: 'not configured' }
  }

  try {
    await payload.sendEmail({
      to,
      /*
       * No `from`. The adapter already sets "Name <address>" from its own
       * defaults, and passing a bare address here would override that and
       * drop the display name, so every message would arrive from a raw
       * mailbox address.
       */
      subject: template.subject,
      html: renderEmailHtml(content),
      text: renderEmailText(content),
    })

    return { sent: true }
  } catch (error) {
    // The address is logged; the body is not. A log is not the place for
    // somebody's message to the foundation.
    payload.logger.error({ err: error }, `Could not send "${template.subject}" to ${to}`)
    return { sent: false, reason: 'send failed' }
  }
}

/**
 * Sends one message to the foundation's own mailbox.
 *
 * Silently does nothing when no address is known, which is the right outcome:
 * an unset notification address means nobody asked to be notified, not that
 * something is broken.
 */
export async function sendNotification(
  payload: Payload,
  template: EmailTemplate,
): Promise<SendResult> {
  const { notifyAddress } = await getSender(payload)

  if (!notifyAddress) {
    payload.logger.info(
      `No notification address set, so "${template.subject}" was not sent. Set it in Instellingen or as EMAIL_NOTIFY_ADDRESS.`,
    )
    return { sent: false, reason: 'no notification address' }
  }

  return sendMail(payload, { to: notifyAddress, template })
}

/**
 * Renders a template without sending it.
 *
 * For Payload's own authentication emails, which it sends itself: the
 * collection's generateEmailHTML hook has to hand back HTML rather than
 * dispatch a message. Going through here means the password-reset mail gets
 * the same shell, the same escaping and the same footer as everything else.
 */
export async function renderTemplate(
  payload: Payload,
  template: EmailTemplate,
): Promise<{ html: string; text: string }> {
  const sender = await getSender(payload)

  const content = {
    preview: template.preview,
    blocks: template.blocks,
    organisation: sender.organisation,
    siteUrl: sender.siteUrl,
  }

  return { html: renderEmailHtml(content), text: renderEmailText(content) }
}

/** A link into the admin panel, for the notifications that carry one. */
export const adminUrlFor = (collection: string, id: number | string): string =>
  `${getSiteUrl()}/admin/collections/${collection}/${id}`

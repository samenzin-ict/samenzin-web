import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * The one file to change to send mail through something else.
 *
 * Everything that sends an email goes through `sendMail` in ./send.ts, which
 * only ever calls `payload.sendEmail`. Nothing else in the application imports
 * nodemailer, names an SMTP variable, or knows who the provider is. Swapping
 * to a hosted API is this function and the four variables below; no template
 * and no caller changes.
 *
 * SMTP was chosen over a mail API on purpose: it points at the mailbox the
 * foundation already has, and later at Google Workspace, which means no second
 * processor handling members' names and addresses and so no extra processing
 * register entry and no processor agreement. Recorded in docs/environments.md.
 */

const DEFAULT_FROM_NAME = 'Samenleving en Zingeving'

const read = (key: string): string | undefined => process.env[key]?.trim() || undefined

/**
 * Whether real mail can be sent.
 *
 * A host is the one thing with no sensible default. Everything else has one,
 * and some SMTP relays take no credentials at all, so requiring a user and a
 * password here would rule those out.
 */
export const isEmailConfigured = (): boolean => Boolean(read('SMTP_HOST'))

/** The address mail appears to come from, which a reply would go to. */
export const getFromAddress = (): string =>
  read('EMAIL_FROM_ADDRESS') ?? read('SMTP_USER') ?? 'noreply@localhost'

/**
 * The adapter, or undefined when SMTP is not configured.
 *
 * Undefined is deliberate and safe: Payload 3 then logs the recipient and the
 * subject of every message instead of sending it, and warns once at startup.
 * Nothing throws, so a local clone with no mail settings still runs, and a
 * deploy that is missing a variable degrades to "nothing was sent" rather than
 * to a member unable to finish a form. Payload 3 no longer falls back to
 * ethereal.email, so no message leaves the machine either.
 */
type ConfiguredAdapter = ReturnType<typeof nodemailerAdapter>

export const getEmailAdapter = (): ConfiguredAdapter | undefined => {
  const host = read('SMTP_HOST')

  if (!host) return undefined

  const user = read('SMTP_USER')
  const pass = read('SMTP_PASS')

  /*
   * 587 with STARTTLS is what Google Workspace and nearly every other relay
   * wants. `secure` is only for implicit TLS on 465, so it is derived from the
   * port rather than asked for, with SMTP_SECURE as the escape hatch for a
   * relay that disagrees.
   */
  const port = Number(read('SMTP_PORT') ?? 587)
  const secure = read('SMTP_SECURE') ? read('SMTP_SECURE') === 'true' : port === 465

  return nodemailerAdapter({
    defaultFromAddress: getFromAddress(),
    defaultFromName: read('EMAIL_FROM_NAME') ?? DEFAULT_FROM_NAME,
    /*
     * Do not open a connection to the mail server while building the config.
     *
     * The adapter otherwise calls transport.verify(), which is a full SMTP
     * handshake. The config is built on every cold start of every serverless
     * function, including ones that will never send anything, so that is a
     * round trip to the mail server added to the first request a visitor makes
     * after a quiet period. A bad setting shows up in the log of the first
     * message instead, which is soon enough.
     */
    skipVerify: true,
    transportOptions: {
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      // Omitted entirely when absent: an empty user makes nodemailer attempt
      // an authentication that the relay never asked for.
      ...(user && pass ? { auth: { user, pass } } : {}),
    },
  })
}

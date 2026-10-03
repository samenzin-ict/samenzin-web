import type { EmailTemplate } from '@/lib/email/types'

/**
 * Dutch text for every message the site sends.
 *
 * Here and not in a component or a sending function, for the same reason as
 * nl.ts: no Dutch string belongs in code (CLAUDE.md rule 5). These are
 * interface text rather than content — a volunteer does not edit them — and
 * they are functions rather than plain strings because a message has to name
 * the person it is written to.
 *
 * House style, applied throughout:
 *
 * - "u", never "je". The foundation writes to members, applicants and donors
 *   as an organisation, and the rest of the site already does.
 * - No subject line starting with "Re:" or an exclamation mark, and no
 *   marketing tone. These are notifications, not a newsletter.
 * - Nothing is promised that the system cannot keep. An application
 *   confirmation says the board will be in touch, not when.
 * - A link is always written out as well as linked, because the text part of
 *   the message has no anchor to click.
 */

type Named = { name: string }

const greeting = (name: string): string => `Beste ${name},`

/** Shared sign-off, so changing it changes every message. */
const signOff = 'Met vriendelijke groet,\nStichting Samenleving en Zingeving'

export const nlEmail = {
  /* --- Members ------------------------------------------------------- */

  /**
   * Sent when an approved application becomes a member, so the member learns
   * the account exists at all. Before this there was no way for them to find
   * out except by being telephoned.
   */
  memberWelcome: ({ name, url }: Named & { url: string }): EmailTemplate => ({
    subject: 'Welkom — stel uw wachtwoord in voor Mijn omgeving',
    preview: 'Uw account voor Mijn omgeving staat klaar.',
    blocks: [
      { type: 'heading', text: 'Welkom bij Samenleving en Zingeving' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Uw aanmelding is goedgekeurd en er staat een account voor u klaar in Mijn omgeving. Daar ziet u uw taken, de cursussen die u volgt en de evenementen waarvoor u zich heeft aangemeld.',
      },
      {
        type: 'paragraph',
        text: 'Kies eerst zelf een wachtwoord. Gebruik daarvoor de knop hieronder.',
      },
      { type: 'button', label: 'Wachtwoord instellen', url },
      {
        type: 'paragraph',
        text: `Werkt de knop niet? Kopieer dan deze link naar uw browser: ${url}`,
      },
      {
        type: 'paragraph',
        text: 'Deze link is 24 uur geldig. Daarna kunt u op de inlogpagina een nieuwe aanvragen via "Wachtwoord vergeten".',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** The "wachtwoord vergeten" link. */
  passwordReset: ({ name, url }: Named & { url: string }): EmailTemplate => ({
    subject: 'Nieuw wachtwoord instellen',
    preview: 'U heeft een nieuw wachtwoord aangevraagd.',
    blocks: [
      { type: 'heading', text: 'Nieuw wachtwoord instellen' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'U heeft aangegeven dat u uw wachtwoord voor Mijn omgeving niet meer weet. Met de knop hieronder stelt u een nieuw wachtwoord in.',
      },
      { type: 'button', label: 'Nieuw wachtwoord instellen', url },
      {
        type: 'paragraph',
        text: `Werkt de knop niet? Kopieer dan deze link naar uw browser: ${url}`,
      },
      {
        type: 'paragraph',
        text: 'Deze link is één uur geldig. Heeft u dit niet zelf aangevraagd? Dan hoeft u niets te doen; uw huidige wachtwoord blijft werken.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** A task assigned in the admin panel, so the member does not have to look. */
  taskAssigned: ({
    name,
    title,
    description,
    dueDate,
    url,
  }: Named & {
    title: string
    description?: string | null
    dueDate?: string | null
    url: string
  }): EmailTemplate => ({
    subject: 'Er is een nieuwe taak aan u toegewezen',
    preview: title,
    blocks: [
      { type: 'heading', text: 'Er is een nieuwe taak aan u toegewezen' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'In Mijn omgeving staat een nieuwe taak voor u klaar.',
      },
      {
        type: 'facts',
        items: [
          { label: 'Taak', value: title },
          ...(dueDate ? [{ label: 'Deadline', value: dueDate }] : []),
        ],
      },
      ...(description ? [{ type: 'quote' as const, text: description }] : []),
      { type: 'button', label: 'Naar mijn taken', url },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /* --- Courses and events -------------------------------------------- */

  courseEnrolment: ({
    name,
    course,
    startDate,
    url,
  }: Named & { course: string; startDate?: string | null; url: string }): EmailTemplate => ({
    subject: `Inschrijving ontvangen: ${course}`,
    preview: `U bent ingeschreven voor ${course}.`,
    blocks: [
      { type: 'heading', text: 'Uw inschrijving is ontvangen' },
      { type: 'paragraph', text: greeting(name) },
      { type: 'paragraph', text: `U bent ingeschreven voor de cursus ${course}.` },
      {
        type: 'facts',
        items: [
          { label: 'Cursus', value: course },
          ...(startDate ? [{ label: 'Start', value: startDate }] : []),
        ],
      },
      {
        type: 'paragraph',
        text: 'In Mijn omgeving ziet u uw inschrijving terug en kunt u volgen hoe ver u bent. Kunt u niet meer meedoen? Laat het ons dan weten, dan geven wij uw plaats aan iemand anders.',
      },
      { type: 'button', label: 'Naar mijn cursussen', url },
      { type: 'paragraph', text: signOff },
    ],
  }),

  eventRegistration: ({
    name,
    event,
    when,
    location,
    url,
  }: Named & {
    event: string
    when: string
    location?: string | null
    url: string
  }): EmailTemplate => ({
    subject: `Aanmelding ontvangen: ${event}`,
    preview: `U bent aangemeld voor ${event}.`,
    blocks: [
      { type: 'heading', text: 'Uw aanmelding is ontvangen' },
      { type: 'paragraph', text: greeting(name) },
      { type: 'paragraph', text: `U bent aangemeld voor ${event}. Wij zien u graag daar.` },
      {
        type: 'facts',
        items: [
          { label: 'Wanneer', value: when },
          ...(location ? [{ label: 'Waar', value: location }] : []),
        ],
      },
      {
        type: 'paragraph',
        text: 'Bent u onverhoopt verhinderd? Meld u dan af in Mijn omgeving, zodat uw plaats vrijkomt.',
      },
      { type: 'button', label: 'Naar mijn evenementen', url },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /* --- Confirmations to whoever filled in a form --------------------- */

  contactConfirmation: ({ name, message }: Named & { message: string }): EmailTemplate => ({
    subject: 'Wij hebben uw bericht ontvangen',
    preview: 'Een kopie van het bericht dat u ons stuurde.',
    blocks: [
      { type: 'heading', text: 'Wij hebben uw bericht ontvangen' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Bedankt voor uw bericht. Wij lezen het en nemen zo snel mogelijk contact met u op. Hieronder staat wat u ons stuurde.',
      },
      { type: 'quote', text: message },
      {
        type: 'paragraph',
        text: 'U hoeft op dit bericht niet te antwoorden; het is alleen een bevestiging.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  volunteerConfirmation: ({ name }: Named): EmailTemplate => ({
    subject: 'Wij hebben uw aanmelding als vrijwilliger ontvangen',
    preview: 'Bedankt voor uw aanmelding.',
    blocks: [
      { type: 'heading', text: 'Bedankt voor uw aanmelding' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Wij hebben uw aanmelding als vrijwilliger ontvangen. Iemand van de vrijwilligerscommissie neemt contact met u op voor een kennismakingsgesprek.',
      },
      {
        type: 'paragraph',
        text: 'Wordt het niets, of trekt u uw aanmelding in? Dan verwijderen wij uw gegevens. In elk geval bewaren wij een aanmelding niet langer dan zes maanden.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  membershipConfirmation: ({ name }: Named): EmailTemplate => ({
    subject: 'Wij hebben uw aanvraag voor het lidmaatschap ontvangen',
    preview: 'Bedankt voor uw aanvraag.',
    blocks: [
      { type: 'heading', text: 'Bedankt voor uw aanvraag' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Wij hebben uw aanvraag om lid te worden ontvangen. Het bestuur bespreekt iedere aanvraag; zodra er een besluit is, hoort u van ons.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /* --- Decisions ------------------------------------------------------ */

  membershipApproved: ({ name }: Named): EmailTemplate => ({
    subject: 'Uw aanvraag voor het lidmaatschap is goedgekeurd',
    preview: 'Welkom als lid.',
    blocks: [
      { type: 'heading', text: 'Uw aanvraag is goedgekeurd' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Het bestuur heeft uw aanvraag goedgekeurd. Welkom bij Stichting Samenleving en Zingeving.',
      },
      {
        type: 'paragraph',
        text: 'U ontvangt een apart bericht waarmee u een wachtwoord instelt voor Mijn omgeving.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  membershipRejected: ({ name }: Named): EmailTemplate => ({
    subject: 'Over uw aanvraag voor het lidmaatschap',
    preview: 'Een bericht over uw aanvraag.',
    blocks: [
      { type: 'heading', text: 'Over uw aanvraag' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Het bestuur heeft uw aanvraag om lid te worden besproken en besloten er deze keer geen gevolg aan te geven. Wij realiseren ons dat dit een teleurstellend bericht is.',
      },
      {
        type: 'paragraph',
        text: 'Wilt u weten waarom, of denkt u dat er iets niet goed is begrepen? Neem dan contact met ons op; wij leggen het u graag uit.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  volunteerApproved: ({ name }: Named): EmailTemplate => ({
    subject: 'Welkom als vrijwilliger',
    preview: 'Uw aanmelding is goedgekeurd.',
    blocks: [
      { type: 'heading', text: 'Welkom als vrijwilliger' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Wij hebben uw aanmelding als vrijwilliger goedgekeurd. De vrijwilligerscommissie neemt contact met u op om af te spreken waar u aan de slag gaat.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  volunteerRejected: ({ name }: Named): EmailTemplate => ({
    subject: 'Over uw aanmelding als vrijwilliger',
    preview: 'Een bericht over uw aanmelding.',
    blocks: [
      { type: 'heading', text: 'Over uw aanmelding' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Bedankt dat u zich heeft aangemeld als vrijwilliger. Wij hebben op dit moment geen plek waar uw inzet goed tot zijn recht komt, en gaan daarom niet verder met uw aanmelding.',
      },
      {
        type: 'paragraph',
        text: 'Wij bewaren uw gegevens niet langer dan nodig. Heeft u vragen, dan kunt u altijd contact met ons opnemen.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /* --- To the foundation's own mailbox -------------------------------- */

  /*
   * These go to one address, read by whoever handles that kind of message.
   * They carry only enough to decide whether it is urgent; the details stay in
   * the admin panel behind a login, because this mailbox is a copy of personal
   * data in a place nobody controls the retention of.
   */

  contactNotification: ({
    name,
    email,
    url,
  }: Named & { email: string; url: string }): EmailTemplate => ({
    subject: `Nieuw bericht via de website: ${name}`,
    preview: `${name} (${email}) heeft het contactformulier ingevuld.`,
    blocks: [
      { type: 'heading', text: 'Nieuw bericht via het contactformulier' },
      {
        type: 'facts',
        items: [
          { label: 'Van', value: name },
          { label: 'E-mail', value: email },
        ],
      },
      {
        type: 'paragraph',
        text: 'Het bericht zelf staat in het beheerpaneel. Daar staat het achter een inlog, en daar wordt het ook automatisch opgeruimd.',
      },
      { type: 'button', label: 'Bekijk in het beheerpaneel', url },
    ],
  }),

  volunteerNotification: ({
    name,
    email,
    city,
    url,
  }: Named & { email: string; city?: string | null; url: string }): EmailTemplate => ({
    subject: `Nieuwe aanmelding vrijwilliger: ${name}`,
    preview: `${name} wil vrijwilliger worden.`,
    blocks: [
      { type: 'heading', text: 'Nieuwe aanmelding als vrijwilliger' },
      {
        type: 'facts',
        items: [
          { label: 'Naam', value: name },
          { label: 'E-mail', value: email },
          ...(city ? [{ label: 'Locatie', value: city }] : []),
        ],
      },
      {
        type: 'paragraph',
        text: 'De interesses, vaardigheden en beschikbaarheid staan in het beheerpaneel.',
      },
      { type: 'button', label: 'Bekijk in het beheerpaneel', url },
    ],
  }),

  membershipNotification: ({
    name,
    email,
    url,
  }: Named & { email: string; url: string }): EmailTemplate => ({
    subject: `Nieuwe aanvraag lidmaatschap: ${name}`,
    preview: `${name} wil lid worden.`,
    blocks: [
      { type: 'heading', text: 'Nieuwe aanvraag voor het lidmaatschap' },
      {
        type: 'facts',
        items: [
          { label: 'Naam', value: name },
          { label: 'E-mail', value: email },
        ],
      },
      {
        type: 'paragraph',
        text: 'De motivatie staat in het beheerpaneel. Het bestuur besluit; de aanvrager krijgt pas bericht als de status wordt aangepast.',
      },
      { type: 'button', label: 'Bekijk in het beheerpaneel', url },
    ],
  }),
} as const

export type EmailMessages = typeof nlEmail

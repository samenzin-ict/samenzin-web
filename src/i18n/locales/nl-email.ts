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
        text: 'In Mijn omgeving ziet u uw inschrijving terug en kunt u volgen hoe ver u bent. Kunt u niet meer meedoen? Dan kunt u zich op de cursuspagina weer uitschrijven, zolang de cursus nog niet is begonnen.',
      },
      { type: 'button', label: 'Naar de cursus', url },
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
        text: 'Bent u onverhoopt verhinderd? Meld u dan af op de pagina van het evenement, zodat uw plaats vrijkomt voor iemand anders.',
      },
      { type: 'button', label: 'Naar het evenement', url },
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
        text: 'Wij maken uw account voor Mijn omgeving in orde en nemen contact met u op zodra u kunt inloggen.',
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
  /* --- Donations ------------------------------------------------------ */
  /*
   * The texts docs/SEPA_otomatik_incasso.pdf asks for. Amounts and dates
   * arrive already formatted ("€ 10,00", "3 december 2026").
   *
   * Every message about a running gift ends with how to stop it, written out:
   * stopping must be as easy as starting (B5), and an incasso the donor did
   * not expect is what turns into a chargeback.
   */

  /** Dated confirmation of a one-off gift (beleidsplan §8). */
  donationReceipt: ({
    name,
    amount,
    date,
    fund,
  }: Named & { amount: string; date: string; fund: string }): EmailTemplate => ({
    subject: 'Bevestiging van uw gift',
    preview: `Wij hebben uw gift van ${amount} ontvangen.`,
    blocks: [
      { type: 'heading', text: 'Bedankt voor uw gift' },
      { type: 'paragraph', text: greeting(name) },
      { type: 'paragraph', text: 'Wij hebben uw gift in goede orde ontvangen. Hartelijk dank.' },
      {
        type: 'facts',
        items: [
          { label: 'Bedrag', value: amount },
          { label: 'Datum', value: date },
          { label: 'Bestemming', value: fund },
        ],
      },
      { type: 'paragraph', text: 'Bewaar deze e-mail als bewijs van uw gift.' },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** Proof of the mandate, sent once the first payment is in (B3). */
  recurringStarted: ({
    name,
    kind,
    amount,
    interval,
    firstDate,
    terms,
    stopUrl,
    contactEmail,
  }: Named & {
    kind: 'monthly' | 'periodic'
    amount: string
    interval: string
    firstDate: string
    terms: number | null
    stopUrl: string
    contactEmail: string | null
  }): EmailTemplate => ({
    subject:
      kind === 'periodic'
        ? 'Bevestiging van uw periodieke gift'
        : 'Bevestiging van uw maandelijkse gift',
    preview: `Vanaf ${firstDate} schrijven wij ${interval} ${amount} af.`,
    blocks: [
      {
        type: 'heading',
        text: kind === 'periodic' ? 'Uw periodieke gift is gestart' : 'Uw maandelijkse gift is gestart',
      },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Hartelijk dank voor uw steun. Uw eerste gift is betaald, en daarmee heeft u ons gemachtigd om voortaan automatisch af te schrijven. Hieronder staat wat u met ons heeft afgesproken.',
      },
      {
        type: 'facts',
        items: [
          { label: 'Ten gunste van', value: 'Stichting Samenleving en Zingeving' },
          { label: 'Bedrag', value: amount },
          { label: 'Hoe vaak', value: interval },
          { label: 'Eerste afschrijving', value: firstDate },
          {
            label: 'Looptijd',
            value: terms
              ? `${terms} termijnen in totaal, de eerste betaling meegeteld; daarna stopt de incasso vanzelf`
              : 'tot u stopt',
          },
        ],
      },
      {
        type: 'paragraph',
        text: 'De afschrijving wordt uitgevoerd door onze betaaldienst Mollie, namens de stichting. Een paar dagen vóór elke afschrijving krijgt u van ons een e-mail met het bedrag en de datum.',
      },
      {
        type: 'paragraph',
        text: 'Bent u het niet eens met een afschrijving? Dan kunt u die binnen 8 weken via uw eigen bank laten terugboeken, zonder opgaaf van reden.',
      },
      {
        type: 'paragraph',
        text:
          kind === 'periodic'
            ? 'Uw periodieke gift loopt volgens de overeenkomst die u met ons heeft getekend. Wilt u er vervroegd mee stoppen, neem dan contact met ons op; dat heeft gevolgen voor de overeenkomst.'
            : 'U kunt uw maandelijkse gift op elk moment stopzetten, met de knop hieronder of door ons te mailen. Er wordt dan niets meer afgeschreven.',
      },
      ...(kind === 'monthly'
        ? [
            { type: 'button' as const, label: 'Maandelijkse gift stopzetten', url: stopUrl },
            { type: 'paragraph' as const, text: `Werkt de knop niet? Gebruik dan deze link: ${stopUrl}` },
          ]
        : []),
      ...(contactEmail
        ? [{ type: 'paragraph' as const, text: `Vragen? Mail ons op ${contactEmail}.` }]
        : []),
      { type: 'paragraph', text: 'Bewaar deze e-mail: hij is het bewijs van uw machtiging.' },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** The pre-notification before each collection (B4). */
  recurringPreNotice: ({
    name,
    kind,
    amount,
    date,
    previous,
    stopUrl,
    contactEmail,
  }: Named & {
    kind: 'monthly' | 'periodic'
    amount: string
    date: string
    previous: { amount: string; date: string } | null
    stopUrl: string
    contactEmail: string | null
  }): EmailTemplate => ({
    subject: `Op ${date} schrijven wij ${amount} af`,
    preview: `Aankondiging van de volgende afschrijving voor uw ${kind === 'periodic' ? 'periodieke' : 'maandelijkse'} gift.`,
    blocks: [
      { type: 'heading', text: 'Aankondiging van uw volgende gift' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: `Op of rond ${date} schrijven wij ${amount} van uw rekening af voor uw ${kind === 'periodic' ? 'periodieke' : 'maandelijkse'} gift aan Stichting Samenleving en Zingeving. De afschrijving loopt via onze betaaldienst Mollie. U hoeft hiervoor niets te doen.`,
      },
      ...(previous
        ? [
            {
              type: 'paragraph' as const,
              text: `Uw vorige gift van ${previous.amount}, afgeschreven op ${previous.date}, hebben wij in goede orde ontvangen. Hartelijk dank.`,
            },
          ]
        : []),
      ...(kind === 'monthly'
        ? [
            {
              type: 'paragraph' as const,
              text: 'Wilt u niet meer geven? Zet uw maandelijkse gift dan stop vóór de afschrijvingsdatum. Er wordt daarna niets meer afgeschreven.',
            },
            { type: 'button' as const, label: 'Maandelijkse gift stopzetten', url: stopUrl },
            { type: 'paragraph' as const, text: `Werkt de knop niet? Gebruik dan deze link: ${stopUrl}` },
          ]
        : []),
      ...(contactEmail
        ? [{ type: 'paragraph' as const, text: `Vragen? Mail ons op ${contactEmail}.` }]
        : []),
      { type: 'paragraph', text: signOff },
    ],
  }),

  recurringStopped: ({
    name,
    kind,
    byBank,
    contactEmail,
  }: Named & {
    kind: 'monthly' | 'periodic'
    byBank: boolean
    contactEmail: string | null
  }): EmailTemplate => ({
    subject: `Uw ${kind === 'periodic' ? 'periodieke' : 'maandelijkse'} gift is stopgezet`,
    preview: 'Er wordt niets meer van uw rekening afgeschreven.',
    blocks: [
      { type: 'heading', text: `Uw ${kind === 'periodic' ? 'periodieke' : 'maandelijkse'} gift is stopgezet` },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: byBank
          ? 'De automatische incasso voor uw gift kon niet worden uitgevoerd en is daarom beëindigd. Er wordt niets meer van uw rekening afgeschreven. Wilt u ons blijven steunen, dan kunt u op onze website opnieuw beginnen.'
          : 'Uw machtiging is ingetrokken. Er wordt niets meer van uw rekening afgeschreven.',
      },
      { type: 'paragraph', text: 'Hartelijk dank voor uw steun tot nu toe.' },
      ...(contactEmail
        ? [{ type: 'paragraph' as const, text: `Klopt dit niet? Mail ons op ${contactEmail}.` }]
        : []),
      { type: 'paragraph', text: signOff },
    ],
  }),

  recurringCompleted: ({ name }: Named): EmailTemplate => ({
    subject: 'Uw periodieke gift is afgerond',
    preview: 'De laatste termijn is afgeschreven.',
    blocks: [
      { type: 'heading', text: 'Uw periodieke gift is afgerond' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'De laatste termijn van uw periodieke gift is afgeschreven. De incasso is daarmee beëindigd; er wordt niets meer afgeschreven. Hartelijk dank voor uw trouwe steun.',
      },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** Sent once the signed agreement is in, so the donor can start (A2, B1). */
  periodicInvite: ({
    name,
    amount,
    interval,
    terms,
    url,
  }: Named & { amount: string; interval: string; terms: number; url: string }): EmailTemplate => ({
    subject: 'Start uw periodieke gift',
    preview: 'Wij hebben uw getekende overeenkomst ontvangen.',
    blocks: [
      { type: 'heading', text: 'Start uw periodieke gift' },
      { type: 'paragraph', text: greeting(name) },
      {
        type: 'paragraph',
        text: 'Wij hebben uw getekende overeenkomst voor een periodieke gift ontvangen. Hartelijk dank. Met de knop hieronder betaalt u de eerste termijn via iDEAL; daarmee geeft u ons ook de machtiging om de volgende termijnen automatisch af te schrijven.',
      },
      {
        type: 'facts',
        items: [
          { label: 'Bedrag per termijn', value: amount },
          { label: 'Hoe vaak', value: interval },
          { label: 'Aantal termijnen', value: String(terms) },
        ],
      },
      { type: 'button', label: 'Periodieke gift starten', url },
      { type: 'paragraph', text: `Werkt de knop niet? Gebruik dan deze link: ${url}` },
      { type: 'paragraph', text: signOff },
    ],
  }),

  /** To the foundation's own mailbox: something about a running gift changed. */
  recurringNotification: ({
    event,
    name,
    amount,
    reason,
    url,
  }: Named & { event: string; amount: string; reason?: string | null; url: string }): EmailTemplate => ({
    subject: `Doorlopende gift: ${event}`,
    preview: `${name}, ${amount}`,
    blocks: [
      { type: 'heading', text: `Doorlopende gift: ${event}` },
      {
        type: 'facts',
        items: [
          { label: 'Gever', value: name },
          { label: 'Bedrag per termijn', value: amount },
          ...(reason ? [{ label: 'Toelichting', value: reason }] : []),
        ],
      },
      { type: 'button', label: 'Bekijk in het beheerpaneel', url },
    ],
  }),
} as const

export type EmailMessages = typeof nlEmail

/**
 * Fills an empty database with obviously fake content, so a developer can see
 * the site with something in it. Run with `pnpm seed`.
 *
 * Everything here is invented. No real name, address, telephone number or
 * e-mail address appears, and none may ever be added (CLAUDE.md rule 2). The
 * copy mirrors the approved mockups so the implementation can be compared
 * against them; it is placeholder text, not the board's words, and must never
 * reach production.
 *
 * Safe to run more than once: it updates the globals and replaces the pages it
 * owns rather than creating duplicates. It never touches users, so nobody's
 * admin account is lost.
 */
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { getPayload } from 'payload'

/*
 * No e-mail, whatever the environment says.
 *
 * Creating an enrolment, a registration or a task now sends a confirmation,
 * and this script creates dozens of them for people who do not exist. With
 * SMTP configured — which it is in any shell that has read .env — seeding
 * would fire a burst of mail at example.org, every message bouncing, from the
 * foundation's own address. A fast way to a damaged sending reputation.
 *
 * Cleared before getPayload, because the adapter reads it once while the
 * config is built. Payload then logs "attempted without being configured" per
 * message instead, which doubles as a list of what the seed would have sent.
 */
delete process.env.SMTP_HOST

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assets = path.resolve(dirname, 'demo-assets')

/*
 * Two guards, because the first one is weaker than it looks, and both run
 * before connecting: checking after the connection is open defeats the point.
 *
 * NODE_ENV only says how this process was started; it is not 'production' when
 * you run this on a laptop with DATABASE_URI pointed at Neon, which is exactly
 * the accident worth preventing. So the host is checked as well, and the host
 * check is the one that does the real work.
 *
 * Seeding a hosted database is a legitimate one-off when bootstrapping a new
 * environment, so it is possible, but only on purpose: set SEED_ALLOW_REMOTE.
 * That opt-in clears both guards, because filling a hosted database *wants*
 * NODE_ENV=production — it is what keeps `push` off, so connecting cannot
 * rewrite that database's schema to match this machine. Without the exception
 * the only safe way to run this would also be the one way it refused to.
 */
if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW_REMOTE !== 'true') {
  throw new Error(
    'Refusing to seed demo content into a production database.\n' +
      '  If you are filling a hosted environment on purpose, use `pnpm fill:remote`.',
  )
}

const databaseUri = process.env.DATABASE_URI ?? ''
const targetHost = databaseUri.replace(/^[^@]*@/, '').replace(/\/.*$/, '') || 'unknown host'
const isLocalDatabase = /(localhost|127\.0\.0\.1|::1)/.test(databaseUri)

if (!isLocalDatabase && process.env.SEED_ALLOW_REMOTE !== 'true') {
  throw new Error(
    `Refusing to seed ${targetHost}, which is not a local database.\n` +
      '  This writes placeholder content over whatever is already there.\n' +
      '  If that is genuinely what you want, run it again with SEED_ALLOW_REMOTE=true.',
  )
}

/*
 * Invented people: members with a login, applications and contact messages.
 *
 * On by default locally and never on a hosted database unless asked for by
 * name, because these are not like a demo project. A fake member is an account
 * that can sign in to a deployment, and fake applications and messages land in
 * the list a volunteer works through, where they are indistinguishable from
 * real ones until somebody opens them.
 *
 * `pnpm fill:remote dev` sets this. `pnpm fill:remote production` deliberately
 * does not, and refuses to.
 */
const seedPeople = isLocalDatabase || process.env.SEED_DEMO_PEOPLE === 'true'

console.log(`Seeding ${targetHost}${isLocalDatabase ? '' : '   <-- NOT LOCAL'}`)
console.log(
  seedPeople
    ? '  Including invented people: members, aanmeldingen and berichten.\n'
    : '  Content only. No members, aanmeldingen or berichten (SEED_DEMO_PEOPLE is not set).\n',
)

const payload = await getPayload({ config })

/** A minimal Lexical document, so rich text fields are not left empty. */
/**
 * Paragraphs, and pull-quotes. A line starting with "> " becomes a quote, the
 * way docs/design/10-nieuws-en-artikelen.png shows one in the middle of an
 * article.
 */
const richText = (...paragraphs: string[]) =>
  ({
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((line) => {
        const isQuote = line.startsWith('> ')
        const text = isQuote ? line.slice(2) : line

        return {
          type: isQuote ? 'quote' : 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
          ],
        }
      }),
    },
  })

/** Uploads an image once and reuses it on later runs. */
const upload = async (filename: string, alt: string): Promise<number> => {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt },
    filePath: path.join(assets, filename),
  })

  return created.id
}

console.log('Uploading images…')
const heroImage = await upload('hero-visual.png', 'Abstracte vorm in de kleuren van de stichting')
const taalmaatje = await upload('project-taalmaatje.png', 'Twee mensen oefenen samen de Nederlandse taal')
const retraites = await upload('project-retraites.png', 'Een rustige ruimte ingericht voor bezinning')
const huisvesting = await upload('project-studentenhuisvesting.png', 'Een studentenkamer met een bureau bij het raam')
const socialeEvenementen = await upload('project-sociale-evenementen.png', 'Vlak in het diepe bosgroen van de stichting')
const publicaties = await upload('project-publicaties.png', 'Vlak in het warme goud van de stichting')
const mediaContent = await upload('project-media-content.png', 'Vlak in een zacht teal uit de huisstijl')
const artGemeenschap = await upload('article-gemeenschap.png', 'Kleurverloop van bosgroen naar goud')
const artVrijwilligerswerk = await upload('article-vrijwilligerswerk.png', 'Kleurverloop van teal naar goud')
const artOpenDag = await upload('article-open-dag.png', 'Kleurverloop van bosgroen naar zacht goud')
const artTaalmaatje = await upload('article-taalmaatje.png', 'Kleurverloop van groen naar goud')
const artStudenten = await upload('article-studenten.png', 'Kleurverloop van teal naar licht goud')
const artRamadan = await upload('article-ramadan.png', 'Kleurverloop van bosgroen naar goudgroen')

console.log('Writing Instellingen…')
await payload.updateGlobal({
  slug: 'site-settings',
  overrideAccess: true,
  data: {
    organisationName: 'Stichting Samenleving en Zingeving',
    tagline: 'Samen leven, samen zin geven',
    email: 'voorbeeld@example.org',
    phone: '013 000 0000',
    openingHours: 'Maandag tot en met donderdag\n9.00 tot 17.00 uur',
    addresses: [
      { label: 'Tilburg', street: 'Voorbeeldstraat 1', postalCode: '5000 AA', city: 'Tilburg' },
      { label: 'Schiedam', street: 'Voorbeeldlaan 2', postalCode: '3100 BB', city: 'Schiedam' },
      { label: 'Rotterdam', street: 'Voorbeeldkade 3', postalCode: '3000 CC', city: 'Rotterdam' },
    ],
    // The menu of docs/design/02, plus Lid worden: becoming a member was
    // reachable only from the footer, which is too well hidden for something
    // the foundation actually wants people to do.
    mainNavigation: [
      { label: 'Over ons', url: '/over-ons' },
      { label: 'Projecten', url: '/projecten' },
      { label: 'Agenda', url: '/agenda' },
      { label: 'Cursussen', url: '/cursussen' },
      { label: 'Nieuws', url: '/nieuws' },
      { label: 'Lid worden', url: '/lid-worden' },
      { label: 'Contact', url: '/contact' },
    ],
    headerCta: { label: 'Doneer', url: '/doneren' },
    socialLinks: [
      { platform: 'facebook', url: 'https://example.org/facebook' },
      { platform: 'instagram', url: 'https://example.org/instagram' },
      { platform: 'linkedin', url: 'https://example.org/linkedin' },
    ],
    footerIntro: 'Wij verbinden mensen door dialoog, taal, bezinning en actieve deelname.',
    footerColumns: [
      {
        title: 'Over ons',
        links: [
          { label: 'Visie', url: '/over-ons' },
          { label: 'ANBI', url: '/anbi' },
        ],
      },
      {
        title: 'Meedoen',
        links: [
          { label: 'Doneren', url: '/doneren' },
          { label: 'Vrijwilliger worden', url: '/vrijwilligers' },
          { label: 'Lid worden', url: '/lid-worden' },
          { label: 'Contact', url: '/contact' },
        ],
      },
      {
        title: 'Hulp vragen',
        links: [
          { label: 'Contact', url: '/contact' },
          { label: 'Privacyverklaring', url: '/privacyverklaring' },
          { label: 'Cookiebeleid', url: '/cookiebeleid' },
        ],
      },
    ],
    copyright: 'Stichting Samenleving en Zingeving',
    /*
     * The wording on a course certificate, so the preview shows a filled-in
     * document rather than the fallbacks. Invented, like everything else here:
     * the board writes its own in Instellingen > Certificaten.
     */
    certificate: {
      statement:
        'heeft de cursus hieronder met goed gevolg afgerond. Wij danken u voor uw inzet en wensen u veel succes met wat u heeft geleerd.',
      signatoryName: 'V. Voorbeeld',
      signatoryRole: 'Voorzitter',
    },
  },
})

/*
 * The ANBI record is the one thing here that is real on a hosted environment.
 * It carries the foundation's statutory name, KvK number and RSIN, and the
 * Belastingdienst requires the published page to be correct; overwriting it
 * with "Stichting Voorbeeld" would break a legal obligation, and there is no
 * copy of the real text in this repository to put back afterwards.
 *
 * So: written locally, never to a hosted database unless somebody explicitly
 * asks for it. `pnpm fill:remote` therefore leaves the real record alone
 * instead of overwriting it and hoping something restores it.
 */
if (isLocalDatabase || process.env.SEED_INCLUDE_ANBI === 'true') {
  console.log('Writing ANBI-gegevens…')
  await payload.updateGlobal({
    slug: 'anbi-gegevens',
    overrideAccess: true,
    data: {
      statutoryName: 'Stichting Voorbeeld',
      kvkNumber: '00000000',
      rsin: '000000000',
      foundedOn: new Date('2026-01-01').toISOString(),
      statutorySeat: 'Gemeente Voorbeeld',
      operatingArea: 'Voorbeeldstad en overig Nederland',
      fiscalYear: '1 januari tot en met 31 december.',
      contact: {
        address: 'Postbus 0000\n0000 AA Voorbeeldstad',
        email: 'voorbeeld@example.org',
        phone: '013 000 0000',
      },
      iban: 'NL00BANK0000000000',
      anbiStatus: 'aangevraagd',
      statusNotice: richText(
        'Voorbeeldtekst. De stichting heeft de ANBI-status aangevraagd. Zolang deze niet is toegekend kunnen wij niet garanderen dat uw gift aftrekbaar is.',
      ),
      objective: richText('Voorbeeldtekst voor de doelstelling volgens de statuten.'),
      mission: richText('Voorbeeldtekst voor de missie in het kort.'),
      policyActivities: richText('Voorbeeldtekst. Hier staat wat de stichting doet.'),
      policyIncome: richText('Voorbeeldtekst. Hier staat hoe de stichting inkomsten werft.'),
      policyAssets: richText('Voorbeeldtekst. Hier staat hoe het vermogen wordt beheerd en besteed.'),
      policyPlanOnRequest: 'Voorbeeldtekst. Het volledige beleidsplan sturen wij op verzoek toe.',
      remunerationPolicy: richText('Voorbeeldtekst. Bestuursleden ontvangen geen beloning.'),
      /*
       * No photographs, deliberately. A demo portrait would be a stock face of
       * somebody who never agreed to appear on this website, and the Over ons
       * block falls back to name cards when a photograph is missing, so this
       * is also the state most environments are in and the one worth seeing.
       */
      boardMembers: [
        {
          role: 'Voorzitter',
          name: 'A. Voorbeeld',
          bio: richText(
            'Voorbeeldtekst. Hier staat wat dit bestuurslid doet en waarom zij zich inzet.',
            'Voorbeeldtekst. En hier waarvoor zij binnen de stichting verantwoordelijk is.',
          ),
        },
        {
          role: 'Secretaris',
          name: 'B. Voorbeeld',
          bio: richText(
            'Voorbeeldtekst. Hier staat wat dit bestuurslid doet en waarom hij zich inzet.',
            'Voorbeeldtekst. En hier waarvoor hij binnen de stichting verantwoordelijk is.',
          ),
        },
        {
          role: 'Penningmeester',
          name: 'C. Voorbeeld',
          bio: richText(
            'Voorbeeldtekst. Hier staat wat dit bestuurslid doet en waarom zij zich inzet.',
            'Voorbeeldtekst. En hier waarvoor zij binnen de stichting verantwoordelijk is.',
          ),
        },
      ],
      boardComposition: richText('Voorbeeldtekst over de adviesraad en de commissies.'),
      reportingNotice:
        'Voorbeeldtekst. Het verslag over het eerste boekjaar wordt uiterlijk zes maanden na afloop daarvan op deze pagina gepubliceerd.',
      supportText: richText('Voorbeeldtekst over doneren en periodieke giften.'),
    },
  })
} else {
  console.log('Skipping ANBI-gegevens: not a local database.')
  console.log('  The real record there is left untouched.')
  console.log('  Pass SEED_INCLUDE_ANBI=true to overwrite it with placeholders.')
}

/** Dates a few weeks out, so the agenda never looks stale. */
const soon = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

/*
 * Seeded pages are published, not drafts.
 *
 * Pages carry a draft state (ROADMAP 2.1) and Payload creates a document as a
 * draft unless told otherwise. Without this the seed fills a database with
 * content nobody can see, which on a fresh deployment looks exactly like the
 * seed never ran.
 */
const PUBLISHED = { _status: 'published' as const }

const pages = [
  {
    ...PUBLISHED,
    title: 'Home',
    slug: 'home',
    body: [
      {
        blockType: 'hero' as const,
        heading: 'Samen leven, samen zin geven.',
        intro: 'We verbinden mensen door dialoog, taal, bezinning en actieve deelname.',
        image: heroImage,
        links: [
          { label: 'Steun ons werk', url: '/doneren', style: 'cta' as const },
          { label: 'Word vrijwilliger', url: '/contact', style: 'outline' as const },
        ],
        stats: [
          { value: '6', label: 'Projecten' },
          { value: '40+', label: 'Vrijwilligers' },
          { label: 'ANBI in aanvraag' },
          { label: 'Tilburg · Schiedam · Rotterdam' },
        ],
      },
      {
        blockType: 'featuredItems' as const,
        heading: 'Onze projecten',
        /*
         * The cards are the projects themselves. The hand-typed list below is
         * kept so a fresh install shows what the manual option looks like, and
         * so switching the block over has something to switch to.
         */
        source: 'projects' as const,
        limit: 3,
        items: [
          {
            title: 'Taalmaatje',
            description: 'Help een ander de taal te leren.',
            image: taalmaatje,
            url: '/projecten/taalmaatje',
            linkLabel: 'Lees meer',
          },
          {
            title: 'Retraites',
            description: 'Tijd voor bezinning en rust.',
            image: retraites,
            url: '/projecten/retraites',
            linkLabel: 'Lees meer',
          },
          {
            title: 'Studentenhuisvesting',
            description: 'Begeleiding bij wonen voor studenten.',
            image: huisvesting,
            url: '/projecten/studentenhuisvesting',
            linkLabel: 'Lees meer',
          },
        ],
      },
      {
        blockType: 'agenda' as const,
        heading: 'Agenda',
        source: 'events' as const,
        limit: 4,
        items: [
          { date: soon(9), title: 'Taalmaatje bijeenkomst', location: 'Tilburg', badge: 'Gratis' },
          { date: soon(9), title: 'Inloopbijeenkomst dialoog', location: 'Schiedam', badge: 'Gratis' },
          { date: soon(16), title: 'Taalcafé', location: 'Rotterdam Centrum' },
          { date: soon(16), title: 'Retraiteweekend', location: 'Tilburg', badge: '€ 45' },
        ],
      },
      {
        blockType: 'callToAction' as const,
        heading: 'Draag bij aan ons werk',
        text: 'Met uw steun kunnen wij meer mensen bereiken en meer activiteiten organiseren.',
        links: [{ label: 'Doneer', url: '/doneren', style: 'cta' as const }],
      },
    ],
  },
  {
    ...PUBLISHED,
    title: 'Over ons',
    slug: 'over-ons',
    body: [
      {
        blockType: 'richText' as const,
        content: richText(
          'Voorbeeldtekst. De stichting brengt mensen samen rond taal, bezinning en ontmoeting.',
          'Voorbeeldtekst. Deze pagina wordt door het bestuur gevuld met de werkelijke tekst.',
        ),
      },
      /*
       * The real page is written by the board and loaded with
       * `pnpm load:over-ons`; this is only here so the block is on a page
       * somewhere in a fresh install. It carries no names: those come from the
       * ANBI record above.
       */
      {
        blockType: 'board' as const,
        heading: 'Het bestuur',
        intro: 'Voorbeeldtekst. Een jonge stichting wordt beoordeeld op de mensen die haar dragen.',
      },
    ],
  },
  {
    ...PUBLISHED,
    title: 'Contact',
    slug: 'contact',
    body: [
      {
        blockType: 'richText' as const,
        content: richText('Voorbeeldtekst. Heeft u een vraag? Stuur ons gerust een bericht.'),
      },
    ],
  },
  {
    ...PUBLISHED,
    title: 'Doneren',
    slug: 'doneren',
    body: [
      {
        blockType: 'richText' as const,
        content: richText('Voorbeeldtekst. Uw bijdrage maakt onze projecten mogelijk.'),
      },
    ],
  },
  {
    ...PUBLISHED,
    title: 'Privacyverklaring',
    slug: 'privacyverklaring',
    body: [
      {
        blockType: 'richText' as const,
        content: richText(
          'PLAATSHOUDER. Dit is geen geldige privacyverklaring en mag niet live gaan.',
          'De werkelijke tekst moet beschrijven welke gegevens de stichting verwerkt, waarom, hoe lang ze bewaard worden en welke rechten bezoekers hebben.',
        ),
      },
    ],
  },
]

console.log('Writing projecten…')
const projects = [
  {
    ...PUBLISHED,
    title: 'Taalmaatje',
    slug: 'taalmaatje',
    phase: 'loopt' as const,
    order: 1,
    category: 'Taalmaatje',
    excerpt: 'Voorbeeldtekst. Vrijwilligers oefenen wekelijks Nederlands met deelnemers.',
    image: taalmaatje,
    body: richText(
      'Voorbeeldtekst. Deze projectpagina wordt door het bestuur gevuld met de werkelijke tekst.',
      'Voorbeeldtekst. Een tweede alinea, zodat de opmaak te beoordelen is.',
    ),
    facts: [
      { icon: 'people' as const, label: '10 koppels' },
      { icon: 'duration' as const, label: '8 weken' },
      { icon: 'location' as const, label: '3 steden' },
    ],
    funding: { goal: 5000, raised: 2000 },
    callToAction: { heading: 'Word taalmaatje', label: 'Aanmelden', url: '/vrijwilligers' },
  },
  {
    ...PUBLISHED,
    title: 'Retraites',
    slug: 'retraites',
    phase: 'loopt' as const,
    order: 2,
    category: 'Retraites',
    excerpt: 'Voorbeeldtekst. Meerdaagse programma\u2019s over zingeving en samenleven.',
    image: retraites,
    body: richText('Voorbeeldtekst over de retraites.'),
    facts: [{ icon: 'duration' as const, label: '3 dagen' }],
  },
  {
    ...PUBLISHED,
    title: 'Studentenhuisvesting',
    slug: 'studentenhuisvesting',
    phase: 'in-voorbereiding' as const,
    order: 3,
    category: 'Studentenhuisvesting',
    excerpt: 'Voorbeeldtekst. Begeleiding bij wonen voor studenten.',
    image: huisvesting,
    body: richText('Voorbeeldtekst over studentenhuisvesting.'),
    funding: { goal: 250000, raised: 12500 },
  },
  {
    ...PUBLISHED,
    title: 'Sociale evenementen',
    slug: 'sociale-evenementen',
    phase: 'loopt' as const,
    order: 4,
    category: 'Sociale evenementen',
    excerpt: 'Voorbeeldtekst. Ontmoetingen, diners en dagen voor de hele buurt.',
    image: socialeEvenementen,
    body: richText('Voorbeeldtekst over de sociale evenementen.'),
    facts: [{ icon: 'people' as const, label: '400 bezoekers' }],
  },
  {
    ...PUBLISHED,
    title: 'Publicaties',
    slug: 'publicaties',
    phase: 'loopt' as const,
    order: 5,
    category: 'Publicaties',
    excerpt: 'Voorbeeldtekst. Teksten en uitgaven over zingeving en samenleven.',
    image: publicaties,
    body: richText('Voorbeeldtekst over de publicaties.'),
  },
  {
    ...PUBLISHED,
    title: 'Media & content',
    slug: 'media-en-content',
    phase: 'loopt' as const,
    order: 6,
    category: 'Media & content',
    excerpt: 'Voorbeeldtekst. Video, foto en verhalen over het werk van de stichting.',
    image: mediaContent,
    body: richText('Voorbeeldtekst over media en content.'),
  },
]

for (const data of projects) {
  const existing = await payload.find({
    collection: 'projects',
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'projects', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /projecten/${data.slug}`)
  } else {
    await payload.create({ collection: 'projects', data, overrideAccess: true })
    console.log(`  created /projecten/${data.slug}`)
  }
}

console.log('Writing agenda…')

/**
 * A fixed month and day, in whichever year keeps it in the future. The agenda
 * mockup lists 20 MRT, 05 APR, 18 MEI, 12 JUN and 25 SEP, and those have to
 * stay upcoming however long from now the seed is run.
 */
const MIN_LEAD_DAYS = 14

const onDay = (month: number, day: number, hour: number, minute = 0) => {
  const now = new Date()
  const candidate = new Date(now.getFullYear(), month, day, hour, minute, 0, 0)

  /*
   * Push to next year unless the date is comfortably ahead. Without the lead
   * time, seeding on the day of one of these events would leave it hours away
   * and reorder the whole agenda against what the mockup shows.
   */
  const leadMs = MIN_LEAD_DAYS * 24 * 60 * 60 * 1000

  if (candidate.getTime() - now.getTime() < leadMs) {
    candidate.setFullYear(now.getFullYear() + 1)
  }

  return candidate.toISOString()
}

/** Dates around today, so both Aankomend and Afgelopen have something in them. */
const at = (days: number, hour: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const events = [
  {
    ...PUBLISHED,
    title: 'Meet Islam Dag',
    slug: 'meet-islam-dag',
    startsAt: onDay(2, 20, 10),
    endsAt: onDay(2, 20, 16),
    locationName: 'De Hal',
    city: 'Schiedam',
    theme: 'Ontmoeting',
    audience: 'Iedereen',
    price: { isFree: true },
    capacity: 100,
    spotsAvailable: 12,
    // Kept on purpose. An aanmeldlink wins over the site's own button,
    // so this one keeps that branch visible in the demo data.
    registrationUrl: '/contact',
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Een dag voor open gesprek, ontmoeting en wederzijds begrip.',
    body: richText(
      'Stichting Samenzin nodigt u van harte uit voor de Meet Islam Dag. Dit evenement biedt een unieke kans voor open dialoog, ontmoeting en wederzijds begrip tussen verschillende gemeenschappen. We verkennen de cultuur en waarden van de Islam in een ongedwongen sfeer, met als doel verbinding en harmonie te bevorderen in Schiedam en de regio.',
      'De dag is gevuld met informatieve sessies, workshops, en persoonlijke verhalen. Of u nu op zoek bent naar antwoorden of gewoon wilt kennismaken, u bent welkom. Samen bouwen we aan een inclusieve samenleving waar iedereen zich thuis voelt.',
    ),
  },
  {
    ...PUBLISHED,
    title: 'Iftar-diner',
    slug: 'iftar-diner',
    startsAt: onDay(3, 5, 19, 30),
    endsAt: onDay(3, 5, 22),
    locationName: 'Buurthuis',
    city: 'Rotterdam',
    theme: 'Ontmoeting',
    audience: 'Iedereen',
    price: { isFree: false, amount: 15 },
    /*
     * One place, and the first demo member takes it. Deliberately small so the
     * full state is reachable: signed in as that member you can cancel and
     * watch the place come back, and as any other member you see "volgeboekt"
     * with no button rather than one that would fail.
     */
    capacity: 1,
    // No aanmeldlink, so the website offers its own aanmeldknop to a
    // signed-in member. Null rather than omitted: the field is
    // localized, and leaving it out of an update keeps the old value,
    // so re-seeding would never clear one that had been set.
    registrationUrl: null,
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Samen eten en elkaar leren kennen.',
    body: richText('Voorbeeldtekst over het iftar-diner.'),
  },
  {
    ...PUBLISHED,
    title: 'Bezinningsretreat',
    slug: 'bezinningsretreat',
    startsAt: onDay(4, 18, 10),
    endsAt: onDay(4, 18, 16),
    locationName: 'Retraitehuis',
    city: 'Rotterdam',
    theme: 'Bezinning',
    audience: 'Iedereen',
    price: { isFree: false, amount: 50 },
    // No aanmeldlink, so the website offers its own aanmeldknop to a
    // signed-in member. Null rather than omitted: the field is
    // localized, and leaving it out of an update keeps the old value,
    // so re-seeding would never clear one that had been set.
    registrationUrl: null,
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Een dag rust en bezinning.',
    body: richText('Voorbeeldtekst over het bezinningsretreat.'),
  },
  {
    ...PUBLISHED,
    title: 'Taalmaatje-training',
    slug: 'taalmaatje-training',
    startsAt: onDay(5, 12, 10),
    endsAt: onDay(5, 12, 16),
    locationName: 'Bibliotheek',
    city: 'Rotterdam',
    theme: 'Taal',
    audience: 'Iedereen',
    price: { isFree: false, amount: 30 },
    // No aanmeldlink, so the website offers its own aanmeldknop to a
    // signed-in member. Null rather than omitted: the field is
    // localized, and leaving it out of an update keeps the old value,
    // so re-seeding would never clear one that had been set.
    registrationUrl: null,
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Training voor nieuwe taalmaatjes.',
    body: richText('Voorbeeldtekst over de taalmaatje-training.'),
  },
  {
    ...PUBLISHED,
    title: 'Symposium: samen leven in de wijk',
    slug: 'symposium-samen-leven-in-de-wijk',
    startsAt: onDay(8, 25, 19),
    endsAt: onDay(8, 25, 22),
    locationName: 'Locatie A',
    city: 'Rotterdam',
    theme: 'Bezinning',
    audience: 'Iedereen',
    price: { isFree: false, amount: 50 },
    // No aanmeldlink, so the website offers its own aanmeldknop to a
    // signed-in member. Null rather than omitted: the field is
    // localized, and leaving it out of an update keeps the old value,
    // so re-seeding would never clear one that had been set.
    registrationUrl: null,
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Een avond over samenleven in de wijk.',
    body: richText('Voorbeeldtekst over het symposium.'),
  },
  {
    ...PUBLISHED,
    title: 'Taalcaf\u00e9',
    slug: 'taalcafe',
    startsAt: at(-14, 19),
    endsAt: at(-14, 21),
    locationName: 'Bibliotheek',
    city: 'Rotterdam',
    theme: 'Taal',
    audience: 'Iedereen',
    price: { isFree: true },
    image: heroImage,
    excerpt: 'Voorbeeldtekst. Een avond Nederlands oefenen.',
    body: richText('Voorbeeldtekst over het taalcaf\u00e9.'),
  },
]

for (const data of events) {
  const existing = await payload.find({
    collection: 'events',
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'events', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /agenda/${data.slug}`)
  } else {
    await payload.create({ collection: 'events', data, overrideAccess: true })
    console.log(`  created /agenda/${data.slug}`)
  }
}

console.log('Writing cursussen…')
const courses = [
  {
    ...PUBLISHED,
    title: 'Nederlands voor beginners',
    slug: 'nederlands-voor-beginners',
    level: 'beginner' as const,
    duration: '8 weken, wekelijks een avond',
    startsAt: at(30, 19),
    price: { isFree: true },
    // No aanmeldlink, so the site's own button shows. This course is enrolled
    // at 100%, which is what makes uitschrijven refused — the state worth
    // being able to see. The external-link branch is demonstrated by
    // /agenda/meet-islam-dag instead.
    registrationUrl: null,
    excerpt: 'Voorbeeldtekst. Een cursus voor wie net begint met Nederlands.',
    image: taalmaatje,
    body: richText('Voorbeeldtekst over deze cursus.'),
  },
  {
    ...PUBLISHED,
    title: 'Vrijwilligerswerk in de praktijk',
    slug: 'vrijwilligerswerk-in-de-praktijk',
    level: 'iedereen' as const,
    duration: '4 bijeenkomsten',
    price: { isFree: false, amount: 25 },
    // No aanmeldlink, so the website offers its own aanmeldknop to a
    // signed-in member. Null rather than omitted: the field is
    // localized, and leaving it out of an update keeps the old value,
    // so re-seeding would never clear one that had been set.
    registrationUrl: null,
    excerpt: 'Voorbeeldtekst. Wat komt er kijken bij vrijwilligerswerk?',
    image: retraites,
    body: richText('Voorbeeldtekst over deze cursus.'),
  },
  {
    ...PUBLISHED,
    title: 'Verdieping in zingeving',
    slug: 'verdieping-in-zingeving',
    level: 'gevorderd' as const,
    duration: '6 weken',
    price: { isFree: false, amount: 60 },
    excerpt: 'Voorbeeldtekst. Voor wie zich verder wil verdiepen.',
    image: huisvesting,
    body: richText('Voorbeeldtekst over deze cursus.'),
  },
]

for (const data of courses) {
  const existing = await payload.find({
    collection: 'courses',
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'courses', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /cursussen/${data.slug}`)
  } else {
    await payload.create({ collection: 'courses', data, overrideAccess: true })
    console.log(`  created /cursussen/${data.slug}`)
  }
}

console.log('Writing nieuws & artikelen…')

/** Dates in the recent past, so the overview never looks abandoned. */
const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

const articles = [
  {
    ...PUBLISHED,
    title: 'Samen bouwen aan een sterkere gemeenschap in Rotterdam',
    slug: 'samen-bouwen-aan-een-sterkere-gemeenschap-in-rotterdam',
    category: 'artikel' as const,
    // The one that fills the wide card at the top of the overview.
    featured: true,
    author: 'Jan de Vries',
    publishedAt: daysAgo(3),
    excerpt:
      'Lees meer over onze recente projecten en hoe we samen impact maken in de wijken. Ontdek de verhalen achter onze initiatieven.',
    image: artGemeenschap,
    body: richText(
      'Voorbeeldtekst. Dit artikel wordt door de redactie gevuld met de werkelijke tekst.',
      'Voorbeeldtekst. Een tweede alinea, zodat de opmaak te beoordelen is.',
    ),
    tags: [{ label: 'Vrijwilligerswerk' }, { label: 'Rotterdam' }, { label: 'Samenwerking' }],
  },
  {
    ...PUBLISHED,
    title: 'Samen voorwaarts: een gesprek over vrijwilligerswerk',
    slug: 'samen-voorwaarts-een-gesprek-over-vrijwilligerswerk',
    category: 'interview' as const,
    author: 'Anouk Smits',
    publishedAt: daysAgo(8),
    excerpt: 'Voorbeeldtekst. Een gesprek met een van onze vrijwilligers over haar werk in de wijk.',
    image: artVrijwilligerswerk,
    body: richText(
      'Voorbeeldtekst. Lees meer over onze projecten en de verhalen achter onze initiatieven.',
      '> Het mooiste is de glimlach van de mensen die we helpen en de verbinding die ontstaat.',
      'Voorbeeldtekst. Een derde alinea, zodat de opmaak van een langer artikel te beoordelen is.',
    ),
    tags: [{ label: 'Vrijwilligerswerk' }, { label: 'Rotterdam' }, { label: 'Samenwerking' }],
  },
  {
    ...PUBLISHED,
    title: 'Verslag van de open dag in Schiedam',
    slug: 'verslag-van-de-open-dag-in-schiedam',
    category: 'verslag' as const,
    author: 'Jan de Vries',
    publishedAt: daysAgo(16),
    excerpt: 'Voorbeeldtekst. Een terugblik op de open dag in Schiedam.',
    image: artOpenDag,
    body: richText('Voorbeeldtekst voor het verslag.'),
    tags: [{ label: 'Schiedam' }],
  },
  {
    ...PUBLISHED,
    title: 'Taalmaatje: wekelijks samen Nederlands oefenen',
    slug: 'taalmaatje-wekelijks-samen-nederlands-oefenen',
    category: 'artikel' as const,
    author: 'Jan de Vries',
    publishedAt: daysAgo(24),
    excerpt: 'Voorbeeldtekst. Hoe een taalmaatje het verschil maakt in een gezin.',
    image: artTaalmaatje,
    body: richText('Voorbeeldtekst over het taalmaatjeproject.'),
    tags: [{ label: 'Taal' }, { label: 'Tilburg' }],
  },
  {
    ...PUBLISHED,
    title: 'Studentenhuisvesting: een kamer en een thuis',
    slug: 'studentenhuisvesting-een-kamer-en-een-thuis',
    category: 'project' as const,
    author: 'Anouk Smits',
    publishedAt: daysAgo(35),
    excerpt: 'Voorbeeldtekst. Begeleiding bij wonen voor studenten die net beginnen.',
    image: artStudenten,
    body: richText('Voorbeeldtekst over studentenhuisvesting.'),
    tags: [{ label: 'Huisvesting' }, { label: 'Studenten' }],
  },
  {
    ...PUBLISHED,
    title: 'Terugblik op de ramadanactiviteiten',
    slug: 'terugblik-op-de-ramadanactiviteiten',
    category: 'verslag' as const,
    author: 'Jan de Vries',
    publishedAt: daysAgo(48),
    excerpt: 'Voorbeeldtekst. Iftars, gesprekken en ontmoetingen in drie steden.',
    image: artRamadan,
    body: richText('Voorbeeldtekst over de ramadanactiviteiten.'),
    tags: [{ label: 'Ontmoeting' }, { label: 'Rotterdam' }],
  },
]

for (const data of articles) {
  const existing = await payload.find({
    collection: 'articles',
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'articles', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /nieuws/${data.slug}`)
  } else {
    await payload.create({ collection: 'articles', data, overrideAccess: true })
    console.log(`  created /nieuws/${data.slug}`)
  }
}

/*
 * Invented members, so Mijn omgeving can actually be used.
 *
 * Three of them rather than one. Several of the rules written this phase are
 * about one member not seeing another's rows, and a single member cannot show
 * whether that works. The coordinator's view of everybody's hours is likewise
 * empty with one person in it.
 *
 * Only when DEMO_MEMBER_PASSWORD is set. A login needs a password, and a
 * password written into this file would be a credential in the repository
 * (CLAUDE.md, rule 1) that would also be created on any environment this seed
 * is pointed at. All three share it, which is fine for invented people and
 * saves remembering three.
 */
const demoPassword = process.env.DEMO_MEMBER_PASSWORD

/** Filled in below, so the applications and donations further down can use it. */
const demoMembers: { id: number; name: string; email: string }[] = []

if (!demoPassword) {
  console.log('\nSkipping the demo members: DEMO_MEMBER_PASSWORD is not set.')
  console.log('  To see Mijn omgeving:')
  console.log("    DEMO_MEMBER_PASSWORD='a-long-local-only-password' pnpm seed")
} else if (!seedPeople) {
  console.log('\nSkipping the demo members: SEED_DEMO_PEOPLE is not set for this target.')
} else {
  console.log('Writing demoleden…')

  const people = [
    {
      name: 'Voorbeeld Vrijwilliger',
      email: 'demolid@example.org',
      memberRole: 'vrijwilliger' as const,
      commission: 'evenementen' as const,
      city: 'Rotterdam',
      memberSince: daysAgo(400),
    },
    {
      name: 'Tweede Voorbeeld',
      email: 'tweedelid@example.org',
      memberRole: 'lid' as const,
      commission: 'media' as const,
      city: 'Tilburg',
      memberSince: daysAgo(120),
    },
    {
      name: 'Derde Voorbeeld',
      email: 'derdelid@example.org',
      memberRole: 'bestuur' as const,
      commission: 'vrijwilligers' as const,
      city: 'Schiedam',
      memberSince: daysAgo(900),
    },
  ]

  for (const person of people) {
    const found = await payload.find({
      collection: 'members',
      where: { email: { equals: person.email } },
      limit: 1,
      overrideAccess: true,
    })

    const data = { ...person, status: 'actief' as const }

    const existing = found.docs[0]

    // The password is set on every run, not only on the first. Otherwise a
    // second run leaves an account nobody knows the password to.
    const member = existing
      ? await payload.update({
          collection: 'members',
          id: existing.id,
          data: { ...data, password: demoPassword },
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'members',
          data: { ...data, password: demoPassword },
          overrideAccess: true,
        })

    demoMembers.push({ id: member.id, name: member.name, email: member.email })
    console.log(`  ${existing ? 'updated' : 'created'} ${person.email}`)
  }

  const [first, second, third] = demoMembers

  /** Wipes a member's demo rows so a second run does not pile them up. */
  const resetFor = async (
    collection: 'member-tasks' | 'course-enrolments' | 'event-registrations' | 'volunteer-hours',
    memberId: number,
  ) => {
    const { docs } = await payload.find({
      collection,
      where: { member: { equals: memberId } },
      limit: 200,
      overrideAccess: true,
    })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id, overrideAccess: true })
    }
  }

  for (const member of demoMembers) {
    for (const collection of [
      'member-tasks',
      'course-enrolments',
      'event-registrations',
      'volunteer-hours',
    ] as const) {
      await resetFor(collection, member.id)
    }
  }

  const inDays = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(12, 0, 0, 0)
    return date.toISOString()
  }

  // The task list of docs/design/08, in Dutch: the mockup's own titles are
  // English placeholder copy (CLAUDE.md, "Design").
  const tasks = [
    { title: 'Locatie zoeken voor het evenement', description: 'Bel de drie zalen uit de lijst.', dueAt: inDays(1), done: false },
    { title: 'Vrijwilligersbriefing voorbereiden', description: 'Korte instructie voor de dag zelf.', dueAt: inDays(4), done: false },
    { title: 'Gastsprekers benaderen', description: 'Twee sprekers uitnodigen.', dueAt: inDays(5), done: false },
    { title: 'Draaiboek rondsturen', description: 'Naar alle vrijwilligers.', dueAt: inDays(20), done: false },
    { title: 'Social media plannen', description: 'Berichten inplannen voor de hele week.', dueAt: daysAgo(4), done: true },
    { title: 'Donatiepagina inrichten', description: 'Tekst en bedrag controleren.', dueAt: daysAgo(9), done: true },
    { title: 'Zaal afrekenen', description: 'Factuur doorsturen naar de penningmeester.', dueAt: daysAgo(14), done: true },
  ]

  for (const task of tasks) {
    await payload.create({
      collection: 'member-tasks',
      overrideAccess: true,
      data: { ...task, member: first.id, commission: 'evenementen' },
    })
  }

  // One for somebody else, so "a member sees only their own" is testable.
  await payload.create({
    collection: 'member-tasks',
    overrideAccess: true,
    data: {
      member: second.id,
      title: 'Nieuwsbrief van deze maand schrijven',
      description: 'Deze taak hoort bij het tweede lid en mag niet bij het eerste verschijnen.',
      dueAt: inDays(9),
      done: false,
      commission: 'media',
    },
  })
  console.log(`  ${tasks.length + 1} taken`)

  /*
   * Enrolments and registrations, with something deliberately left undone.
   *
   * The first member is enrolled in all but one course and registered for all
   * but one upcoming event, so "Inschrijven" and "Aanmelden" can both actually
   * be tried on the preview. One enrolment has progress, which is what makes
   * withdrawing refused; one is at zero, which is what makes it allowed.
   */
  const courses = await payload.find({
    collection: 'courses',
    limit: 10,
    sort: 'createdAt',
    overrideAccess: true,
  })
  const progresses = [100, 0]
  const enrolledCourses = courses.docs.slice(0, Math.max(courses.docs.length - 1, 0))

  for (const [index, course] of enrolledCourses.entries()) {
    await payload.create({
      collection: 'course-enrolments',
      overrideAccess: true,
      data: { member: first.id, course: course.id, progress: progresses[index] ?? 40 },
    })
  }
  console.log(
    `  ${enrolledCourses.length} cursusdeelnames; ${courses.docs.length - enrolledCourses.length} cursus vrij om te testen`,
  )

  const upcoming = await payload.find({
    collection: 'events',
    where: { startsAt: { greater_than_equal: new Date().toISOString() } },
    limit: 10,
    sort: 'startsAt',
    overrideAccess: true,
  })
  const registeredEvents = upcoming.docs.slice(0, Math.max(upcoming.docs.length - 1, 0))

  for (const event of registeredEvents) {
    await payload.create({
      collection: 'event-registrations',
      overrideAccess: true,
      data: { member: first.id, event: event.id, attended: false },
    })
  }

  // A second member on one of them, so a capacity count is not just one row.
  if (registeredEvents[0]) {
    await payload.create({
      collection: 'event-registrations',
      overrideAccess: true,
      data: { member: second.id, event: registeredEvents[0].id, attended: false },
    })
  }
  console.log(
    `  ${registeredEvents.length} aanmeldingen; ${upcoming.docs.length - registeredEvents.length} evenement vrij om te testen`,
  )

  // Eighteen hours this year, the figure on the Uren card in the mockup.
  const hours = [
    { date: daysAgo(6), hours: 4, activity: 'Evenement opgebouwd' },
    { date: daysAgo(20), hours: 6, activity: 'Taalmaatje begeleid' },
    { date: daysAgo(41), hours: 3.5, activity: 'Vergadering commissie' },
    { date: daysAgo(70), hours: 4.5, activity: 'Open dag bemand' },
  ]

  for (const entry of hours) {
    await payload.create({
      collection: 'volunteer-hours',
      overrideAccess: true,
      data: { ...entry, member: first.id, commission: 'evenementen' },
    })
  }

  // Hours for the others, so the coordinator's overview has more than one name.
  await payload.create({
    collection: 'volunteer-hours',
    overrideAccess: true,
    data: { date: daysAgo(12), hours: 2, activity: 'Nieuwsbrief opgemaakt', member: second.id, commission: 'media' },
  })
  await payload.create({
    collection: 'volunteer-hours',
    overrideAccess: true,
    data: { date: daysAgo(30), hours: 5, activity: 'Intakegesprekken gevoerd', member: third.id, commission: 'vrijwilligers' },
  })
  console.log('  18 uur voor het eerste lid, 7 uur voor de andere twee')
}

/*
 * Aanmeldingen, aanvragen en berichten: the three things a volunteer works
 * through in the admin panel, and the three that now write back by e-mail.
 *
 * Left in the states that are worth testing: something undecided, so a
 * decision can be recorded and the mail watched; something already decided, so
 * the list is not uniformly new.
 *
 * Replaced rather than added to on a second run, matched on the invented
 * e-mail addresses, so running the seed twice does not pile them up.
 */
if (seedPeople) {
  console.log('Writing aanmeldingen, aanvragen en berichten…')

  const replace = async (
    collection: 'volunteer-applications' | 'membership-applications' | 'contact-submissions',
    rows: Record<string, unknown>[],
  ) => {
    const { docs } = await payload.find({
      collection,
      where: { email: { like: '@example.org' } },
      limit: 200,
      overrideAccess: true,
    })
    for (const doc of docs) {
      await payload.delete({ collection, id: doc.id, overrideAccess: true })
    }

    for (const row of rows) {
      // @ts-expect-error — one helper for three collections; each row below is
      // written against its own collection's fields.
      await payload.create({ collection, data: row, overrideAccess: true })
    }

    console.log(`  ${rows.length} ${collection}`)
  }

  await replace('volunteer-applications', [
    {
      name: 'Aisha Voorbeeld',
      email: 'aisha@example.org',
      phone: '06 0000 0001',
      city: 'tilburg',
      interests: ['taalmaatje', 'onderwijs'],
      skills: ['taalcoaching', 'teksten-schrijven'],
      languageLevel: 'b2',
      availability: ['za-ochtend', 'wo-avond'],
      message: 'Ik wil graag helpen bij taalactiviteiten. Dit is verzonnen tekst.',
      status: 'aangemeld',
    },
    {
      name: 'Bram Voorbeeld',
      email: 'bram@example.org',
      phone: '06 0000 0002',
      city: 'rotterdam',
      interests: ['evenementen', 'media'],
      skills: ['sociale-media', 'ontwerp'],
      languageLevel: 'moedertaal',
      availability: ['zo-middag', 'za-middag'],
      status: 'in-gesprek',
    },
    {
      name: 'Chloé Voorbeeld',
      email: 'chloe@example.org',
      city: 'schiedam',
      interests: ['dames-activiteiten'],
      skills: ['evenementenbeheer'],
      languageLevel: 'a2',
      availability: ['ma-avond'],
      status: 'goedgekeurd',
      vogStatus: 'ok',
    },
    {
      name: 'Daan Voorbeeld',
      email: 'daan@example.org',
      city: 'tilburg',
      interests: ['fondsenwerving'],
      languageLevel: 'c1',
      availability: ['vr-avond'],
      status: 'afgewezen',
    },
  ])

  await replace('membership-applications', [
    {
      name: 'Esra Voorbeeld',
      email: 'esra@example.org',
      motivation:
        'Ik lees al een tijd mee en wil me graag verbinden aan de stichting. Dit is verzonnen tekst.',
      status: 'aangevraagd',
    },
    {
      name: 'Faruk Voorbeeld',
      email: 'faruk@example.org',
      motivation: 'Een vriend heeft me over het werk verteld. Dit is verzonnen tekst.',
      status: 'aangevraagd',
    },
    {
      name: 'Gina Voorbeeld',
      email: 'gina@example.org',
      motivation: 'Verzonnen tekst.',
      status: 'afgewezen',
    },
  ])

  await replace('contact-submissions', [
    {
      name: 'Hakan Voorbeeld',
      email: 'hakan@example.org',
      message: 'Wanneer is de volgende open avond? Dit is een verzonnen bericht.',
      handled: false,
    },
    {
      name: 'Ingrid Voorbeeld',
      email: 'ingrid@example.org',
      message:
        'Ik zou graag een zaal willen huren voor een bijeenkomst. Dit is een verzonnen bericht.',
      handled: false,
    },
    {
      name: 'Joost Voorbeeld',
      email: 'joost@example.org',
      message: 'Bedankt voor de hulp van vorige week. Dit is een verzonnen bericht.',
      handled: true,
    },
  ])
}

console.log('Writing demodonaties…')

/*
 * Donations spread over the past eight months, so the dashboard chart in
 * docs/design/09 has something to draw. Obviously fake names and addresses
 * (CLAUDE.md, rule 2), and no Mollie ids: these never went near a payment
 * provider.
 */
const donationPlan = [
  { monthsAgo: 0, amounts: [50, 25, 100, 250], fund: 'Taalmaatje' },
  { monthsAgo: 1, amounts: [75, 40, 120], fund: 'Studentenhuisvesting' },
  { monthsAgo: 2, amounts: [200, 60, 35, 90], fund: 'Algemeen' },
  { monthsAgo: 3, amounts: [30, 45], fund: 'Retraites' },
  { monthsAgo: 4, amounts: [80, 20, 55], fund: 'Taalmaatje' },
  { monthsAgo: 5, amounts: [150, 65], fund: 'Algemeen' },
  { monthsAgo: 6, amounts: [40, 95, 25], fund: 'Sociale evenementen' },
  { monthsAgo: 7, amounts: [110, 30], fund: 'Publicaties' },
]

const donorNames = ['M. Voorbeeld', 'A. Voorbeeld', 'R. Voorbeeld', 'S. Voorbeeld']

/*
 * The fund names above are project titles, so they are resolved to real
 * projects and the gifts are attached to them.
 *
 * Without this the fundraising bar on a project page would only ever show the
 * amount typed into `funding.raised`, and the part of it that counts paid
 * online gifts would read zero on every project — which looks exactly like a
 * feature that does not work. "Algemeen" stays unattached on purpose: a
 * general gift belongs to no project and is worth having in the data.
 */
const projectsForFunds = await payload.find({
  collection: 'projects',
  limit: 100,
  depth: 0,
  overrideAccess: true,
})

const projectIdByTitle = new Map(projectsForFunds.docs.map((doc) => [doc.title, doc.id]))

const existingDonations = await payload.find({
  collection: 'donations',
  where: { molliePaymentId: { like: 'demo-' } },
  limit: 200,
  overrideAccess: true,
})

for (const doc of existingDonations.docs) {
  await payload.delete({ collection: 'donations', id: doc.id, overrideAccess: true })
}

let donationCount = 0

for (const plan of donationPlan) {
  for (const [index, amount] of plan.amounts.entries()) {
    const paidAt = new Date()
    paidAt.setMonth(paidAt.getMonth() - plan.monthsAgo, 8 + index)
    paidAt.setHours(12, 0, 0, 0)

    const anonymous = index === plan.amounts.length - 1 && plan.monthsAgo % 3 === 0

    await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        molliePaymentId: `demo-${plan.monthsAgo}-${index}`,
        amount,
        status: 'paid',
        project: projectIdByTitle.get(plan.fund) ?? null,
        fund: plan.fund,
        anonymous,
        donorName: anonymous ? null : donorNames[index % donorNames.length],
        donorEmail: anonymous ? null : `donateur${index}@example.org`,
        paidAt: paidAt.toISOString(),
      },
    })
    donationCount += 1
  }
}

console.log(`  ${donationCount} demodonaties`)

/*
 * Pages whose real text is not demo content and must not be written over on a
 * hosted environment. The privacyverklaring and the cookiebeleid are published
 * legal documents; `pnpm load:legal` puts them there, from the Word files in
 * docs/. Same reasoning as the ANBI record above: the seed holds a placeholder,
 * and a placeholder privacy statement on a live site is worse than none.
 */
const PROTECTED_SLUGS = new Set(['privacyverklaring', 'cookiebeleid'])

console.log("Writing pagina's…")
for (const data of pages) {
  if (!isLocalDatabase && PROTECTED_SLUGS.has(data.slug)) {
    console.log(`  skipped /${data.slug}: real text, not demo content`)
    continue
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /${data.slug}`)
  } else {
    await payload.create({ collection: 'pages', data, overrideAccess: true })
    console.log(`  created /${data.slug}`)
  }
}

console.log('\nDone. Demo content only — never deploy this.')
process.exit(0)

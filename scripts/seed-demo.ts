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

const dirname = path.dirname(fileURLToPath(import.meta.url))
const assets = path.resolve(dirname, 'demo-assets')

/*
 * Two guards, because the first one is weaker than it looks, and both run
 * before connecting: checking after the connection is open defeats the point.
 *
 * NODE_ENV only says how this process was started; it is not 'production' when
 * you run this on a laptop with DATABASE_URI pointed at Neon, which is exactly
 * the accident worth preventing. So the host is checked as well.
 *
 * Seeding a hosted database is a legitimate one-off when bootstrapping a new
 * environment, so it is possible, but only on purpose: set SEED_ALLOW_REMOTE.
 */
if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed demo content into a production database.')
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

console.log(`Seeding ${targetHost}${isLocalDatabase ? '' : '   <-- NOT LOCAL'}\n`)

const payload = await getPayload({ config })

/** A minimal Lexical document, so rich text fields are not left empty. */
const richText = (...paragraphs: string[]) =>
  ({
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
        ],
      })),
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
    mainNavigation: [
      { label: 'Over ons', url: '/over-ons' },
      { label: 'ANBI', url: '/anbi' },
      { label: 'Doneren', url: '/doneren' },
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
          { label: 'Contact', url: '/contact' },
        ],
      },
      {
        title: 'Hulp vragen',
        links: [
          { label: 'Contact', url: '/contact' },
          { label: 'Privacyverklaring', url: '/privacyverklaring' },
        ],
      },
    ],
    copyright: 'Stichting Samenleving en Zingeving',
  },
})

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
    boardMembers: [
      { role: 'Voorzitter', name: 'A. Voorbeeld' },
      { role: 'Secretaris', name: 'B. Voorbeeld' },
      { role: 'Penningmeester', name: 'C. Voorbeeld' },
    ],
    boardComposition: richText('Voorbeeldtekst over de adviesraad en de commissies.'),
    reportingNotice:
      'Voorbeeldtekst. Het verslag over het eerste boekjaar wordt uiterlijk zes maanden na afloop daarvan op deze pagina gepubliceerd.',
    supportText: richText('Voorbeeldtekst over doneren en periodieke giften.'),
  },
})

/** Dates a few weeks out, so the agenda never looks stale. */
const soon = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

const pages = [
  {
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
        items: [
          {
            title: 'Taalmaatje',
            description: 'Help een ander de taal te leren.',
            image: taalmaatje,
            url: '/over-ons',
            linkLabel: 'Lees meer',
          },
          {
            title: 'Retraites',
            description: 'Tijd voor bezinning en rust.',
            image: retraites,
            url: '/over-ons',
            linkLabel: 'Lees meer',
          },
          {
            title: 'Studentenhuisvesting',
            description: 'Begeleiding bij wonen voor studenten.',
            image: huisvesting,
            url: '/over-ons',
            linkLabel: 'Lees meer',
          },
        ],
      },
      {
        blockType: 'agenda' as const,
        heading: 'Agenda',
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
    ],
  },
  {
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

console.log("Writing pagina's…")
for (const data of pages) {
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

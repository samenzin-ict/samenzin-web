/**
 * Publishes the seven projects and the text that introduces them.
 *
 *   pnpm load:projecten                 # the local database
 *   pnpm load:projecten dev             # the Neon dev branch
 *   pnpm load:projecten production      # the Neon production branch
 *
 * The text comes from .devseed/projecten.json, which
 * scripts/convert-projecten.py produces from the Word file in docs/. Neither
 * is in the repository; see scripts/convert-legal.py for why.
 *
 * Matching is by slug, using the same slugify the admin panel uses — imported,
 * not copied, so a project loaded here and one typed in by hand cannot end up
 * at two different addresses. Running this twice updates the same seven
 * projects instead of creating seven more.
 *
 * What it will not do is delete. A project that exists here but not in the
 * document is listed at the end and left alone: it may be demo content that
 * should go, and it may be something a volunteer wrote in the admin panel that
 * nobody told the document about. Choosing between those is not a script's
 * decision, and an overview page with one card too many is a smaller problem
 * than a page with one project silently gone.
 *
 * The fields this leaves untouched on a project that already exists — the
 * image, the funding goal, the facts, the call to action, the commission — are
 * maintained in the admin panel and are not in the Word file. Overwriting them
 * with nothing is how a loader quietly undoes somebody's afternoon.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { getPayload } from 'payload'

import { slugify } from '@/fields/slug'

import { toLexical, type TextBlock } from './lexical'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.resolve(dirname, '..', '.devseed', 'projecten.json')
const IMAGES = path.resolve(dirname, '..', '.devseed', 'project-images')

/** The page whose blocks /projecten renders above the grid. */
const PAGE_SLUG = 'projecten'

type Phase = 'loopt' | 'in-voorbereiding'

type Detail = { label: string; text: string }

type Document = {
  intro: TextBlock[]
  projects: {
    order: number
    title: string
    card: string
    phase: Phase
    note: string | null
    body: TextBlock[]
    details: Detail[]
  }[]
  closing: TextBlock[]
}

if (!fs.existsSync(SOURCE)) {
  console.error(`No ${path.relative(process.cwd(), SOURCE)}.`)
  console.error('Run: python3 scripts/convert-projecten.py')
  console.error('That needs the Word file in docs/, which is gitignored.')
  process.exit(1)
}

const document = JSON.parse(fs.readFileSync(SOURCE, 'utf8')) as Document

/*
 * The four button labels and the heading of the band. Short interface words
 * rather than content, which is why they sit here and not in the Word file;
 * the sentence a reader actually reads is the "Meedoen" line, shown above the
 * button.
 */
const MESSAGES = {
  heading: 'Meedoen',
  volunteer: 'Word vrijwilliger',
  agenda: 'Bekijk de agenda',
  donate: 'Doneer aan dit project',
  contact: 'Neem contact op',
}

/**
 * The button under the project, worked out from what the text itself asks the
 * reader to do.
 *
 * Derived rather than written here, so the page cannot invite somebody to do
 * something the board's own text does not offer. Studieondersteuning is the
 * case that matters: it asks for gifts and deliberately offers no application
 * form, because a bursary application needs its own form and its own table
 * first (ICT 9). A hand-maintained list here would eventually grow one.
 *
 * Order matters. Taalmaatje names both the volunteer form and the e-mail
 * address; the form is the better answer.
 */
const callToActionFor = (details: Detail[], slug: string): { url: string; label: string } | null => {
  const text = details
    .map((detail) => `${detail.label} ${detail.text}`)
    .join(' ')
    .toLowerCase()

  if (text.includes('aanmeldformulier') || text.includes('wij zoeken vrijwilligers')) {
    return { url: '/vrijwilligers', label: MESSAGES.volunteer }
  }

  if (text.includes('agendapagina')) {
    return { url: '/agenda', label: MESSAGES.agenda }
  }

  if (text.includes('uw gift')) {
    return { url: `/doneren?project=${encodeURIComponent(slug)}`, label: MESSAGES.donate }
  }

  if (text.includes('info@samenzin.org')) {
    return { url: '/contact', label: MESSAGES.contact }
  }

  return null
}

const payload = await getPayload({ config })

/** Uploads a banner, or reuses the one already there, so re-running is free. */
const uploadBanner = async (order: number, title: string): Promise<number | null> => {
  const file = path.join(IMAGES, `${order}.png`)

  if (!fs.existsSync(file)) return null

  const filename = `project-${order}.png`

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const alt = `Decoratief patroon in de huisstijl bij ${title}`
  const current = existing.docs[0]

  if (current) {
    // Only send the file again when it differs, or Payload stores it beside the
    // old one as project-1-1.png and leaves the first in the bucket for ever.
    const changed = current.filesize !== fs.statSync(file).size
    const updated = await payload.update({
      collection: 'media',
      id: current.id,
      data: { alt },
      ...(changed ? { filePath: file } : {}),
      overrideAccess: true,
    })

    return updated.id
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: file,
    overrideAccess: true,
  })

  return created.id
}

const seen = new Set<string>()

for (const project of document.projects) {
  const slug = slugify(project.title)
  seen.add(slug)

  const banner = await uploadBanner(project.order, project.title)
  const cta = callToActionFor(project.details, slug)

  const data = {
    title: project.title,
    slug,
    _status: 'published' as const,
    phase: project.phase,
    phaseNote: project.note,
    order: project.order,
    excerpt: project.card,
    body: toLexical(project.body),
    details: project.details,
    ...(banner ? { image: banner } : {}),
    ...(cta ? { callToAction: { heading: MESSAGES.heading, label: cta.label, url: cta.url } } : {}),
  }

  const existing = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'projects',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    console.log(`  updated  ${project.order}. ${slug} (${project.phase}, ${project.details.length} details${banner ? ', banner' : ''})`)
  } else {
    await payload.create({ collection: 'projects', data, overrideAccess: true })
    console.log(`  created  ${project.order}. ${slug} (${project.phase}, ${project.details.length} details${banner ? ', banner' : ''})`)
  }
}

const pageData = {
  title: 'Projecten',
  slug: PAGE_SLUG,
  _status: 'published' as const,
  body: [{ blockType: 'richText' as const, content: toLexical(document.intro) }],
}

const existingPage = await payload.find({
  collection: 'pages',
  where: { slug: { equals: PAGE_SLUG } },
  limit: 1,
  overrideAccess: true,
})

if (existingPage.docs[0]) {
  await payload.update({
    collection: 'pages',
    id: existingPage.docs[0].id,
    data: pageData,
    overrideAccess: true,
  })
  console.log(`  updated  /${PAGE_SLUG} — ${document.intro.length} intro blocks`)
} else {
  await payload.create({ collection: 'pages', data: pageData, overrideAccess: true })
  console.log(`  created  /${PAGE_SLUG} — ${document.intro.length} intro blocks`)
}

const all = await payload.find({
  collection: 'projects',
  limit: 200,
  depth: 0,
  overrideAccess: true,
})

const extra = all.docs.filter((doc) => !seen.has(doc.slug))

if (extra.length > 0) {
  console.log('')
  console.log(`  ${extra.length} project(s) on this database are not in the document:`)

  for (const doc of extra) {
    console.log(`    /${doc.slug} — "${doc.title}"`)
  }

  console.log('  They are untouched. Remove them in the admin panel if they should go.')
}

console.log('Done.')
process.exit(0)

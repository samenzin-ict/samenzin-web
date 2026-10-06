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

/** The page whose blocks /projecten renders above the grid. */
const PAGE_SLUG = 'projecten'

type Phase = 'loopt' | 'in-voorbereiding'

type Document = {
  intro: TextBlock[]
  projects: {
    order: number
    title: string
    card: string
    phase: Phase
    note: string | null
    body: TextBlock[]
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

const payload = await getPayload({ config })

const seen = new Set<string>()

for (const project of document.projects) {
  const slug = slugify(project.title)
  seen.add(slug)

  const data = {
    title: project.title,
    slug,
    _status: 'published' as const,
    phase: project.phase,
    phaseNote: project.note,
    order: project.order,
    excerpt: project.card,
    body: toLexical(project.body),
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
    console.log(`  updated  ${project.order}. ${slug} (${project.phase})`)
  } else {
    await payload.create({ collection: 'projects', data, overrideAccess: true })
    console.log(`  created  ${project.order}. ${slug} (${project.phase})`)
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

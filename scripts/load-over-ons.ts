/**
 * Publishes /over-ons: the page text, and the board's biographies and
 * portraits.
 *
 *   pnpm load:over-ons                 # the local database
 *   pnpm load:over-ons dev             # the Neon dev branch
 *   pnpm load:over-ons production      # the Neon production branch
 *
 * The text comes from .devseed/over-ons.json, which
 * scripts/convert-over-ons.py produces from the Word file in docs/, and the
 * portraits from .devseed/portraits/, which scripts/crop-portraits.py cuts to
 * one shape. None of those are in the repository: they carry the board
 * members' names and faces, and CLAUDE.md rule 2 keeps real names out of git.
 * The privacyverklaring is handled the same way; see scripts/load-legal.ts.
 *
 * The page is built from blocks the converter has already shaped: running text
 * as sections, named points as rows or cards. See scripts/convert-over-ons.py
 * for how it tells them apart.
 *
 * Two things this deliberately does not store on the page.
 *
 * The names. They stay in the ANBI record, where they already were, and the
 * board block reads them from there. This script matches a biography to a
 * person by role, never by name, so the only place a name is spelled is the
 * one that has to agree with the statutes.
 *
 * The sentence about the ANBI application. The converter replaces it with a
 * marker and this writes whichever sentence matches the status in that same
 * record. Flip the status when the beschikking arrives and both /anbi and
 * /over-ons change together, instead of one of them being forgotten.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { getPayload } from 'payload'

import { paragraphsToLexical, toLexical, type TextBlock } from './lexical'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.resolve(dirname, '..', '.devseed', 'over-ons.json')
const PORTRAITS = path.resolve(dirname, '..', '.devseed', 'portraits')

const SLUG = 'over-ons'
const ANBI_MARKER = '{{anbiStatus}}'

type Point = { title: string; text: string }

type SourceBlock =
  | { kind: 'section'; heading: string; body: TextBlock[]; layout: 'rail' | 'lead'; tone: 'plain' | 'soft' }
  | {
      kind: 'highlights'
      heading: string
      intro: string
      items: Point[]
      outro: string
      layout: 'cards' | 'rows'
      tone: 'plain' | 'soft' | 'strong'
    }
  | { kind: 'board'; heading: string; intro: string }

type Document = {
  title: string
  blocks: SourceBlock[]
  biographies: Record<string, string[]>
}

if (!fs.existsSync(SOURCE)) {
  console.error(`No ${path.relative(process.cwd(), SOURCE)}.`)
  console.error('Run: python3 scripts/convert-over-ons.py')
  console.error('That needs the Word file in docs/, which is gitignored.')
  process.exit(1)
}

const document = JSON.parse(fs.readFileSync(SOURCE, 'utf8')) as Document

/**
 * The sentence the page makes about the ANBI application, per status.
 *
 * Worded to match /anbi, which says the same thing at more length. "Aangevraagd"
 * may not promise that a gift is deductible, because until the beschikking
 * arrives it is not.
 */
const anbiSentence = (status: string): string =>
  status === 'toegekend'
    ? 'De Belastingdienst heeft de stichting aangemerkt als algemeen nut beogende instelling (ANBI).'
    : 'De ANBI-status is aangevraagd en nog niet toegekend.'

/**
 * Does this biography open with the member's full name, as the ANBI page has it?
 *
 * The board wants each person named in full where they are introduced, so a
 * first name on its own is refused along with a misspelling: "Ahmet Emre" for
 * "Ahmet Emre Yönder" stops the load just as "Halil Baykan" for "Halil İbrahim
 * Baykan" does. One spelling, and the whole of it.
 */
const opensWithFullName = (biography: string, canonical: string): boolean =>
  biography.startsWith(`${canonical} `)

const payload = await getPayload({ config })

const anbi = await payload.findGlobal({ slug: 'anbi-gegevens', depth: 0 })
const members = anbi.boardMembers ?? []

if (members.length === 0) {
  console.error('The ANBI record has no board members, so there is nobody to describe.')
  console.error('Fill Bestuur under ANBI-gegevens first; that is where the names live.')
  process.exit(1)
}

const portraitFor = (role: string) => path.join(PORTRAITS, `${role.toLowerCase()}.jpg`)

/**
 * Attaches a portrait to a member who has none yet.
 *
 * A photograph that is already attached is left alone, whatever is on this
 * machine. Somebody replacing a portrait in the admin panel is the normal way
 * for it to change, and a loader that put last month's crop back every time
 * the text was revised would undo that without a word.
 */
const portraitIfMissing = async (
  member: (typeof members)[number],
): Promise<typeof member.photo> => {
  if (member.photo) return member.photo

  const file = portraitFor(member.role)

  if (!fs.existsSync(file)) return member.photo

  const created = await payload.create({
    collection: 'media',
    data: { alt: `Portret van ${member.name}` },
    filePath: file,
    overrideAccess: true,
  })

  console.log(`  ${member.role}: uploaded ${created.filename}`)

  return created.id
}

const updatedMembers = []
let refused = false

for (const member of members) {
  const biography = document.biographies[member.role.toLowerCase()]

  if (!biography) {
    console.error(`  No biography for "${member.role}" in the Word file.`)
    refused = true
    continue
  }

  if (!opensWithFullName(biography[0], member.name)) {
    console.error(`  "${member.role}": the biography has to open with the full name as the`)
    console.error(`  ANBI record has it, "${member.name}". It opens with:`)
    console.error(`    ${biography[0].slice(0, 60)}…`)
    console.error('  Fix it in the Word file, re-run the converter, and run this again.')
    refused = true
    continue
  }

  updatedMembers.push({
    ...member,
    bio: paragraphsToLexical(biography),
    photo: await portraitIfMissing(member),
  })
}

if (refused) {
  console.error('\nNothing was written.')
  process.exit(1)
}

await payload.updateGlobal({
  slug: 'anbi-gegevens',
  data: { boardMembers: updatedMembers },
  overrideAccess: true,
})

console.log(`  updated ${updatedMembers.length} biographies`)

const withAnbi = (text: string): string =>
  text.replace(ANBI_MARKER, anbiSentence(anbi.anbiStatus))

/*
 * Where a named point leads. Only the closing call to action links anywhere:
 * its three points are things to do, and each has a page where it is done.
 *
 * The points under "Wat wij doen" are deliberately not linked to projects.
 * Three of the five share a name with one and two do not, and a list in which
 * some rows are links and others are not reads as a list with two rows broken.
 */
const WAYS_TO_HELP: [RegExp, string][] = [
  [/vrijwilliger/i, '/vrijwilligers'],
  [/financieel|gift|doneer/i, '/doneren'],
  [/samen|organisatie/i, '/contact'],
]

const urlFor = (point: Point, tone: string): string | undefined =>
  tone === 'strong' ? WAYS_TO_HELP.find(([pattern]) => pattern.test(point.title))?.[1] : undefined

const body = document.blocks.map((block) => {
  if (block.kind === 'board') {
    return { blockType: 'board' as const, heading: block.heading, intro: block.intro }
  }

  if (block.kind === 'section') {
    return {
      blockType: 'section' as const,
      heading: block.heading,
      layout: block.layout,
      tone: block.tone,
      content: toLexical(
        block.body.map((paragraph) =>
          paragraph.type !== 'ul' && typeof paragraph.text === 'string'
            ? { ...paragraph, text: withAnbi(paragraph.text) }
            : paragraph,
        ),
      ),
    }
  }

  return {
    blockType: 'highlights' as const,
    heading: block.heading,
    intro: block.intro || undefined,
    outro: block.outro || undefined,
    layout: block.layout,
    tone: block.tone,
    items: block.items.map((point) => ({
      title: point.title,
      text: withAnbi(point.text),
      url: urlFor(point, block.tone),
    })),
  }
})

const data = { title: document.title, slug: SLUG, _status: 'published' as const, body }

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: SLUG } },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs[0]) {
  await payload.update({ collection: 'pages', id: existing.docs[0].id, data, overrideAccess: true })
  console.log(`  updated /${SLUG} — ${body.length} blocks`)
} else {
  await payload.create({ collection: 'pages', data, overrideAccess: true })
  console.log(`  created /${SLUG} — ${body.length} blocks`)
}

console.log('Done.')
process.exit(0)

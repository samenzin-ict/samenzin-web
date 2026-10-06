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

type Document = {
  title: string
  body: TextBlock[]
  board: {
    heading: string
    intro: string
    biographies: Record<string, string[]>
  }
  closing: TextBlock[]
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
 * May this biography open with this name?
 *
 * Only if the name it opens with is the one on the ANBI page, or a shortening
 * of it from the front: "Ahmet Emre" for "Ahmet Emre Yönder" is a person being
 * called by their first names, while "Halil Baykan" for "Halil İbrahim Baykan"
 * is a second spelling of a name. The first is normal Dutch prose; the second
 * is the thing that leaves a website naming the same person two ways.
 *
 * Leading capitalised words are taken as the name. A biography that opens with
 * anything else is not making a claim about the spelling and is left alone.
 */
const nameIsConsistent = (biography: string, canonical: string): boolean => {
  const leading = biography.match(/^(\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*)*)/u)

  if (!leading) return true

  const written = leading[1].split(/\s+/)
  const expected = canonical.split(/\s+/)

  // Not a name at all, just a sentence that happens to start with a capital.
  if (written.length === 1 && written[0] !== expected[0]) return true

  return written.every((word, index) => expected[index] === word)
}

const payload = await getPayload({ config })

const anbi = await payload.findGlobal({ slug: 'anbi-gegevens', depth: 0 })
const members = anbi.boardMembers ?? []

if (members.length === 0) {
  console.error('The ANBI record has no board members, so there is nobody to describe.')
  console.error('Fill Bestuur under ANBI-gegevens first; that is where the names live.')
  process.exit(1)
}

/*
 * Portraits are all-or-nothing, the same rule the page renders by. Uploading
 * two of three would leave the page showing none of them and two unused files
 * in the bucket.
 */
const portraitFor = (role: string) => path.join(PORTRAITS, `${role.toLowerCase()}.jpg`)
const everyPortrait = members.every((member) => fs.existsSync(portraitFor(member.role)))

if (!everyPortrait) {
  console.log('  Not every board member has a portrait in .devseed/portraits/,')
  console.log('  so no photographs are loaded and the page shows name cards.')
}

/**
 * Uploads a portrait, or reuses the one that is already there.
 *
 * The file is only sent again when it differs in size from the one on record.
 * Re-uploading an identical image is not free: Payload treats the name as
 * taken, stores the new one as portrait-1.jpg, and leaves the old file and its
 * generated sizes behind in the bucket. Running this twice should cost nothing
 * and change nothing, because it will be run twice.
 */
const uploadPortrait = async (role: string, name: string): Promise<number> => {
  const file = portraitFor(role)
  const alt = `Portret van ${name}`

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: path.basename(file) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const current = existing.docs[0]

  if (current) {
    const changed = current.filesize !== fs.statSync(file).size

    const updated = await payload.update({
      collection: 'media',
      id: current.id,
      data: { alt },
      ...(changed ? { filePath: file } : {}),
      overrideAccess: true,
    })

    console.log(`  ${role}: ${changed ? 'replaced' : 'unchanged'} ${updated.filename}`)

    return updated.id
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: file,
    overrideAccess: true,
  })

  console.log(`  ${role}: uploaded ${created.filename}`)

  return created.id
}

const updatedMembers = []
let refused = false

for (const member of members) {
  const role = member.role.toLowerCase()
  const biography = document.board.biographies[role]

  if (!biography) {
    console.error(`  No biography for "${member.role}" in the Word file.`)
    refused = true
    continue
  }

  if (!nameIsConsistent(biography[0], member.name)) {
    console.error(`  "${member.role}": the biography opens with a different spelling than the`)
    console.error(`  ANBI record, which says "${member.name}". Fix it in the Word file,`)
    console.error('  re-run the converter, and run this again.')
    refused = true
    continue
  }

  updatedMembers.push({
    ...member,
    bio: paragraphsToLexical(biography),
    photo: everyPortrait ? await uploadPortrait(role, member.name) : member.photo,
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

console.log(`  updated ${updatedMembers.length} board members${everyPortrait ? ' with portraits' : ''}`)

// The Over ons converter writes plain strings, so the marker is in one of them.
const body = document.body.map((block) =>
  block.type !== 'ul' && typeof block.text === 'string' && block.text.includes(ANBI_MARKER)
    ? { ...block, text: block.text.replace(ANBI_MARKER, anbiSentence(anbi.anbiStatus)) }
    : block,
)

const data = {
  title: document.title,
  slug: SLUG,
  _status: 'published' as const,
  body: [
    { blockType: 'richText' as const, content: toLexical(body) },
    {
      blockType: 'board' as const,
      heading: document.board.heading,
      intro: document.board.intro,
    },
    { blockType: 'richText' as const, content: toLexical(document.closing) },
  ],
}

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: SLUG } },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs[0]) {
  await payload.update({ collection: 'pages', id: existing.docs[0].id, data, overrideAccess: true })
  console.log(`  updated /${SLUG} — ${body.length} text blocks and the board`)
} else {
  await payload.create({ collection: 'pages', data, overrideAccess: true })
  console.log(`  created /${SLUG} — ${body.length} text blocks and the board`)
}

console.log('Done.')
process.exit(0)

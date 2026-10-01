/**
 * Publishes the privacyverklaring and the cookiebeleid.
 *
 *   pnpm load:legal                 # the local database
 *   pnpm load:legal dev             # the Neon dev branch
 *   pnpm load:legal production      # the Neon production branch
 *
 * The text comes from .devseed/legal.json, which scripts/convert-legal.py
 * produces from the Word files in docs/. Neither is in the repository: the
 * privacyverklaring carries the foundation's postal address, e-mail address,
 * KvK number and RSIN, and CLAUDE.md rule 2 keeps real addresses out of git.
 * The real ANBI text is handled the same way.
 *
 * These two pages are not demo content, so `pnpm seed` leaves them alone on a
 * hosted database in the same way it leaves the ANBI record alone. This is what
 * puts them there, and what updates them when the texts change.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.resolve(dirname, '..', '.devseed', 'legal.json')

type Block =
  | { type: 'p' | 'h2' | 'h3'; text: string }
  | { type: 'ul'; items: string[] }

type Document = { title: string; blocks: Block[] }

if (!fs.existsSync(SOURCE)) {
  console.error(`No ${path.relative(process.cwd(), SOURCE)}.`)
  console.error('Run: python3 scripts/convert-legal.py')
  console.error('That needs the Word files in docs/, which are gitignored.')
  process.exit(1)
}

const documents = JSON.parse(fs.readFileSync(SOURCE, 'utf8')) as Record<string, Document>

/** Lexical's shape for a run of plain text. */
const textNode = (text: string) => ({
  type: 'text',
  text,
  mode: 'normal',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
})

const container = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

/**
 * The blocks as Lexical's editor state. Built as a plain object, the same way
 * the seed builds its rich text: Payload's field type wants an index signature
 * that the exported SerializedEditorState does not carry, and casting to it
 * only moves the problem.
 */
const toLexical = (blocks: Block[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks.map((block) => {
      if (block.type === 'ul') {
        return container(
          'list',
          block.items.map((item, index) =>
            container('listitem', [textNode(item)], { value: index + 1 }),
          ),
          { listType: 'bullet', start: 1, tag: 'ul' },
        )
      }

      if (block.type === 'h2' || block.type === 'h3') {
        return container('heading', [textNode(block.text)], { tag: block.type })
      }

      return container('paragraph', [textNode(block.text)], { textFormat: 0, textStyle: '' })
    }),
  },
})

const payload = await getPayload({ config })

for (const [slug, document] of Object.entries(documents)) {
  const data = {
    title: document.title,
    slug,
    _status: 'published' as const,
    body: [
      {
        blockType: 'richText' as const,
        content: toLexical(document.blocks),
      },
    ],
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data, overrideAccess: true })
    console.log(`  updated /${slug} — ${document.blocks.length} blocks`)
  } else {
    await payload.create({ collection: 'pages', data, overrideAccess: true })
    console.log(`  created /${slug} — ${document.blocks.length} blocks`)
  }
}

console.log('Done.')
process.exit(0)

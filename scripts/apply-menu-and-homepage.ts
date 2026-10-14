/**
 * Applies the 2026-10-14 decisions about the menu and the homepage to a
 * database that already has content.
 *
 *   pnpm apply:menu-and-homepage                 # the local database
 *   pnpm apply:menu-and-homepage dev             # the Neon dev branch
 *   pnpm apply:menu-and-homepage production      # the Neon production branch
 *
 * - The main menu becomes scripts/navigation.ts: five items, three of them
 *   submenus.
 * - Every link to /lid-worden goes from the footer: membership is no longer
 *   requested through the site.
 * - The homepage banner: "Word vrijwilliger" goes to the volunteer form rather
 *   than the contact page, and the band of figures under it is emptied,
 *   because its figures were placeholders.
 * - With HERO_TEXT_IN_IMAGE=1, the banner's heading and text are also marked
 *   as already being in its image. True of the designed banner on production,
 *   not of the demo pattern on dev, which is why it is not the default:
 *
 *     HERO_TEXT_IN_IMAGE=1 pnpm apply:menu-and-homepage production
 *
 * Changes only those fields and leaves the rest of each document as it is.
 * Running it twice changes nothing the second time.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { MAIN_NAVIGATION } from './navigation'

const MEMBERSHIP_URL = '/lid-worden'
const VOLUNTEER_URL = '/vrijwilligers'

const payload = await getPayload({ config })

const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })

const footerColumns = (settings.footerColumns ?? []).map((column) => ({
  ...column,
  links: (column.links ?? []).filter((link) => link.url !== MEMBERSHIP_URL),
}))

const removed =
  (settings.footerColumns ?? []).reduce((sum, column) => sum + (column.links?.length ?? 0), 0) -
  footerColumns.reduce((sum, column) => sum + column.links.length, 0)

await payload.updateGlobal({
  slug: 'site-settings',
  data: { mainNavigation: MAIN_NAVIGATION, footerColumns },
  overrideAccess: true,
})

console.log(`  menu: ${MAIN_NAVIGATION.map((item) => item.label).join(' · ')}`)
console.log(`  footer: removed ${removed} link(s) to ${MEMBERSHIP_URL}`)

const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})

const home = docs[0]

if (!home) {
  console.log('  no homepage on this database; nothing else to do')
} else {
  const body = (home.body ?? []).map((block) => {
    if (block.blockType !== 'hero') return block

    return {
      ...block,
      textInImage: process.env.HERO_TEXT_IN_IMAGE === '1' ? Boolean(block.image) : block.textInImage,
      stats: [],
      links: (block.links ?? []).map((link) =>
        /vrijwilliger/i.test(link.label) ? { ...link, url: VOLUNTEER_URL } : link,
      ),
    }
  })

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { body, _status: 'published' },
    overrideAccess: true,
  })

  console.log(
    `  homepage banner: volunteer button, figures removed${process.env.HERO_TEXT_IN_IMAGE === '1' ? ', text in image' : ''}`,
  )
}

console.log('Done.')
process.exit(0)

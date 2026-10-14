import { hasPublished } from '@/lib/payload'
import type { SiteSetting } from '@/payload-types'

export type NavLink = { id: string; label: string; url: string }

/** A menu item: a link, or a label that opens a list of links. */
export type NavItem = NavLink | { id: string; label: string; children: NavLink[] }

/*
 * Listings that hide themselves from the menu while they are empty. A link to
 * a page that says "nothing here yet" is a dead end in the most prominent
 * place on the site.
 */
const LISTINGS = {
  '/nieuws': 'articles',
  '/cursussen': 'courses',
} as const

const isListing = (url: string): url is keyof typeof LISTINGS => url in LISTINGS

/**
 * The main menu from SiteSettings, with empty listings left out.
 *
 * A submenu that ends up with one link becomes that link, and one that ends
 * up with none disappears, so hiding /cursussen never leaves a dropdown with a
 * single entry in it.
 */
export async function getNavigation(
  items: NonNullable<SiteSetting['mainNavigation']>,
): Promise<NavItem[]> {
  const empty = new Set<string>()

  await Promise.all(
    Object.entries(LISTINGS).map(async ([url, collection]) => {
      if (!(await hasPublished(collection))) empty.add(url)
    }),
  )

  const visible = (url: string) => !(isListing(url) && empty.has(url))

  return items.flatMap((item, index): NavItem[] => {
    const id = item.id ?? String(index)
    const children = (item.children ?? [])
      .filter((child) => visible(child.url))
      .map((child, childIndex) => ({
        id: child.id ?? `${id}-${childIndex}`,
        label: child.label,
        url: child.url,
      }))

    if ((item.children?.length ?? 0) > 0) {
      if (children.length === 0) return []
      if (children.length === 1) return [children[0]]
      return [{ id, label: item.label, children }]
    }

    return item.url && visible(item.url) ? [{ id, label: item.label, url: item.url }] : []
  })
}


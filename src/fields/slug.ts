import type { FieldHook } from 'payload'

/**
 * Turn a Dutch title into a URL slug.
 *
 * Accents are stripped rather than transliterated, so "Café" becomes "cafe".
 * URLs and slugs are Dutch (CLAUDE.md, "Language conventions"), which follows
 * from deriving them from the Dutch title.
 */
export const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Fill the slug from the title when the editor has not typed one.
 *
 * Only ever fills a blank slug. Changing the title of a published page must
 * not silently change its address and break every link to it.
 */
export const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value)
    }

    if (operation === 'create' || !originalDoc?.slug) {
      const fallback = data?.[fallbackField] ?? originalDoc?.[fallbackField]

      if (typeof fallback === 'string' && fallback.trim().length > 0) {
        return slugify(fallback)
      }
    }

    return value
  }

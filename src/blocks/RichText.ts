import type { Block } from 'payload'

/**
 * A block of formatted text. The workhorse of every page.
 */
export const RichText: Block = {
  slug: 'richText',
  labels: {
    singular: 'Tekst',
    plural: 'Tekstblokken',
  },
  imageAltText: 'Een blok met opgemaakte tekst.',
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Tekst',
    },
  ],
}

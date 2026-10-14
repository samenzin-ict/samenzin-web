import type { Block } from 'payload'

/**
 * A titled section of running text: a heading over a column of prose.
 *
 * The plain text block is one column of prose, which is right for a privacy
 * statement and wrong for a page like Over ons, where five sections in a row
 * read as one grey slab down the left of the screen with nothing to tell them
 * apart. Giving each section its heading as a landmark is what lets a reader
 * find "Hoe het begon" without reading their way to it.
 *
 * The heading is a field rather than a heading typed into the text, so the
 * page decides where it goes and an editor cannot end up with two.
 */
export const Section: Block = {
  slug: 'section',
  labels: {
    singular: 'Sectie',
    plural: 'Secties',
  },
  imageAltText: 'Een sectie met een kop boven de tekst.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Tekst',
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'plain',
      label: 'Achtergrond',
      options: [
        { label: 'Geen', value: 'plain' },
        { label: 'Witte band', value: 'soft' },
      ],
      admin: {
        description: 'Wissel af om de secties van elkaar te scheiden.',
      },
    },
  ],
}

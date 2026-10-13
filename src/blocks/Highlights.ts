import type { Block } from 'payload'

/**
 * A short list of things that each have a name and a line of explanation:
 * what we do, how we work, the ways to help.
 *
 * In a text block these are bullets, and five bullets of two lines each are
 * the part of a page nobody reads. They are also the part a visitor most wants
 * to scan. Here every item gets its name set apart from its explanation, as a
 * row in a list or as a card in a grid.
 *
 * One block with two layouts rather than two blocks, because the content is
 * the same shape and only the amount differs: a handful of longer items reads
 * best as rows, six short principles as cards.
 */
export const Highlights: Block = {
  slug: 'highlights',
  labels: {
    singular: 'Uitgelichte punten',
    plural: 'Uitgelichte punten',
  },
  imageAltText: 'Een lijst of raster van punten met elk een titel en een korte uitleg.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Inleiding',
      admin: { description: 'Een of twee zinnen onder de kop. Optioneel.' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Punten',
      labels: { singular: 'Punt', plural: 'Punten' },
      minRows: 1,
      maxRows: 9,
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Titel' },
        { name: 'text', type: 'textarea', label: 'Uitleg' },
        {
          name: 'url',
          type: 'text',
          label: 'Adres',
          admin: {
            description: 'Optioneel. Maakt van de titel een link, bijvoorbeeld naar /doneren.',
          },
        },
      ],
    },
    {
      name: 'outro',
      type: 'textarea',
      label: 'Afsluiting',
      admin: { description: 'Een alinea onder de punten. Optioneel.' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cards',
      label: 'Opmaak',
      options: [
        { label: 'Kaarten in een raster', value: 'cards' },
        { label: 'Rijen onder elkaar', value: 'rows' },
      ],
      admin: {
        description: 'Kaarten voor korte punten, rijen voor punten met een langere uitleg.',
      },
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'plain',
      label: 'Achtergrond',
      options: [
        { label: 'Geen', value: 'plain' },
        { label: 'Witte band', value: 'soft' },
        { label: 'Groene band', value: 'strong' },
      ],
      admin: {
        description: 'De groene band is voor de afsluitende oproep van een pagina.',
      },
    },
  ],
}

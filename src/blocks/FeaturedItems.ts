import type { Block } from 'payload'

/**
 * The card grid from the homepage mockup, "Onze projecten".
 *
 * The cards are filled in here rather than pulled from a Projects collection.
 * Projects are phase 2 (ROADMAP.md); a curated row of cards on the homepage is
 * not, and an editor can point it at anything: projects, focus areas, ways to
 * help. When the Projects collection arrives this block can gain an option to
 * pull from it, without the homepage having to be rebuilt.
 */
export const FeaturedItems: Block = {
  slug: 'featuredItems',
  labels: {
    singular: 'Kaartenrij',
    plural: 'Kaartenrijen',
  },
  imageAltText: 'Een rij kaarten met een afbeelding, een titel en een korte tekst.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
      admin: {
        description: 'Bijvoorbeeld: Onze projecten.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Kaarten',
      labels: {
        singular: 'Kaart',
        plural: 'Kaarten',
      },
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Titel',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Korte tekst',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Afbeelding',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Adres',
          admin: {
            description: 'Waar de link onder de kaart naartoe gaat. Laat leeg voor geen link.',
          },
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Tekst van de link',
          admin: {
            description: 'Bijvoorbeeld: Lees meer.',
          },
        },
      ],
    },
  ],
}

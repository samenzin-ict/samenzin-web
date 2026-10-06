import type { Block } from 'payload'

/**
 * The card grid from the homepage mockup, "Onze projecten".
 *
 * Normally the cards are the projects themselves, read from the collection, so
 * the homepage follows when a project is renamed, rewritten or added and
 * cannot end up pointing at an address that no longer exists. That is what it
 * did before this option existed: three cards typed in by hand, still naming
 * projects that had been rewritten, two of their three links dead.
 *
 * The hand-typed list stays, because the block is also used for things that
 * are not projects: focus areas, ways to help. Switching a block to manual
 * brings the old cards straight back, because adding the automatic source
 * never deleted them.
 *
 * An empty `source` reads as manual. The migration gave every existing block
 * the automatic source, so in practice nothing is left empty; the fallback is
 * for a row written by some path that skips the column default, and it fails
 * towards the cards an editor typed rather than away from them.
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
      name: 'source',
      type: 'select',
      defaultValue: 'projects',
      label: 'Waar komen de kaarten vandaan?',
      options: [
        { label: 'Automatisch: onze projecten', value: 'projects' },
        { label: 'Handmatig: de lijst hieronder', value: 'manual' },
      ],
      admin: {
        description:
          'Automatisch toont de projecten in de volgorde van de projectenpagina. Zo hoeft de homepagina niet apart bijgewerkt te worden als een project verandert.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
      label: 'Aantal kaarten',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'projects',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Kaarten',
      admin: {
        condition: (_, siblingData) => siblingData?.source !== 'projects',
      },
      labels: {
        singular: 'Kaart',
        plural: 'Kaarten',
      },
      // No minimum: with the automatic source the list is legitimately empty,
      // and requiring a row there would make the page refuse to publish.
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

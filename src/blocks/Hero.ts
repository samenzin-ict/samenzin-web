import type { Block } from 'payload'

import { linkArray } from '@/fields/link'

/**
 * The banner at the top of a page.
 *
 * Modelled on the homepage in docs/design/02-homepage-desktop.png: a heading,
 * a short introduction, up to two buttons, a decorative image, and the band of
 * figures underneath it.
 *
 * Everything is optional except the heading, so the same block works for the
 * homepage and for a plain page that only needs a title. The colours are not
 * configurable; they come from the design tokens, which keeps every hero
 * within the approved palette and above the contrast requirement.
 */
export const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  imageAltText: 'Banner met een kop, een korte tekst en knoppen.',
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
      label: 'Korte tekst',
      admin: {
        description: 'Een of twee zinnen onder de kop.',
      },
    },
    linkArray(),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
      admin: {
        description: 'Optioneel. Wordt naast of achter de tekst getoond.',
      },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Balk met kerngegevens',
      labels: {
        singular: 'Gegeven',
        plural: 'Gegevens',
      },
      maxRows: 4,
      admin: {
        description:
          'De balk onder de banner. Laat leeg om de balk te verbergen. Bijvoorbeeld: 40+ vrijwilligers.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Getal',
          admin: {
            description: 'Optioneel. Laat leeg voor een gegeven zonder getal.',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Omschrijving',
        },
      ],
    },
  ],
}

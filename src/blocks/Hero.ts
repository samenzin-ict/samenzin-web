import type { Block } from 'payload'

import { linkArray } from '@/fields/link'

/**
 * The banner at the top of a page.
 *
 * Modelled on the homepage in docs/design/02-homepage-desktop.png: a heading,
 * a short introduction, up to two buttons, an image filling the banner behind
 * them, and the band of figures underneath it.
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
        description:
          'Optioneel. Vult de hele banner, achter de tekst. Breed beeld, ongeveer 5 bij 2, met het onderwerp rechts: links komt de tekst.',
      },
    },
    {
      name: 'textInImage',
      type: 'checkbox',
      defaultValue: false,
      label: 'De kop en de tekst staan al in de afbeelding',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.image),
        description:
          'Dan worden ze niet nog eens over de afbeelding gezet; schermlezers en zoekmachines krijgen ze nog wel. Zet de tekst in de afbeelding links, op ongeveer een twaalfde van de rand: de knoppen komen er recht onder.',
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

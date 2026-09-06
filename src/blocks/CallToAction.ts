import type { Block } from 'payload'

import { linkArray } from '@/fields/link'

/**
 * A band that asks the visitor to do something: donate, volunteer, get in
 * touch. Modelled on the gold call-to-action in the design system.
 */
export const CallToAction: Block = {
  slug: 'callToAction',
  labels: {
    singular: 'Oproep',
    plural: 'Oproepen',
  },
  imageAltText: 'Een opvallend blok met een oproep en een knop.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Korte tekst',
    },
    linkArray({ minRows: 1 }),
  ],
}

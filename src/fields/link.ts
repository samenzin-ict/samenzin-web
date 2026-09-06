import type { ArrayField } from 'payload'

/**
 * The buttons that appear in a block.
 *
 * The style options are the three button variants in the design system
 * (docs/design/01-design-system.png). An editor chooses which role a button
 * plays, not what colour it is: the colours come from the design tokens, so a
 * volunteer cannot produce a combination that fails the contrast requirement.
 */
export const linkArray = (overrides: Partial<ArrayField> = {}): ArrayField => ({
  name: 'links',
  type: 'array',
  label: 'Knoppen',
  labels: {
    singular: 'Knop',
    plural: 'Knoppen',
  },
  maxRows: 2,
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Tekst op de knop',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Adres',
      admin: {
        description: 'Een pad op deze website, zoals /doneren, of een volledig adres.',
      },
    },
    {
      name: 'style',
      type: 'select',
      required: true,
      defaultValue: 'cta',
      label: 'Soort knop',
      options: [
        { label: 'Oproep tot actie (goud)', value: 'cta' },
        { label: 'Tweede knop (groen)', value: 'primary' },
        { label: 'Derde knop (omlijnd)', value: 'outline' },
      ],
    },
  ],
  ...overrides,
})

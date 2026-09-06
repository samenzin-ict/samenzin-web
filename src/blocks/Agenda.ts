import type { Block } from 'payload'

/**
 * The list of dated items from the homepage mockup, "Agenda".
 *
 * Entered by hand rather than read from an Events collection, which is phase 2
 * (ROADMAP.md). A short list of what is coming up is useful on the homepage
 * long before the events module exists, and this block is replaced rather than
 * extended when it arrives.
 *
 * The mockup also draws "Aankomend" and "Afgelopen" filter pills. Those need a
 * real collection to filter, so they are deliberately not drawn here: controls
 * that do nothing are worse than no controls.
 */
export const Agenda: Block = {
  slug: 'agenda',
  labels: {
    singular: 'Agenda',
    plural: 'Agenda-blokken',
  },
  imageAltText: 'Een lijst met datums en activiteiten.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Activiteiten',
      labels: {
        singular: 'Activiteit',
        plural: 'Activiteiten',
      },
      minRows: 1,
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Datum',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Titel',
        },
        {
          name: 'location',
          type: 'text',
          label: 'Locatie',
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Label',
          admin: {
            description: 'Klein label rechts, bijvoorbeeld Gratis of € 45. Optioneel.',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Adres',
          admin: {
            description: 'Waar de activiteit naartoe linkt. Optioneel.',
          },
        },
      ],
    },
  ],
}

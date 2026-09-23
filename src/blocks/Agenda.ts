import type { Block } from 'payload'

/**
 * The list of dated items from the homepage mockup, "Agenda".
 *
 * Since ROADMAP 2.4 this normally reads the next events from the Events
 * collection. The hand-typed list is kept for blocks that already use it, and
 * for the occasional item that is not a real event.
 *
 * A block saved before 2.4 has no `source`, and an empty `source` means
 * manual. That is deliberate: defaulting old blocks to automatic would have
 * silently emptied every homepage that was already filled in by hand.
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
      name: 'source',
      type: 'select',
      defaultValue: 'events',
      label: 'Waar komen de activiteiten vandaan?',
      options: [
        { label: 'Automatisch: de eerstvolgende evenementen', value: 'events' },
        { label: 'Handmatig: de lijst hieronder', value: 'manual' },
      ],
      admin: {
        description:
          'Automatisch toont de eerstvolgende evenementen uit de Agenda. Zo hoeft de homepagina niet apart bijgewerkt te worden.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 8,
      label: 'Aantal activiteiten',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'events',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Activiteiten',
      admin: {
        condition: (_, siblingData) => siblingData?.source !== 'events',
      },
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

import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isEditorOfCommission, isPublishedOrAuthenticated } from '@/access'
import { commissionField } from '@/fields/commissions'
import { formatSlug } from '@/fields/slug'

/**
 * The foundation's projects: Taalmaatje, retraites, studentenhuisvesting and
 * the rest. ROADMAP 2.2, modelled on docs/design/06-projecten-*.png.
 *
 * Drafts are on, the read rule returns only published documents and preview
 * goes through the same checked route as Pages. Every collection added from
 * here on needs all three; without them a half-written project is reachable by
 * guessing its address.
 *
 * The funding figures are typed in by hand. They are not derived from the
 * Donations collection: a donation can be earmarked in ways the website does
 * not know about, and a bank transfer never passes through here at all. A
 * figure someone maintains deliberately is more honest than one that looks
 * automatic and is quietly wrong.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projecten',
  },
  access: {
    read: isPublishedOrAuthenticated,
    create: isAdminOrEditor,
    // ROADMAP 2.8: an editor may change what their commission owns, and what
    // no commission owns.
    update: isEditorOfCommission,
    delete: isEditorOfCommission,
  },
  versions: {
    drafts: { validate: false },
    maxPerDoc: 50,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
    group: 'Content',
    description: 'De projecten van de stichting.',
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''

      if (!slug) return null

      const params = new URLSearchParams({
        path: `/projecten/${slug}`,
        previewSecret: process.env.PREVIEW_SECRET || '',
      })

      return `/preview?${params.toString()}`
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Titel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true,
      label: 'Adres van het project',
      admin: {
        position: 'sidebar',
        description:
          'Het deel van het webadres na /projecten/. Wordt automatisch ingevuld vanuit de titel. Wijzig dit niet meer zodra het project online staat.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'category',
      type: 'text',
      localized: true,
      label: 'Categorie',
      admin: {
        position: 'sidebar',
        description: 'Het label op de kaart in het overzicht. Optioneel.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Korte omschrijving',
      admin: {
        description: 'Een of twee zinnen. Wordt getoond op de kaart in het overzicht.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
      admin: {
        description: 'Gebruikt op de kaart en als banner bovenaan de projectpagina.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: 'Tekst',
    },
    {
      name: 'facts',
      type: 'array',
      localized: true,
      label: 'Kerngegevens',
      labels: { singular: 'Gegeven', plural: 'Kerngegevens' },
      maxRows: 4,
      admin: {
        description: 'De rij met feiten onder de tekst. Bijvoorbeeld: 8 weken per traject.',
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          defaultValue: 'people',
          label: 'Pictogram',
          options: [
            { label: 'Mensen', value: 'people' },
            { label: 'Tijd', value: 'duration' },
            { label: 'Locatie', value: 'location' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Tekst',
        },
      ],
    },
    {
      name: 'funding',
      type: 'group',
      label: 'Inzamelingsdoel',
      admin: {
        description:
          'Laat het doelbedrag leeg om de voortgangsbalk te verbergen. De bedragen worden met de hand bijgehouden; zij komen niet automatisch uit de donaties.',
      },
      fields: [
        {
          name: 'goal',
          type: 'number',
          min: 0,
          label: 'Doelbedrag in euro',
        },
        {
          name: 'raised',
          type: 'number',
          min: 0,
          defaultValue: 0,
          label: 'Opgehaald in euro',
        },
      ],
    },
    {
      name: 'callToAction',
      type: 'group',
      localized: true,
      label: 'Oproep onderaan',
      admin: {
        description: 'De groene balk onderaan de pagina. Laat de kop leeg om hem te verbergen.',
      },
      fields: [
        { name: 'heading', type: 'text', label: 'Kop' },
        { name: 'label', type: 'text', label: 'Tekst op de knop' },
        { name: 'url', type: 'text', label: 'Adres' },
      ],
    },
    commissionField,
  ],
}

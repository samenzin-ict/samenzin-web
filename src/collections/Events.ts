import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isEditorOfCommission, isPublishedOrAuthenticated } from '@/access'
import { commissionField } from '@/fields/commissions'
import { formatSlug } from '@/fields/slug'

/**
 * Activities and events. ROADMAP 2.4, from
 * docs/design/05-agenda-overzicht-en-detail.png.
 *
 * Same three safeguards as the other content collections: drafts, a
 * published-only read rule, and read helpers that do not override access.
 *
 * City, theme and audience are free text rather than fixed lists. The filter
 * dropdowns are built from the values that actually exist, so they can never
 * offer a choice that returns nothing, and nobody had to invent a taxonomy for
 * a foundation whose programme is still taking shape. Turning them into
 * selects later is a small change; guessing the categories now and being wrong
 * is not.
 *
 * Registration is a link, not a feature. Taking sign-ups means holding
 * personal data, which needs a processing register entry first and is not part
 * of this item (ROADMAP 2.6 is the volunteer intake form). "Aanmelden" points
 * wherever the organiser wants.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Evenement',
    plural: 'Evenementen',
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
  defaultSort: 'startsAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'city', '_status'],
    group: 'Programma',
    description: 'Activiteiten en evenementen van de stichting.',
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''

      if (!slug) return null

      const params = new URLSearchParams({
        path: `/agenda/${slug}`,
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
      label: 'Adres van het evenement',
      admin: {
        position: 'sidebar',
        description:
          'Het deel van het webadres na /agenda/. Wordt automatisch ingevuld vanuit de titel.',
      },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      label: 'Begint op',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, HH:mm' },
        description: 'Bepaalt of het evenement onder Aankomend of Afgelopen valt.',
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      label: 'Eindigt op',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, HH:mm' },
        description: 'Optioneel. Zonder eindtijd wordt alleen het begin getoond.',
      },
    },
    {
      name: 'locationName',
      type: 'text',
      localized: true,
      label: 'Locatie',
      admin: { description: 'Bijvoorbeeld: De Hal.' },
    },
    {
      name: 'city',
      type: 'text',
      index: true,
      label: 'Stad',
      admin: { description: 'Wordt gebruikt om op te filteren. Houd de schrijfwijze gelijk.' },
    },
    {
      name: 'theme',
      type: 'text',
      index: true,
      localized: true,
      label: 'Thema',
      admin: { description: 'Wordt gebruikt om op te filteren. Houd de schrijfwijze gelijk.' },
    },
    {
      name: 'audience',
      type: 'text',
      index: true,
      localized: true,
      label: 'Doelgroep',
      admin: { description: 'Wordt gebruikt om op te filteren. Houd de schrijfwijze gelijk.' },
    },
    {
      name: 'price',
      type: 'group',
      label: 'Deelname',
      fields: [
        {
          name: 'isFree',
          type: 'checkbox',
          defaultValue: true,
          label: 'Gratis',
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          label: 'Bedrag in euro',
          admin: {
            condition: (_, siblingData) => !siblingData?.isFree,
          },
        },
      ],
    },
    {
      name: 'capacity',
      type: 'number',
      min: 0,
      label: 'Capaciteit',
      admin: { description: 'Aantal personen. Optioneel.' },
    },
    {
      name: 'spotsAvailable',
      type: 'number',
      min: 0,
      label: 'Nog beschikbare plaatsen',
      admin: {
        description:
          'Wordt met de hand bijgehouden; de website neemt geen aanmeldingen aan. Laat leeg om dit niet te tonen.',
      },
    },
    {
      name: 'registrationUrl',
      type: 'text',
      localized: true,
      label: 'Aanmeldlink',
      admin: {
        description:
          'Waar de knop Aanmelden naartoe gaat. Laat leeg om de knop te verbergen.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Korte omschrijving',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: 'Tekst',
    },
    commissionField,
  ],
}

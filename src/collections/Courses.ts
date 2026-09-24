import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isEditorOfCommission, isPublishedOrAuthenticated } from '@/access'
import { commissionField } from '@/fields/commissions'
import { formatSlug } from '@/fields/slug'

/**
 * The course catalogue. ROADMAP 3.4.
 *
 * The public half only: what is offered, and how to ask about it. Enrolment,
 * progress and certificates need a member identity, which is ROADMAP 3.2 and
 * still an open decision, so "Aanmelden" is a link exactly as it is for
 * events. ROADMAP always said the catalogue can ship before enrolment, and
 * this is what that means in practice.
 *
 * Same three safeguards as every other content collection: drafts, a
 * published-only read rule, and read helpers that do not override access.
 */
export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: 'Cursus',
    plural: 'Cursussen',
  },
  access: {
    read: isPublishedOrAuthenticated,
    create: isAdminOrEditor,
    update: isEditorOfCommission,
    delete: isEditorOfCommission,
  },
  versions: {
    drafts: { validate: false },
    maxPerDoc: 50,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'startsAt', '_status'],
    group: 'Programma',
    description: 'Het cursusaanbod van de stichting.',
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''

      if (!slug) return null

      const params = new URLSearchParams({
        path: `/cursussen/${slug}`,
        previewSecret: process.env.PREVIEW_SECRET || '',
      })

      return `/preview?${params.toString()}`
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titel' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true,
      label: 'Adres van de cursus',
      admin: {
        position: 'sidebar',
        description: 'Het deel van het webadres na /cursussen/.',
      },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'iedereen',
      index: true,
      label: 'Niveau',
      options: [
        { label: 'Voor iedereen', value: 'iedereen' },
        { label: 'Beginners', value: 'beginner' },
        { label: 'Gevorderden', value: 'gevorderd' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Startdatum',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: 'Optioneel. Laat leeg als de cursus doorlopend start.',
      },
    },
    {
      name: 'duration',
      type: 'text',
      localized: true,
      label: 'Duur',
      admin: { description: 'Bijvoorbeeld: 8 weken, wekelijks een avond.' },
    },
    {
      name: 'price',
      type: 'group',
      label: 'Deelname',
      fields: [
        { name: 'isFree', type: 'checkbox', defaultValue: true, label: 'Gratis' },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          label: 'Bedrag in euro',
          admin: { condition: (_, siblingData) => !siblingData?.isFree },
        },
      ],
    },
    {
      name: 'registrationUrl',
      type: 'text',
      localized: true,
      label: 'Aanmeldlink',
      admin: {
        description:
          'Waar de knop Aanmelden naartoe gaat. De website neemt zelf nog geen inschrijvingen aan.',
      },
    },
    { name: 'excerpt', type: 'textarea', localized: true, label: 'Korte omschrijving' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Afbeelding' },
    { name: 'body', type: 'richText', localized: true, label: 'Tekst' },
    commissionField,
  ],
}

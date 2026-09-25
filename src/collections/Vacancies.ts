import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isPublishedOrAuthenticated } from '@/access'
import { commissionField } from '@/fields/commissions'

/**
 * Open positions, paid or voluntary. The "Vacatures" entry in the admin
 * sidebar of docs/design/09-admin-panel-dashboard.png.
 *
 * Content, not personal data: a vacancy describes a role, never a person.
 * Editable by editors the same way pages and projects are, and scoped to the
 * commission that owns it.
 *
 * Drafts are on, with the published-only read rule, so an unfinished vacancy
 * is not readable from the public API. There is no public route for these yet;
 * when one is added it must use `overrideAccess: false`, like every other read
 * helper here.
 */
export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  labels: { singular: 'Vacature', plural: 'Vacatures' },
  versions: { drafts: true },
  access: {
    create: isAdminOrEditor,
    read: isPublishedOrAuthenticated,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'commission', 'hoursPerWeek', 'closesAt', '_status'],
    group: 'Mensen',
    description: 'Openstaande vacatures en vrijwilligersplekken.',
  },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titel' },
    commissionField,
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'vrijwillig',
      label: 'Soort',
      options: [
        { label: 'Vrijwilligerswerk', value: 'vrijwillig' },
        { label: 'Betaalde functie', value: 'betaald' },
        { label: 'Stage', value: 'stage' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'hoursPerWeek',
      type: 'text',
      label: 'Uren per week',
      admin: { position: 'sidebar', description: 'Bijvoorbeeld: 4 tot 6 uur.' },
    },
    {
      name: 'closesAt',
      type: 'date',
      label: 'Sluit op',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
      },
    },
    { name: 'excerpt', type: 'textarea', localized: true, label: 'Korte omschrijving' },
    { name: 'body', type: 'richText', localized: true, label: 'Tekst' },
  ],
}

import type { CollectionConfig } from 'payload'

import { isVolunteerCoordinator } from '@/access'

/** How long an application is kept before it should be deleted. */
export const RETENTION_MONTHS = 6

/**
 * People offering to volunteer. ROADMAP 2.6.
 *
 * This holds personal data, so it is built the same way as contact messages
 * and for the same reasons:
 *
 * - Four fields and nothing more. No telephone number, no date of birth, no
 *   VOG status. The coordinator gathers what they need in a conversation; what
 *   is not collected cannot leak and does not have to be produced on a subject
 *   access request.
 * - Never publicly readable. Administrators and the vrijwilligers commission
 *   only, so a coordinator can work without an administrator account and no
 *   other editor can read applicants' details.
 * - Closed to the API. The public form writes through a server action that
 *   validates first and then overrides access.
 *
 * Retention is six months, agreed with the maintainer. `deleteAfter` is filled
 * in when the application arrives and is shown in the list, so an overdue
 * record is visible rather than theoretical. Deleting is not automatic; run
 * `pnpm prune:applications`, or point a scheduled job at it.
 *
 * This needs an entry in the processing register in samenzin-ict before it
 * goes live.
 */
export const VolunteerApplications: CollectionConfig = {
  slug: 'volunteer-applications',
  labels: {
    singular: 'Aanmelding',
    plural: 'Vrijwilligersaanmeldingen',
  },
  access: {
    // The public form does not use this path.
    create: isVolunteerCoordinator,
    read: isVolunteerCoordinator,
    update: isVolunteerCoordinator,
    delete: isVolunteerCoordinator,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'handled', 'createdAt', 'deleteAfter'],
    group: 'Mensen',
    description:
      'Aanmeldingen van mensen die vrijwilliger willen worden. Deze bevatten persoonsgegevens: verwijder ze zodra ze zijn afgehandeld, en in elk geval voor de datum in de kolom "Opruimen na".',
  },
  defaultSort: '-createdAt',
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== 'create') return data

        // Worked out once, on arrival, so the date stays true even if the
        // retention period is changed later for new applications.
        const deleteAfter = new Date()
        deleteAfter.setMonth(deleteAfter.getMonth() + RETENTION_MONTHS)

        return { ...data, deleteAfter: deleteAfter.toISOString() }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Naam',
      maxLength: 200,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'E-mailadres',
    },
    {
      name: 'interest',
      type: 'relationship',
      relationTo: 'projects',
      label: 'Waar wil deze persoon bij helpen?',
      admin: {
        description: 'Leeg betekent: geen voorkeur opgegeven.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Bericht',
      maxLength: 5000,
    },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Afgehandeld',
      admin: {
        position: 'sidebar',
        description: 'Vink aan zodra er contact is geweest.',
      },
    },
    {
      name: 'deleteAfter',
      type: 'date',
      label: 'Opruimen na',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: `Automatisch ingevuld: ${RETENTION_MONTHS} maanden na binnenkomst.`,
      },
    },
  ],
}

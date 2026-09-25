import type { CollectionConfig } from 'payload'

import { isVolunteerCoordinator } from '@/access'
import {
  AVAILABILITY_OPTIONS,
  CITY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  SKILL_OPTIONS,
} from '@/fields/volunteering'

/** How long an application is kept before it should be deleted. */
export const RETENTION_MONTHS = 6

/**
 * People offering to volunteer. ROADMAP 2.6.
 *
 * This holds personal data, so it is built the same way as contact messages
 * and for the same reasons:
 *
 * - Only what the intake form asks for. That used to be four fields; the
 *   maintainer then specified the form in
 *   docs/design/07-vrijwilliger-aanmeldformulier.png, which asks for a
 *   telephone number, interests, skills, Dutch level, city and availability,
 *   so those are here now. Still no date of birth and no VOG status: the
 *   coordinator gathers those in the intake conversation the form promises,
 *   and what is not collected cannot leak.
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
    defaultColumns: ['name', 'email', 'city', 'interests', 'vogStatus', 'handled'],
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
      name: 'phone',
      type: 'text',
      label: 'Telefoonnummer',
      maxLength: 40,
    },
    {
      name: 'city',
      type: 'select',
      options: [...CITY_OPTIONS],
      index: true,
      label: 'Locatie',
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: [...INTEREST_OPTIONS],
      index: true,
      label: 'Interesses',
    },
    {
      name: 'skills',
      type: 'select',
      hasMany: true,
      options: [...SKILL_OPTIONS],
      label: 'Vaardigheden',
    },
    {
      name: 'languageLevel',
      type: 'select',
      options: [...LANGUAGE_LEVEL_OPTIONS],
      label: 'Taalniveau Nederlands',
    },
    {
      name: 'availability',
      type: 'select',
      hasMany: true,
      options: [...AVAILABILITY_OPTIONS],
      label: 'Beschikbaarheid',
      admin: {
        description: 'Dagdelen die deze persoon heeft aangekruist.',
      },
    },
    {
      name: 'interest',
      type: 'relationship',
      relationTo: 'projects',
      label: 'Voorkeursproject',
      admin: {
        description:
          'Uit de oude versie van het formulier. Het huidige formulier vraagt naar interesses in plaats van een project.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Bericht',
      maxLength: 5000,
    },
    {
      /*
       * Verklaring Omtrent het Gedrag. The dashboard in docs/design/09 shows
       * it per applicant, so it is tracked here. The certificate itself is
       * never uploaded: it is shown to a coordinator and the outcome recorded,
       * which is all the foundation needs to keep.
       */
      name: 'vogStatus',
      type: 'select',
      defaultValue: 'niet-gestart',
      index: true,
      label: 'VOG',
      options: [
        { label: 'Niet gestart', value: 'niet-gestart' },
        { label: 'Loopt', value: 'loopt' },
        { label: 'OK', value: 'ok' },
        { label: 'Niet nodig', value: 'niet-nodig' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Alleen de uitkomst. Upload de verklaring zelf niet.',
      },
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

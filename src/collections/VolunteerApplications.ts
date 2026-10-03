import type { CollectionConfig } from 'payload'

import { isVolunteerCoordinator } from '@/access'
import { getEmailMessages } from '@/i18n'
import { sendMail } from '@/lib/email'
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
 * `status` is the outcome and `handled` is the administration of it, which is
 * a distinction worth keeping straight. The coordinator sets the status; that
 * writes to the applicant, and it ticks `handled` by itself, because deciding
 * is the thing that makes an application dealt with. `handled` can still be
 * ticked on its own for an application that needs no decision mail, which is
 * what the dashboard counts.
 *
 * Retention is six months, agreed with the maintainer. `deleteAfter` is filled
 * in when the application arrives and is shown in the list, so an overdue
 * record is visible rather than theoretical. Deleting is not automatic; run
 * `pnpm prune:expired`, and a daily Vercel cron job calls the same code.
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
    defaultColumns: ['name', 'email', 'city', 'status', 'vogStatus', 'handled'],
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
      /*
       * A decision is what makes an application dealt with, so recording one
       * ticks "afgehandeld" without the coordinator having to remember. Never
       * unticks it: an application that was handled and then reopened is still
       * one somebody has worked on.
       */
      ({ data }) => {
        if (data?.status === 'goedgekeurd' || data?.status === 'afgewezen') {
          return { ...data, handled: true }
        }

        return data
      },
    ],
    afterChange: [
      /**
       * Tells the applicant what was decided.
       *
       * Only on the two statuses that are a decision. "In gesprek" is an
       * internal note about where the coordinator has got to, and sending mail
       * for it would be noise.
       *
       * Fires on a change of status and not on every save, so correcting a
       * typo in somebody's telephone number does not tell them again that they
       * were turned down.
       */
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return
        if (doc.status === previousDoc?.status) return
        if (doc.status !== 'goedgekeurd' && doc.status !== 'afgewezen') return

        const email = getEmailMessages()

        await sendMail(req.payload, {
          to: doc.email,
          template:
            doc.status === 'goedgekeurd'
              ? email.volunteerApproved({ name: doc.name })
              : email.volunteerRejected({ name: doc.name }),
        })
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'aangemeld',
      index: true,
      label: 'Status',
      options: [
        { label: 'Aangemeld', value: 'aangemeld' },
        { label: 'In gesprek', value: 'in-gesprek' },
        { label: 'Goedgekeurd', value: 'goedgekeurd' },
        { label: 'Afgewezen', value: 'afgewezen' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Let op: bij Goedgekeurd en Afgewezen krijgt de aanmelder automatisch bericht. Aangemeld en In gesprek sturen niets.',
      },
    },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Afgehandeld',
      admin: {
        position: 'sidebar',
        description:
          'Wordt zelf aangevinkt zodra u de status op Goedgekeurd of Afgewezen zet. Vink het met de hand aan voor een aanmelding die u zonder bericht afdoet.',
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

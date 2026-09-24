import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '@/access'

/** How long an application that did not become a membership is kept. */
export const RETENTION_MONTHS = 6

/**
 * People applying to become a member. ROADMAP 3.1.
 *
 * Administrators only. Approving a member is a board decision, and there is no
 * commission whose job it is; if that changes, this gets its own rule the way
 * volunteer applications did.
 *
 * Three fields. Address, date of birth and bank details are deliberately not
 * asked for here: they are needed to administer a membership, not to decide
 * whether to grant one, and collecting them from everyone who applies means
 * holding them for people who are turned down.
 *
 * Approval is explicit and never automatic. `status` can only be changed by an
 * administrator, and the applicant is not told anything by this system: the
 * board writes to them. Turning an approved application into a member record
 * is ROADMAP 3.2, which does not exist yet.
 *
 * Retention: an application that is still pending or was declined is deleted
 * after six months, the same as a volunteer application. An approved one is
 * kept, because it is the evidence that a membership was granted; it gets no
 * `deleteAfter`, and `pnpm prune:applications` leaves it alone.
 *
 * Needs an entry in the processing register in samenzin-ict before it goes
 * live.
 */
export const MembershipApplications: CollectionConfig = {
  slug: 'membership-applications',
  labels: {
    singular: 'Aanvraag lidmaatschap',
    plural: 'Aanvragen lidmaatschap',
  },
  access: {
    // The public form does not use this path; it writes through a server action.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'createdAt', 'deleteAfter'],
    group: 'Mensen',
    description:
      'Aanvragen om lid te worden. Bevatten persoonsgegevens. Een afgewezen of nog openstaande aanvraag wordt na zes maanden opgeruimd; een goedgekeurde blijft bewaard.',
  },
  defaultSort: '-createdAt',
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        const status = data?.status ?? originalDoc?.status ?? 'aangevraagd'

        /*
         * An approved application is the record that a membership was granted,
         * so it loses its delete-by date. Clearing it on approval rather than
         * only setting it on creation means an application approved in month
         * five does not quietly disappear in month six.
         */
        if (status === 'goedgekeurd') {
          return { ...data, deleteAfter: null }
        }

        if (operation === 'create' || !originalDoc?.deleteAfter) {
          const deleteAfter = new Date()
          deleteAfter.setMonth(deleteAfter.getMonth() + RETENTION_MONTHS)
          return { ...data, deleteAfter: deleteAfter.toISOString() }
        }

        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Naam', maxLength: 200 },
    { name: 'email', type: 'email', required: true, label: 'E-mailadres' },
    {
      name: 'motivation',
      type: 'textarea',
      label: 'Motivatie',
      maxLength: 5000,
      admin: { description: 'Wat de aanvrager zelf heeft geschreven.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'aangevraagd',
      index: true,
      label: 'Status',
      options: [
        { label: 'Aangevraagd', value: 'aangevraagd' },
        { label: 'Goedgekeurd', value: 'goedgekeurd' },
        { label: 'Afgewezen', value: 'afgewezen' },
      ],
      access: {
        // A decision only the board makes.
        update: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description:
          'De aanvrager krijgt hiervan geen automatisch bericht. Neem zelf contact op.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Interne aantekeningen',
      admin: {
        position: 'sidebar',
        description: 'Niet zichtbaar voor de aanvrager. Houd het zakelijk en ter zake.',
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
        description: `Automatisch ingevuld: ${RETENTION_MONTHS} maanden. Vervalt zodra de aanvraag is goedgekeurd.`,
      },
    },
  ],
}

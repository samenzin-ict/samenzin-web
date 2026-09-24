import { randomBytes } from 'crypto'

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
 * board writes to them. Approving does create the member record (ROADMAP 3.2),
 * so nobody has to retype a name and an e-mail address that are already here.
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
    afterChange: [
      /**
       * Approving an application creates the member. ROADMAP 3.1 into 3.2.
       *
       * Idempotent on the e-mail address, because "goedgekeurd" can be saved
       * more than once and a second save must not create a second member or
       * overwrite the first one's password.
       *
       * The password is random and is never shown to anyone. There is no email
       * adapter yet, so there is no invitation to send and no reset link to
       * follow; an administrator opens the new member and sets a password they
       * pass on themselves. The alternative, leaving the account without a
       * password, would be an account anybody could claim.
       */
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return
        if (doc.status !== 'goedgekeurd' || previousDoc?.status === 'goedgekeurd') return

        const existing = await req.payload.find({
          collection: 'members',
          where: { email: { equals: doc.email } },
          limit: 1,
          overrideAccess: true,
          req,
        })

        if (existing.totalDocs > 0) return

        try {
          await req.payload.create({
            collection: 'members',
            overrideAccess: true,
            req,
            data: {
              name: doc.name,
              email: doc.email,
              status: 'actief',
              memberSince: new Date().toISOString(),
              // 32 bytes of entropy nobody holds. See the note above.
              password: randomBytes(32).toString('hex'),
            },
          })
        } catch (error) {
          // Never let this fail the approval itself: the board's decision is
          // recorded either way, and an administrator can add the member by
          // hand. Swallowing it silently would be worse than a log line.
          req.payload.logger.error(
            { err: error },
            'Approved membership application but could not create the member',
          )
        }
      },
    ],
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

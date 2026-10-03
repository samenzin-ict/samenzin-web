import { randomBytes } from 'crypto'

import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '@/access'
import { getEmailMessages } from '@/i18n'
import { sendMail } from '@/lib/email'
import { memberResetUrl } from '@/lib/email/auth'

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
 * administrator. Changing it does now write to the applicant: approving sends
 * a welcome message with a link to set a password, declining sends a short
 * note. Approving also creates the member record (ROADMAP 3.2), so nobody has
 * to retype a name and an e-mail address that are already here.
 *
 * Retention: an application that is still pending or was declined is deleted
 * after six months, the same as a volunteer application. An approved one is
 * kept, because it is the evidence that a membership was granted; it gets no
 * `deleteAfter`, and `pnpm prune:expired` leaves it alone.
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
       * Acting on the board's decision. ROADMAP 3.1 into 3.2.
       *
       * Approving creates the member and tells them so, with a link to set
       * their own password. Declining sends a short message saying so. Either
       * way the applicant now hears something, which until this existed they
       * never did: the status changed in the admin panel and nothing left the
       * building.
       *
       * Creating the member is idempotent on the e-mail address, because
       * "goedgekeurd" can be saved more than once and a second save must not
       * create a second member or reset the first one's password.
       */
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return
        if (doc.status === previousDoc?.status) return

        const email = getEmailMessages()

        if (doc.status === 'afgewezen') {
          await sendMail(req.payload, {
            to: doc.email,
            template: email.membershipRejected({ name: doc.name }),
          })

          return
        }

        if (doc.status !== 'goedgekeurd') return

        const existing = await req.payload.find({
          collection: 'members',
          where: { email: { equals: doc.email } },
          limit: 1,
          overrideAccess: true,
          req,
        })

        if (existing.totalDocs === 0) {
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
                /*
                 * 32 bytes of entropy nobody holds, not even an
                 * administrator. The member sets their own password through
                 * the link below. The account is never passwordless, which
                 * would be an account anybody could claim.
                 */
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

            // No account, so no link to send. Say the decision and nothing
            // about logging in.
            await sendMail(req.payload, {
              to: doc.email,
              template: email.membershipApproved({ name: doc.name }),
            })

            return
          }
        }

        /*
         * The welcome message carries a password-reset token, which is how the
         * member gets in the first time. Payload's own reset mail is
         * suppressed: this one says more, and the member has not asked to
         * reset anything.
         *
         * 24 hours rather than the usual hour. This link is the member's only
         * way in and arrives unannounced, so it has to survive a weekend.
         * Passed per call because a value on the collection would also stretch
         * the ordinary "wachtwoord vergeten" link to 24 hours.
         */
        try {
          const token = await req.payload.forgotPassword({
            collection: 'members',
            data: { email: doc.email },
            disableEmail: true,
            expiration: 24 * 60 * 60 * 1000,
            req,
          })

          await sendMail(req.payload, {
            to: doc.email,
            template: email.memberWelcome({ name: doc.name, url: memberResetUrl(token) }),
          })
        } catch (error) {
          /*
           * The member exists and the approval stands; only the invitation
           * failed. An administrator can send a new link from the login page's
           * "wachtwoord vergeten", so this is recoverable without touching
           * the database.
           */
          req.payload.logger.error(
            { err: error },
            `Created or found the member for ${doc.email} but could not send the welcome message`,
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
          'Let op: de aanvrager krijgt hiervan automatisch bericht. Bij Goedgekeurd ontvangt hij een welkomstmail met een link om zelf een wachtwoord in te stellen; bij Afgewezen een kort bericht.',
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

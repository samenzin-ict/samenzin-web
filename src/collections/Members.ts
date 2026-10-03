import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrSelfMember } from '@/access'
import { COMMISSION_OPTIONS } from '@/fields/commissions'
import { memberResetUrl, resetPasswordEmail } from '@/lib/email/auth'

/** How long a member stays signed in before having to log in again. */
export const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7

/**
 * How long an ended membership is kept.
 *
 * Two years, which is what the published privacyverklaring promises: "zolang
 * uw account bestaat en daarna 2 jaar". Change this and the statement has to
 * change with it.
 */
export const RETENTION_MONTHS_AFTER_END = 24

/**
 * Members of the foundation, with their own login. ROADMAP 3.2.
 *
 * This is a separate collection and not a `member` role on `Users`, which is
 * the decision recorded in ROADMAP.md. `admin.user` in payload.config.ts names
 * `users` as the one collection that may open the admin panel, and Payload
 * refuses everyone else, so a member has no route into the admin panel at all.
 * No mistake in an access rule can turn a member into an editor, because the
 * admin panel never even considers them.
 *
 * The flip side is that `req.user` is now one of two things. Every access rule
 * had to be taught the difference; see src/access/isAdminPanelUser.ts for the
 * two ways that would otherwise have gone wrong.
 *
 * Members are created by approving a membership application, or by hand by an
 * administrator. There is no public sign-up: membership is granted, not
 * claimed.
 *
 * A member sets their own password and always has. Approving an application
 * sends them a link to do it with, and the login page offers "wachtwoord
 * vergeten", both of which land on /mijn/wachtwoord-instellen. An
 * administrator never sees or sets a member's password; the random one the
 * account is created with exists only so the account cannot be claimed by
 * somebody who guesses the address.
 */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Lid',
    plural: 'Leden',
  },
  auth: {
    tokenExpiration: TOKEN_EXPIRATION_SECONDS,
    /*
     * Payload locks the account after this many failures. It is the defence
     * against someone working through a password list, and it is per account
     * rather than per address, so it complements the rate limiter on the login
     * form rather than duplicating it.
     */
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    /*
     * No address verification. A member does not sign themselves up: the board
     * approves an application and the account is created from the address the
     * applicant gave. Setting a password already proves they can read mail at
     * that address, so a separate verification step would ask the same
     * question twice.
     */
    verify: false,
    /*
     * The Dutch reset mail, instead of Payload's English default. Expiry is
     * deliberately left at Payload's one hour: a per-collection value would
     * also override the 24 hours that the welcome message asks for, because
     * the collection setting wins over the per-call one.
     */
    forgotPassword: resetPasswordEmail(memberResetUrl),
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelfMember,
    update: isAdminOrSelfMember,
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [
      /**
       * Deleting a member takes everything that belongs to them with it.
       *
       * Not a nicety. Every one of these tables has `member_id integer NOT
       * NULL` with an ON DELETE SET NULL constraint, which is a combination
       * Postgres cannot satisfy: it refuses the delete and the admin panel
       * shows a raw "Failed query: delete from members..." with nothing an
       * administrator could act on. Verified on a fresh database with one row
       * in each of the four.
       *
       * This used to cover registered hours only, so the panel broke the
       * moment a member had a task, an enrolment or a registration — which is
       * to say on the first erasure request for anybody who used the portal.
       *
       * Removing the rows is also the honest reading of what deleting a member
       * means. Ending a membership is `status: beeindigd`; deleting the record
       * is for an erasure request, and hours, tasks and attendance tied to a
       * named person are that person's data too.
       *
       * The cost is that the board loses those hours from its totals. If that
       * turns out to matter more than simplicity, the alternative is to keep
       * the rows and blank the member, which preserves the aggregate without
       * naming anyone — and would need the NOT NULL dropped first. Recorded in
       * PROGRESS.md.
       */
      async ({ id, req }) => {
        /*
         * Order matters only in that it does not: none of these reference each
         * other. They are listed with the most valuable last so a failure
         * part-way through loses the least.
         */
        const owned = [
          'event-registrations',
          'course-enrolments',
          'member-tasks',
          'volunteer-hours',
        ] as const

        for (const collection of owned) {
          const { docs } = await req.payload.find({
            collection,
            where: { member: { equals: id } },
            limit: 1000,
            depth: 0,
            overrideAccess: true,
            req,
          })

          for (const row of docs) {
            await req.payload.delete({ collection, id: row.id, overrideAccess: true, req })
          }

          if (docs.length > 0) {
            req.payload.logger.info(
              `Deleted ${docs.length} ${collection} row(s) belonging to member ${id}`,
            )
          }
        }
      },
    ],
    beforeChange: [
      /**
       * The clock on an ended membership.
       *
       * The privacyverklaring promises a member's data is kept "zolang uw
       * account bestaat en daarna 2 jaar". Nothing acted on that: the status
       * went to "beeindigd" and the record stayed for ever.
       *
       * "The account ends" is read as the status becoming beeindigd, which is
       * the only signal the model has and the only one an administrator
       * controls. Two years from that moment, `pnpm prune:expired` and the
       * daily cron job delete the member, which takes their hours, tasks,
       * enrolments and registrations with them.
       *
       * Reinstating a member clears the date, so somebody who comes back is
       * not quietly removed on the old schedule.
       */
      ({ data, originalDoc }) => {
        const status = data?.status ?? originalDoc?.status

        if (status === 'beeindigd') {
          // Only on the transition, so an administrator editing a telephone
          // number on an ended member does not push the date two years out.
          if (originalDoc?.status === 'beeindigd' && originalDoc?.deleteAfter) return data

          const deleteAfter = new Date()
          deleteAfter.setMonth(deleteAfter.getMonth() + RETENTION_MONTHS_AFTER_END)

          return { ...data, deleteAfter: deleteAfter.toISOString() }
        }

        // Active again, or still active: no clock.
        return { ...data, deleteAfter: null }
      },
    ],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'memberSince'],
    group: 'Mensen',
    description:
      'Leden met een eigen inlog voor Mijn omgeving. Leden kunnen niet in dit beheerpaneel. Een lid stelt zijn eigen wachtwoord in via de link die het bij goedkeuring krijgt, of via "Wachtwoord vergeten" op de inlogpagina. Let op: een lid verwijderen wist ook de uren die dit lid heeft ingevoerd. Wilt u het lidmaatschap alleen beëindigen, zet de status dan op Beëindigd.',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Naam', maxLength: 200 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'actief',
      index: true,
      label: 'Status',
      options: [
        { label: 'Actief', value: 'actief' },
        { label: 'Beëindigd', value: 'beeindigd' },
      ],
      access: {
        // A member must not be able to reinstate themselves.
        update: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description: 'Een beëindigd lid kan niet meer inloggen.',
      },
    },
    {
      /*
       * The line under the greeting in docs/design/08 reads
       * "Vrijwilliger - commissie Evenementen - Rotterdam". These two fields
       * and the city supply it.
       */
      name: 'memberRole',
      type: 'select',
      defaultValue: 'vrijwilliger',
      label: 'Rol',
      options: [
        { label: 'Vrijwilliger', value: 'vrijwilliger' },
        { label: 'Lid', value: 'lid' },
        { label: 'Bestuurslid', value: 'bestuur' },
      ],
      access: { update: isAdminFieldLevel },
      admin: { position: 'sidebar' },
    },
    {
      name: 'commission',
      type: 'select',
      options: [...COMMISSION_OPTIONS],
      label: 'Commissie',
      access: { update: isAdminFieldLevel },
      admin: { position: 'sidebar' },
    },
    {
      name: 'memberSince',
      type: 'date',
      label: 'Lid sinds',
      access: { update: isAdminFieldLevel },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
      },
    },
    {
      type: 'collapsible',
      label: 'Contactgegevens',
      admin: {
        description: 'Het lid onderhoudt deze gegevens zelf in Mijn omgeving.',
      },
      fields: [
        { name: 'phone', type: 'text', label: 'Telefoonnummer', maxLength: 40 },
        { name: 'street', type: 'text', label: 'Straat en huisnummer', maxLength: 200 },
        { name: 'postalCode', type: 'text', label: 'Postcode', maxLength: 20 },
        { name: 'city', type: 'text', label: 'Plaats', maxLength: 100 },
      ],
    },
    {
      name: 'deleteAfter',
      type: 'date',
      label: 'Opruimen na',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: `Wordt gevuld zodra u de status op Beëindigd zet: ${RETENTION_MONTHS_AFTER_END / 12} jaar daarna wordt het lid verwijderd, met de uren, taken, inschrijvingen en aanmeldingen. Zet u de status terug op Actief, dan vervalt de datum.`,
      },
    },
  ],
}

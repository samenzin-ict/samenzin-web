import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrSelfMember } from '@/access'
import { COMMISSION_OPTIONS } from '@/fields/commissions'

/** How long a member stays signed in before having to log in again. */
export const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7

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
 * Until an email adapter exists there is no "forgotten password" and no way to
 * invite somebody. An administrator sets the password here and passes it on
 * themselves. That is recorded as a launch blocker in PROGRESS.md.
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
    // Email verification needs an email adapter. There is none yet.
    verify: false,
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
       * Deleting a member takes their registered hours with them.
       *
       * Not a nicety. `volunteer_hours.member_id` is NOT NULL with an
       * ON DELETE SET NULL constraint, so without this Postgres refuses the
       * delete and the admin panel shows a raw "Failed query" with nothing an
       * administrator could act on.
       *
       * Removing the hours is also the honest reading of what deleting a
       * member means. Ending a membership is `status: beeindigd`; deleting the
       * record is for an erasure request, and hours tied to a named person are
       * that person's data too.
       *
       * The cost is that the board loses those hours from its totals. If that
       * turns out to matter more than simplicity, the alternative is to keep
       * the rows and blank the member, which preserves the aggregate without
       * naming anyone. Recorded in PROGRESS.md.
       */
      async ({ id, req }) => {
        const { docs } = await req.payload.find({
          collection: 'volunteer-hours',
          where: { member: { equals: id } },
          limit: 1000,
          depth: 0,
          overrideAccess: true,
          req,
        })

        for (const entry of docs) {
          await req.payload.delete({
            collection: 'volunteer-hours',
            id: entry.id,
            overrideAccess: true,
            req,
          })
        }

        if (docs.length > 0) {
          req.payload.logger.info(
            `Deleted ${docs.length} hour entr${docs.length === 1 ? 'y' : 'ies'} belonging to member ${id}`,
          )
        }
      },
    ],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'memberSince'],
    group: 'Mensen',
    description:
      'Leden met een eigen inlog voor Mijn omgeving. Leden kunnen niet in dit beheerpaneel. Zolang er geen e-mail is ingesteld, stelt een beheerder hier het wachtwoord in en geeft dat zelf door. Let op: een lid verwijderen wist ook de uren die dit lid heeft ingevoerd. Wilt u het lidmaatschap alleen beëindigen, zet de status dan op Beëindigd.',
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
  ],
}

import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isMemberUser, isOwnHoursOrCoordinator } from '@/access'
import { COMMISSION_OPTIONS } from '@/fields/commissions'

/** Nobody volunteers more than this in one day; a larger number is a typo. */
export const MAX_HOURS_PER_ENTRY = 24

/** A quarter of an hour is the smallest unit worth recording. */
export const MIN_HOURS_PER_ENTRY = 0.25

/**
 * Hours a volunteer registers for themselves. ROADMAP 3.5.
 *
 * Written by members through Mijn omgeving, never by the public. The `member`
 * field is set from the session and forced on every write, so a member cannot
 * file hours under somebody else's name even by posting a crafted form.
 *
 * There is no approval step. The board asked for a register, not a timesheet
 * to sign off, and a queue of unapproved hours that nobody empties is worse
 * than no queue. If hours ever do need signing off, that is a status field and
 * a rule here, not a change to how they are entered.
 *
 * A member may correct and delete their own entries. A register that cannot be
 * corrected gets worked around on paper, and these figures are not an
 * accounting record: phase 4 reports on them, nothing is paid from them.
 *
 * Note the scope. Only members have a login, so only members can register
 * hours. A volunteer who never became a member has nowhere to enter them; that
 * is a gap in the model, recorded in PROGRESS.md rather than papered over here.
 *
 * Holds personal data and needs a processing register entry in samenzin-ict
 * before it goes live.
 */
export const VolunteerHours: CollectionConfig = {
  slug: 'volunteer-hours',
  labels: {
    singular: 'Urenregistratie',
    plural: 'Urenregistratie',
  },
  access: {
    // The portal writes through a server action; the admin panel through an
    // administrator. A member never creates one over the API directly.
    create: isAdmin,
    read: isOwnHoursOrCoordinator,
    update: isOwnHoursOrCoordinator,
    delete: isOwnHoursOrCoordinator,
  },
  admin: {
    useAsTitle: 'activity',
    defaultColumns: ['date', 'member', 'hours', 'commission', 'activity'],
    group: 'Mensen',
    description:
      'Uren die vrijwilligers zelf hebben ingevoerd in Mijn omgeving. Bevat persoonsgegevens.',
  },
  defaultSort: '-date',
  timestamps: true,
  hooks: {
    beforeValidate: [
      /**
       * The owner is whoever is signed in, always.
       *
       * Forced on update as well as on create: without that, a member could
       * move one of their own entries onto another member's name. An
       * administrator working in the admin panel is not a member, so their
       * edits are left alone.
       */
      ({ data, req }) => {
        if (!isMemberUser(req.user)) return data

        return { ...data, member: req.user.id }
      },
    ],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
      label: 'Lid',
      access: {
        // Set from the session by the hook above; never chosen in a form.
        update: isAdminFieldLevel,
      },
      admin: { readOnly: true },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      label: 'Datum',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
      },
    },
    {
      name: 'hours',
      type: 'number',
      required: true,
      min: MIN_HOURS_PER_ENTRY,
      max: MAX_HOURS_PER_ENTRY,
      label: 'Aantal uren',
      admin: { step: 0.25 },
    },
    {
      name: 'activity',
      type: 'text',
      required: true,
      maxLength: 200,
      label: 'Wat heeft u gedaan?',
    },
    {
      name: 'commission',
      type: 'select',
      options: [...COMMISSION_OPTIONS],
      index: true,
      label: 'Voor welke commissie?',
      admin: {
        description: 'Laat leeg als het niet voor een specifieke commissie was.',
      },
    },
  ],
}

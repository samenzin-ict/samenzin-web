import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isMemberUser, isOwnRecordOrCoordinator } from '@/access'
import { COMMISSION_OPTIONS } from '@/fields/commissions'
import { formatLongDate } from '@/lib/dates'
import { getEmailMessages } from '@/i18n'
import { sendMail } from '@/lib/email'
import { getSiteUrl } from '@/lib/site-url'

/**
 * Tasks assigned to a member, the "Mijn taken" list of
 * docs/design/08-ledenportaal-mijn-taken.png.
 *
 * Tasks are handed out, not invented by the person doing them: an
 * administrator or the vrijwilligers commission creates them, and the member
 * ticks them off. That is why `create` is closed to members while `update` is
 * not, and why the member field is forced from the session on a member's own
 * writes exactly as it is for registered hours.
 *
 * A member can only change whether a task is done. Its title, description,
 * owner and deadline are administrator-only at field level, so ticking a box
 * cannot become rewriting the assignment.
 *
 * Holds personal data: it says who is doing what and by when. Needs a
 * processing register entry alongside the rest of the member portal.
 */
export const MemberTasks: CollectionConfig = {
  slug: 'member-tasks',
  labels: { singular: 'Taak', plural: 'Taken' },
  access: {
    create: isAdmin,
    read: isOwnRecordOrCoordinator,
    update: isOwnRecordOrCoordinator,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'member', 'dueAt', 'done'],
    group: 'Mensen',
    description:
      'Taken die vrijwilligers in Mijn omgeving zien en kunnen afvinken. Het lid krijgt bericht zodra u een taak aan hem toewijst.',
  },
  defaultSort: 'dueAt',
  timestamps: true,
  hooks: {
    beforeValidate: [
      // Same rule as registered hours: a member's write is always about
      // themselves, whatever the form said.
      ({ data, req }) => (isMemberUser(req.user) ? { ...data, member: req.user.id } : data),
    ],
    afterChange: [
      /**
       * Tells a member that a task is waiting for them.
       *
       * Sent when the task is created, and again if it is later handed to
       * somebody else, because the new owner has not heard about it either.
       * Not sent when the title, the deadline or anything else changes: a
       * coordinator tidying up wording should not post to everybody.
       *
       * Never sent for a task a member created, which is only possible for an
       * administrator who is also a member in their own right; nobody needs
       * mail about something they just typed in.
       */
      async ({ doc, previousDoc, operation, req }) => {
        const assignedTo = typeof doc.member === 'object' ? doc.member?.id : doc.member
        const previous =
          typeof previousDoc?.member === 'object' ? previousDoc?.member?.id : previousDoc?.member

        if (operation === 'update' && assignedTo === previous) return
        if (!assignedTo) return
        if (isMemberUser(req.user) && req.user.id === assignedTo) return

        /*
         * The relationship may arrive as an id or as the whole document,
         * depending on the depth the caller asked for, so the member is read
         * back rather than assumed. One query on an event that happens a
         * handful of times a week.
         */
        const member = await req.payload
          .findByID({
            collection: 'members',
            id: assignedTo,
            depth: 0,
            overrideAccess: true,
            req,
          })
          .catch(() => null)

        // An ended member keeps their tasks in the panel but is not written
        // to; they can no longer sign in to act on one.
        if (!member?.email || member.status !== 'actief') return

        await sendMail(req.payload, {
          to: member.email,
          template: getEmailMessages().taskAssigned({
            name: member.name,
            title: doc.title,
            description: doc.description,
            dueDate: formatLongDate(doc.dueAt),
            url: `${getSiteUrl()}/mijn`,
          }),
        })
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
      label: 'Toegewezen aan',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      label: 'Taak',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1000,
      label: 'Toelichting',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'commission',
      type: 'select',
      options: [...COMMISSION_OPTIONS],
      label: 'Commissie',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'dueAt',
      type: 'date',
      index: true,
      label: 'Deadline',
      access: { update: isAdminFieldLevel },
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
    },
    {
      // The one thing a member may change.
      name: 'done',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Afgerond',
    },
  ],
}

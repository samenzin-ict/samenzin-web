import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isMemberUser, isOwnRecordOrCoordinator } from '@/access'
import { COMMISSION_OPTIONS } from '@/fields/commissions'

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
    description: 'Taken die vrijwilligers in Mijn omgeving zien en kunnen afvinken.',
  },
  defaultSort: 'dueAt',
  timestamps: true,
  hooks: {
    beforeValidate: [
      // Same rule as registered hours: a member's write is always about
      // themselves, whatever the form said.
      ({ data, req }) => (isMemberUser(req.user) ? { ...data, member: req.user.id } : data),
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

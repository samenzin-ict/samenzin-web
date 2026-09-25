import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isMemberUser, isOwnRecordOrCoordinator } from '@/access'

/**
 * A member signed up for an event, the "Mijn evenementen" tab of
 * docs/design/08-ledenportaal-mijn-taken.png.
 *
 * Deliberately not a public sign-up. The decision recorded in PROGRESS.md
 * stands: the website takes no registrations from the open web, because that
 * is personal data arriving from strangers and it needs a processing register
 * entry first. These records are entered by an administrator for people who
 * are already members, and the portal only shows a member their own.
 */
export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  labels: { singular: 'Aanmelding evenement', plural: 'Aanmeldingen evenementen' },
  access: {
    create: isAdmin,
    read: isOwnRecordOrCoordinator,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'event', 'attended'],
    group: 'Mensen',
    description: 'Aanmeldingen van leden voor evenementen. Door een beheerder ingevoerd.',
  },
  timestamps: true,
  hooks: {
    beforeValidate: [
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
      label: 'Lid',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      label: 'Evenement',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'attended',
      type: 'checkbox',
      defaultValue: false,
      label: 'Aanwezig geweest',
      access: { update: isAdminFieldLevel },
    },
  ],
}

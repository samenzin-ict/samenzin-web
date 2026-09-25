import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isMemberUser, isOwnRecordOrCoordinator } from '@/access'

/**
 * A member following a course, with how far along they are. The "Mijn
 * cursussen" row of docs/design/08-ledenportaal-mijn-taken.png.
 *
 * This is the enrolment half of ROADMAP 3.4, and only the half the portal
 * needs: an administrator enrols somebody and records progress. There is no
 * public "enrol me" button, because that would take a sign-up from the open
 * web, which is a processing register entry that does not exist yet.
 *
 * Progress is a whole percentage kept by hand. Deriving it would mean modelling
 * lessons and attendance, which nothing has asked for.
 */
export const CourseEnrolments: CollectionConfig = {
  slug: 'course-enrolments',
  labels: { singular: 'Cursusdeelname', plural: 'Cursusdeelnames' },
  access: {
    create: isAdmin,
    read: isOwnRecordOrCoordinator,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'course', 'progress'],
    group: 'Mensen',
    description: 'Wie welke cursus volgt, en hoe ver. Zichtbaar voor het lid zelf.',
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
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
      label: 'Cursus',
      access: { update: isAdminFieldLevel },
    },
    {
      name: 'progress',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Voortgang (%)',
      access: { update: isAdminFieldLevel },
    },
  ],
}

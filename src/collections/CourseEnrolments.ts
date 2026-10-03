import type { CollectionConfig } from 'payload'

import {
  canCancelCourseEnrolment,
  canEnrolSelf,
  isAdmin,
  isAdminFieldLevel,
  isMemberUser,
  isOwnRecordOrCoordinator,
} from '@/access'
import { getEmailMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import { sendMail } from '@/lib/email'
import { getSiteUrl } from '@/lib/site-url'

/**
 * A member following a course, with how far along they are. The "Mijn
 * cursussen" row of docs/design/08-ledenportaal-mijn-taken.png.
 *
 * The enrolment half of ROADMAP 3.4. A signed-in member enrols themselves from
 * the course page and may withdraw again while their progress is still zero;
 * a coordinator can do either for anybody. There is still no sign-up from the
 * open web: a visitor who is not a member is shown the login instead. See
 * src/access/selfEnrolment.ts for why that distinction is the one that matters.
 *
 * Progress is a whole percentage kept by hand and is administrator-only at
 * field level, so enrolling cannot become awarding yourself a result. Deriving
 * it would mean modelling lessons and attendance, which nothing has asked for.
 */
export const CourseEnrolments: CollectionConfig = {
  slug: 'course-enrolments',
  labels: { singular: 'Cursusdeelname', plural: 'Cursusdeelnames' },
  access: {
    create: canEnrolSelf,
    read: isOwnRecordOrCoordinator,
    // Progress is the coordinator's to record, never the member's.
    update: isAdmin,
    delete: canCancelCourseEnrolment,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'course', 'progress'],
    group: 'Mensen',
    description:
      'Wie welke cursus volgt, en hoe ver. Zichtbaar voor het lid zelf. Leden schrijven zich zelf in via de cursuspagina en kunnen zich weer uitschrijven zolang de voortgang nul is.',
  },
  timestamps: true,
  hooks: {
    beforeValidate: [
      /*
       * A member's write is always about themselves, whatever the request
       * said. This is what makes `create` safe to open to members at all: the
       * access rule can return true without a document to match, because the
       * member id never comes from the caller.
       */
      ({ data, req }) => (isMemberUser(req.user) ? { ...data, member: req.user.id } : data),
    ],
    afterChange: [
      /**
       * Confirms an enrolment to the member.
       *
       * Only on create. A coordinator recording progress is not news worth
       * mailing about, and the member sees it in Mijn omgeving anyway.
       */
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        const memberId = typeof doc.member === 'object' ? doc.member?.id : doc.member
        const courseId = typeof doc.course === 'object' ? doc.course?.id : doc.course

        if (!memberId || !courseId) return

        const [member, course] = await Promise.all([
          req.payload
            .findByID({ collection: 'members', id: memberId, depth: 0, overrideAccess: true, req })
            .catch(() => null),
          req.payload
            .findByID({ collection: 'courses', id: courseId, depth: 0, overrideAccess: true, req })
            .catch(() => null),
        ])

        if (!member?.email || !course) return

        await sendMail(req.payload, {
          to: member.email,
          template: getEmailMessages().courseEnrolment({
            name: member.name,
            course: course.title,
            startDate: formatLongDate(course.startsAt),
            url: `${getSiteUrl()}/cursussen/${course.slug}`,
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

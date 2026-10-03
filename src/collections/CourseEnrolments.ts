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
 *
 * Reaching 100 stamps `completedAt`, which is what a certificate is dated with
 * (ROADMAP 3.6). A member can never set either field, so a certificate cannot
 * be awarded to oneself.
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
    beforeChange: [
      /**
       * Stamps the completion date the moment progress reaches 100, and takes
       * it off again if the progress is corrected downwards. ROADMAP 3.6.
       *
       * Only set once: re-saving a finished enrolment must not move the date,
       * because the certificate already carries it and a certificate whose
       * date changes is worse than none.
       */
      ({ data, originalDoc }) => {
        const progress = data?.progress ?? originalDoc?.progress ?? 0
        const existing = data?.completedAt ?? originalDoc?.completedAt ?? null

        if (progress >= 100) {
          return existing ? data : { ...data, completedAt: new Date().toISOString() }
        }

        // Corrected back below 100: there is nothing to certify any more.
        return existing ? { ...data, completedAt: null } : data
      },
    ],
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
    {
      /*
       * When the course was finished, which is what a certificate is dated
       * with. ROADMAP 3.6.
       *
       * Derived from the progress rather than typed in, so a coordinator
       * cannot forget it and the certificate's date cannot disagree with the
       * figure beside it. Stored rather than computed on the fly because it is
       * the date the course was *completed*, which is not recoverable later:
       * `updatedAt` moves every time anything on the record changes.
       */
      name: 'completedAt',
      type: 'date',
      label: 'Afgerond op',
      /*
       * Belt as well as braces. `update` on this collection is already
       * administrators only, so a member cannot write this today; the
       * field-level rule means that stays true if `update` is ever opened up,
       * the way `create` was for self-enrolment.
       */
      access: { update: isAdminFieldLevel },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description:
          'Wordt zelf gevuld zodra de voortgang 100% is. Vanaf dat moment kan het lid een certificaat downloaden.',
      },
    },
  ],
}

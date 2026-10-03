import type { CollectionConfig } from 'payload'

import {
  canCancelEventRegistration,
  canEnrolSelf,
  isAdmin,
  isAdminFieldLevel,
  isMemberUser,
  isOwnRecordOrCoordinator,
} from '@/access'
import { getEmailMessages } from '@/i18n'
import { formatLongDate, formatTimeRange } from '@/lib/dates'
import { sendMail } from '@/lib/email'
import { getSiteUrl } from '@/lib/site-url'

/**
 * A member signed up for an event, the "Mijn evenementen" tab of
 * docs/design/08-ledenportaal-mijn-taken.png.
 *
 * Still not a public sign-up. The decision recorded in PROGRESS.md stands: the
 * website takes no registrations from the open web, because that is personal
 * data arriving from strangers and it needs a processing register entry first.
 *
 * A signed-in member is a different case, and may now register themselves from
 * the event page and cancel again until somebody ticks them as having been
 * there. The foundation already holds that member's record; the registration
 * itself is two foreign keys and no new personal data. A visitor who is not a
 * member is shown the login, or the editor's own external aanmeldlink if the
 * event has one. See src/access/selfEnrolment.ts.
 *
 * Capacity is counted from these rows, so cancelling frees the place.
 */
export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  labels: { singular: 'Aanmelding evenement', plural: 'Aanmeldingen evenementen' },
  access: {
    create: canEnrolSelf,
    read: isOwnRecordOrCoordinator,
    // Attendance is recorded by whoever ran the event, never by the attendee.
    update: isAdmin,
    delete: canCancelEventRegistration,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'event', 'attended'],
    group: 'Mensen',
    description:
      'Aanmeldingen van leden voor evenementen. Leden melden zich zelf aan via de evenementpagina en kunnen zich weer afmelden tot u ze als aanwezig hebt aangevinkt.',
  },
  timestamps: true,
  hooks: {
    beforeValidate: [
      // A member's write is always about themselves, whatever the request
      // said. See the same hook on CourseEnrolments for why that matters.
      ({ data, req }) => (isMemberUser(req.user) ? { ...data, member: req.user.id } : data),
    ],
    afterChange: [
      /** Confirms a registration to the member, with the date and the place. */
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        const memberId = typeof doc.member === 'object' ? doc.member?.id : doc.member
        const eventId = typeof doc.event === 'object' ? doc.event?.id : doc.event

        if (!memberId || !eventId) return

        const [member, event] = await Promise.all([
          req.payload
            .findByID({ collection: 'members', id: memberId, depth: 0, overrideAccess: true, req })
            .catch(() => null),
          req.payload
            .findByID({ collection: 'events', id: eventId, depth: 0, overrideAccess: true, req })
            .catch(() => null),
        ])

        if (!member?.email || !event) return

        const day = formatLongDate(event.startsAt)
        const time = formatTimeRange(event.startsAt, event.endsAt)

        await sendMail(req.payload, {
          to: member.email,
          template: getEmailMessages().eventRegistration({
            name: member.name,
            event: event.title,
            when: time ? `${day}, ${time}` : (day ?? ''),
            location: [event.locationName, event.city].filter(Boolean).join(', ') || null,
            url: `${getSiteUrl()}/agenda/${event.slug}`,
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

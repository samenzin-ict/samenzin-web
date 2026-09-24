import type { Field } from 'payload'

/**
 * The foundation's commissions, as listed in the ANBI text.
 *
 * One list, used both on a user (which commissions they work for) and on a
 * piece of content (which commission owns it). Two lists would drift apart the
 * first time one was edited.
 *
 * Adding a commission means adding a line here and a migration, because the
 * values are an enum in the database.
 */
export const COMMISSION_OPTIONS = [
  { label: 'Onderwijs en bezinning', value: 'onderwijs' },
  { label: 'Vrijwilligers en taalmaatje', value: 'vrijwilligers' },
  { label: 'Organisatie en evenementen', value: 'evenementen' },
  { label: 'Media en communicatie', value: 'media' },
  { label: 'ICT', value: 'ict' },
  { label: 'Fondsenwerving', value: 'fondsenwerving' },
  { label: 'Vrouwenwerking', value: 'vrouwenwerking' },
  { label: 'Huisvesting', value: 'huisvesting' },
] as const

export type CommissionValue = (typeof COMMISSION_OPTIONS)[number]['value']

/**
 * The commission that owns a piece of content.
 *
 * Left empty the content is shared: any editor may work on it. That is the
 * sensible default for a small organisation, and it keeps everything written
 * before commissions existed editable rather than stranded.
 *
 * An editor may only assign content to a commission they belong to. Without
 * that check, scoping would be advisory: anyone could reassign a document to
 * themselves and then edit it.
 */
export const commissionField: Field = {
  name: 'commission',
  type: 'select',
  options: [...COMMISSION_OPTIONS],
  index: true,
  label: 'Commissie',
  admin: {
    position: 'sidebar',
    description:
      'Welke commissie dit beheert. Laat leeg als iedere redacteur eraan mag werken.',
  },
  validate: (value: unknown, options: unknown) => {
    const req = (options as { req?: { user?: { role?: string; commissions?: string[] | null } } })
      ?.req
    const user = req?.user

    if (!value || !user || user.role === 'admin') return true

    const allowed = user.commissions ?? []

    if (!allowed.includes(value as string)) {
      return 'U kunt alleen kiezen uit de commissies waar u lid van bent.'
    }

    return true
  },
}

import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

/**
 * Mollie transaction records.
 *
 * Never publicly readable (ARCHITECTURE.md). Only an administrator can see
 * these: they hold what someone gave and, unless they chose otherwise, who
 * they are.
 *
 * Nothing here is written by a visitor. Records are created by the server when
 * a payment is started and updated only by the webhook, which re-fetches the
 * payment from Mollie before believing anything. The collection is closed to
 * the API entirely, the same way contact submissions are.
 *
 * Card and bank details never reach this application. The visitor pays on
 * Mollie's own checkout; we store an identifier and an outcome.
 *
 * Two deliberate limits:
 *
 * - One-off gifts only. Monthly and five-year periodic gifts need a mandate,
 *   which is ROADMAP 3.3, and a signed mandate has legal weight.
 * - `status` mirrors Mollie's own vocabulary rather than inventing a parallel
 *   one, so a record can always be compared with the Mollie dashboard.
 */
/**
 * "Export naar boekhouding" on the dashboard (docs/design/09).
 *
 * Returns the paid donations of a calendar month as CSV, which is what the
 * treasurer hands to the bookkeeper. Administrators only, and it goes through
 * the normal access check rather than trusting the caller: this is financial
 * and personal data in one file.
 *
 * Semicolon separated and UTF-8 with a BOM, because that is what Dutch Excel
 * opens correctly without an import dialogue.
 */
const csvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value)

  // Guard against a leading =, +, - or @ being treated as a formula.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text

  return `"${safe.replace(/"/g, '""')}"`
}

export const Donations: CollectionConfig = {
  slug: 'donations',
  labels: {
    singular: 'Donatie',
    plural: 'Donaties',
  },
  access: {
    // The donation flow writes with access overridden; nothing else may.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [
    {
      path: '/export',
      method: 'get',
      handler: async (req) => {
        const { searchParams } = new URL(req.url ?? '', 'http://localhost')
        const month = searchParams.get('maand')
        const from = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date()

        if (Number.isNaN(from.getTime())) {
          return Response.json({ error: 'Ongeldige maand.' }, { status: 400 })
        }

        from.setUTCDate(1)
        from.setUTCHours(0, 0, 0, 0)
        const to = new Date(from)
        to.setUTCMonth(to.getUTCMonth() + 1)

        const { docs } = await req.payload.find({
          collection: 'donations',
          where: {
            and: [
              { status: { equals: 'paid' } },
              { paidAt: { greater_than_equal: from.toISOString() } },
              { paidAt: { less_than: to.toISOString() } },
            ],
          },
          // Not overridden: an editor gets a 403 rather than a spreadsheet.
          overrideAccess: false,
          user: req.user,
          limit: 5000,
          depth: 0,
          sort: 'paidAt',
        })

        const header = ['Datum', 'Bedrag', 'Bestemming', 'Donateur', 'E-mailadres', 'Mollie-id']
        const rows = docs.map((d) =>
          [
            d.paidAt ? new Date(d.paidAt).toISOString().slice(0, 10) : '',
            typeof d.amount === 'number' ? d.amount.toFixed(2).replace('.', ',') : '',
            d.fund ?? 'Algemeen',
            d.anonymous ? 'Anoniem' : (d.donorName ?? ''),
            d.anonymous ? '' : (d.donorEmail ?? ''),
            d.molliePaymentId ?? '',
          ].map(csvCell).join(';'),
        )

        const csv = `\uFEFF${[header.map(csvCell).join(';'), ...rows].join('\r\n')}\r\n`
        const name = `donaties-${from.toISOString().slice(0, 7)}.csv`

        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${name}"`,
          },
        })
      },
    },
  ],
  admin: {
    useAsTitle: 'molliePaymentId',
    defaultColumns: ['createdAt', 'amount', 'status', 'fund', 'donorName'],
    group: 'Financieel',
    description:
      'Donaties die via de website zijn gestart. Deze records bevatten persoonsgegevens en zijn niet openbaar.',
  },
  timestamps: true,
  fields: [
    {
      name: 'molliePaymentId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Mollie-betaalnummer',
      admin: {
        readOnly: true,
        description: 'Het nummer waarmee deze betaling in het Mollie-dashboard te vinden is.',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Bedrag in euro',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      index: true,
      label: 'Status',
      options: [
        { label: 'Gestart', value: 'open' },
        { label: 'In behandeling', value: 'pending' },
        { label: 'Betaald', value: 'paid' },
        { label: 'Geannuleerd', value: 'canceled' },
        { label: 'Verlopen', value: 'expired' },
        { label: 'Mislukt', value: 'failed' },
      ],
      admin: {
        readOnly: true,
        description:
          'Wordt automatisch bijgewerkt door Mollie. Alleen de status "Betaald" betekent dat het geld is ontvangen.',
      },
    },
    {
      name: 'fund',
      type: 'text',
      label: 'Bestemming',
      admin: {
        readOnly: true,
        description: 'Waar de gever de gift aan wilde besteden. Leeg betekent algemeen.',
      },
    },
    {
      name: 'anonymous',
      type: 'checkbox',
      defaultValue: false,
      label: 'Anoniem gegeven',
      admin: {
        readOnly: true,
        description: 'Bij een anonieme gift zijn naam en e-mailadres niet opgeslagen.',
      },
    },
    {
      name: 'donorName',
      type: 'text',
      label: 'Naam',
      admin: {
        readOnly: true,
        description: 'Leeg bij een anonieme gift.',
      },
    },
    {
      name: 'donorEmail',
      type: 'email',
      label: 'E-mailadres',
      admin: {
        readOnly: true,
        description: 'Alleen gebruikt om een donatiebevestiging te sturen. Leeg bij een anonieme gift.',
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      label: 'Betaald op',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}

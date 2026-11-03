import type { CollectionConfig, FieldAccess } from 'payload'
import { APIError } from 'payload'

import { isAdmin } from '@/access'
import {
  MAX_RECURRING_AMOUNT,
  RECURRING_RETENTION_MONTHS,
  addMonths,
  newAccessKey,
  onRecurringStatusChange,
  revokeAtMollie,
  todayInAmsterdam,
} from '@/lib/donations'

/**
 * A gift that is collected again and again by SEPA automatische incasso.
 * ROADMAP 3.3; the requirements are in docs/SEPA_otomatik_incasso.pdf.
 *
 * Two kinds share this collection:
 *
 * - **Maandelijks.** Started by the donor on /doneren. They pay the first
 *   month by iDEAL, which also lays down the SEPA mandate at Mollie; Mollie
 *   then collects every month until somebody stops it.
 * - **Periodieke gift.** Five years, and only fiscally a periodic gift with a
 *   written agreement signed before anything is collected. So it never starts
 *   from the website: an administrator creates the record once the signed
 *   agreement is in, and setting the status to "Betaallink versturen" mails
 *   the donor a link. From there it runs like the monthly one, with a fixed
 *   number of terms after which Mollie stops by itself.
 *
 * Each collection Mollie makes becomes an ordinary record in Donaties, linked
 * back here, so the totals, the export and the project counters need no
 * second code path.
 *
 * The status is mostly set by the system: by the website, by Mollie's webhook
 * and by the daily job. An administrator may make only the moves a person
 * should make — send the link, stop a gift — and stopping one revokes the
 * mandate at Mollie before the record changes, so the panel never says
 * "stopgezet" about a gift that is still being collected.
 *
 * What is not here: the donor's IBAN. Mollie holds the mandate and the account
 * number; this record keeps only Mollie's identifiers for them. What is not
 * stored cannot leak.
 */

/** The statuses a person in the admin panel may move a record to. */
const MANUAL_MOVES: Record<string, string[]> = {
  draft: ['invited', 'stopped'],
  invited: ['stopped'],
  pending: ['stopped'],
  active: ['stopped'],
}

/** Identity and amount are fixed once the donor has been asked to sign up. */
const editableWhileDraft: FieldAccess = ({ doc }) => !doc || doc.status === 'draft'

export const RecurringDonations: CollectionConfig = {
  slug: 'recurring-donations',
  labels: {
    singular: 'Doorlopende gift',
    plural: 'Doorlopende giften',
  },
  access: {
    // Only an administrator; the website and the webhook write with access
    // overridden, the same as for Donaties.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    // A mandate is a record with legal weight and is kept, not deleted; the
    // daily job anonymises it when its retention period is over.
    delete: () => false,
  },
  admin: {
    useAsTitle: 'donorName',
    defaultColumns: ['donorName', 'kind', 'amount', 'status', 'nextPaymentDate'],
    group: 'Financieel',
    description:
      'Maandelijkse giften en periodieke giften die via automatische incasso lopen. Een periodieke gift maakt u hier zelf aan, nadat de getekende overeenkomst binnen is; zet daarna de status op "Betaallink versturen". Een gift stopzetten doet u door de status op "Stopgezet" te zetten: de machtiging wordt dan direct bij Mollie ingetrokken.',
  },
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req, context }) => {
        const next = { ...data }

        if (operation === 'create') {
          next.status = next.status ?? 'draft'
          // Only the website creates anything other than a draft.
          if (!context.system && next.status !== 'draft') {
            throw new APIError('Een nieuwe gift begint als concept.', 400, undefined, true)
          }
          if (!context.system && next.kind !== 'periodic') {
            throw new APIError(
              'Een maandelijkse gift start de gever zelf via de website. Hier maakt u alleen periodieke giften aan.',
              400,
              undefined,
              true,
            )
          }
          if (!next.donorName?.trim() || !next.donorEmail?.trim()) {
            throw new APIError('Naam en e-mailadres zijn verplicht.', 400, undefined, true)
          }
          next.accessKey = next.accessKey ?? newAccessKey()
          return next
        }

        const from = originalDoc?.status as string | undefined
        const to = (next.status as string | undefined) ?? from

        if (!from || to === from || context.system) return next

        if (!MANUAL_MOVES[from]?.includes(to ?? '')) {
          throw new APIError(
            'Deze status wordt automatisch gezet en kan hier niet worden gekozen.',
            400,
            undefined,
            true,
          )
        }

        if (to === 'invited') {
          const agreement = next.agreementReceived ?? originalDoc?.agreementReceived

          if (!agreement) {
            throw new APIError(
              'Vink eerst aan dat de getekende overeenkomst is ontvangen. Zonder overeenkomst is het geen periodieke gift.',
              400,
              undefined,
              true,
            )
          }
        }

        if (to === 'stopped') {
          /*
           * Revoked at Mollie first. If that fails the save fails with it, and
           * the record keeps saying the gift runs — which is then still true.
           */
          await revokeAtMollie(originalDoc, req.payload)

          const today = todayInAmsterdam()
          next.endedOn = today
          next.stoppedBy = context.stoppedBy === 'donor' ? 'donor' : 'admin'
          next.nextPaymentDate = null
          next.deleteAfter = `${addMonths(today, RECURRING_RETENTION_MONTHS)}T00:00:00.000Z`
        }

        return next
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.status === previousDoc?.status) return
        await onRecurringStatusChange(req.payload, doc, previousDoc?.status)
      },
    ],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'periodic',
      label: 'Soort',
      options: [
        { label: 'Maandelijks', value: 'monthly' },
        { label: 'Periodieke gift (5 jaar)', value: 'periodic' },
      ],
      access: { update: editableWhileDraft },
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      label: 'Status',
      options: [
        { label: 'Concept', value: 'draft' },
        { label: 'Betaallink versturen / verstuurd', value: 'invited' },
        { label: 'Wacht op eerste betaling', value: 'pending' },
        { label: 'Actief', value: 'active' },
        { label: 'Stopgezet', value: 'stopped' },
        { label: 'Niet gestart', value: 'failed' },
        { label: 'Afgerond', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Kies zelf alleen "Betaallink versturen" (periodieke gift, na ontvangst van de overeenkomst) of "Stopgezet". De rest zet het systeem.',
      },
    },
    {
      name: 'agreementReceived',
      type: 'checkbox',
      defaultValue: false,
      label: 'Getekende overeenkomst ontvangen',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.kind === 'periodic',
        description:
          'De overeenkomst met het BSN komt per post of wordt afgegeven, nooit per e-mail. Bewaar het origineel bij de administratie.',
      },
    },
    {
      name: 'agreementDate',
      type: 'date',
      label: 'Datum overeenkomst',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.kind === 'periodic',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
      },
    },
    {
      /*
       * Not required in the schema: the retention job empties both once the
       * period is over. The hook requires them on every new record instead.
       */
      name: 'donorName',
      type: 'text',
      label: 'Naam',
      access: { update: editableWhileDraft },
    },
    {
      name: 'donorEmail',
      type: 'email',
      label: 'E-mailadres',
      access: { update: editableWhileDraft },
      admin: {
        description:
          'Hier gaan de bevestiging, het bericht vóór elke afschrijving en de link om te stoppen naartoe.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 1,
          max: MAX_RECURRING_AMOUNT,
          label: 'Bedrag per termijn (euro)',
          access: { update: editableWhileDraft },
          admin: {
            description: `Mollie schrijft standaard hoogstens € ${MAX_RECURRING_AMOUNT} per keer af.`,
          },
        },
        {
          name: 'interval',
          type: 'select',
          required: true,
          defaultValue: 'monthly',
          label: 'Termijn',
          options: [
            { label: 'Elke maand', value: 'monthly' },
            { label: 'Elk jaar', value: 'yearly' },
          ],
          access: { update: editableWhileDraft },
          admin: { description: 'Een maandelijkse gift is altijd elke maand.' },
        },
      ],
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      label: 'Project',
      access: { update: editableWhileDraft },
      admin: { description: 'Leeg betekent een algemene gift.' },
    },
    {
      name: 'fund',
      type: 'text',
      label: 'Bestemming',
      admin: {
        readOnly: true,
        description: 'Zoals het project heette toen de gift begon.',
      },
    },
    {
      type: 'collapsible',
      label: 'Verloop',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'startDate',
              type: 'text',
              label: 'Eerste incasso',
              admin: { readOnly: true, description: 'JJJJ-MM-DD' },
            },
            {
              name: 'nextPaymentDate',
              type: 'text',
              index: true,
              label: 'Volgende incasso',
              admin: { readOnly: true, description: 'JJJJ-MM-DD, volgens Mollie' },
            },
            {
              name: 'endedOn',
              type: 'text',
              label: 'Beëindigd op',
              admin: { readOnly: true },
            },
          ],
        },
        {
          name: 'totalTerms',
          type: 'number',
          label: 'Aantal termijnen',
          admin: {
            readOnly: true,
            description: 'Alleen bij een periodieke gift: vijf jaar, de eerste betaling meegeteld.',
          },
        },
        {
          name: 'stoppedBy',
          type: 'select',
          label: 'Gestopt door',
          options: [
            { label: 'De gever', value: 'donor' },
            { label: 'Een beheerder', value: 'admin' },
            { label: 'Mollie of de bank', value: 'mollie' },
          ],
          admin: { readOnly: true },
        },
        {
          name: 'stopReason',
          type: 'text',
          label: 'Reden',
          admin: {
            readOnly: true,
            description: 'Bij een stop door de bank: de redencode, bijvoorbeeld AC01 (rekening ongeldig) of MD01 (geen machtiging).',
          },
        },
        {
          name: 'notifiedFor',
          type: 'text',
          label: 'Vooraankondiging verstuurd voor',
          admin: {
            readOnly: true,
            description: 'De incassodatum waarover de gever het laatst vooraf is ingelicht.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Mollie',
      admin: { initCollapsed: true },
      fields: [
        { name: 'mollieCustomerId', type: 'text', index: true, label: 'Klant', admin: { readOnly: true } },
        { name: 'mollieMandateId', type: 'text', label: 'Machtiging', admin: { readOnly: true } },
        {
          name: 'mollieSubscriptionId',
          type: 'text',
          unique: true,
          index: true,
          label: 'Abonnement',
          admin: { readOnly: true },
        },
      ],
    },
    {
      /*
       * The secret in the donor's links: to start a periodic gift, and to stop
       * any gift without having to write to anybody. Random, not derived from
       * the id, and never shown in the panel.
       */
      name: 'accessKey',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'deleteAfter',
      type: 'date',
      label: 'Naam weghalen na',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: `Automatisch: ${RECURRING_RETENTION_MONTHS} maanden na de laatste incasso. Daarna worden naam en e-mailadres weggehaald.`,
      },
    },
  ],
}

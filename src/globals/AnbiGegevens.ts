import type { GlobalConfig } from 'payload'

import { isAdmin, isPublic } from '@/access'

/**
 * The statutory ANBI publication fields.
 *
 * A global with named fields rather than a page, because Dutch tax law
 * prescribes exactly which information must be published. Modelling each
 * requirement as its own field means a volunteer cannot accidentally delete a
 * mandatory one (ARCHITECTURE.md, "Content model, phase 1").
 *
 * The structure follows docs/ANBI_guide.docx, which in turn follows the
 * Belastingdienst list. Publishing this page is condition 12 of the twelve an
 * ANBI must meet: if the page is not live, the condition is not met and the
 * application can be refused on that ground alone. Its address goes on the
 * application form, so it has to resolve before the form is sent.
 *
 * Two rules that are easy to break by accident:
 *
 * - Board members are name and function only. Publishing their home address,
 *   telephone number or date of birth is not required and must not be added.
 * - While the status is "aangevraagd" the page may not claim to be an ANBI or
 *   that gifts are deductible. The notice field below is required in that
 *   state and the page renders it prominently.
 *
 * Administrators only. This is the legal record of the foundation and is not
 * everyday content.
 */
export const AnbiGegevens: GlobalConfig = {
  slug: 'anbi-gegevens',
  label: 'Rapportage & ANBI',
  access: {
    read: isPublic,
    update: isAdmin,
  },
  admin: {
    group: 'Financieel',
    description:
      'De gegevens die de Belastingdienst verplicht stelt voor een ANBI. Alles op deze pagina is openbaar. Werk de pagina dezelfde dag bij als de statuten, het bestuur, het adres of de activiteiten veranderen.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Organisatie',
          fields: [
            {
              name: 'statutoryName',
              type: 'text',
              required: true,
              label: 'Statutaire naam',
              admin: { description: 'De naam zoals die in de statuten en bij de KVK staat.' },
            },
            {
              name: 'kvkNumber',
              type: 'text',
              label: 'KVK-nummer',
            },
            {
              name: 'rsin',
              type: 'text',
              label: 'RSIN / fiscaal nummer',
            },
            {
              name: 'foundedOn',
              type: 'date',
              label: 'Opgericht op',
              admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
            },
            {
              name: 'statutorySeat',
              type: 'text',
              label: 'Statutaire zetel',
              admin: { description: 'Bijvoorbeeld: Gemeente Tilburg.' },
            },
            {
              name: 'operatingArea',
              type: 'text',
              label: 'Werkgebied',
            },
            {
              name: 'fiscalYear',
              type: 'textarea',
              label: 'Boekjaar',
              admin: {
                description:
                  'Bijvoorbeeld: 1 januari tot en met 31 december. Vermeld ook het eerste, afwijkende boekjaar.',
              },
            },
            {
              name: 'contact',
              type: 'group',
              label: 'Contactgegevens',
              admin: {
                description:
                  'Het post- of bezoekadres is verplicht. Dit mag een postadres zijn en hoeft niet hetzelfde te zijn als het bezoekadres bij Instellingen.',
              },
              fields: [
                { name: 'address', type: 'textarea', label: 'Postadres' },
                { name: 'email', type: 'email', label: 'E-mailadres' },
                { name: 'phone', type: 'text', label: 'Telefoonnummer' },
              ],
            },
            {
              name: 'iban',
              type: 'text',
              label: 'Bankrekening (IBAN)',
              admin: { description: 'Wordt op de pagina getoond bij "Steun ons".' },
            },
          ],
        },
        {
          label: 'ANBI-status',
          fields: [
            {
              name: 'anbiStatus',
              type: 'select',
              required: true,
              defaultValue: 'aangevraagd',
              label: 'Status van de aanvraag',
              options: [
                { label: 'Aangevraagd, nog niet toegekend', value: 'aangevraagd' },
                { label: 'Toegekend', value: 'toegekend' },
              ],
              admin: {
                description:
                  'Zet dit pas op "toegekend" als de beschikking binnen is. Zolang de status is aangevraagd mag de website niet vermelden dat giften aftrekbaar zijn.',
              },
            },
            {
              name: 'anbiGrantedOn',
              type: 'date',
              label: 'Toegekend per',
              admin: {
                condition: (data) => data?.anbiStatus === 'toegekend',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
                description: 'De datum op de beschikking van de Belastingdienst.',
              },
            },
            {
              name: 'statusNotice',
              type: 'richText',
              label: 'Let op-melding',
              admin: {
                description:
                  'Wordt bovenaan de pagina getoond zolang de status is aangevraagd. Vermeld dat de aftrekbaarheid nog niet gegarandeerd is en dat contante giften nooit aftrekbaar zijn.',
              },
              validate: (value: unknown, options: unknown) => {
                const data = (options as { data?: { anbiStatus?: string } })?.data

                if (data?.anbiStatus === 'aangevraagd' && !value) {
                  return 'Verplicht zolang de ANBI-status nog niet is toegekend.'
                }

                return true
              },
            },
          ],
        },
        {
          label: 'Beleid',
          fields: [
            {
              name: 'objective',
              type: 'richText',
              localized: true,
              label: 'Doelstelling',
              admin: {
                description: 'De doelstelling zoals omschreven in de statuten, met het artikelnummer.',
              },
            },
            {
              name: 'mission',
              type: 'richText',
              localized: true,
              label: 'Missie in het kort',
              admin: { description: 'Een korte toelichting in gewone taal. Optioneel.' },
            },
            {
              name: 'policyActivities',
              type: 'richText',
              localized: true,
              label: 'Beleidsplan: wat wij doen',
              admin: {
                description:
                  'Onderdeel van de hoofdlijnen van het beleidsplan. Het volledige beleidsplan hoort niet op de website.',
              },
            },
            {
              name: 'policyIncome',
              type: 'richText',
              localized: true,
              label: 'Beleidsplan: hoe wij onze inkomsten werven',
            },
            {
              name: 'policyAssets',
              type: 'richText',
              localized: true,
              label: 'Beleidsplan: hoe wij ons vermogen beheren en besteden',
              admin: {
                description:
                  'Vermeld hier ook wat er bij opheffing met een batig saldo gebeurt.',
              },
            },
            {
              name: 'policyPlanOnRequest',
              type: 'textarea',
              localized: true,
              label: 'Beleidsplan op verzoek',
              admin: {
                description:
                  'Zin waarmee bezoekers het volledige beleidsplan kunnen opvragen.',
              },
            },
            {
              name: 'remunerationPolicy',
              type: 'richText',
              localized: true,
              label: 'Beloningsbeleid',
              admin: {
                description:
                  'Voor het bestuur en voor eventueel personeel. Vermeld het ook als bestuursleden onbezoldigd zijn.',
              },
            },
          ],
        },
        {
          label: 'Bestuur',
          fields: [
            {
              name: 'boardMembers',
              type: 'array',
              label: 'Bestuursleden',
              labels: { singular: 'Bestuurslid', plural: 'Bestuursleden' },
              admin: {
                description:
                  'Alleen naam en functie. Woonadres, telefoonnummer en geboortedatum zijn niet verplicht en horen hier niet.',
              },
              fields: [
                { name: 'role', type: 'text', required: true, localized: true, label: 'Functie' },
                { name: 'name', type: 'text', required: true, label: 'Naam' },
              ],
            },
            {
              name: 'boardComposition',
              type: 'richText',
              localized: true,
              label: 'Toelichting op het bestuur',
              admin: {
                description: 'Bijvoorbeeld over de adviesraad en de commissies. Optioneel.',
              },
            },
          ],
        },
        {
          label: 'Verantwoording',
          fields: [
            {
              name: 'reportingNotice',
              type: 'textarea',
              localized: true,
              label: 'Melding zolang er nog geen jaarstukken zijn',
              admin: {
                description:
                  'Wordt getoond zolang hieronder geen boekjaar is toegevoegd. Vermeld de uiterste publicatiedatum. Een ANBI moet binnen zes maanden na afloop van het boekjaar publiceren; te laat publiceren is de belangrijkste reden dat de status wordt ingetrokken.',
              },
            },
            {
              name: 'annualReports',
              type: 'array',
              label: 'Jaarstukken',
              labels: { singular: 'Boekjaar', plural: 'Boekjaren' },
              admin: {
                description:
                  'Per boekjaar het verslag van de activiteiten en de financiële verantwoording: balans, staat van baten en lasten, en de toelichting daarop.',
              },
              fields: [
                { name: 'year', type: 'number', required: true, label: 'Boekjaar' },
                {
                  name: 'activityReport',
                  type: 'richText',
                  localized: true,
                  label: 'Verslag van de activiteiten',
                },
                {
                  name: 'financialStatement',
                  type: 'richText',
                  localized: true,
                  label: 'Financiële verantwoording',
                  admin: {
                    description: 'Balans en staat van baten en lasten, met toelichting.',
                  },
                },
                {
                  name: 'documents',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  label: 'Documenten',
                  admin: {
                    description:
                      'Optioneel en aanvullend. De cijfers moeten ook als gewone tekst op de pagina staan, niet alleen in een PDF.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Steun ons',
          fields: [
            {
              name: 'supportText',
              type: 'richText',
              localized: true,
              label: 'Tekst bij Steun ons',
              admin: {
                description:
                  'Over doneren, periodieke giften en geoormerkte giften. Claim hier niet dat giften aftrekbaar zijn zolang de ANBI-status niet is toegekend.',
              },
            },
          ],
        },
      ],
    },
  ],
}

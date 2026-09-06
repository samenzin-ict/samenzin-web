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
 * The fields below are the list in ARCHITECTURE.md: name, RSIN, KVK number,
 * contact details, objective, policy plan, board composition and names,
 * remuneration policy, activity report and financial statement.
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
      'De gegevens die de Belastingdienst verplicht stelt voor een ANBI. Alle velden zijn openbaar op de website.',
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
              admin: {
                description: 'De naam zoals die in de statuten en bij de KVK staat.',
              },
            },
            {
              name: 'rsin',
              type: 'text',
              label: 'RSIN',
              admin: {
                description: 'Het RSIN of fiscaal nummer van de stichting.',
              },
            },
            {
              name: 'kvkNumber',
              type: 'text',
              label: 'KVK-nummer',
            },
            {
              name: 'contact',
              type: 'group',
              label: 'Contactgegevens',
              admin: {
                description:
                  'De contactgegevens zoals geregistreerd bij de KVK. Dit mag een postadres zijn en hoeft niet hetzelfde te zijn als het bezoekadres bij Instellingen.',
              },
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: 'E-mailadres',
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Telefoonnummer',
                },
                {
                  name: 'address',
                  type: 'textarea',
                  label: 'Postadres',
                },
              ],
            },
          ],
        },
        {
          label: 'Beleid',
          fields: [
            {
              name: 'objective',
              type: 'richText',
              label: 'Doelstelling',
              admin: {
                description: 'De doelstelling van de stichting, zoals omschreven in de statuten.',
              },
            },
            {
              name: 'policyPlan',
              type: 'richText',
              label: 'Beleidsplan',
              admin: {
                description: 'Een samenvatting van het beleidsplan, of het plan in zijn geheel.',
              },
            },
            {
              name: 'policyPlanDocument',
              type: 'upload',
              relationTo: 'media',
              label: 'Beleidsplan als document',
              admin: {
                description: 'Optioneel. Een PDF met het volledige beleidsplan.',
              },
            },
            {
              name: 'remunerationPolicy',
              type: 'richText',
              label: 'Beloningsbeleid',
              admin: {
                description:
                  'Het beloningsbeleid voor het bestuur en voor eventueel personeel. Vermeld het ook als bestuursleden onbezoldigd zijn.',
              },
            },
          ],
        },
        {
          label: 'Bestuur',
          fields: [
            {
              name: 'boardComposition',
              type: 'richText',
              label: 'Bestuurssamenstelling',
              admin: {
                description: 'Een korte toelichting op de samenstelling van het bestuur.',
              },
            },
            {
              name: 'boardMembers',
              type: 'array',
              label: 'Bestuursleden',
              labels: {
                singular: 'Bestuurslid',
                plural: 'Bestuursleden',
              },
              admin: {
                description: 'De namen en functies van de bestuursleden.',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: 'Naam',
                },
                {
                  name: 'role',
                  type: 'text',
                  required: true,
                  label: 'Functie',
                  admin: {
                    description: 'Bijvoorbeeld: voorzitter, secretaris, penningmeester.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Verantwoording',
          fields: [
            {
              name: 'annualReports',
              type: 'array',
              label: 'Jaarstukken',
              labels: {
                singular: 'Boekjaar',
                plural: 'Boekjaren',
              },
              admin: {
                description:
                  'Per boekjaar het verslag van de activiteiten en de financiële verantwoording. Een ANBI moet deze jaarlijks publiceren.',
              },
              fields: [
                {
                  name: 'year',
                  type: 'number',
                  required: true,
                  label: 'Boekjaar',
                },
                {
                  name: 'activityReport',
                  type: 'richText',
                  label: 'Verslag van de activiteiten',
                },
                {
                  name: 'financialStatement',
                  type: 'richText',
                  label: 'Financiële verantwoording',
                },
                {
                  name: 'documents',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  label: 'Documenten',
                  admin: {
                    description: 'Optioneel. Bijvoorbeeld de jaarrekening als PDF.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

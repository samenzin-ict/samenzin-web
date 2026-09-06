import type { GlobalConfig } from 'payload'

import { isAdmin, isPublic } from '@/access'

/**
 * Site-wide details that appear on every page.
 *
 * Nothing here may be hardcoded in a component. The logo, the organisation
 * name and the footer in the mockups are placeholders; the real values come
 * from here (docs/design/README.md, "Two things the mockups get wrong on
 * purpose").
 *
 * Only an administrator may change these. An editor edits content, not
 * settings (ARCHITECTURE.md, "Access control").
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Instellingen',
  access: {
    read: isPublic,
    update: isAdmin,
  },
  admin: {
    group: 'Systeem',
    description: 'Naam, logo, adressen en footer van de website.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Organisatie',
          fields: [
            {
              name: 'organisationName',
              type: 'text',
              required: true,
              label: 'Naam van de organisatie',
              admin: {
                description: 'Zoals de naam op de website getoond wordt.',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'Slogan',
              admin: {
                description: 'Korte zin onder of naast de naam. Optioneel.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: {
                description: 'Bij voorkeur een SVG of een PNG met transparante achtergrond.',
              },
            },
          ],
        },
        {
          label: 'Contact',
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
              name: 'addresses',
              type: 'array',
              label: 'Adressen',
              labels: {
                singular: 'Adres',
                plural: 'Adressen',
              },
              admin: {
                description: 'De stichting is op meerdere plaatsen actief. Voeg elke locatie toe.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Naam van de locatie',
                  admin: {
                    description: 'Bijvoorbeeld: Tilburg.',
                  },
                },
                {
                  name: 'street',
                  type: 'text',
                  label: 'Straat en huisnummer',
                },
                {
                  name: 'postalCode',
                  type: 'text',
                  label: 'Postcode',
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  label: 'Plaats',
                },
              ],
            },
          ],
        },
        {
          label: 'Sociale media',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Sociale media',
              labels: {
                singular: 'Link',
                plural: 'Links',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  label: 'Platform',
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'X', value: 'x' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'Adres van de pagina',
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerIntro',
              type: 'textarea',
              localized: true,
              label: 'Tekst in de footer',
              admin: {
                description: 'Korte tekst over de stichting. Optioneel.',
              },
            },
            {
              name: 'footerColumns',
              type: 'array',
              // Localized as a whole: a second locale needs its own link
              // labels and may not want the same columns at all.
              localized: true,
              label: 'Kolommen met links',
              labels: {
                singular: 'Kolom',
                plural: 'Kolommen',
              },
              maxRows: 5,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Kop van de kolom',
                },
                {
                  name: 'links',
                  type: 'array',
                  label: 'Links',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      label: 'Tekst van de link',
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: 'Adres',
                      admin: {
                        description: 'Een pad op deze website, zoals /over-ons, of een volledig adres.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'copyright',
              type: 'text',
              localized: true,
              label: 'Copyrightregel',
            },
          ],
        },
      ],
    },
  ],
}

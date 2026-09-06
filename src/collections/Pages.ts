import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isPublic } from '@/access'
import { Agenda, CallToAction, FeaturedItems, Hero, RichText } from '@/blocks'
import { formatSlug } from '@/fields/slug'

/**
 * The editable pages of the public site: home, over ons, contact and the rest
 * of the phase 1 routes.
 *
 * The body is a list of blocks rather than one text field, so a volunteer
 * assembles a page from pieces that already match the design system instead of
 * formatting it by hand.
 *
 * Three blocks to start with. Adding a fourth is cheap; removing one after
 * editors have used it is not.
 *
 * No draft or published state yet. Editorial workflow is phase 2
 * (ROADMAP.md), so anything saved here is immediately live.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: "Pagina",
    plural: "Pagina's",
  },
  access: {
    read: isPublic,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description: "De pagina's van de website.",
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Titel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      // A second locale needs its own address, so the slug is localized too.
      localized: true,
      label: 'Adres van de pagina',
      admin: {
        position: 'sidebar',
        description:
          'Het deel van het webadres na de schuine streep, bijvoorbeeld over-ons. Wordt automatisch ingevuld vanuit de titel. Wijzig dit niet meer zodra de pagina online staat, want bestaande links werken dan niet meer.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'body',
      type: 'blocks',
      /*
       * The whole body is localized rather than each field inside it, so a
       * second locale can lay a page out differently instead of being forced
       * into the Dutch structure. One flag also covers every field in every
       * block, including ones added later.
       */
      localized: true,
      label: 'Inhoud',
      labels: {
        singular: 'Blok',
        plural: 'Blokken',
      },
      blocks: [Hero, RichText, FeaturedItems, Agenda, CallToAction],
      admin: {
        description: 'Bouw de pagina op uit blokken. Sleep om de volgorde te wijzigen.',
      },
    },
    {
      name: 'meta',
      type: 'group',
      localized: true,
      label: 'Vindbaarheid',
      admin: {
        position: 'sidebar',
        description:
          'Hoe de pagina getoond wordt in Google en bij het delen op sociale media. Laat leeg om de titel van de pagina te gebruiken.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Titel voor zoekmachines',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Omschrijving',
          admin: {
            description: 'Ongeveer 150 tekens.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Afbeelding bij delen',
        },
      ],
    },
  ],
}

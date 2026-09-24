import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isEditorOfCommission, isPublishedOrAuthenticated } from '@/access'
import { Agenda, CallToAction, FeaturedItems, Hero, RichText } from '@/blocks'
import { commissionField } from '@/fields/commissions'
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
 * Drafts are on (ROADMAP 2.1). Saving leaves a page unpublished until someone
 * presses publish, and the public read rule returns only published documents,
 * so an unfinished page cannot be reached by guessing its address.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: "Pagina",
    plural: "Pagina's",
  },
  access: {
    read: isPublishedOrAuthenticated,
    create: isAdminOrEditor,
    // ROADMAP 2.8: an editor may change what their commission owns, and what
    // no commission owns.
    update: isEditorOfCommission,
    delete: isEditorOfCommission,
  },
  versions: {
    drafts: {
      /*
       * Drafts are not validated, so an editor can save a half-written page
       * without filling in every required field. Publishing validates.
       */
      validate: false,
    },
    /*
       A page is small and the history is what makes a mistake recoverable, so
       this is generous. It is not unlimited: unbounded version rows on a
       serverless database is a bill nobody reviews.
     */
    maxPerDoc: 50,
  },
  admin: {
    useAsTitle: 'title',
    // _status is injected by versions.drafts; an editor needs to see it.
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: "De pagina's van de website.",
    /*
     * The button that opens an unpublished page on the real site. It goes via
     * /preview, which checks the secret and that the caller is signed in
     * before turning Next's draft mode on.
     */
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''

      if (!slug) return null

      const params = new URLSearchParams({
        // The homepage is served at / rather than /home.
        path: slug === 'home' ? '/' : `/${slug}`,
        previewSecret: process.env.PREVIEW_SECRET || '',
      })

      return `/preview?${params.toString()}`
    },
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
    commissionField,
  ],
}

import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isEditorOfCommission, isPublishedOrOwnCommission } from '@/access'
import { commissionField } from '@/fields/commissions'
import { formatSlug } from '@/fields/slug'
import { articlePath, type ArticleSection } from '@/lib/article-sections'

/**
 * News and articles. ROADMAP 2.3, modelled on
 * docs/design/10-nieuws-en-artikelen.png.
 *
 * Two rubrieken in one collection: Nieuws at /nieuws and Artikelen at
 * /artikelen. See src/lib/article-sections.ts.
 *
 * Same three safeguards as Pages and Projects: drafts, a published-only read
 * rule, and read helpers that do not override access.
 *
 * `publishedAt` is the date shown to a reader and the one the list is sorted
 * by. It is not the same thing as `_status`, which is whether the article is
 * visible at all. Keeping them apart lets an editor write something today,
 * date it properly, and publish it whenever they are ready.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Bericht',
    plural: 'Nieuws & artikelen',
  },
  access: {
    read: isPublishedOrOwnCommission,
    create: isAdminOrEditor,
    // ROADMAP 2.8: an editor may change what their commission owns, and what
    // no commission owns.
    update: isEditorOfCommission,
    delete: isEditorOfCommission,
  },
  versions: {
    drafts: { validate: false },
    maxPerDoc: 50,
  },
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description:
      'Nieuws (wat er nu speelt) en artikelen (beschouwingen, interviews, achtergrond). Kies per bericht de rubriek.',
    preview: (doc) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''

      if (!slug) return null

      const section = doc?.section === 'nieuws' ? 'nieuws' : 'artikelen'
      const params = new URLSearchParams({
        path: articlePath({ section: section satisfies ArticleSection, slug }),
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
      localized: true,
      label: 'Adres van het bericht',
      admin: {
        position: 'sidebar',
        description:
          'Het deel van het webadres na /nieuws/ of /artikelen/. Wordt automatisch ingevuld vanuit de titel. Wijzig dit niet meer zodra het bericht online staat.',
      },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      label: 'Datum',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description:
          'De datum die bij het artikel staat en waarop het overzicht sorteert. Dit is iets anders dan gepubliceerd zijn.',
      },
    },
    {
      /*
       * Which overview the item appears in, and so its address. Required and
       * without a default, so nothing ends up in a rubriek by accident.
       */
      name: 'section',
      type: 'select',
      required: true,
      index: true,
      label: 'Rubriek',
      options: [
        { label: 'Nieuws — wat er nu speelt', value: 'nieuws' },
        { label: 'Artikelen — beschouwing, interview, achtergrond', value: 'artikelen' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Nieuws verschijnt op /nieuws, artikelen op /artikelen. Wijzig dit liever niet meer zodra het bericht online staat: het webadres verandert mee (het oude blijft wel doorverwijzen).',
      },
    },
    {
      /*
       * A fixed list rather than free text. These are the labels on the cards,
       * and a list keeps them consistent; free text produces "interview",
       * "Interview" and "Intervieuw" within a month.
       *
       * "Nieuws" and "Artikel" were options here until the rubriek above took
       * over that job; a label repeating the rubriek tells a reader nothing.
       */
      name: 'category',
      type: 'select',
      index: true,
      label: 'Soort',
      options: [
        { label: 'Interview', value: 'interview' },
        { label: 'Verslag', value: 'verslag' },
        // Both appear as pills in docs/design/10-nieuws-en-artikelen.png.
        { label: 'Project', value: 'project' },
        { label: 'Vrijwilliger', value: 'vrijwilliger' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Optioneel. Het label op de kaart.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Uitgelicht',
      admin: {
        position: 'sidebar',
        description:
          'Zet dit bericht groot bovenaan het overzicht van zijn rubriek. Is er meer dan één, dan wint het nieuwste.',
      },
    },
    {
      name: 'author',
      type: 'text',
      localized: true,
      label: 'Auteur',
      admin: { description: 'Wordt getoond als "Door ...". Optioneel.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Samenvatting',
      admin: { description: 'Een of twee zinnen. Wordt getoond op de kaart in het overzicht.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: 'Tekst',
    },
    {
      /*
       * Plain labels, not a collection. Tag pages are not in ROADMAP, and a
       * Tags collection would add an admin section for something nobody has
       * asked to browse by yet. It can become one when that changes.
       */
      name: 'tags',
      type: 'array',
      localized: true,
      label: 'Onderwerpen',
      labels: { singular: 'Onderwerp', plural: 'Onderwerpen' },
      maxRows: 6,
      fields: [{ name: 'label', type: 'text', required: true, label: 'Onderwerp' }],
    },
    commissionField,
  ],
}

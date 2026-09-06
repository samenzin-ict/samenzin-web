import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isPublic } from '@/access'

/**
 * Uploads: images used on the public site, and the PDF documents the ANBI
 * page has to publish.
 *
 * Alt text is required and has no default. WCAG 2.1 AA is a requirement
 * (CLAUDE.md rule 6) and an image without a description is unusable to
 * someone on a screen reader, so the field is mandatory at the point of
 * upload rather than checked later.
 *
 * Files are written to /media on disk in development. Production uses object
 * storage; see ARCHITECTURE.md.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Bestand',
    plural: 'Media',
  },
  access: {
    // Visitors have to be able to load the images on the public site.
    read: isPublic,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    group: 'Content',
    description: 'Afbeeldingen en documenten voor de website.',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    // Mobile first: the smallest size is the one most visitors receive.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1600,
        height: undefined,
        position: 'centre',
      },
      {
        // Open Graph images are a fixed size, so this one is cropped.
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: 'Alternatieve tekst',
      admin: {
        description:
          'Beschrijf wat er op de afbeelding te zien is, voor bezoekers die de afbeelding niet kunnen zien. Bij een document: waar het document over gaat.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: 'Bijschrift',
      admin: {
        description: 'Optioneel. Wordt zichtbaar onder de afbeelding getoond.',
      },
    },
  ],
}

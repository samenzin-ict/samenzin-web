import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

/**
 * Messages sent through the contact form.
 *
 * This is the only collection in phase 1 that holds personal data, so it is
 * treated accordingly:
 *
 * - Three fields and nothing more. ARCHITECTURE.md says the contact form
 *   stores the minimum, so there is no IP address, no user agent and no
 *   referrer. What we do not collect cannot leak and does not have to be
 *   handed over on a subject access request.
 * - Never publicly readable. Only an administrator can see, edit or delete a
 *   message.
 * - Creation is closed to the API. The public form writes through a server
 *   action that overrides access after validating, so nothing can be inserted
 *   by posting at /api/contact-submissions directly.
 *
 * Before this goes live it needs an entry in the processing register in the
 * samenzin-ict repository (ARCHITECTURE.md, "Privacy by design"), including
 * how long messages are kept. Nothing here deletes them automatically yet.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Bericht',
    plural: 'Berichten',
  },
  access: {
    // The public form does not use this path; see the note above.
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'handled', 'createdAt'],
    group: 'Mensen',
    description:
      'Berichten die via het contactformulier zijn binnengekomen. Deze bevatten persoonsgegevens: verwijder ze zodra ze zijn afgehandeld.',
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Naam',
      maxLength: 200,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'E-mailadres',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Bericht',
      maxLength: 5000,
    },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Afgehandeld',
      admin: {
        position: 'sidebar',
        description: 'Vink aan zodra iemand op dit bericht heeft gereageerd.',
      },
    },
  ],
}

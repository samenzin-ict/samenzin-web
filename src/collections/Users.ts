import type { CollectionConfig } from 'payload'

/**
 * Admin panel accounts.
 *
 * Two roles, deliberately few (ARCHITECTURE.md, "Access control"):
 *
 *   admin   everything, including users, settings and donations
 *   editor  create and edit content, nothing else
 *
 * A user holds one role rather than a list. The access matrix has two rows and
 * a single dropdown is far easier for a volunteer to read than a multi-select.
 * If per-commission permissions arrive in phase 2 this becomes a list, which is
 * a small migration on a table with a handful of rows.
 *
 * The role is saved to the JWT so access checks do not need a database read.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers & rollen',
  },
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Systeem',
    description:
      'Accounts voor het beheerpaneel. Beheerders kunnen gebruikers toevoegen en rollen wijzigen.',
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
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      label: 'Rol',
      options: [
        {
          label: 'Beheerder',
          value: 'admin',
        },
        {
          label: 'Redacteur',
          value: 'editor',
        },
      ],
      admin: {
        description:
          'Beheerder: volledige toegang, inclusief gebruikers en instellingen. Redacteur: alleen inhoud bewerken.',
      },
    },
  ],
}

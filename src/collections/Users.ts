import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrEditor, isAdminOrSelf } from '@/access'

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
  access: {
    // Who may open the admin panel at all.
    admin: isAdminOrEditor,
    create: isAdmin,
    delete: isAdmin,
    // Editors may see and edit themselves, so they can change their password.
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Systeem',
    description:
      'Accounts voor het beheerpaneel. Beheerders kunnen gebruikers toevoegen en rollen wijzigen.',
  },
  hooks: {
    beforeChange: [
      /**
       * Make the very first account an administrator.
       *
       * Without this the first user would be created with the default editor
       * role and nobody could ever administer the site, because only an
       * administrator can change a role.
       */
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data

        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          req,
        })

        if (totalDocs > 0) return data

        return { ...data, role: 'admin' }
      },
    ],
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
      access: {
        // An editor must not be able to promote themselves. Create is left
        // open so the first-user bootstrap above can set it.
        update: isAdminFieldLevel,
      },
      admin: {
        description:
          'Beheerder: volledige toegang, inclusief gebruikers en instellingen. Redacteur: alleen inhoud bewerken.',
      },
    },
  ],
}

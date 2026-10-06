import type { Block } from 'payload'

/**
 * The bestuur, as a row of portraits with a short biography each.
 *
 * It carries no names. The people come from the ANBI-gegevens, where the board
 * is already recorded because the Belastingdienst requires it, so a name is
 * spelled in one place and this page and /anbi cannot disagree about it
 * (ROADMAP 2.5).
 *
 * That also means this block says nothing about who is on the board. Adding a
 * member, changing a role or correcting a spelling happens once, under
 * ANBI-gegevens, and both pages follow.
 */
export const Board: Block = {
  slug: 'board',
  labels: {
    singular: 'Bestuur',
    plural: 'Bestuursblokken',
  },
  imageAltText: 'De bestuursleden met foto en korte biografie.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Kop',
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Inleiding',
      admin: {
        description: 'Een of twee zinnen boven de bestuursleden. Optioneel.',
      },
    },
  ],
}

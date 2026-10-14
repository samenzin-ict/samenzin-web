/**
 * The main menu, as the board agreed it on 2026-10-14.
 *
 * Shared by the demo seed and by scripts/apply-menu-and-homepage.ts, so a
 * fresh install and production show the same menu. After this it is
 * maintained in the admin panel, under Instellingen → Menu.
 *
 * Five items in the bar, the way https://stipstudenten.nl/ does it: what
 * belongs together sits in a submenu. Nieuws and Cursussen are listed but are
 * hidden by the header for as long as nothing is published there
 * (src/lib/navigation.ts). Lid worden is gone: membership is not requested
 * through the site (src/lib/membership.ts).
 */
export const MAIN_NAVIGATION = [
  {
    label: 'Over ons',
    children: [
      { label: 'Wie wij zijn', url: '/over-ons' },
      { label: 'ANBI', url: '/anbi' },
      { label: 'Nieuws', url: '/nieuws' },
    ],
  },
  { label: 'Projecten', url: '/projecten' },
  {
    label: 'Activiteiten',
    children: [
      { label: 'Agenda', url: '/agenda' },
      { label: 'Cursussen', url: '/cursussen' },
    ],
  },
  {
    label: 'Meedoen',
    children: [
      { label: 'Vrijwilliger worden', url: '/vrijwilligers' },
      { label: 'Doneren', url: '/doneren' },
    ],
  },
  { label: 'Contact', url: '/contact' },
]

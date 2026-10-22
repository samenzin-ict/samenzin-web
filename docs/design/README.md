# Design reference

Mockups approved by the board, exported from the website presentation. These define the
**visual language** of the platform: spacing, component shapes and interaction patterns.
Colours, typography and the logo come from the house style below, which supersedes the
mockups on those points.

> **They do not define scope.** Most of these screens belong to phase 2 or 3. What is in
> scope right now is in `ROADMAP.md`, and nothing else. Use these images to answer "how
> should this look", never to decide "what should I build next".

## House style

The media commission delivered the foundation's visual identity in October 2026. It
**replaces the colours and typography of the mockups**; the mockups still define layout,
spacing and component shapes.

| Source | What it settles |
|---|---|
| `docs/SamenZin_Visual_Identity_Guidelines.pdf` | Palette, typeface, logo use, graphic language |
| `docs/Stichting_Samenleving_en_Zingeving_Brand_Brief_NL.pdf` | Mission, personality, what to avoid |
| `docs/Logo/` | The logo files. `kleurpalette en font.png` is the one-page summary |

## Design tokens

The four base colours, from page 7 of the guidelines:

| Token | Hex | Use |
|---|---|---|
| Okergeel | `#D89B2F` | Call to action. Donate buttons, highlights, price labels |
| Terracotta | `#CC552F` | Accent. Focus ring, the petal motif. A darker step carries text (below) |
| Donkerblauw | `#1D2333` | Primary. Headings, hero backgrounds, footer, admin sidebar, secondary buttons |
| Wit | `#FFFFFF` | Cards and surfaces |

Derived values, because a role needs something the base four cannot give. Each is
explained in `src/styles/brand.css`:

| Token | Hex | Why |
|---|---|---|
| Crème | `#F7F4ED` | Page background. The ground the guidelines themselves are laid out on |
| Inkt | `#4A5163` | Running text. Navy lifted towards grey; 7.2:1 on crème |
| Terracotta donker | `#B4472A` | Links, badges, the stats bar. The base terracotta is 3.9:1 on crème and fails AA for text |

Two pairings are fixed by contrast, not taste: text on ochre is **navy**, never white
(white is 2.4:1), and text on terracotta uses the darker step.

**Typography** is one family for everything, Avenir in the guidelines: Heavy/Bold for
titles, Medium for subtitles and labels, Book for running text, small labels in capitals
with extra letter spacing. Avenir needs a paid web licence, so the site self-hosts
**Nunito Sans**, the closest open equivalent. See `src/fonts/README.md`.

Do not load fonts from a foreign CDN. Self-host them. This keeps the no-cookie-banner
position intact and avoids sending visitor IP addresses to third parties.

**The logo** is served from `src/assets/brand/`, generated from `docs/Logo/` by
`scripts/build-brand-assets.py`. The full logo is never shown narrower than 220 px; below
that the five-petal symbol stands alone (guidelines, page 9). On navy the white-wordmark
version is used. Never stretch, recolour, rotate or rebuild it from parts.

**Graphic language** (page 11): the drops of the symbol may be used as a motif, large and
quiet, at most one per composition, with terracotta as the accent.

## Component patterns visible in the mockups

- Generous white cards with soft rounded corners on a crème background
- Ochre filled buttons for the primary action, navy filled for the secondary, and a
  white outlined variant for tertiary; each has a defined hover state
- Pill-shaped filters and status labels, coloured when active and grey when inactive
- Date blocks on the left of event rows: day number over abbreviated month
- Progress bars for fundraising goals, terracotta on a light track
- Inline alert bars in ochre with an icon
- Forms with clear labels above the field, generous height, visible focus ring

## The screens

| File | Screen | Phase |
|---|---|---|
| `01-design-system.png` | Style card: colours, type, buttons, forms, cards, labels, alerts | Reference |
| `02-homepage-desktop.png` | Homepage, agenda block and footer | **1** |
| `03-homepage-mobile.png` | Homepage on a phone, with sticky donate bar | **1** |
| `04-doneren.png` | Donation page: one-off, monthly, five-year periodic gift | **1** |
| `05-agenda-overzicht-en-detail.png` | Events list with filters, and event detail | 2 |
| `06-projecten-overzicht-en-detail.png` | Projects grid, and project detail with funding progress | 2 |
| `07-vrijwilliger-aanmeldformulier.png` | Volunteer sign-up, four steps | 2 |
| `08-ledenportaal-mijn-taken.png` | Member area: tasks, courses, hours | 3 |
| `09-admin-panel-dashboard.png` | Admin dashboard and its sidebar structure | 2 |
| `10-nieuws-en-artikelen.png` | News overview and article detail | 2 |
| `11-sitemap.png` | Full site map, public, member area and admin, with phase bands | Reference |
| `12-schermenoverzicht.png` | All screens on one sheet | Reference |

## Two things the mockups get wrong on purpose

1. **The branding is placeholder.** The logo, the `[İSİM]` marker, the green-and-gold
   palette and the Cambria/Calibri type in the screenshots are stand-ins, now replaced by
   the house style above. The site name still comes from `SiteSettings`, never
   hardcoded, and an editor can override the header logo there.
2. **The body copy is filler.** Dutch text in the images is placeholder and in places
   grammatically wrong. Never copy it into the codebase. Real copy comes from the board
   through the CMS.

## Relationship to the admin panel

`09-admin-panel-dashboard.png` shows the intended grouping of the admin navigation:
Content, Mensen, Programma, Financieel, Systeem. Payload generates its own admin panel, so
this is not a screen to rebuild pixel by pixel — it is the **information architecture** to
follow when grouping collections and naming them in Dutch.

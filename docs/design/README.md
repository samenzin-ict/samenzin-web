# Design reference

Mockups approved by the board, exported from the website presentation. These define the
**visual language** of the platform: colours, typography, spacing, component shapes and
interaction patterns.

> **They do not define scope.** Most of these screens belong to phase 2 or 3. What is in
> scope right now is in `ROADMAP.md`, and nothing else. Use these images to answer "how
> should this look", never to decide "what should I build next".

## Design tokens

Taken directly from `01-design-system.png`. These are the approved values.

| Token | Hex | Use |
|---|---|---|
| Diep bosgroen | `#0B3B36` | Primary. Hero backgrounds, footer, admin sidebar, secondary buttons |
| Teal | `#14655C` | Accent. Stats bar, active states, badges, progress fills |
| Warm goud | `#CBA24A` | Call to action. Donate buttons, highlights, price labels |
| Crème | `#F7F4ED` | Page background |
| Wit | `#FFFFFF` | Cards and surfaces |
| Gedempt grijs | `#555555` | Body text |

Typography is a **serif for headings, sans-serif for body**. The mockups use Cambria and
Calibri, which are system fonts and not licensed for web distribution. Pick self-hosted
web equivalents that keep the same feel — a warm, readable serif with moderate contrast,
and a neutral humanist sans. Confirm the final choice with the media commission before
committing to it.

Do not load fonts from a foreign CDN. Self-host them. This keeps the no-cookie-banner
position intact and avoids sending visitor IP addresses to third parties.

## Component patterns visible in the mockups

- Generous white cards with soft rounded corners on a crème background
- Gold filled buttons for the primary action, dark green filled for the secondary, and a
  white outlined variant for tertiary; each has a defined hover state
- Pill-shaped filters and status labels, in green when active and grey when inactive
- Date blocks on the left of event rows: day number over abbreviated month
- Progress bars for fundraising goals, teal on light grey
- Inline alert bars in gold with an icon
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

1. **The branding is placeholder.** The logo, the `[İSİM]` marker and the `samenzin.nl`
   address in the screenshots are stand-ins. The real house style comes from the media
   commission. Build the layout so the logo is a swappable asset and the site name comes
   from `SiteSettings`, never hardcoded.
2. **The body copy is filler.** Dutch text in the images is placeholder and in places
   grammatically wrong. Never copy it into the codebase. Real copy comes from the board
   through the CMS.

## Relationship to the admin panel

`09-admin-panel-dashboard.png` shows the intended grouping of the admin navigation:
Content, Mensen, Programma, Financieel, Systeem. Payload generates its own admin panel, so
this is not a screen to rebuild pixel by pixel — it is the **information architecture** to
follow when grouping collections and naming them in Dutch.

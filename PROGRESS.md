# Progress

Working memory across sessions. Update this at the end of every session, before the last
commit. The next session starts by reading it.

Keep it short. This is a status board, not a diary.

---

## Current state

**Phase:** 1 — Live site
**Status:** The public site renders from the CMS. Layout, blocks, the ANBI page, the 404,
sitemap and robots are done. `/contact` and `/doneren` are the remaining routes and both
need a decision first.

Getting started is unchanged from `README.md`: `docker compose up -d`, `pnpm install`,
`pnpm dev`. The database starts empty, so `/admin` opens the "Eerste gebruiker" screen and
the first account you create becomes an administrator automatically.

## Done

- Next.js 16.3.4 + Payload 3.88.0 in one application, PostgreSQL 18 via Docker Compose
- Tailwind 4 and shadcn/ui, with the approved palette as tokens in
  `src/app/(frontend)/globals.css`. No colour literal appears in any component.
- Self-hosted Source Serif 4 and Source Sans 3, committed as woff2, 212 KB total
- `Users` with `admin` and `editor` roles, Dutch labels, first account promoted to admin
- `src/access/` — `isAdmin`, `isAdminFieldLevel`, `isAdminOrEditor`, `isAdminOrSelf`,
  `isPublic`
- `Media` with required alt text, four image sizes, images and PDF
- `SiteSettings` and `AnbiGegevens` globals, the latter with the statutory ANBI fields
- `Pages` with slug, SEO fields and a block body: Hero, RichText, CallToAction
- Admin sidebar grouped in Dutch; the panel's own chrome is Dutch too
- Localization enabled, `nl` the only locale, `localized` set on the right fields
- Header, footer, mobile menu, skip link and the sticky mobile donate bar, all from
  `SiteSettings`
- React components for the three blocks, with an exhaustive dispatcher
- Routes: `/` (home), `/<slug>` for CMS pages, `/anbi`, and a branded 404 at any depth
- `sitemap.xml`, `robots.txt`, Open Graph tags and title templates
- `src/i18n/` for interface strings, so no Dutch is hardcoded in a component

Verified on a rebuilt database: `pnpm dev` runs, `/admin` loads, the first user is created
and becomes an administrator, the public routes render from the CMS, and `pnpm build`,
`pnpm lint` and `pnpm typecheck` all pass. The production build also succeeds with the
database stopped, which is the situation in GitHub Actions.

## In progress

- Nothing half-done. The session ended on a clean tree.

## Next up

1. `/contact` — needs a decision, see below. The page itself already works as a CMS page;
   what is missing is the form.
2. `/doneren` — needs a decision, see below
3. Cookieless analytics — needs a decision, see below
4. Lighthouse pass on mobile once there is real content to measure
5. A real database migration before the first deployment

## Needs a decision before it can be finished

- [ ] **Media commission must confirm the fonts.** Source Serif 4 and Source Sans 3 are
      installed as the closest self-hostable equivalents to Cambria and Calibri.
      `docs/design/README.md` asks for their sign-off.
- [ ] **Four derived colour tints** are marked in `globals.css` as interpolated from the
      mockups (button hover fills, hairline borders). They are not part of the approved
      palette and need confirming.
- [ ] **No draft or published state on pages.** Anything an editor saves is immediately
      live. Editorial workflow is phase 2 in `ROADMAP.md`, so it was deliberately not
      built, but a volunteer can currently publish a half-finished page. Worth deciding
      whether a minimal published checkbox is wanted before launch.
- [ ] **`Donations` is not modelled yet.** `ARCHITECTURE.md` lists it in the phase 1
      content model; it was not in this session's scope and waits for the Mollie work.
- [ ] **The contact form is not built.** It collects personal data, which `CLAUDE.md`
      says to ask about first. It also needs an entry in the processing register in
      `samenzin-ict` before it goes live, and spam handling that does not involve a
      third-party tracker.
- [ ] **`/doneren` is not built.** It touches payments, which `CLAUDE.md` says to ask
      about first, and Mollie cannot be registered until the bank account exists.
- [ ] **No analytics yet.** `ARCHITECTURE.md` asks for cookieless aggregate analytics.
      Every option is a second service in the deployment, which `CLAUDE.md` says to ask
      about first.
- [ ] **Social media icons are text labels, not brand icons.** `lucide-react` 1.x removed
      every brand icon for trademark reasons. The mockup draws icons; shipping the marks
      ourselves means taking on their licensing.

## Open questions for the maintainer

- [ ] Is the foundation's bank account open, and can Mollie be registered yet?
- [ ] KVK number and RSIN for the ANBI page
- [ ] Board members: names and roles for the ANBI page
- [ ] Logo and final font sign-off from the media commission
- [ ] Canonical domain: `.org` or `.nl`

## Decisions taken during implementation

Record anything a future maintainer would otherwise have to reverse-engineer. If it is
significant, write a proper ADR in the `samenzin-ict` repository and link it here.

| Date | Decision | Why |
|---|---|---|
| 2026-09-06 | Gold call-to-action buttons use forest-green text, not the white drawn in the mockups | White on `#CBA24A` is 2.4:1 and fails WCAG 2.1 AA. Forest green is 5.2:1 and passes. Confirmed with the maintainer; CLAUDE.md rule 6 takes precedence over the mockup. |
| 2026-09-06 | Fonts are committed as woff2 rather than fetched by `next/font/google` | Both a CDN and a build-time fetch make the project depend on a third party. Committing removes it and keeps the no-cookie-banner position. |
| 2026-09-06 | One `role` per user instead of a list of roles | The access matrix has two rows. A single dropdown is easier for a volunteer; moving to a list later is a small migration on a tiny table. |
| 2026-09-06 | The whole page `body` is localized, not each field inside it | Lets a future locale lay a page out differently, and covers blocks added later without another migration. |
| 2026-09-06 | SEO handled with three plain fields, not `@payloadcms/plugin-seo` | Avoids a dependency for something this small. Revisit if editors want search-result previews. |
| 2026-09-06 | `AnbiGegevens` keeps its own contact details rather than reusing `SiteSettings` | The statutory contact is the address registered with the KVK and may be a postal address, not the visiting address on the contact page. |
| 2026-09-06 | Admin sidebar shows Financieel after Systeem, not before | Payload orders nav groups by first appearance, collections before globals, with no ordering option. Replacing the Nav component is not worth maintaining across upgrades. |
| 2026-09-06 | Next.js telemetry disabled in the package scripts | Consistent with the privacy-by-design position in ARCHITECTURE.md. |
| 2026-09-06 | Public routes are `force-dynamic` | The container image is built where the database is unreachable, so prerendering would fail the build. It also means an edit is live as soon as a volunteer saves. |
| 2026-09-06 | The page route is a catch-all, not a single segment | A URL of any depth then gets the site's own 404 instead of Next's unbranded built-in page. |
| 2026-09-06 | `/anbi` is a fixed route, not a CMS page | Dutch tax law prescribes the fields, so a volunteer should not be able to omit or reorder them. `anbi` is a reserved slug so a page cannot shadow it. |
| 2026-09-06 | `robots.ts` and `sitemap.ts` live at `src/app`, outside the route group | Inside the group the catch-all answered `/robots.txt` first and served an HTML 404. |
| 2026-09-06 | A gold button inside the gold call-to-action band is remapped to green | Gold on gold is invisible and an editor has no way to see that from the admin panel. |

## Notes for whoever is next

- **Do not trust training data for Payload APIs.** Payload 3 differs a lot from Payload 2.
  Check the current docs, as CLAUDE.md says.
- `src/blocks/` holds Payload block *configs*. Their React components belong in
  `src/components/blocks/`, as `ARCHITECTURE.md` describes. `ARCHITECTURE.md` does not
  mention `src/blocks/` yet and should be updated.
- The database uses Payload's dev push. Before the first deployment, generate a real
  migration with `pnpm payload migrate:create` and commit it.
- `scripts/build-fonts.sh` regenerates the webfonts. It is only needed if the character
  coverage has to change.
- The homepage is the page whose slug is `home`. Without it the site shows a short note
  pointing at the admin panel rather than a 404.
- Interface strings live in `src/i18n/locales/nl.ts`. Content lives in the CMS. If a
  component needs a Dutch word, it goes in the locale file (`CLAUDE.md` rule 5).
- There is no seed script. A fresh database gives an empty site; create a page with the
  slug `home` and fill in Instellingen to see the layout with content.

# Progress

Working memory across sessions. Update this at the end of every session, before the last
commit. The next session starts by reading it.

Keep it short. This is a status board, not a diary.

---

## Current state

**Phase:** 1 — Live site
**Status:** Local development environment runs. Content model and design tokens are in
place. No public pages yet.

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

Verified on a rebuilt database: `pnpm dev` runs, `/admin` loads, the first user is created
and becomes an administrator, `pnpm build`, `pnpm lint` and `pnpm typecheck` all pass.

## In progress

- Nothing half-done. The session ended on a clean tree.

## Next up

1. Layout: header, navigation, footer, mobile menu, using `SiteSettings`
2. React components for the three blocks in `src/components/blocks/`
3. The six phase 1 routes
4. Sitemap, robots, Open Graph tags, 404 page
5. Cookieless analytics
6. Mollie donation flow

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

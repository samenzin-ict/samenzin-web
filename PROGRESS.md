# Progress

Working memory across sessions. Update this at the end of every session, before the last
commit. The next session starts by reading it.

Keep it short. This is a status board, not a diary.

---

## Current state

**Phase:** 1 — Live site
**Status:** All six phase 1 routes are built, the initial migration exists and the
production image builds and runs. The remaining work before launch is content, a privacy
statement, the deployment target and a Lighthouse pass — not features.

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
- `/contact` with a working form, storing name, email and message and nothing else
- `/doneren` in the agreed disabled state, with no inert form controls
- Rate limiting on the contact form, five per caller per ten minutes, IP never stored
- The initial database migration, covering all 34 tables
- A production Dockerfile and a CI workflow that lints, type checks and builds
- Two more blocks, Kaartenrij and Agenda, so the homepage matches the approved mockup
- `pnpm seed` fills an empty database with obviously fake demo content
- The admin panel carries the brand colours; the palette now lives in one file that both
  the public site and the admin read

Verified on a rebuilt database: `pnpm dev` runs, `/admin` loads, the first user is created
and becomes an administrator, the public routes render from the CMS, and `pnpm build`,
`pnpm lint` and `pnpm typecheck` all pass. The production build also succeeds with the
database stopped, which is the situation in GitHub Actions.

## In progress

- Nothing half-done. The session ended on a clean tree.

## Next up

1. **Write the privacy statement.** This is a launch blocker, see below.
2. Fill in Instellingen and create the pages: `home`, `over-ons`, `contact`, `doneren`,
   `privacyverklaring`. The site is empty until someone does.
3. Decide the canonical domain, the registry and the VPS, then finish the deploy
   workflow. The image is built in CI but not pushed, because none of those are settled.
4. Caddy configuration and TLS, and the nightly encrypted database dump
5. Lighthouse pass on mobile once there is real content to measure

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
- [ ] **The privacy statement does not exist. This blocks launch.** The contact form now
      collects personal data and links to `/privacyverklaring`, which returns 404 until
      someone creates a page with that slug. Do not put the contact form in front of the
      public before that page exists. The text has to describe what the foundation
      actually does with the data, so it cannot be written from the code.
- [ ] **The contact form needs a processing register entry** in `samenzin-ict` before it
      goes live, including how long messages are kept. Nothing deletes them automatically.
- [ ] **Contact messages are visible to administrators only.** If a volunteer with the
      editor role is meant to answer them, that needs a deliberate decision, because the
      messages contain personal data.
- [ ] **Rate limiting is per process and in memory.** Fine for one container on one VPS.
      If the deployment ever runs more than one instance, each will allow the limit
      separately and it must move to the database or in front of the application.
- [ ] **Analytics deliberately skipped.** Neither the ANBI application nor Google for
      Nonprofits needs it, and every option adds a service to the deployment. Revisit
      after launch.
- [ ] **Social media icons are text labels, not brand icons.** `lucide-react` 1.x removed
      every brand icon for trademark reasons. The mockup draws icons; shipping the marks
      ourselves means taking on their licensing.

## Open questions for the maintainer

- [ ] Is the foundation's bank account open, and can Mollie be registered yet?
- [ ] KVK number and RSIN for the ANBI page
- [ ] Board members: names and roles for the ANBI page
- [ ] Logo and final font sign-off from the media commission
- [ ] Container registry and VPS: not arranged yet, so CI builds the image but cannot
      push or deploy

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
| 2026-09-06 | The contact form stores name, email and message and nothing else | ARCHITECTURE.md asks for the minimum. No IP address, user agent or referrer: what is not collected cannot leak. |
| 2026-09-06 | Contact submissions are closed to public creation; the form writes through a server action with access overridden | Nothing can be inserted by posting at the REST endpoint, and validation cannot be bypassed. |
| 2026-09-06 | Spam is handled with a honeypot, not a CAPTCHA | reCAPTCHA and hCaptcha are third-party trackers. CLAUDE.md rule 4 rules them out, and they would force a cookie banner. |
| 2026-09-06 | `/doneren` ships with no amount picker at all, rather than inert controls | Drawing the form from the mockup and leaving it dead would waste the goodwill of someone who came to give. |
| 2026-09-06 | Rate limiting lives in the application, not in Caddy | Caddy has no rate limiting in a standard build, so doing it there would mean maintaining a custom Caddy image. The in-app limiter adds nothing to the deployment. |
| 2026-09-06 | The rate limiter hashes the caller's IP and keeps only the hash, in memory | ARCHITECTURE.md asks the contact form to keep the minimum. An address we cannot reverse is the least we can work with while still counting requests. |
| 2026-09-06 | `push` is on in development and off in production | A deploy then makes exactly the schema change that was reviewed, and it can be rolled back. |
| 2026-09-06 | The container does not run migrations on start | A failed migration should stop a deploy, not restart-loop the live site. |
| 2026-09-06 | Canonical domain is `samenzin.org` | The `.org` is bought; `.nl` was not taken. This is the value for `NEXT_PUBLIC_SERVER_URL` at build time. |
| 2026-09-06 | Homepage projects and agenda are blocks, not collections | Projecten and Agenda are phase 2. A curated row on the homepage is not, and blocks let the mockup be reproduced without pulling the content platform forward. |
| 2026-09-06 | The palette moved to `src/styles/brand.css` | The admin panel does not use Tailwind, so branding it would have meant writing the six approved values a second time. |
| 2026-09-06 | CI builds without a database | Every public route is force-dynamic, so the build must not need PostgreSQL. CI fails instead of the deploy if that changes. |

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
- `pnpm seed` fills an empty database with obviously fake demo content, including a
  placeholder privacy statement that says in capitals that it must not go live. It never
  touches users, so nobody's admin account is lost. Demo content only: never run it
  against production, and it refuses to when NODE_ENV is production.
- The admin panel will not look like `docs/design/09-admin-panel-dashboard.png`. Payload
  generates it, and `docs/design/README.md` asks for the information architecture rather
  than a rebuild. The grouping, the Dutch labels and the brand colours match; the
  dashboard widgets in the mockup are phase 2 and 4 reporting.
- `/anbi`, `/contact` and `/doneren` are fixed routes. Each still renders the blocks of a
  CMS page with the matching slug above its own content, so an editor can add an
  introduction without touching code.
- The honeypot constant lives in its own module, not in `actions.ts`. A `'use server'`
  file may only export async functions; exporting it from there left it undefined on the
  client, so the field rendered with no name and the check never fired.
- `NEXT_PUBLIC_SERVER_URL` is inlined into the bundle at build time, not read when the
  container starts, so it is a Docker build argument. See `README.md`.
- After changing a collection or a global, run `pnpm payload migrate:create` and commit
  the result. Development pushes the schema automatically, so it is easy to forget and
  only notice on deploy.

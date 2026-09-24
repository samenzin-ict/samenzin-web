# Progress

Working memory across sessions. Update this at the end of every session, before the last
commit. The next session starts by reading it.

Keep it short. This is a status board, not a diary.

---

## Current state

**Phase:** 3 — Member portal. 3.1, 3.2 and the 3.4 catalogue are done. Phases 1 and 2 are
built apart from 2.5 and 2.7, which the maintainer chose to skip.
**Deployment:** Vercel, Neon PostgreSQL (branches `production` and `dev`) and Cloudflare
R2 for media, replacing the EU VPS plan. See `docs/environments.md`.
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
- Vercel deployment: Cloudflare R2 for uploads, migrations in `vercel-build`, functions
  pinned to `fra1`, and rate limiting moved onto Payload's database-backed key-value store
- `docs/environments.md` documents local, preview and production, every variable, and how
  content is copied down with `pnpm db:pull`
- Branded error pages: `error.tsx` for a page that throws, `global-error.tsx` for the root
  layout failing, which is what an unreachable database causes
- `Donations` collection and the Mollie one-off flow, behind the disabled state until the
  bank account exists
- ROADMAP 2.1: drafts and publishing on `Pages`, with preview on the real site behind a
  secret and a session, and a banner so an editor knows what they are looking at
- ROADMAP 2.2: `Projects`, with `/projecten` and `/projecten/<slug>`, a fundraising bar,
  the facts row and the closing call to action from the mockup
- ROADMAP 2.3: `Articles`, with `/nieuws` and `/nieuws/<slug>`, a featured lead card,
  bylines, topics and a "meer lezen" row
- ROADMAP 2.4: `Events`, with `/agenda`, `/agenda/<slug>` and working filters. The
  homepage agenda block now reads the next events instead of a hand-typed list
- ROADMAP 3.4 (first half): the public course catalogue at `/cursussen` and
  `/cursussen/<slug>`. Enrolment waits on 3.2
- ROADMAP 2.6: `/vrijwilligers` with an intake form. Four fields, six-month retention,
  readable by administrators and the vrijwilligers commission only
- ROADMAP 2.8: per-commission permissions. An editor changes what their commission owns
  and what no commission owns; an administrator changes anything
- Two more blocks, Kaartenrij and Agenda, so the homepage matches the approved mockup
- `pnpm seed` fills an empty database with obviously fake demo content
- The admin panel carries the brand colours; the palette now lives in one file that both
  the public site and the admin read
- `Courses` and the public catalogue at `/cursussen` (3.4). Enrolment is not built.
- `MembershipApplications` and the form at `/lid-worden` (3.1). Administrators only,
  three fields, an explicit approval step, six-month retention that an approval clears.
  Nothing emails the applicant, because there is still no email adapter.
- `Members` with their own login, and Mijn omgeving at `/mijn` (3.2): login, overview,
  contact details the member maintains, and a password change. Approving an application
  creates the member. Members cannot reach the admin panel: `admin.user` names `users` as
  the only collection Payload lets in.
- `src/access/userCollections.ts`, which every role rule now goes through. Adding a second
  auth collection broke two rules that were correct while `users` was the only one; both
  are described there and both are covered by the checks below.

Verified on a rebuilt database: `pnpm dev` runs, `/admin` loads, the first user is created
and becomes an administrator, the public routes render from the CMS, and `pnpm build`,
`pnpm lint` and `pnpm typecheck` all pass. The production build also succeeds with the
database stopped, which is the situation in GitHub Actions.

## In progress

- Nothing half-done. The session ended on a clean tree.

## Next up

1. **Write the privacy statement.** This is a launch blocker, see below. It now has to
   cover three forms: contact, volunteer applications and membership applications.
2. **An email adapter.** This now blocks more than password resets: a new member cannot
   receive their own login. See below.
3. Fill in Instellingen and create the pages: `home`, `over-ons`, `contact`, `doneren`,
   `privacyverklaring`. The site is empty until someone does.
4. Set `PREVIEW_SECRET` in Vercel for Production and Preview, then redeploy
5. Decide the backup arrangement for Neon, see below
6. Lighthouse pass on mobile once there is real content to measure

## Needs a decision before it can be finished

- [ ] **Media commission must confirm the fonts.** Source Serif 4 and Source Sans 3 are
      installed as the closest self-hostable equivalents to Cambria and Calibri.
      `docs/design/README.md` asks for their sign-off.
- [ ] **Four derived colour tints** are marked in `globals.css` as interpolated from the
      mockups (button hover fills, hairline borders). They are not part of the approved
      palette and need confirming.
- [ ] **Commissions scope changing content, not reading it.** Every editor can still see
      every document in the admin panel; they cannot alter one another's. Hiding them from
      the list as well is a change to `read`, which also governs the public site, so it
      needs care rather than a quick edit.
- [ ] **Every collection added from here needs the same three things** as `Pages` and
      `Projects`: `versions.drafts`, the published-only read rule, and `overrideAccess:
      false` in its read helper. The third is the one that is easy to forget and silently
      serves drafts to the public.
- [ ] **Event capacity and remaining places are typed in by hand**, like the project
      funding figures, because the site takes no registrations. Whoever runs an event has
      to keep them current or leave them empty.
- [ ] **Project funding figures are typed in by hand.** They are not derived from
      `Donations`, because a gift can be earmarked in ways the website never sees and a
      bank transfer never passes through it at all. Someone has to keep them current.
- [ ] **The donation page cannot yet be told which project to fund.** The mockup's
      "Doneer aan dit project" links to `/doneren` without preselecting anything. Wiring
      the fund dropdown to published projects is small and worth doing with the Mollie
      work.
- [ ] **The Mollie flow has never talked to Mollie.** The collection, the start action,
      the webhook and the form are built and the disabled state still works, but no
      request has reached Mollie because there is no account. Before switching it on:
      create the payment with a test key, confirm the webhook is reachable from the
      internet, and check a record moves from `open` to `paid`.
- [ ] **`MOLLIE_WEBHOOK_URL` must be set in production**, to
      `https://samenzin.org/api/mollie-webhook`. Without it Mollie never calls back and
      every donation stays `open` regardless of whether it was paid.
- [ ] **Donations hold personal data** and need a processing register entry in
      `samenzin-ict`, including how long records are kept.
- [ ] **No email adapter, and from 3.2 this blocks getting a member their login.**
      Payload writes mail to the console, so there is no invitation, no password reset and
      no "forgotten password". Today an administrator opens the member in the admin panel,
      sets a password and passes it on themselves; the login form says so in as many
      words. Configuring an adapter means adding a service to the deployment, which
      CLAUDE.md says to ask about first, so it is a decision rather than a task.
- [ ] **Members hold personal data** — name, e-mail, telephone and address — and need a
      processing register entry in `samenzin-ict`, with a retention tied to the end of the
      membership. Note that nothing deletes an ended member: `status` goes to `beeindigd`
      and the record stays until somebody removes it.
- [ ] **Nobody has logged into Mijn omgeving with a real account yet.** The flow is
      verified end to end against a test member that was created and then deleted; the
      first real member is still a manual step for an administrator.
- [ ] **The ANBI page still needs three values before it can go live:** e-mailadres,
      telefoonnummer and IBAN. `pnpm check:anbi` reports them as aandachtspunten. The
      guide lists them as outstanding too.
- [ ] **The real ANBI content is not in the repository** and must not be: it carries the
      board members' names and the postal address. The loader lives in `.devseed/`, which
      is gitignored. Keep a copy outside git; if it is lost, it can be rebuilt from
      `docs/ANBI_guide.docx`.
- [ ] **Production content is placeholder apart from the ANBI page.** `Voorbeeldtekst`,
      `voorbeeld@example.org` and invented project names are publicly visible. Replace
      them before the site is announced, and before the contact form faces the public.
      The seeded privacy statement says in capitals that it is not valid.
- [ ] **The privacy statement does not exist. This blocks launch.** The contact form now
      collects personal data and links to `/privacyverklaring`, which returns 404 until
      someone creates a page with that slug. Do not put the contact form in front of the
      public before that page exists. The text has to describe what the foundation
      actually does with the data, so it cannot be written from the code.
- [ ] **The contact form needs a processing register entry** in `samenzin-ict` before it
      goes live, including how long messages are kept. Nothing deletes them automatically.
- [ ] **Volunteer and membership applications need processing register entries too**,
      before either form faces the public. Both keep records six months, enforced by
      `pnpm prune:applications`, but nothing runs it yet: point a scheduled job at it, or
      it stays a manual chore somebody has to remember. Note the difference to write down:
      an approved membership application is kept indefinitely, because it is the record
      that a membership was granted. That needs its own line in the register, with a
      retention tied to the membership rather than to a date.
- [ ] **Contact messages have no retention mechanism**, unlike volunteer applications.
      Worth giving them the same `deleteAfter` treatment.
- [ ] **Contact messages are visible to administrators only.** If a volunteer with the
      editor role is meant to answer them, that needs a deliberate decision, because the
      messages contain personal data.
- [ ] **Backups are not arranged.** The VPS plan had a nightly encrypted dump shipped to
      a different provider. Neon keeps point-in-time history, which is not a copy held
      somewhere else. Decide what is acceptable before real donor data exists.
- [ ] **ADR-0003 in `samenzin-ict` still describes the VPS** and needs rewriting to match
      the move to Vercel. `ARCHITECTURE.md` here has been updated.
- [ ] **Preview deployments share whatever `DATABASE_URI` the Preview environment has.**
      Point it at a Neon branch, or a pull request will migrate the live database.
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
| 2026-09-12 | Production moved from an EU VPS to Vercel with Neon | The maintainer's decision. Brings Blob storage for uploads, migrations in the build, and no shared memory between instances. |
| 2026-09-12 | `output: standalone` is switched off on Vercel | Vercel does its own output tracing and expects `.next/next-server.js.nft.json`, which standalone never produces. The setting stays for the Docker image. |
| 2026-09-12 | Rate limiting moved to Payload's key-value store | Serverless gives every invocation a fresh instance, so an in-memory counter would let each one allow the whole quota. |
| 2026-09-12 | Cloudflare R2 instead of Vercel Blob | The maintainer's choice. Files are served straight from the bucket, so images cost no function invocations. |
| 2026-09-12 | One R2 bucket shared by every environment, with no per-environment prefix | Payload stores each file's path with the document, so an environment prefix would make a database copied from production point at paths that do not exist. One namespace means `pnpm db:pull` works without copying files. |
| 2026-09-12 | A new environment is filled by running the seeders against it, not by pushing a database | Keeps the one-way rule intact. `pnpm seed` refuses a non-local database unless `SEED_ALLOW_REMOTE` is set, and prints the host first. |
| 2026-09-12 | `pnpm db:pull` exists; there is no `db:push` | Schema travels upward as a reviewed migration, content downward as a dump. A script that overwrote production content from a laptop is a bad thing to have lying around. |
| 2026-09-12 | Functions pinned to `fra1` | Keeps requests inside the EU, which is what the privacy section of ARCHITECTURE.md assumes. |
| 2026-09-22 | Donations are one-off only; monthly and five-year gifts wait for ROADMAP 3.3 | Recurring needs a mandate, and a signed mandate has legal weight. Phase 1 in ROADMAP.md is iDEAL one-off. |
| 2026-09-22 | A donation record is created before the visitor leaves, and only the webhook may mark it paid | The return URL proves nothing; anyone can open it. ARCHITECTURE.md: webhook plus a server-side re-fetch is the only source of truth. |
| 2026-09-22 | Anonymous donations store no name or e-mail at all | Same reasoning as the contact form: what is not collected cannot leak. The form hides the fields and the action refuses to store them. |
| 2026-09-24 | The course catalogue shipped without enrolment | ROADMAP always allowed this, and enrolment needs a member identity, which is 3.2 and still undecided. "Aanmelden" is a link, as it is for events. |
| 2026-09-24 | The volunteer form collects four fields and no more | Agreed with the maintainer. No telephone, date of birth or VOG status: the coordinator gathers what they need in conversation, and what is not collected cannot leak. |
| 2026-09-24 | Volunteer applications are kept six months | Agreed with the maintainer. `deleteAfter` is written on arrival and shown in the list, and `pnpm prune:applications` acts on it, so the retention is a mechanism rather than a promise. |
| 2026-09-24 | Volunteer applications are readable by the vrijwilligers commission, not every editor | A coordinator should not need an administrator account to do their job, and no other editor has business reading applicants' details. |
| 2026-09-24 | Content with no commission stays editable by every editor | Everything written before commissions existed has no commission. Locking it to administrators would have turned a permissions feature into an outage. |
| 2026-09-24 | The commission rule returns a query constraint, not a boolean | Payload folds it into the query, so content owned by another commission is never fetched. A boolean would have to load the document first and be repeated in every list, count and bulk operation. |
| 2026-09-24 | An editor may only assign content to a commission they belong to | Without it the scoping would be advisory: anyone could reassign a document to themselves and then edit it. |
| 2026-09-23 | Agenda filters are links and a GET form, with no JavaScript | The agenda stays filterable on a slow connection and before hydration, and every filtered view gets its own address that can be bookmarked and shared. Filtering on change would be slicker and would lose both. |
| 2026-09-23 | Filter dropdowns are built from the events that exist, not a fixed taxonomy | A dropdown can then never offer a choice that returns nothing, and nobody had to invent categories for a programme that is still taking shape. |
| 2026-09-23 | An agenda block with no `source` keeps its hand-typed list | Defaulting old blocks to automatic would have silently emptied any homepage already filled in by hand. New blocks default to automatic. |
| 2026-09-23 | The website takes no event registrations | Sign-ups are personal data and need a processing register entry first. "Aanmelden" is a link the organiser points wherever they like. |
| 2026-09-23 | Article topics are plain labels, not a Tags collection | Tag pages are not in ROADMAP, and a collection would add an admin section for something nobody has asked to browse by. It can become one when that changes. |
| 2026-09-23 | "Meer lezen" picks the newest other articles, not ones matching on topic | Matching on subject looks cleverer and regularly returns nothing, which is worse than showing something recent. |
| 2026-09-23 | `publishedAt` is separate from `_status` | One is the date a reader sees and the list sorts by; the other is whether it is visible at all. Keeping them apart lets an editor date something properly and publish when ready. |
| 2026-09-23 | The project title sits below the banner, not over it as the mockup draws | The image is chosen by an editor, so contrast over it cannot be guaranteed, and WCAG 2.1 AA is a hard rule. Same reasoning as the gold button's text colour. |
| 2026-09-23 | The fundraising bar is `aria-hidden`; the amounts beside it are the accessible text | "62 percent" tells a screen reader user less than "EUR 2.000 of EUR 5.000 raised", and announcing both says it twice. |
| 2026-09-22 | Read helpers pass `overrideAccess: false` | The Payload local API skips access control by default, so without it every draft would have been served to the public. This is what makes the published-only rule actually apply. |
| 2026-09-24 | Members will be a separate collection with their own login, not Payload users | The maintainer's call. A member then has no path into the admin panel, so no access-rule mistake can promote one to editor. Costs a second auth surface in 3.2. |
| 2026-09-24 | Mijn omgeving uses its own session cookie, not Payload's | Payload names the cookie `${cookiePrefix}-token` with no collection in it, so `users` and `members` would share one: logging in to the portal would log a board member out of the admin panel, and logging out of one would end both. The member token is held separately and handed back through the `Authorization: JWT` header. |
| 2026-09-24 | Every role rule goes through `isAdminPanelUser` | With two auth collections, "anyone signed in" included members, and a rule comparing ids alone matched across tables. Both were verified to be real, not theoretical: before the fix a member could read draft pages, and `isAdminOrSelf` returned `{id:{equals:7}}` for member 7 on the `users` collection. |
| 2026-09-24 | The session is checked in a layout, not in middleware | Verifying a Payload token means reaching the database, which middleware is the wrong place for. Every route inside `(beveiligd)` inherits the layout, so a page added later is protected by existing rather than by somebody remembering. |
| 2026-09-24 | A member cannot change their own e-mail address | It is the login. Without the ability to send a confirmation, one typo would lock a member out of their own account for good. |
| 2026-09-24 | Approval creates the member with a random password | An auth account needs a password, and there is no e-mail to send an invitation or a reset link. A random one nobody holds is safer than a predictable one or an account anybody could claim; an administrator sets a real one and passes it on. |
| 2026-09-24 | The portal shows only the tabs that exist | The mockup has taken, cursussen and evenementen as well. Those are 3.4 and 3.5. A tab that leads nowhere is worse than one that is not there yet, and `PortalNav` takes a list so each is one entry when it arrives. |
| 2026-09-24 | The membership form asks for name, e-mail and motivation only | Address, date of birth and bank details are needed to administer a membership, not to decide on one. Asking everybody means holding them for people who are turned down. |
| 2026-09-24 | Membership applications are administrators only | Granting membership is a board decision and no commission owns it. Volunteer applications got their own rule because there is a commission for them; there is none for members. |
| 2026-09-24 | Approving an application clears its delete-by date | An approved application is the evidence a membership was granted, so it must not be pruned. Clearing on approval rather than only setting on creation means one approved in month five does not vanish in month six. |
| 2026-09-24 | `prune:applications` skips records with no `deleteAfter` | It queries `exists: true` as well as the date, so "keep this" is expressed by the absence of a date rather than by a special case in the script. |
| 2026-09-22 | The drafts migration publishes rows that already existed | Postgres backfills a new column with its default, so `_status` would have been `draft` everywhere and every live page would have vanished. Hand-added `UPDATE`, marked as such in the migration. |
| 2026-09-22 | Preview needs a secret **and** a Payload session | The secret travels in a URL, and URLs reach browser history, chat messages and logs. On its own it is not a credential. |
| 2026-09-22 | Two error boundaries, not one | `error.tsx` renders inside the layout, so it cannot catch the layout failing. An unreachable database takes down the layout, which is the failure most likely in production. |
| 2026-09-12 | The ANBI page follows `docs/ANBI_guide.docx` exactly, including its order | The Belastingdienst prescribes what must appear. Publishing it is condition 12 of twelve; if the page is wrong the application can be refused on that ground. |
| 2026-09-12 | No full beleidsplan PDF on the site | The guide decided only the hoofdlijnen are published, which is also all the legislation asks for. The `policyPlanDocument` upload field was removed. |
| 2026-09-12 | "Laatst bijgewerkt" comes from the record's own `updatedAt` | The guide requires it to change on every update. Deriving it means it cannot be forgotten or drift from reality. |
| 2026-09-12 | The footer link to /anbi is permanent, not a configurable footer column | Linking the page from the site is a statutory requirement, so an editor rearranging the footer must not be able to remove it. |
| 2026-09-12 | Pre-deployment migrations squashed into one | Drizzle prompts interactively when a column is dropped while others are added, which blocks a non-interactive run. Nothing had been deployed, so one clean initial migration is honest and avoids the prompt entirely. |
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
- `pnpm check:anbi` verifies the ANBI page against `docs/ANBI_guide.docx` while the site
  is running: the ten items the Belastingdienst requires, the technical conditions, and
  the claims that may not be made while the status is only applied for. It exits non-zero
  when something mandatory is missing, so it can gate a deploy.
- `docs/ANBI_guide.docx` is deliberately **not** in git. It carries the board members'
  full names and the postal address, and `CLAUDE.md` rule 2 keeps personal data out of
  the repository. `.gitignore` blocks `docs/*.docx`, `*.doc` and `*.pdf` so it cannot be
  committed by accident. The content belongs in the CMS.
- If `pnpm dev` hangs with every request timing out, look at the top of the dev log. In
  development Payload pushes the schema on boot, and when a column is dropped while
  others are added Drizzle asks on stdin whether it is a rename. It waits forever and the
  app never finishes starting. Answer it in a terminal, or reset the development database.
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

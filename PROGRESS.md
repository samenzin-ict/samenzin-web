# Progress

Working memory across sessions. Update this at the end of every session, before the last
commit. The next session starts by reading it.

Keep it short. This is a status board, not a diary.

---

## Current state

**Phase:** 3 — Member portal. 3.1, 3.2, 3.4, 3.5 and 3.6 are done; 3.3 (SEPA) waits on
the bank account. Phases 1 and 2 are complete apart from 2.7 (vacancies), which the
maintainer chose to skip.
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
- The admin dashboard of docs/design/09: four figures, an eight-month donations chart,
  the new-volunteers table with VOG status and the latest donations with a working CSV
  export. `Vacatures` added so the sidebar carries what the mockup lists.
- Mijn omgeving as docs/design/08 draws it: the greeting line, four figures, the task
  list with its deadline badges, and the course row with progress. Tabs for taken,
  cursussen, evenementen and gegevens; uren is reached from the Uren card.
- `Members` with their own login, and Mijn omgeving at `/mijn` (3.2): login, overview,
  contact details the member maintains, and a password change. Approving an application
  creates the member. Members cannot reach the admin panel: `admin.user` names `users` as
  the only collection Payload lets in.
- `src/access/userCollections.ts`, which every role rule now goes through. Adding a second
  auth collection broke two rules that were correct while `users` was the only one; both
  are described there and both are covered by the checks below.
- The volunteer intake form as four steps at `/vrijwilligers`, per docs/design/07:
  gegevens, interesses, beschikbaarheid, bevestiging, with a summary that links back to
  each step.
- `VolunteerHours` and `/mijn/uren` (3.5): a member registers, corrects and deletes their
  own hours, with totals for this year and since the beginning. Administrators and editors
  in the vrijwilligers commission see everyone's; no other editor sees any.
- **E-mail, over SMTP, behind one swappable adapter.** `src/lib/email/adapter.ts` is the
  only file that names a provider; everything else calls `sendMail`, which calls
  `payload.sendEmail`. Dutch text lives in `src/i18n/locales/nl-email.ts`. With SMTP_HOST
  unset nothing is sent and Payload logs the recipient and subject, so a local clone and a
  deploy with a missing variable both still work.
- Eight messages: a welcome with a set-password link when an application is approved, a
  Dutch "wachtwoord vergeten" for members *and* administrators, a decision mail for a
  declined membership and for a volunteer aanmelding, confirmations to whoever filled in
  the contact, vrijwilligers or lid-worden form, notifications to the foundation's own
  mailbox, a task-assignment message, and enrolment and registration confirmations.
- `/mijn/wachtwoord-vergeten` and `/mijn/wachtwoord-instellen`. A member sets their own
  password; an administrator never sees one. Resetting deliberately does not sign them in.
- `status` on `VolunteerApplications` (aangemeld / in gesprek / goedgekeurd / afgewezen).
  `handled` still means "the coordinator dealt with it" and is ticked automatically by
  recording a decision.
- ROADMAP 3.4 finished: a signed-in member enrols from `/cursussen/<slug>` and registers
  from `/agenda/<slug>`, and may undo either — withdrawing while progress is zero,
  cancelling until somebody ticks them as attended. Both limits are query constraints in
  `src/access/selfEnrolment.ts`, so the REST endpoint is bound by them too. Event capacity
  is counted from the registrations instead of being hand-decremented.
- A gift can be earmarked for a project: `/doneren?project=<slug>`, a `project`
  relationship on `Donations`, and a fundraising bar that adds the paid online gifts to
  the amount an editor typed in for everything that arrived off the website.
- Retention is enforced for members (two years after `beeindigd`) and donations (the
  donor's name comes off after the seven-year fiscal period; the amount stays).
- ROADMAP 3.6: certificates at `/mijn/certificaten`. A print-styled page the browser
  saves as a pdf, so no PDF library is in the bundle and the document is real text.
  Nothing is stored: a certificate is a view of an enrolment that reached 100%, dated
  with `completedAt`, which a hook stamps once and never moves. The wording and the
  signatory live in Instellingen.
- ROADMAP 2.8's read half: an editor no longer sees other commissions' **drafts**.
  Published content stays visible to every editor, because hiding what is already on
  the public site protects nothing and makes the panel look broken.

Verified on a rebuilt database: `pnpm dev` runs, `/admin` loads, the first user is created
and becomes an administrator, the public routes render from the CMS, and `pnpm build`,
`pnpm lint` and `pnpm typecheck` all pass. The production build also succeeds with the
database stopped, which is the situation in GitHub Actions.

- **ROADMAP 2.5 — the bestuur on `/over-ons`.** A `board` block with a portrait, a role
  and a biography each. It stores no names: it reads them from `AnbiGegevens`, which the
  ANBI page already publishes, so the two pages cannot disagree about a spelling.
  Portraits are all or nothing — the block shows none unless every member has one.
- Over ons, the privacyverklaring and the cookiebeleid are written in Word and loaded:
  `convert-*.py` reads `docs/*.docx`, `pnpm load:legal` and `pnpm load:over-ons` publish
  it, `crop-portraits.py` cuts the photographs to one shape. Neither the documents nor
  `.devseed/` are in git; they carry real names and faces. See `docs/environments.md`.

- **Projecten: seven, each labelled.** Every project carries a `phase` — **Loopt** or
  **In voorbereiding** — shown as a badge on the card and on the project page. A young
  foundation is read by fondsen and gemeenten, and telling running work apart from a plan
  is what keeps a plan from being read as a promise. `studentenhuisvesting` is the case
  this exists for.
- Projects are ordered by an `order` field the board sets, not by when somebody typed
  them in. The sequence is editorial: what runs comes first.
- `/projecten` now renders the blocks of the CMS page with slug `projecten` above the
  grid, the same way `/contact` and `/doneren` render theirs. That is where the
  introduction lives.

## In progress

- Nothing half-done. The session ended on a clean tree, lint, types and build all
  passing, and both branches in step.

## Next up

1. **Fill in the SMTP variables in Vercel, then redeploy.** Everything that sends mail is
   built and tested, and nothing is sent until `SMTP_HOST` is set. See `.env.example`; for
   Google Workspace it is `smtp.gmail.com`, port 587, and an app password. Until then an
   approved member still never hears that their account exists.
2. **Set `CRON_SECRET` in Vercel (Production), then redeploy.** The daily clear-out
   returns 503 without it.
3. Replace the demo values in Instellingen on production with the real address, telephone
   number and e-mail. The privacyverklaring already gives `info@samenzin.org`, so the two
   disagree until this is done.
4. Set `PREVIEW_SECRET` in Vercel for Production and Preview, then redeploy
5. Decide the backup arrangement for Neon, see below
6. Lighthouse pass on mobile once there is real content to measure

## Blocked, needs the maintainer

- [x] **Deploying works, and production is live.** `dev` deploys to the Vercel Preview and
      Neon `dev`, `main` to Production and Neon `production`, both after lint, types and
      build pass. Every deploy logs which database it wrote to. Verified 25 September 2026.
- [x] **Both databases hold the demo content.** Pages, six projects, six events, six
      articles, three courses and the new menu. Production's real ANBI record survived:
      the seed refuses to write `anbi-gegevens` to anything but a local database.
- [ ] **The site settings on production are demo data.** Addresses, telephone number and
      e-mail are "Voorbeeldstraat 1" and the like, because `fill:remote` overwrote
      Instellingen. Real values go in through `/admin` -> Instellingen; only the ANBI
      record is protected from the seed.
- [x] **The privacyverklaring and the cookiebeleid are published**, with the real texts,
      and the footer links to both. The placeholder is gone from the live site.
- [ ] **Set `CRON_SECRET` in Vercel (Production), then redeploy.** The daily clear-out at
      /api/cron/prune returns 503 until it is set, and nothing is deleted. Any random
      string of 16 characters or more. Verified live: 503 now, 401 for a wrong secret,
      200 for the right one.
- [ ] **Set the SMTP variables in Vercel (Production and Preview), then redeploy.** This is
      the one that matters most: everything that sends mail is built and tested, and
      nothing is sent until `SMTP_HOST` is set. Until then an approved member still never
      learns their account exists, and nobody who fills in a form hears anything back.
      `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM_ADDRESS`,
      `EMAIL_FROM_NAME`; for Google Workspace that is smtp.gmail.com, port 587, and an app
      password rather than the account password. `EMAIL_NOTIFY_ADDRESS` is optional and
      defaults to the e-mail address in Instellingen.
      Nothing breaks while they are empty: Payload logs the recipient and subject instead
      of sending, and no form or approval fails.
- [ ] **Check whether the foundation's mail provider lets the site send as its own
      address.** Most relays refuse to send as an address the authenticated account does
      not own, so `EMAIL_FROM_ADDRESS` usually has to be the same mailbox as `SMTP_USER`.
      Worth testing with one real message before relying on it.

## Retention, and what the privacyverklaring promises

The published statement is a commitment, so the gap between it and the code is worth
keeping visible. All of it is enforced by `src/lib/retention.ts`, run by a daily Vercel
cron job at 04:00 UTC and by `pnpm prune:expired`.

| Data | Promised | Implemented |
|---|---|---|
| Contact messages | handled, then at most 1 year, deleted automatically | `deleteAfter` on arrival |
| Volunteer applications | — | 6 months from arrival |
| Membership applications | — | 6 months; an approved one is kept |
| Members | "zolang uw account bestaat en daarna 2 jaar" | 2 years from `status: beeindigd`; deleting takes their hours, tasks, enrolments and registrations |
| Donations | 7 years, a legal obligation | the donor's name and e-mail come off after the fiscal period; the amount, date and Mollie reference stay |

Two decisions inside that worth knowing:

- **"The account ends" means the status becoming `beeindigd`**, which is the only signal
  the model has and the only one an administrator controls. Reinstating a member clears
  the date; editing an ended member does not push it out.
- **A donation is anonymised, not deleted.** The obligation is about the amount, the date
  and the payment reference, which the accountant and the ANBI figures need; the name and
  the e-mail address are the personal data and only those go. Deleting the row would
  destroy a financial record to protect something removable on its own.

Still open:

- [ ] **Website logs: "maximaal 6 maanden."** These are Vercel's runtime logs, not ours.
      Check the retention Vercel actually applies on this plan and make the statement
      match it, rather than the other way round. The only remaining gap.

## Needs a decision before it can be finished

- [ ] **Media commission must confirm the fonts.** Source Serif 4 and Source Sans 3 are
      installed as the closest self-hostable equivalents to Cambria and Calibri.
      `docs/design/README.md` asks for their sign-off.
- [ ] **Four derived colour tints** are marked in `globals.css` as interpolated from the
      mockups (button hover fills, hairline borders). They are not part of the approved
      palette and need confirming.
- [ ] **Five palette values are mirrored in `src/lib/email/layout.ts`.** `brand.css` says to
      change a colour there and nowhere else, and that is the one place that cannot: an
      e-mail cannot read a CSS custom property and the stylesheet is not bundled into the
      function that sends the mail. Changing a brand colour means changing it there too.
- [x] **Commissions now scope reading as well as changing.** The worry in this note —
      that `read` also governs the public site — turned out not to apply: every helper in
      `src/lib/payload.ts` calls the local API without `user` or `req`, so public queries
      carry no identity and take the anonymous branch. Narrower than the note asked for:
      only other commissions' *drafts* are hidden, because hiding published content from
      a colleague protects nothing. See `src/access/isPublishedOrOwnCommission.ts`.
- [ ] **Every collection added from here needs the same three things** as `Pages` and
      `Projects`: `versions.drafts`, the published-only read rule, and `overrideAccess:
      false` in its read helper. The third is the one that is easy to forget and silently
      serves drafts to the public.
- [x] **Event places are counted, not typed in.** Fill in a capacity and the site works
      out what is left from the registrations and closes the aanmelding when it is full.
      `spotsAvailable` remains for an event with no capacity, for instance one where people
      register elsewhere, and is ignored when a capacity is set.
- [x] **Project funding figures are part typed in, part counted.** `funding.raised` is now
      labelled as money that arrived away from the website — bank transfers, collections, a
      pledge — which nothing else can know about, and the paid online gifts earmarked for
      that project are added on top. Someone still has to keep the offline figure current.
- [x] **The donation page can be told which project to fund.** `/doneren?project=<slug>`
      preselects it and the project page links there. The select posts the project's id and
      the action resolves it with access not overridden, so a draft or deleted project
      cannot become a destination.
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
- [x] **There is an e-mail adapter, and a member gets their own login.** SMTP through
      nodemailer, chosen over a hosted mail API by the maintainer so that no second
      processor handles members' names and addresses and no processing register entry or
      processor agreement is needed for one. `src/lib/email/adapter.ts` is the only file
      that names a provider. An administrator no longer sets anybody's password: an
      approved application sends a link, and the login page offers "wachtwoord vergeten".
      What remains is filling in the variables, listed above.
- [ ] **Only members can register hours, and not every volunteer is a member.** A
      volunteer who never became a member has no login and therefore nowhere to enter
      hours. Either they are given a membership record, or 3.5 needs a second way in.
      This is a gap in the model, not a bug in the code, and it needs a decision.
- [ ] **Registered hours are personal data** and belong in the processing register in
      `samenzin-ict` together with the rest of 3.5, including who may read them
      (administrators and the vrijwilligers commission) and how long they are kept.
      Nothing prunes them today.
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
- [x] **The privacy statement exists and is published**, with the real text, and the
      footer links to it. See the retention table above for what it promises and what
      enforces each promise.
- [ ] **The contact form needs a processing register entry** in `samenzin-ict` before it
      goes live, including how long messages are kept. Deletion is automatic now; the
      register entry is still missing.
- [ ] **Volunteer and membership applications need processing register entries too**,
      before either form faces the public. Both keep records six months, enforced by
      `pnpm prune:expired` and by the daily cron job, so the deletion itself is handled;
      the register entries are not. Note the difference to write down:
      an approved membership application is kept indefinitely, because it is the record
      that a membership was granted. That needs its own line in the register, with a
      retention tied to the membership rather than to a date.
- [ ] **Course enrolments and event registrations need a line in the processing
      register.** They were administrator-entered and are now created by the member
      themselves, which changes who the data comes from even though the fields did not
      change. Both say who went to what, which is personal data.
- [ ] **Outgoing e-mail belongs in the register too**, including the mail provider as a
      processor if the foundation's mailbox is hosted. SMTP was chosen partly to avoid a
      *separate* processor, but whoever hosts the mailbox is still one.
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
| 2026-09-24 | Volunteer applications are kept six months | Agreed with the maintainer. `deleteAfter` is written on arrival and shown in the list, and `pnpm prune:applications` acts on it (since renamed `pnpm prune:expired`), so the retention is a mechanism rather than a promise. |
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
| 2026-09-25 | /doneren is fully built and gated on MOLLIE_API_KEY, not hidden behind a notice | It previously showed only "binnenkort mogelijk". The whole page of docs/design/04 is now there; setting the key is the only step left, because the server action, the webhook and the Donations collection already exist. Until then the notice explains and the pay button is disabled, so nobody is sent into a payment that cannot complete. |
| 2026-09-25 | The monthly and five-year tabs are drawn but do not pay | They need a SEPA mandate, which is ROADMAP 3.3 and has legal weight. Choosing one explains that the foundation arranges it personally and links to contact, rather than offering a button that cannot honour what it promises. |
| 2026-09-25 | Payment methods are written out, not shown as brand logos | iDEAL, Mastercard and the rest are other people's trademarks and not ours to ship. The names carry the same information, and Mollie shows the real marks on its own checkout. |
| 2026-09-25 | The fund dropdown is the published projects | The board decides what a gift can be earmarked for by publishing a project, not by asking for a code change. |
| 2026-09-25 | Inloggen sits beside Doneer, and becomes Mijn omgeving when signed in | Per docs/design/02. Members had no way in from the site at all. getMember returns immediately when there is no session cookie, so an anonymous visitor pays nothing for it. |
| 2026-09-25 | Lid worden moved into the main menu | It was reachable only from the footer, which is too well hidden for something the foundation wants people to do. It is CMS-editable, so the board can reorder or remove it. |
| 2026-09-25 | The admin dashboard replaces Payload's, and counts everything live | docs/design/09. Nothing on it is a placeholder: an empty foundation sees zeroes rather than invented figures. Queries run with `overrideAccess: false` and the signed-in user, so an editor never sees numbers their own permissions would not allow. |
| 2026-09-25 | Two dashboard labels differ from the mockup on purpose | The mockup says "Maandelijkse donateurs", which means recurring givers; recurring SEPA is 3.3 and is not built, so the card reads "Donateurs deze maand" and counts distinct givers this month. It will be wrong to relabel it until 3.3 exists. |
| 2026-09-25 | "Export naar boekhouding" is a working CSV download, not a decorative link | A link that does nothing is worse than no link. It returns the paid donations of one month as semicolon-separated UTF-8 with a BOM, which is what Dutch Excel opens without an import dialogue, and it refuses anyone who is not an administrator. Cells starting with = + - or @ are prefixed so a spreadsheet cannot treat them as formulas. |
| 2026-09-25 | VOG is tracked as an outcome, never as an upload | The dashboard shows it per applicant. The certificate itself is shown to a coordinator in person; storing a scan would mean holding a government document the foundation has no reason to keep. |
| 2026-09-25 | No separate Donateurs collection | The mockup's sidebar lists one, but donations already carry the giver's name and e-mail. A second collection would be the same personal data in two places, which is two places to delete it from on request. |
| 2026-10-04 | The database schema was settled deliberately before real data arrives | The maintainer asked to finalise it while nothing real exists, to avoid risky migrations later. The honest framing: *adding* a column or a table never loses data and can wait; what is hard later is dropping, renaming, retyping, tightening NOT NULL, changing a select's stored values, or making a field localized (Payload moves it to a `_locales` table). So the audit looked only for things we would want to *change*. |
| 2026-10-04 | `volunteer_applications.handled` dropped | It predated the status field, then meant no more than "goedgekeurd or afgewezen", and nothing read it — the dashboard never filtered on it. Two sources of truth for one fact is how they drift. Dropped while production held 0 volunteer aanmeldingen; after real ones arrive the same migration destroys an answer somebody gave. |
| 2026-10-04 | `events.spotsAvailable` kept, despite looking redundant | It is the only way to show a number for an event where people register somewhere else, which the site cannot count. Derived capacity covers on-site registration; this covers the rest. Recorded so it is not "tidied away" later. |
| 2026-10-04 | `aangevraagd` for a lidmaatschap, `aangemeld` for a vrijwilliger | Different Dutch nouns — aanvraag and aanmelding — so the initial status differs by design rather than by accident. Renaming either later needs a data migration, so it is written down. |
| 2026-10-04 | No certificate collection | A certificate is a view of an enrolment that reached 100%, not a thing to store. A stored copy would be a second record that could disagree about whether somebody passed, and another row to keep in step when a coordinator corrects a figure. It is why the access rule refuses to let a member delete an enrolment they have progress on. |
| 2026-10-04 | A certificate is a print-styled page, not a generated PDF | The browser's own "Opslaan als pdf" makes the file. No PDF library in the serverless bundle, no fonts embedded by hand, and the document is real text a screen reader can read and a phone can zoom. The cost is margins varying slightly between browsers, which for a certificate of participation is not worth a dependency. |
| 2026-10-04 | `completedAt` is stored, not derived | It is the date the course was finished, which nothing else records: `updatedAt` moves whenever anything on the row changes. Stamped once so a date a certificate already carries cannot move, and cleared if the progress is corrected back below 100. |
| 2026-10-04 | SEPA subscriptions and vacancy applications stay unbuilt | Both need a new table, and a new table never endangers existing rows, so waiting for the bank account and for the CV-retention decision costs nothing. The thing that could not wait was the column drop above. |
| 2026-10-03 | E-mail goes over SMTP, not a hosted mail API | The maintainer's call: it points at the mailbox the foundation already has, and later at Google Workspace, so no second processor handles members' names and addresses and no processing register entry or processor agreement is needed for one. `src/lib/email/adapter.ts` is the only file that names a provider, so swapping is four variables and one function. |
| 2026-10-03 | Nothing in src/lib/email may import `server-only` | Collection configs call `sendMail`, and the configs are loaded by the `payload` CLI, which runs on plain Node where that package does not resolve. With the marker, `payload migrate` fails with ERR_MODULE_NOT_FOUND — and `vercel-build` runs it before `next build`, so the deploy breaks. |
| 2026-10-03 | The adapter passes `skipVerify` | It otherwise opens a full SMTP handshake while building the config, which happens on every serverless cold start, including functions that will never send anything. A bad setting shows up in the log of the first message instead. |
| 2026-10-03 | The welcome link lasts 24 hours, the ordinary reset link one | It arrives unannounced and has to survive a weekend. Passed per call, because a value in the collection's `forgotPassword` block wins over the per-call one and would stretch both. |
| 2026-10-03 | Resetting a password does not sign the member in | Payload's reset operation will hand back a session token. A link that logs you in means whoever reads that mailbox later gets into the account in one click. The member types the new password once on the login page, which also confirms they remember it. |
| 2026-10-03 | "Wachtwoord vergeten" answers the same for an unknown address | Anything else lets a stranger test which addresses are members, which is the one fact a membership register must not hand out. The error path and the success path therefore look identical, including when the mail server is down. |
| 2026-10-03 | Mail is sent after the record is stored, and sendMail never throws | Every caller is in the middle of something that matters more: a visitor submitting a form, the board approving a member. A mail server that is down costs a confirmation, not somebody's message. |
| 2026-10-03 | A signed-in member may enrol and register themselves; the open web still may not | The earlier decision was about personal data arriving from strangers. A member is not a stranger — the foundation already holds their record, granted by the board — and an enrolment is two foreign keys and no new personal data. A visitor who is not a member is shown the login. |
| 2026-10-03 | A member may undo an enrolment only before it counts for anything | Withdrawing while progress is zero, cancelling until somebody ticks them as attended. After that the record is evidence of what the foundation did, and the basis for a certificate in 3.6. Expressed as a query constraint in the access rule, so the REST endpoint is bound by it too. |
| 2026-10-03 | Event capacity is counted, `spotsAvailable` is the fallback | Deriving it is the point of taking registrations on the site. The hand-kept number is never trusted to decide whether an event is full, because nothing keeps it true; it is still used for an event with no capacity set. |
| 2026-10-03 | A donation stores both the project and its title | The relationship is what the fundraising bar counts; the title is what a gift was given for. A project that is renamed or deleted would otherwise rewrite or erase a financial record, and the foreign key is ON DELETE SET NULL. |
| 2026-10-03 | Only `paid` donations count towards a project's total | An "open" donation is somebody who reached Mollie's checkout and may never have finished. Showing it on a public progress bar would overstate what the project has. |
| 2026-10-03 | An expired donation is anonymised, not deleted | The seven-year obligation is about the amount, the date and the payment reference, which the accountant and the ANBI figures need. The name and the e-mail address are the personal data and only those go. Deleting the row would destroy a financial record to protect something removable on its own. |
| 2026-10-03 | "The account ends" means the status becoming `beeindigd` | The only signal the model has and the only one an administrator controls. Reinstating clears the date; editing an ended member does not push it out. |
| 2026-10-03 | Every Intl formatter is pinned to Europe/Amsterdam | Without it a formatter uses the rendering machine's timezone: Amsterdam on a laptop, UTC on Vercel. The live agenda was showing summer events two hours early. Three files had grown their own formatters with the same bug and now call `src/lib/dates.ts`. |
| 2026-10-03 | Deleting a member cascades to all four of their tables, not just hours | `member_tasks`, `course_enrolments` and `event_registrations` have the same `member_id integer NOT NULL` with ON DELETE SET NULL, so the delete failed with a raw "Failed query" for any member who had used the portal. Proved on a fresh database before fixing. |
| 2026-09-25 | Tasks are handed out, not self-created | docs/design/08 shows "Assigned to". Members may tick a task off and nothing else: title, owner, deadline and commission are administrator-only at field level, so ticking a box cannot become rewriting the assignment. Verified. |
| 2026-09-25 | Course progress is a percentage kept by hand | Deriving it would mean modelling lessons and attendance, which nothing has asked for. A member cannot change their own progress. |
| 2026-09-25 | Event registrations are entered by an administrator, never from the open web | The earlier decision that the website takes no public sign-ups still stands: that is personal data arriving from strangers and needs a processing register entry first. The portal only shows a member their own. |
| 2026-09-25 | One access rule covers hours, tasks, enrolments and registrations | All four hang off a `member` relationship, so `isOwnRecordOrCoordinator` (renamed from isOwnHoursOrCoordinator) is enough for all of them. One rule is one thing to get right. |
| 2026-09-25 | The demo member only exists when DEMO_MEMBER_PASSWORD is set | A login needs a password, and one written into the seed would be a credential in the repository that also got created on whatever environment the seed was pointed at. The seed also refuses to create it against a non-local database. |
| 2026-09-25 | The volunteer form became four steps, and asks for far more than four fields | docs/design/07 specifies it: telephone, interests, skills, Dutch level, city and a day-part grid. The earlier "four fields and nothing more" note in the collection said the opposite and has been rewritten rather than left to mislead. Still no date of birth and no VOG; those belong in the intake conversation the form promises. |
| 2026-09-25 | Half-finished applications live in payload.kv, not in the cookie | The cookie holds an opaque id only. Putting the answers in the cookie would send a visitor's name, telephone number and availability on every request to the site, into any log that records headers. Nothing is written to the applications table until the last step, so somebody who gives up halfway leaves no record. |
| 2026-09-25 | The steps work without JavaScript | Each step posts to its own server action, which validates, merges into the draft and redirects. Same as every other form here. Verified by walking all four steps with curl. |
| 2026-09-25 | The availability grid is a table, not a grid of bare checkboxes | The mockup writes the days once along the top. Out of context "checkbox, checked" tells a screen-reader user nothing, so row and column headers carry the day and the part of the day, and each box also has a visually hidden label. |
| 2026-09-25 | Registered hours have no approval step | The board asked for a register, not a timesheet to sign off. A queue of unapproved hours that nobody empties is worse than no queue. If it is ever needed it is a status field and a rule, not a change to how hours are entered. |
| 2026-09-25 | A member may correct and delete their own entries | A register that cannot be corrected gets worked around on paper. Nothing is paid from these figures; phase 4 only reports on them. |
| 2026-09-25 | Deleting a member deletes their registered hours | `volunteer_hours.member_id` is NOT NULL with ON DELETE SET NULL, so without a cascade Postgres refuses the delete and the admin panel shows a raw "Failed query". Deleting a member is for an erasure request anyway, and hours tied to a named person are that person's data. The alternative, keeping the rows and blanking the member, preserves the board's totals; worth revisiting if those totals matter more than simplicity. |
| 2026-09-25 | Hours are tagged with a commission, not a project | One axis, matching how the organisation and the mockup describe volunteering, and how phase 4 will report. Two optional taxonomies would both end up half filled in. |
| 2026-09-25 | The hours form accepts a comma as the decimal separator | Dutch keyboards and Dutch habits produce "1,5". Rejecting it would be a papercut on every single entry. |
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
| 2026-09-24 | `prune:applications` (now `prune:expired`) skips records with no `deleteAfter` | It queries `exists: true` as well as the date, so "keep this" is expressed by the absence of a date rather than by a special case in the script. |
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
- The board members' names live in **one** place: `boardMembers` under ANBI-gegevens.
  `/anbi` publishes them because the Belastingdienst requires it, and the Over ons board
  block reads the same rows. Do not add a second list anywhere. `scripts/load-over-ons.ts`
  refuses to load a biography that opens with a different spelling than that record,
  which is what keeps the spelling the same across the site.
- A project's running/planned label is the field `phase`, not `status`. Payload's drafts
  already own `status` (`_status` holds draft or published) and a second one collides with
  its enum type in Postgres. The first generated migration failed on exactly that.
- `pnpm load:projecten` never deletes a project. It lists the ones in the database that
  are not in the Word file and leaves them; demo projects from an older seed have
  different slugs from the new titles, so they have to be removed by hand once.
- The sentence Over ons makes about the ANBI application is generated from `anbiStatus`,
  not stored in the page. When the beschikking arrives, change the status under
  ANBI-gegevens and re-run `pnpm load:over-ons production`; both pages then agree.
- The board's portraits are published at 480x600 (4:5). That is twice the width the card
  shows, and as large as the smallest of the three source photographs allows without
  enlarging it. `scripts/crop-portraits.py` refuses a crop that is the wrong ratio or too
  small, so the set cannot drift apart silently.

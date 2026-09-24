# Roadmap

Phase 1 exists to unblock two applications that both require a live website: the ANBI
application and Google for Nonprofits. Everything not needed for that waits.

Visual reference for every phase is in `docs/design/`. Scope, however, is defined here and
nowhere else.

## Phase 1 — Live site (current)

Five public pages, editable by a non-technical volunteer.

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Mission, three focus areas, call to action |
| `/over-ons` | Over ons | Story, board, commissions |
| `/anbi` | ANBI | All statutory publication fields |
| `/doneren` | Doneren | Mollie iDEAL. Ships disabled if Mollie is not ready |
| `/contact` | Contact | Form, address, opening hours |
| `/privacyverklaring` | Privacyverklaring | Required once the contact form collects data |

Also in scope: responsive layout and navigation, admin panel with `admin` and `editor`
roles, media handling with required alt text, sitemap, robots, Open Graph tags, 404 page,
cookieless analytics.

**Explicitly out of scope:** news, events, projects, vacancies, volunteer intake, member
portal, courses, search, newsletter, multiple languages. Say no to all of these until
phase 1 is deployed.

**Done when:** the six routes are live on the real domain over HTTPS, a volunteer has
successfully edited a page without help, and the ANBI page contains every mandatory field.

## Phase 2 — Content platform

Everything here is public-facing content a volunteer maintains. Each item is a collection
with its own admin section, an overview route and a detail route, unless noted.

Ordered by how much the foundation needs it and how much it depends on the item above.

| # | Feature | Routes | Admin group | Notes |
|---|---|---|---|---|
| 2.1 | Editorial workflow: drafts, preview, published state | — | all content | Everything below is safer with it, so it comes first |
| 2.2 | Projecten | `/projecten`, `/projecten/<slug>` | Content | Funding progress bar per `06-projecten-*.png` |
| 2.3 | Nieuws & artikelen | `/nieuws`, `/nieuws/<slug>` | Content | Author, publication date, tags |
| 2.4 | Agenda / evenementen | `/agenda`, `/agenda/<slug>` | Programma | Replaces the hand-typed homepage block; filters need a real collection |
| 2.5 | Team | `/over-ons` section | Mensen | Board already exists in `AnbiGegevens`; reuse it, do not duplicate names |
| 2.6 | Vrijwilligers: intake form | `/vrijwilligers`, `/vrijwilliger-worden` | Mensen | **Personal data.** Register entry and retention rule required first |
| 2.7 | Vacatures, with CV upload | `/vacatures`, `/vacatures/<slug>` | Mensen | **Personal data**, and CVs are sensitive. Storage and deletion decided before building |
| 2.8 | Per-commission permissions | — | Systeem | Editors scoped to their own commission's content |

## Phase 3 — Member portal

The data model gets serious here and several parts are regulated. `ROADMAP.md` previously
noted a dedicated design round before coding; that still stands, per feature rather than
for the phase as a whole.

| # | Feature | Routes | Notes |
|---|---|---|---|
| 3.1 | Lid worden: application and approval | `/lid-worden` | **Done.** **Personal data.** Approval is a human decision, not automatic |
| 3.2 | Member login and member area | `/mijn` | **Decided:** members are a separate `Members` collection with its own login, never Payload users |
| 3.3 | Recurring SEPA contributions | — | **Payments and mandates.** Mollie recurring; a signed mandate has legal weight |
| 3.4 | Cursussen: catalogue and enrolment | `/cursussen`, `/cursussen/<slug>` | Catalogue **done**; enrolment still open |
| 3.5 | Hour registration for volunteers | `/mijn/uren` | Per `08-ledenportaal-mijn-taken.png` |
| 3.6 | Certificates | `/mijn/certificaten` | Depends on 3.4 and 3.5 |

### What a member is (decided, 24 September 2026)

Members are a **separate `Members` collection with its own login**, not Payload users with
a `member` role. A member therefore has no route into the admin panel at all, and no
mistake in an access rule can turn one into an editor. It costs a second authentication
surface in 3.2; that is the price of the guarantee.

3.1 is built to fit this: an approved application is the input to creating a member record,
and nothing more. Approving does not create a login, because there is nothing to log in to
yet.

## Phase 4 — Reporting and automation

Board dashboards, donation and volunteer reports, exports for the accountant,
integrations with bookkeeping. The admin dashboard in `09-admin-panel-dashboard.png`
belongs here, not earlier: it reports on data that phases 2 and 3 create.

## Rules that apply to every phase

These are not negotiable per feature; they are how this repository works.

- **Anything holding personal data needs a processing register entry in `samenzin-ict`
  before it goes live**, including how long records are kept and who may read them. That
  covers 2.6, 2.7, 3.1, 3.2, 3.3 and 3.5.
- **Anything touching payments is discussed before it is built** (`CLAUDE.md`).
- **A public form needs spam handling that is not a third-party tracker.** The honeypot
  and the rate limiter on the contact form are the pattern to copy.
- **Every new collection needs a migration**, committed with the code that needs it.
- **Every new public route needs**: Dutch slug, CMS-driven content, sitemap entry,
  metadata, 360/768/1280 layouts, and keyboard reachability.

## Sequencing constraints

- Mollie needs the foundation's bank account. If it is not ready, ship `/doneren` with a
  clear "binnenkort mogelijk" state rather than delaying the whole site.
- Multiple languages must be **configured** in phase 1 even though only Dutch is used.
  Retrofitting localization after content exists means migrating every entry.
- Google Workspace migration happens after ANBI approval and changes the mail records, not
  the application.

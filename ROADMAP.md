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

Projects, news and articles, events calendar, volunteer intake form, vacancies with CV
upload, team page. Editorial workflow with drafts and preview. Per-commission permissions.

## Phase 3 — Member portal

Membership with recurring SEPA, member login, courses, hour registration, certificates.
This is where the data model gets serious; expect a dedicated design round before coding.

## Phase 4 — Reporting and automation

Board dashboards, donation and volunteer reports, exports for the accountant,
integrations with bookkeeping.

## Sequencing constraints

- Mollie needs the foundation's bank account. If it is not ready, ship `/doneren` with a
  clear "binnenkort mogelijk" state rather than delaying the whole site.
- Multiple languages must be **configured** in phase 1 even though only Dutch is used.
  Retrofitting localization after content exists means migrating every entry.
- Google Workspace migration happens after ANBI approval and changes the mail records, not
  the application.

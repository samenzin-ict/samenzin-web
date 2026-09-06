# CLAUDE.md

Instructions for Claude Code working in this repository. Read this fully before the first
change of every session.

## What this is

The website and platform of **Stichting Samenleving en Zingeving**, a Dutch non-profit
foundation in Tilburg with (pending) ANBI status. Public site plus an admin panel used by
non-technical volunteers.

The foundation must be able to run this system after any individual leaves, including the
developer who started it. Every decision favours the maintainer who arrives in two years
over the developer writing code today.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js, App Router, TypeScript strict |
| CMS + admin | Payload CMS 3, running inside the same Next.js app |
| Database | PostgreSQL |
| Styling | Tailwind CSS + shadcn/ui |
| Payments | Mollie (phase 1, donations) |
| Runtime | Docker Compose + Caddy on an EU VPS |

**Verify the current Payload and Next.js APIs against the official documentation before
writing code.** Payload 3 changed significantly from version 2 and training data is
unreliable here. If a Context7 or documentation tool is available, use it. Do not guess an
API and do not copy Payload 2 patterns.

## Hard rules

1. **No secrets in the repository.** No `.env` values, keys or tokens in code, comments or
   documentation. `.env.example` holds names with empty values only.
2. **No personal data in the repository.** No real names, e-mail addresses, donor or member
   records in seeds, fixtures or tests. Use obviously fake data.
3. **TypeScript strict. No `any`.** If a type is hard, model it properly or ask.
4. **No marketing pixels, no third-party trackers, no advertising SDKs.** This is a
   deliberate architectural decision: without them the site needs no cookie banner. Adding
   one would force a banner and break a documented commitment. If a task seems to require
   one, stop and ask.
5. **Localization is enabled from day one, Dutch is the only locale filled in.** Never
   hardcode user-facing Dutch strings in components; they belong in the CMS or in the
   locale files. Retrofitting this later is expensive.
6. **Accessibility is a requirement, not a nice-to-have.** Target WCAG 2.1 AA. Semantic
   HTML, keyboard reachable, visible focus, real labels, sufficient contrast. A
   public-benefit organisation that excludes people fails at its own purpose.
7. **Mobile first.** Most visitors arrive on a phone. Design the small screen first and
   let it grow.

## Design

Approved mockups and design tokens live in `docs/design/`. **Read `docs/design/README.md`
before writing any UI**, and look at the relevant screenshot before building a screen.

The colour palette and typography rules there are approved by the board and are not open
for reinterpretation. Implement them as Tailwind theme tokens and shadcn CSS variables, so
a colour is changed in one place and never hardcoded in a component.

Two standing cautions:

- The mockups cover phases 1 to 3. They tell you **how things look**, not what to build.
  Scope comes from `ROADMAP.md` alone.
- Logo, site name and body copy in the mockups are placeholders. Never hardcode them; they
  come from `SiteSettings` and the CMS.

## Language conventions

| What | Language |
|---|---|
| URLs and slugs | Dutch (`/over-ons`, `/doneren`, `/anbi`) |
| Visible content | Dutch |
| Code, identifiers, comments, commits | English |
| Admin panel labels | Dutch — volunteers read these |

## Working agreement

- **Small, reviewable commits.** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Update `PROGRESS.md` at the end of every session.** The next session starts by reading
  it. Write what was finished, what is half-done, and what the next person should pick up.
- **Ask before**: adding a dependency that overlaps with something already present,
  changing the content model in a way that would drop existing data, introducing a second
  service to the deployment, or anything touching payments or personal data.
- **Do not build phase 2 features while phase 1 is unfinished.** Scope creep is the main
  risk to the launch date. See `ROADMAP.md`.

## Definition of done for a phase 1 page

- Renders correctly at 360px, 768px and 1280px
- Content comes from the CMS, not from hardcoded strings
- Keyboard navigable, headings in order, images have meaningful alt text
- Lighthouse: performance and accessibility both above 90 on mobile
- No console errors, no TypeScript errors, build passes


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

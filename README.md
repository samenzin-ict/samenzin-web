# samenzin-web

Website and platform of Stichting Samenleving en Zingeving.

## Requirements

- Node.js (current LTS)
- Docker and Docker Compose, for PostgreSQL locally
- pnpm

## Getting started

```bash
cp .env.example .env      # then fill in the values, ask the ICT commission
docker compose up -d      # starts PostgreSQL
pnpm install
pnpm dev                  # http://localhost:3000
```

The admin panel is at `/admin`. On first run it asks you to create the first user.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm payload migrate:create` | Create a database migration |
| `pnpm payload migrate` | Apply migrations |

## Deployment

Production runs on Vercel, deployed from GitHub. Set these in the Vercel project
before the first build:

| Variable | Value |
|---|---|
| `DATABASE_URI` | Neon **pooled** connection string, host ending in `-pooler` |
| `PAYLOAD_SECRET` | A long random string |
| `NEXT_PUBLIC_SERVER_URL` | `https://samenzin.org` |
| `BLOB_READ_WRITE_TOKEN` | Set by Vercel once a Blob store is connected |

`NEXT_PUBLIC_SERVER_URL` is inlined at build time, so it has to exist before the
build runs, not just at runtime.

Migrations run from the `vercel-build` script, before `next build`. A failed
migration therefore stops the deployment instead of leaving a half-applied
schema behind a live site.

Preview deployments use whatever `DATABASE_URI` is set for the Preview
environment. Point it at a Neon branch, not at production, or a pull request
will migrate the live database.

## Self-hosted image

Kept for local parity and as a way back to a VPS; not the production path.

```bash
docker build -t samenzin-web --build-arg NEXT_PUBLIC_SERVER_URL=https://example.org .
```

`NEXT_PUBLIC_SERVER_URL` is inlined into the bundle at build time, not read when
the container starts, so it has to be passed as a build argument. Get it wrong and
canonical URLs, the sitemap and the Open Graph images all point at the wrong host.

At run time the container needs `DATABASE_URI` and `PAYLOAD_SECRET`. Mount a volume
over `/app/media` or uploaded files disappear with the container.

The image does not run migrations on start, on purpose: a failed migration should
stop a deploy rather than restart-loop the live site. Run `pnpm payload migrate` as
a deploy step before the new container takes over.

## Documentation

| Read | For |
|---|---|
| `CLAUDE.md` | Conventions and rules. Read before contributing. |
| `ARCHITECTURE.md` | How the system fits together and why |
| `ROADMAP.md` | What is in scope now and what deliberately is not |
| `PROGRESS.md` | Where the work currently stands |
| `docs/design/README.md` | Approved mockups and design tokens |

Governance, access control, GDPR records and infrastructure runbooks live in the separate
`samenzin-ict` repository.

## Rules

No secrets and no personal data in this repository, ever. Secrets belong in the password
vault and are injected as environment variables at deploy time.

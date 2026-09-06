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

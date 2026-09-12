# Environments

Three places this application runs, and how they relate.

| | Local | Preview | Production |
|---|---|---|---|
| Where | Your machine | Vercel, per pull request | Vercel, `main` |
| Database | PostgreSQL in Docker | Neon branch `dev` | Neon branch `production` |
| Media | `./media` on disk | Cloudflare R2 | Cloudflare R2 |
| Address | `localhost:3000` | Vercel preview URL | `samenzin.org` |

Two rules worth stating once:

- **Schema changes travel upward as migrations**, never as a database copy.
- **Content travels downward as a dump**, never upward. There is no push script,
  on purpose.

## Local

```bash
cp .env.example .env      # then fill in PAYLOAD_SECRET
docker compose up -d      # PostgreSQL
pnpm install
pnpm payload migrate      # or just pnpm dev, which pushes the schema
pnpm dev
```

Leave the `R2_*` variables empty. Uploads then go to `./media`, so you need no
Cloudflare account to work on the site.

`pnpm seed` fills an empty database with obviously fake content. Never run it
against anything hosted; it refuses when `NODE_ENV` is `production`.

## Vercel

Set these in **Settings → Environment Variables**. The Environment column is
not optional: putting a production database on Preview means a pull request
will migrate live data.

| Variable | Production | Preview | Notes |
|---|---|---|---|
| `DATABASE_URI` | Neon `production`, pooled | Neon `dev`, pooled | Host ends in `-pooler` |
| `PAYLOAD_SECRET` | A secret | A different secret | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | `https://samenzin.org` | leave unset | Build-time, see below |
| `R2_BUCKET` | `samenzin-media` | `samenzin-media` | Same bucket |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` | same | |
| `R2_ACCESS_KEY_ID` | R2 API token | same | |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret | same | |
| `R2_PUBLIC_URL` | Public bucket address | same | |

`NEXT_PUBLIC_SERVER_URL` is **inlined into the bundle when the build runs**, not
read when the server starts. Set it for Production. Preview deployments get a
different hostname every time, so there is nothing sensible to pin there; leave
it unset and preview falls back to `localhost`, which only affects the sitemap
and canonical tags.

Migrations run automatically: `vercel-build` runs `payload migrate` before
`next build`, so a failed migration stops the deployment rather than leaving a
half-applied schema behind a live site.

Functions are pinned to `fra1` in `vercel.json` so requests are served from
inside the EU. **Create the Neon project in an EU region too** — that is chosen
at creation and cannot be moved afterwards.

### When a deploy fails

**`connect ECONNREFUSED 127.0.0.1:5432`** during `payload migrate`. `DATABASE_URI`
is not set for the environment being built, so PostgreSQL fell back to
localhost. Set it in Vercel for that environment. The build now stops with a
message naming the variable instead of this.

**`DATABASE_URI is not set`.** The same cause, caught earlier and said plainly.

Note that Vercel builds where it likes, often `iad1`, regardless of the function
region in `vercel.json`. The migration therefore runs from the build machine to
Neon, which may cross the Atlantic even though requests are served from `fra1`.
Runtime data stays in the EU. If the build path matters for your data protection
record, the build region can be pinned in the project settings on a paid plan.

## Cloudflare R2

One bucket, `samenzin-media`, shared by every environment.

That is deliberate. Payload stores each file's path with the document, so an
environment-specific prefix would make a database copied from production point
at paths that do not exist. One shared namespace means `pnpm db:pull` works
without also copying files. Media is public content, so little is given up. If
you ever need real isolation, use a second bucket with its own credentials
rather than a prefix.

For images to load, the bucket needs public read access: either switch on the
`r2.dev` address or attach a custom domain such as `media.samenzin.org`, then
put it in `R2_PUBLIC_URL`. Without it, files are still served, but through the
application, which costs a function invocation per image.

The R2 API token needs **Object Read & Write** on this bucket only.

## Keeping things in sync

### Schema

`src/migrations/` is the single source of truth.

After changing a collection or a global:

```bash
pnpm payload migrate:create <short_name>
git add src/migrations && git commit
```

Deploying runs it. Do not edit a migration that has already been applied
anywhere; write a new one.

Development also pushes the schema automatically on `pnpm dev`, which is why
local can drift. If `pnpm dev` ever hangs with every request timing out, look at
the first lines of its output: when a column is dropped while another is added,
the schema tool asks on the terminal whether it is a rename and waits forever.

### Content

```bash
pnpm db:pull dev          # copy the Neon dev branch down
pnpm db:pull production   # copy production down, asks first
```

This drops and rebuilds the local database. Media is not copied and does not
need to be: the URLs in the dump point straight at R2.

Pulling production brings real personal data — contact messages — onto your
machine. Delete it when you are done and never commit a dump.

There is no `db:push`. To get content into production, someone edits it in the
production admin panel.

### Neon branching

Reset the `dev` branch from `production` in the Neon dashboard whenever dev data
gets messy. That is what branches are for, and it is cheaper than a dump.

# Environments

## How this fits together

There are three places the site runs, and each has its own database. Nothing is
shared between them.

| Where | Database | Media | Address |
|---|---|---|---|
| Your laptop | PostgreSQL in Docker | `./media` on disk | `localhost:3000` |
| Vercel Preview | Neon branch `dev` | R2 | the URL Vercel prints |
| Vercel Production | Neon branch `production` | R2 | `samenzin.org` |

**Code** travels by git. **Content** does not: pages, the menu, projects and
images live in whichever database that environment points at, so deploying code
never carries content with it. Copying content is a separate, deliberate step.

### Why there is a Neon `dev` branch and a Vercel Preview but no `dev` branch on GitHub

Because the split is by **deployment target**, not by git branch. Vercel keeps two
sets of environment variables, Preview and Production, and each set has its own
`DATABASE_URI`. A preview deployment reads the Neon `dev` branch; a production
deployment reads the Neon `production` branch. The same commit can be deployed to
either. You do not need a second git branch for that, and adding one would not
change anything on its own.

A `dev` git branch is worth adding only when more than one person is working, so
unfinished work has somewhere to live that is not `main`.

### The three DATABASE_URI variables

This is the part that causes the most confusion. They are not three settings for
one thing; one is read by the application and two are only labels for scripts.

| Variable | Who reads it | What it means |
|---|---|---|
| `DATABASE_URI` | **the application** | the database *this particular process* talks to — different in every environment |
| `NEON_DEV_DATABASE_URI` | scripts only | a reference to the Neon `dev` branch |
| `NEON_PRODUCTION_DATABASE_URI` | scripts only | a reference to the Neon `production` branch |

The application never reads the `NEON_*` variables. They exist so that a script
can say *which* branch it means by name, instead of relying on whatever
`DATABASE_URI` happens to hold.

### The two env files

| File | Used when | `DATABASE_URI` should be |
|---|---|---|
| `.env` | you run `pnpm dev` on your laptop | your local Docker database, always |
| `.env.remote` | a script needs credentials for a hosted environment | nothing — prefer the `NEON_*` variables, which say which branch they mean |

Both are gitignored. Vercel does not read either of them: its variables are set
in the Vercel dashboard, per environment.

> **Do not put a Neon URI in `.env`.** `pnpm dev` would then run against a hosted
> database, and because local development enables schema push, it would rewrite
> that database's schema to match whatever you have locally.

## Talking to a Neon branch

Always by name, never by editing a `DATABASE_URI` somewhere:

```bash
pnpm status:dev        # which migrations have run on dev; changes nothing
pnpm status:prod       # the same for production
pnpm migrate:dev       # apply pending migrations to dev
pnpm migrate:prod      # the same for production; asks you to type "production"
```

These go through `scripts/neon.sh`, which sets `NODE_ENV=production` for you.
That matters: `src/payload.config.ts` has `push: NODE_ENV !== 'production'`, so
without it Payload connects with schema push enabled and **pushes your local
schema into the target instead of migrating it**, printing nothing while it does
so. That has happened to this project once, to the production database.

## The everyday flow

1. **Change the schema locally.** Edit a collection, run `pnpm dev`. Locally,
   Payload pushes the change straight into your Docker database; no migration is
   needed to keep working.
2. **Write the migration** once the shape has settled:
   ```bash
   pnpm payload migrate:create <a_short_name>
   ```
   Check the generated `up()` for anything destructive before committing it.
3. **Prove it applies to an empty database**, which is what a fresh environment
   does:
   ```bash
   docker exec samenzin-postgres psql -U samenzin -d samenzin -c 'CREATE DATABASE samenzin_check'
   NODE_ENV=production DATABASE_URI="postgres://samenzin:<pw>@localhost:5432/samenzin_check" pnpm payload migrate
   ```
4. **Commit and push.** `pnpm build`, `pnpm lint` and `pnpm typecheck` must pass.
5. **Migrate dev, then deploy a preview**, and look at it:
   ```bash
   pnpm migrate:dev
   vercel deploy
   ```
6. **When the preview is right, migrate production and promote:**
   ```bash
   pnpm status:prod     # see what is about to run
   pnpm migrate:prod
   vercel deploy --prod
   ```

Migrate before deploying, not after. A new deployment expects its tables to be
there already.

## Branches and deploying

Two long-lived branches, each bound to one environment:

| Branch | Deploys to | Database |
|---|---|---|
| `dev` | Vercel Preview | Neon branch `dev` |
| `main` | Vercel Production | Neon branch `production` |

Work on `dev`, or on a short branch that you merge into `dev`. When it is right,
merge `dev` into `main`.

### It is GitHub Actions that deploys, not Vercel

Vercel's own Git integration is switched off. The Hobby plan does not build
automatically for a repository owned by an organisation, so the project has an
**Ignored Build Step** that cancels those builds. Vercel reports a cancelled
build as a green "success" on the commit, which looks like a deploy that did
nothing — it is expected, not a failure.

`.github/workflows/ci.yml` does the deploying instead. On a push to `dev` or
`main` it runs lint, types and the build first, and only then:

1. `vercel pull` fetches that environment's variables, including the
   `DATABASE_URI` that decides which Neon branch the deployment talks to.
2. `vercel build` compiles on the GitHub runner. This runs the `vercel-build`
   script, which applies pending migrations to that environment's database
   before compiling, so a deployment never goes out ahead of its own schema.
   A failing migration fails the build and nothing is promoted.
3. `vercel deploy --prebuilt` uploads the result, with `--prod` on `main`.

Nothing deploys from a pull request, only from a push to those two branches.

### What has to be set up once

**Three repository secrets**, which GitHub Actions uses to log in to Vercel on
your behalf. You add them once, by hand, in the browser:

GitHub -> the `samenzin-web` repository -> **Settings** -> **Secrets and
variables** -> **Actions** -> **New repository secret**.

| Secret | What it is |
|---|---|
| `VERCEL_TOKEN` | a password for the Vercel API |
| `VERCEL_ORG_ID` | which Vercel team the project belongs to |
| `VERCEL_PROJECT_ID` | which project inside that team |

### Where to find the three values

**`VERCEL_TOKEN`** — in the Vercel website:

1. Click your avatar, top right -> **Account Settings**.
2. **Tokens** in the left menu -> **Create Token**.
3. Name it something like `github-actions`. Under **Scope**, choose the
   **samenzin-ict** team, not your personal account — the project belongs to the
   team, and a personal-scope token cannot see it.
4. Copy the token *now*. Vercel shows it once and never again.

**`VERCEL_PROJECT_ID`** — in the Vercel website:

1. Open the **samenzin-web** project.
2. **Settings** -> **General**.
3. Scroll to the bottom. **Project ID** is there, starting with `prj_`.

**`VERCEL_ORG_ID`** — in the Vercel website:

1. From the team dashboard, **Settings** -> **General**.
2. **Team ID** is near the top, starting with `team_`.

> This is the one people get wrong. The org id is **not** `samenzin-ict`. That is
> the team's *name*, the part you see in the dashboard address
> `vercel.com/samenzin-ict/samenzin-web`. The id is a long string beginning
> `team_`. Paste the name instead of the id and `vercel pull` fails with
> `Project not found`, which does not tell you which of the two values is wrong.
> The workflow checks the shape first and names it for you.

### The other way: the Vercel CLI

If you would rather not hunt through the dashboard, the CLI writes both ids to a
file for you. **You** run these, on **your own laptop**, in the project folder
(`/home/frknilisu/my_ws/samenzin` — wherever you cloned this repository):

```bash
npm install -g vercel     # once, installs the `vercel` command
vercel login              # opens a browser to sign in
vercel link               # asks which team and project this folder belongs to
```

`vercel link` then creates a folder called `.vercel` inside the project folder,
containing `project.json`:

```json
{ "orgId": "team_AbC123...", "projectId": "prj_XyZ789..." }
```

`orgId` is `VERCEL_ORG_ID`, `projectId` is `VERCEL_PROJECT_ID`. Read it with:

```bash
cat .vercel/project.json
```

The `.vercel` folder is gitignored and stays on your laptop. It is not needed by
GitHub Actions — the workflow uses the two secrets instead — and it is not in
this repository, which is why you will not find it until you run `vercel link`
yourself.

**Vercel environment variables**, set in the Vercel dashboard for each
environment separately. The important one is `DATABASE_URI`: the Preview
environment must hold the Neon `dev` connection string and the Production
environment the Neon `production` one. Get that wrong and a preview deployment
migrates and writes to the live database.

**Production must be baselined first**, once. Its schema was pushed rather than
migrated, so `payload migrate` would refuse and ask a question no one can answer
inside a CI job. Run `pnpm baseline:prod` before the first deploy of `main`.

### Requiring a review before production

The deploy job runs in a GitHub Environment named `production` or `preview`.
Adding a required reviewer to the `production` environment in
Settings -> Environments makes every deploy of `main` wait for approval. Nothing
in the repository needs to change for that.

### Deploying by hand

Still possible, and useful when Actions is not the problem you want to debug:

```bash
vercel deploy          # preview,    Neon dev
vercel deploy --prod   # production, Neon production
```

## If a database was pushed instead of migrated

Payload records a push as a row in `payload_migrations` named `dev` with
`batch = -1`, and that row is what makes `payload migrate` warn about data loss.
The schema is real and usable, but no migration is recorded, so the next
`payload migrate` tries to create tables that already exist and fails.

First prove the schema matches what the migrations produce. Build a database from
the migrations alone and compare, sorted, column for column:

```sql
select table_name || '.' || column_name || ':' || data_type
from information_schema.columns
where table_schema = 'public' and table_name <> 'payload_migrations'
order by 1;
```

The two lists must be identical. If they are, record the migrations as applied
without running them:

```bash
pnpm baseline:prod
```

If they are not identical, do not baseline. Find out which migration the pushed
schema diverges from first.

## Local

Only one value has to be filled in.

```bash
cp .env.example .env
openssl rand -hex 32          # paste the result after PAYLOAD_SECRET=
docker compose up -d          # PostgreSQL on localhost:5432
pnpm install
pnpm dev                      # http://localhost:3000
```

`pnpm seed` fills an empty database with obviously fake content so there is
something to look at. It refuses to run when `NODE_ENV` is `production`.

**Leave the `R2_*` variables empty.** Uploads then go to `./media` on your own
machine and you need no Cloudflare account.

**Leave the `NEON_*` variables empty** until you want a copy of hosted content.
They are used only by `pnpm db:pull`; the application itself always uses
`DATABASE_URI`, which points at Docker.

Three database variables in one file does confuse people, so to be explicit:

| Variable | What it is | Who reads it |
|---|---|---|
| `DATABASE_URI` | The database the app runs on. Locally, Docker. | The application |
| `NEON_DEV_DATABASE_URI` | Neon `dev` branch, for copying down | `pnpm db:pull dev` only |
| `NEON_PRODUCTION_DATABASE_URI` | Neon `production` branch, for copying down | `pnpm db:pull production` only |

## Vercel

Set these under **Settings → Environment Variables**. Each variable has
checkboxes for Production, Preview and Development. Tick only the ones named
below; leave Development unticked, it is for `vercel dev` which we do not use.

After saving, **redeploy**. Variables are read when a build runs, not injected
into a build that already happened.

### Production

Deployed from `main`, serving `samenzin.org`.

| Variable | Value |
|---|---|
| `DATABASE_URI` | Neon **`production`** branch, pooled string |
| `PAYLOAD_SECRET` | `openssl rand -hex 32` |
| `PREVIEW_SECRET` | `openssl rand -hex 32`, different again |
| `NEXT_PUBLIC_SERVER_URL` | `https://samenzin.org` |
| `R2_BUCKET` | `samenzin-media` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | From the R2 API token |
| `R2_SECRET_ACCESS_KEY` | From the R2 API token |
| `R2_PUBLIC_URL` | The bucket's public address |

### Preview

Every pull request. Same variables, with these differences:

| Variable | Value |
|---|---|
| `DATABASE_URI` | Neon **`dev`** branch, pooled string |
| `PAYLOAD_SECRET` | A **different** random string from production |
| `PREVIEW_SECRET` | A different random string again |
| `NEXT_PUBLIC_SERVER_URL` | Leave unset |
| `R2_*` | Identical to production |

`NEXT_PUBLIC_SERVER_URL` is left unset on Preview because every preview gets a
different hostname, so there is nothing sensible to pin. It only affects the
sitemap and canonical tags, which do not matter on a preview.

The database must be the `dev` branch. Migrations run during the build, so a
pull request pointed at production would migrate live data.

### Where the values come from

- **Neon**: Dashboard → your project → Branches → pick the branch → Connection
  string. Choose the **pooled** one; its host ends in `-pooler`. Serverless
  opens a connection per invocation and the direct endpoint runs out.
- **R2 endpoint**: Cloudflare → R2 → Overview. The account ID is in the URL and
  on the page.
- **R2 token**: Cloudflare → R2 → Manage API Tokens → Create. Permission
  **Object Read & Write**, scoped to `samenzin-media` only.
- **R2 public address**: the bucket's Settings → Public access. Either switch on
  the `r2.dev` URL or attach a custom domain such as `media.samenzin.org`.

### When a deploy fails

**`DATABASE_URI is not set`** — the variable is missing for the environment
being built. Set it in Vercel and redeploy.

**`connect ECONNREFUSED 127.0.0.1:5432`** — the same cause on an older build,
before the check above existed: with no connection string, PostgreSQL falls
back to localhost, and there is no database on a build machine.

**Images load locally but not in production** — `R2_PUBLIC_URL` is unset or the
bucket is not publicly readable.

**A variable is set but nothing changed** — variables are read when a build
runs. Redeploy.

**`pnpm fill:remote` says `DATABASE_URI` is missing when it is clearly there** —
fixed. The script used to execute `.env.remote` rather than read it, and a Neon
string ends in `&channel_binding=require`; an unquoted `&` makes the shell run
the assignment as a background job, so the value never arrived. The file is now
parsed, and quotes, `export` prefixes and Windows line endings all work.

**The container image build fails on `DATABASE_URI is not set`** — the
Dockerfile sets a placeholder for the build, which never connects to anything;
the real connection string is supplied when the container runs. If you see this,
the placeholder line in the builder stage has been removed.

Note that Vercel builds where it likes, often `iad1`, regardless of the function
region in `vercel.json`. The migration therefore runs from the build machine to
Neon, which may cross the Atlantic even though requests are served from `fra1`.
Runtime data stays in the EU. If the build path matters for your data protection
record, the build region can be pinned in project settings on a paid plan.

## Cloudflare R2

One bucket, `samenzin-media`, shared by every environment.

That is deliberate. Payload stores each file's path with the document, so an
environment-specific prefix would make a database copied from production point
at paths that do not exist. One shared namespace means `pnpm db:pull` works
without also copying files. Media is public content, so little is given up. If
you ever need real isolation, use a second bucket with its own credentials
rather than a prefix.

Without `R2_PUBLIC_URL` the files are still served, but through the application,
which costs a function invocation per image.

## Filling a new environment for the first time

A fresh Neon branch is empty. The deployment then shows the layout with nothing
in it: the header and footer render but have nothing to list, and the homepage
says "De website is nog niet ingericht".

That is content missing, not design missing. Every component, stylesheet and
button is compiled into the deployment already; what they render comes from the
database.

### One command

```bash
cp .env.example .env.remote     # then replace the values with the target's
pnpm fill:remote                # reads .env.remote
```

`.env.remote` needs six values, all of them required:

```
DATABASE_URI="<neon pooled connection string>"
R2_BUCKET="samenzin-media"
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="<token>"
R2_SECRET_ACCESS_KEY="<secret>"
R2_PUBLIC_URL="<public bucket address>"
```

It shows the database and bucket it is about to write to and waits for
confirmation, then applies the schema, writes the content and uploads the
images, and finally loads the real ANBI text if `.devseed/load-anbi.ts` is
present.

The R2 values are not optional and the script refuses without them. Left out,
the images are written to a `media` directory on your own machine, the database
records point at files the deployment does not have, and every image is broken
with nothing on the page to say why.

`.env.remote` holds credentials for a hosted environment and is gitignored.

Point it at the Neon `dev` branch to fill the preview environment, and at
`production` for production.

Afterwards, open the deployment's `/admin` and create the first account. It
becomes an administrator automatically.

### Doing it by hand

The same three steps, if you would rather see them:

```bash
DATABASE_URI="<neon pooled>" pnpm payload migrate

DATABASE_URI="<neon pooled>" R2_BUCKET=... R2_ENDPOINT=... \
R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_PUBLIC_URL=... \
SEED_ALLOW_REMOTE=true pnpm seed

DATABASE_URI="<neon pooled>" pnpm payload run .devseed/load-anbi.ts
```

The order matters: `pnpm seed` writes placeholder ANBI values and would
otherwise overwrite the real ones.

**What this content is.** Everything except the ANBI page is placeholder:
`Voorbeeldtekst`, `voorbeeld@example.org`, invented project names. It is there
so the site has shape, not because it is true. The seeded privacy statement
says in capitals that it is not valid. Replace it before the site is announced,
and certainly before the contact form is put in front of the public.

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

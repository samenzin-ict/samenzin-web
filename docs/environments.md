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
| `NEXT_PUBLIC_SERVER_URL` | `https://samenzin.org` |
| `R2_BUCKET` | `samenzin-media` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | From the R2 API token |
| `R2_SECRET_ACCESS_KEY` | From the R2 API token |
| `R2_PUBLIC_URL` | The bucket's public address |

### Preview

Every pull request. Same variables, two differences:

| Variable | Value |
|---|---|
| `DATABASE_URI` | Neon **`dev`** branch, pooled string |
| `PAYLOAD_SECRET` | A **different** random string from production |
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

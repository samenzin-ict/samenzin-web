# Production image for the Next.js and Payload application.
#
# Three stages so the final image carries neither the package manager nor the
# build toolchain: install, build, then run.
#
# The database is deliberately not reachable during the build. Every public
# route is force-dynamic and the schema is applied by `payload migrate` at
# deploy time, so nothing here needs to talk to PostgreSQL.

# ---- Dependencies -----------------------------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app

RUN corepack enable

# Copied on their own so a change to application code does not invalidate the
# dependency layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ---- Build ------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ variables are inlined into the bundle at build time, not read at
# run time, so the real address has to be supplied here. Getting this wrong
# means canonical URLs, the sitemap and Open Graph images all point at
# localhost.
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# A placeholder, never connected to.
#
# Collecting page data loads the Payload config, which refuses to start without
# a connection string. That check is what stops a deploy going out with the
# variable unset, so it stays; but a container image is built once and run in
# many places, and the build itself has no database and needs none.
#
# Deliberately not an ARG: the real connection string is supplied when the
# container runs. Passing a live one at build time would bake a credential into
# an image layer.
ENV DATABASE_URI=postgres://build-time-placeholder@127.0.0.1:5432/placeholder

RUN pnpm build

# ---- Runtime ----------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Never run the application as root.
# --ingroup matters: without it adduser drops the user into nogroup, and the
# group ownership set on /app/media below would then grant nothing.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Uploads are written here. Mount a volume over it, or the files disappear with
# the container; ARCHITECTURE.md moves this to object storage in due course.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Migrations are not run here on purpose. A failed migration should stop a
# deploy, not restart-loop the live site. Run `pnpm payload migrate` as a
# deploy step, as README.md describes.
CMD ["node", "server.js"]

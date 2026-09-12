#!/usr/bin/env bash
#
# Copies a Neon branch into the local development database.
#
#   scripts/db-pull.sh dev          # from the Neon "dev" branch
#   scripts/db-pull.sh production   # from the Neon "production" branch
#
# Reads NEON_DEV_DATABASE_URI or NEON_PRODUCTION_DATABASE_URI from .env.
#
# One direction only, on purpose. There is no matching push: the schema travels
# upwards as a migration that has been reviewed, and content is authored in the
# environment that owns it. A script that overwrote production content from a
# laptop is a bad thing to have lying around.
#
# The local database is dropped and rebuilt, so anything only on this machine
# is lost.
set -euo pipefail

BRANCH="${1:-}"

if [[ "$BRANCH" != "dev" && "$BRANCH" != "production" ]]; then
  echo "Usage: scripts/db-pull.sh [dev|production]" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "No .env found. Copy .env.example to .env first." >&2
  exit 1
fi

# Only the variables this script needs, so a malformed line elsewhere in .env
# cannot be executed.
read_env() {
  grep -E "^$1=" .env | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//'
}

if [[ "$BRANCH" == "dev" ]]; then
  SOURCE="$(read_env NEON_DEV_DATABASE_URI)"
else
  SOURCE="$(read_env NEON_PRODUCTION_DATABASE_URI)"
fi

LOCAL="$(read_env DATABASE_URI)"

if [[ -z "$SOURCE" ]]; then
  echo "No connection string for the $BRANCH branch in .env." >&2
  echo "Set NEON_DEV_DATABASE_URI or NEON_PRODUCTION_DATABASE_URI." >&2
  exit 1
fi

if [[ "$LOCAL" == *"neon.tech"* ]]; then
  echo "DATABASE_URI points at Neon, not at a local database." >&2
  echo "Refusing to overwrite a hosted database." >&2
  exit 1
fi

if [[ "$BRANCH" == "production" ]]; then
  echo "This copies PRODUCTION data, including any contact messages, onto this"
  echo "machine. Personal data on a laptop is still personal data: delete it"
  echo "when you are done, and never commit a dump."
  read -r -p "Continue? [y/N] " reply
  [[ "$reply" == "y" || "$reply" == "Y" ]] || exit 1
fi

DUMP="$(mktemp -t samenzin-dump-XXXXXX.sql)"
trap 'rm -f "$DUMP"' EXIT

echo "==> Dumping the $BRANCH branch"
pg_dump "$SOURCE" \
  --no-owner --no-privileges --no-acl \
  --clean --if-exists \
  --file "$DUMP"

echo "==> Restoring into the local database"
psql "$LOCAL" --quiet --set ON_ERROR_STOP=off --file "$DUMP" > /dev/null

echo "==> Done."
echo
echo "    Media files were not copied. They live in Cloudflare R2 and the URLs"
echo "    in this dump point straight at the bucket, so images keep working"
echo "    without a local copy."

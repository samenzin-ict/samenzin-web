#!/usr/bin/env bash
#
# Fills a hosted environment with the same content a local clone has:
# site settings, pages, images and the real ANBI text.
#
#   scripts/fill-remote.sh .env.remote
#
# The file it reads holds the target's credentials and must never be committed;
# .gitignore covers .env.remote and .env.remote.*.
#
# Why a script rather than a list of commands: the content step needs the R2
# variables in the same invocation, and leaving them out is silent. The seed
# happily writes images to a media directory on your laptop instead, the
# database records point at files the deployment does not have, and every image
# is broken with nothing to indicate why. This refuses to start in that case.
set -euo pipefail

BRANCH="${1:-}"
ENV_FILE=".env.remote"

if [[ "$BRANCH" != "dev" && "$BRANCH" != "production" ]]; then
  cat >&2 <<MSG
Usage: scripts/fill-remote.sh <dev|production>

Names the Neon branch to fill. It is never taken from DATABASE_URI, which
means a different database in every context and is the easy way to write
demo content over the live site by accident.
MSG
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  cat >&2 <<MSG
No $ENV_FILE found.

Create it with the target environment's values:

  DATABASE_URI="<neon pooled connection string>"
  R2_BUCKET="samenzin-media"
  R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
  R2_ACCESS_KEY_ID="<token>"
  R2_SECRET_ACCESS_KEY="<secret>"
  R2_PUBLIC_URL="<public bucket address>"

See docs/environments.md.
MSG
  exit 1
fi

# The file is read, not executed.
#
# Sourcing it looked simpler and was wrong. A Neon connection string ends in
# "?sslmode=require&channel_binding=require", and an unquoted & makes the shell
# treat the assignment as a background job: it runs in a subshell and the value
# never reaches this one. The variable then looks empty for no visible reason.
# Parsing also means a stray line in the file cannot execute anything.
read_env_value() {
  local key="$1" line value
  line="$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}=" "$ENV_FILE" | tail -1 || true)"
  [[ -z "$line" ]] && return 0

  value="${line#*=}"
  value="${value%$'\r'}"                       # files written on Windows
  value="${value%\"}"; value="${value#\"}"      # optional double quotes
  value="${value%\'}"; value="${value#\'}"      # optional single quotes
  printf '%s' "$value"
}

# By name, never from DATABASE_URI. See scripts/neon.sh for the same reasoning.
if [[ "$BRANCH" == "dev" ]]; then
  DATABASE_URI="$(read_env_value NEON_DEV_DATABASE_URI)"
else
  DATABASE_URI="$(read_env_value NEON_PRODUCTION_DATABASE_URI)"
fi
R2_BUCKET="$(read_env_value R2_BUCKET)"
R2_ENDPOINT="$(read_env_value R2_ENDPOINT)"
R2_ACCESS_KEY_ID="$(read_env_value R2_ACCESS_KEY_ID)"
R2_SECRET_ACCESS_KEY="$(read_env_value R2_SECRET_ACCESS_KEY)"
R2_PUBLIC_URL="$(read_env_value R2_PUBLIC_URL)"

export DATABASE_URI R2_BUCKET R2_ENDPOINT R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_PUBLIC_URL

MISSING=()
for name in DATABASE_URI R2_BUCKET R2_ENDPOINT R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_PUBLIC_URL; do
  [[ -z "${!name:-}" ]] && MISSING+=("$name")
done

if (( ${#MISSING[@]} > 0 )); then
  echo "Missing in $ENV_FILE: ${MISSING[*]}" >&2
  echo "All six are required. Without the R2 values the images would be written" >&2
  echo "to this machine and every image on the deployment would be broken." >&2
  exit 1
fi

HOST="$(echo "$DATABASE_URI" | sed -E 's#^[^@]*@##; s#/.*$##')"

if [[ "$DATABASE_URI" == *localhost* || "$DATABASE_URI" == *127.0.0.1* ]]; then
  echo "DATABASE_URI in $ENV_FILE points at a local database." >&2
  echo "This script is for filling a hosted environment; use pnpm seed locally." >&2
  exit 1
fi

echo
echo "  Target database : $HOST"
echo "  Target bucket   : $R2_BUCKET"
echo
echo "  This overwrites the site settings, the pages and the ANBI record there."
read -r -p "  Continue? [y/N] " reply
[[ "$reply" == "y" || "$reply" == "Y" ]] || exit 1

echo
echo "==> 1/3 Applying the schema"
# NODE_ENV=production keeps `push` off. Without it Payload connects with schema
# push enabled and rewrites the target's schema to match this machine.
NODE_ENV=production pnpm payload migrate

echo
echo "==> 2/3 Writing content and uploading images"
SEED_ALLOW_REMOTE=true NODE_ENV=production pnpm seed

# The seed writes placeholder ANBI values, so the real ones go in afterwards.
# The loader is not in this repository: it carries the board members' names.
# The seed does not touch anbi-gegevens on a hosted database, so there is
# nothing to put back. This only runs if a real record has to be loaded into an
# environment that has none.
if [[ -f .devseed/load-anbi.ts ]]; then
  echo
  echo "==> 3/3 Loading the real ANBI content"
  NODE_ENV=production pnpm payload run .devseed/load-anbi.ts
else
  echo
  echo "==> 3/3 No .devseed/load-anbi.ts, so nothing to load."
  echo "    Whatever ANBI record that environment already had is unchanged."
fi

echo
echo "Done. Open the deployment's /admin and create the first account."

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

ENV_FILE="${1:-.env.remote}"

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

DATABASE_URI="$(read_env_value DATABASE_URI)"
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
pnpm payload migrate

echo
echo "==> 2/3 Writing content and uploading images"
SEED_ALLOW_REMOTE=true pnpm seed

# The seed writes placeholder ANBI values, so the real ones go in afterwards.
# The loader is not in this repository: it carries the board members' names.
if [[ -f .devseed/load-anbi.ts ]]; then
  echo
  echo "==> 3/3 Loading the real ANBI content"
  pnpm payload run .devseed/load-anbi.ts
else
  echo
  echo "==> 3/3 Skipped: .devseed/load-anbi.ts not found."
  echo "    The ANBI page will show placeholder values until it is loaded."
  echo "    See PROGRESS.md; it can be rebuilt from docs/ANBI_guide.docx."
fi

echo
echo "Done. Open the deployment's /admin and create the first account."

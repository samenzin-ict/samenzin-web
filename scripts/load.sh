#!/usr/bin/env bash
#
# Runs one of the content loaders against a named environment.
#
#   scripts/load.sh load-legal.ts local
#   scripts/load.sh load-over-ons.ts dev
#   scripts/load.sh load-over-ons.ts production
#
# Use it through the package scripts: pnpm load:legal, pnpm load:over-ons.
#
# Named like scripts/neon.sh, and for the same reason: DATABASE_URI means a
# different database in every context, so the target is said out loud and never
# guessed.
#
# A loader that uploads files needs the R2 variables in the same invocation.
# Leaving them out is silent and expensive: the images are written to a media
# directory on this machine, the database rows point at files the deployment
# does not have, and every image is broken with nothing to say why. Pass
# --uploads and this refuses to start instead.
set -euo pipefail

UPLOADS=false

if [[ "${1:-}" == "--uploads" ]]; then
  UPLOADS=true
  shift
fi

SCRIPT="${1:-}"
BRANCH="${2:-local}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "$SCRIPT" || ! -f "scripts/$SCRIPT" ]]; then
  echo "Usage: scripts/load.sh [--uploads] <script.ts> [local|dev|production]" >&2
  exit 1
fi

# Parsed line by line, never sourced: a Neon connection string contains an
# unquoted & that bash would read as "run this in the background".
read_var() {
  local name="$1" file="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${name}=" "$file" | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//'
}

# .env.remote first for a hosted branch, falling back to .env.
read_for_branch() {
  local name="$1" value=""

  if [[ "$BRANCH" != "local" ]]; then
    value="$(read_var "$name" .env.remote)"
  fi

  [[ -n "$value" ]] || value="$(read_var "$name" .env)"
  printf '%s' "$value"
}

case "$BRANCH" in
  local)
    URI="$(read_var DATABASE_URI .env)"
    ;;
  dev)
    URI="$(read_for_branch NEON_DEV_DATABASE_URI)"
    ;;
  production)
    URI="$(read_for_branch NEON_PRODUCTION_DATABASE_URI)"
    ;;
  *)
    echo "Usage: scripts/load.sh [--uploads] <script.ts> [local|dev|production]" >&2
    exit 1
    ;;
esac

SECRET="$(read_for_branch PAYLOAD_SECRET)"

if [[ -z "$URI" ]]; then
  echo "No connection string for '$BRANCH'. See docs/environments.md." >&2
  exit 1
fi

# Only set when this loader uploads and the target is hosted. A loader that
# writes no files is run exactly as it was before, with nothing extra in its
# environment to change how media URLs are resolved.
ENV_ARGS=()

if [[ "$UPLOADS" == "true" && "$BRANCH" != "local" ]]; then
  R2_BUCKET="$(read_for_branch R2_BUCKET)"
  R2_ENDPOINT="$(read_for_branch R2_ENDPOINT)"
  R2_ACCESS_KEY_ID="$(read_for_branch R2_ACCESS_KEY_ID)"
  R2_SECRET_ACCESS_KEY="$(read_for_branch R2_SECRET_ACCESS_KEY)"
  R2_PUBLIC_URL="$(read_for_branch R2_PUBLIC_URL)"

  MISSING=()
  for name in R2_BUCKET R2_ENDPOINT R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_PUBLIC_URL; do
    if [[ -z "${!name}" ]]; then MISSING+=("$name"); fi
  done

  if (( ${#MISSING[@]} > 0 )); then
    echo "Missing for '$BRANCH': ${MISSING[*]}" >&2
    echo "This loader uploads images. Without these they would be written to this" >&2
    echo "machine and every image on the deployment would be broken." >&2
    exit 1
  fi

  for name in R2_BUCKET R2_ENDPOINT R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_PUBLIC_URL; do
    ENV_ARGS+=("$name=${!name}")
  done
fi

echo "script: $SCRIPT"
echo "branch: $BRANCH"
echo "host:   $(printf '%s' "$URI" | sed 's|.*@||; s|/.*||')"
if [[ -n "${R2_BUCKET:-}" ]]; then echo "bucket: $R2_BUCKET"; fi
echo

# NODE_ENV=production keeps Payload's schema push off, so connecting to a hosted
# database cannot rewrite its schema to match this machine.
env \
  NODE_ENV=production \
  DATABASE_URI="$URI" \
  PAYLOAD_SECRET="$SECRET" \
  "${ENV_ARGS[@]}" \
  npx payload run "scripts/$SCRIPT"

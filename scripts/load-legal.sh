#!/usr/bin/env bash
#
# Publishes the privacyverklaring and the cookiebeleid.
#
#   pnpm load:legal              the local database
#   pnpm load:legal dev          the Neon dev branch
#   pnpm load:legal production   the Neon production branch
#
# Named like scripts/neon.sh, and for the same reason: DATABASE_URI means a
# different database in every context, so the target is said out loud.
set -euo pipefail

BRANCH="${1:-local}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

read_var() {
  local name="$1" file="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${name}=" "$file" | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//'
}

case "$BRANCH" in
  local)
    URI="$(read_var DATABASE_URI .env)"
    SECRET="$(read_var PAYLOAD_SECRET .env)"
    ;;
  dev|production)
    if [[ "$BRANCH" == "dev" ]]; then VAR=NEON_DEV_DATABASE_URI; else VAR=NEON_PRODUCTION_DATABASE_URI; fi
    URI="$(read_var "$VAR" .env.remote)"
    [[ -n "$URI" ]] || URI="$(read_var "$VAR" .env)"
    SECRET="$(read_var PAYLOAD_SECRET .env.remote)"
    [[ -n "$SECRET" ]] || SECRET="$(read_var PAYLOAD_SECRET .env)"
    ;;
  *)
    echo "Usage: pnpm load:legal [local|dev|production]" >&2
    exit 1
    ;;
esac

if [[ -z "$URI" ]]; then
  echo "No connection string for '$BRANCH'. See docs/environments.md." >&2
  exit 1
fi

echo "branch: $BRANCH"
echo "host:   $(printf '%s' "$URI" | sed 's|.*@||; s|/.*||')"
echo

# NODE_ENV=production keeps Payload's schema push off, so connecting to a hosted
# database cannot rewrite its schema to match this machine.
NODE_ENV=production \
DATABASE_URI="$URI" \
PAYLOAD_SECRET="$SECRET" \
  npx payload run scripts/load-legal.ts

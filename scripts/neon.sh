#!/usr/bin/env bash
#
# Talk to one named Neon branch, on purpose.
#
#   scripts/neon.sh dev status
#   scripts/neon.sh dev migrate
#   scripts/neon.sh production status
#   scripts/neon.sh production migrate
#
# Why this exists. DATABASE_URI means "whichever database this process talks
# to", which is a different database in every context: your laptop, a Vercel
# preview, production. Reading it out of a file and hoping it points where you
# think is how production gets migrated by accident. This script never reads
# DATABASE_URI. It reads NEON_DEV_DATABASE_URI or NEON_PRODUCTION_DATABASE_URI,
# named for the branch they mean, and prints the host before it does anything.
#
# It also forces NODE_ENV=production. src/payload.config.ts sets
# `push: NODE_ENV !== 'production'`, so without it Payload connects with schema
# push enabled and pushes your local schema into the target instead of
# migrating it, silently. That has happened once; it is why this file exists.
set -euo pipefail

BRANCH="${1:-}"
ACTION="${2:-}"

if [[ "$BRANCH" != "dev" && "$BRANCH" != "production" ]] ||
   [[ "$ACTION" != "status" && "$ACTION" != "migrate" && "$ACTION" != "baseline" ]]; then
  cat >&2 <<MSG
Usage: scripts/neon.sh <dev|production> <status|migrate|baseline>

  status    list which migrations have run on that branch, change nothing
  migrate   run the migrations that have not run yet
  baseline  record every migration as applied without running it, for a
            database whose schema was pushed instead of migrated
MSG
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Parsed line by line, never sourced: a Neon connection string contains an
# unquoted & that bash would read as "run this in the background".
read_var() {
  local name="$1" file="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${name}=" "$file" | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//'
}

if [[ "$BRANCH" == "dev" ]]; then
  VAR=NEON_DEV_DATABASE_URI
else
  VAR=NEON_PRODUCTION_DATABASE_URI
fi

URI="$(read_var "$VAR" .env.remote)"
[[ -n "$URI" ]] || URI="$(read_var "$VAR" .env)"

if [[ -z "$URI" ]]; then
  cat >&2 <<MSG
$VAR is not set in .env.remote or .env.

Find it in the Neon console: Project -> Branches -> $BRANCH -> Connection
string. Put it in .env.remote, which is gitignored.
MSG
  exit 1
fi

SECRET="$(read_var PAYLOAD_SECRET .env.remote)"
[[ -n "$SECRET" ]] || SECRET="$(read_var PAYLOAD_SECRET .env)"

HOST="$(printf '%s' "$URI" | sed 's|.*@||; s|/.*||')"

echo "branch:  $BRANCH"
echo "host:    $HOST"
echo "action:  $ACTION"
echo

if [[ "$BRANCH" == "production" && "$ACTION" != "status" ]]; then
  echo "This changes the live database that samenzin.org reads."
  echo "Take a Neon branch or snapshot first if you have not already."
  read -r -p 'Type the word production to continue: ' CONFIRM
  if [[ "$CONFIRM" != "production" ]]; then
    echo "Stopped. Nothing was changed." >&2
    exit 1
  fi
  echo
fi

# Output goes straight to the terminal. Payload asks a yes/no question before
# migrating a database that has been pushed to, and piping through grep or sed
# hides the question and looks like a hang.
if [[ "$ACTION" == "baseline" ]]; then
  NODE_ENV=production \
  DATABASE_URI="$URI" \
  PAYLOAD_SECRET="$SECRET" \
    npx payload run scripts/neon-baseline.ts
  exit 0
fi

if [[ "$ACTION" == "status" ]]; then
  COMMAND="migrate:status"
else
  COMMAND="migrate"
fi

NODE_ENV=production \
DATABASE_URI="$URI" \
PAYLOAD_SECRET="$SECRET" \
  npx payload "$COMMAND"

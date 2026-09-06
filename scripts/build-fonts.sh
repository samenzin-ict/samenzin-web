#!/usr/bin/env bash
#
# Regenerate the self-hosted webfonts in src/fonts/files.
#
# Downloads the upstream variable fonts from the google/fonts repository and
# subsets them to latin + latin-ext. Run this only when the character coverage
# needs to change; the output is committed so the build never depends on a
# network fetch.
#
# Usage: scripts/build-fonts.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/src/fonts/files"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The Google Fonts latin + latin-ext ranges, concatenated.
RANGE="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,\
U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,\
U+FFFD,U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,\
U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,\
U+A720-A7FF"

FEATURES='kern,liga,clig,calt,ccmp,locl,mark,mkmk'
BASE='https://raw.githubusercontent.com/google/fonts/main/ofl'

echo "==> Setting up fonttools"
python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install --quiet 'fonttools[woff]' brotli

echo "==> Downloading upstream fonts"
curl -sfL "$BASE/sourceserif4/SourceSerif4%5Bopsz,wght%5D.ttf" -o "$WORK/serif.ttf"
curl -sfL "$BASE/sourcesans3/SourceSans3%5Bwght%5D.ttf" -o "$WORK/sans.ttf"
curl -sfL "$BASE/sourcesans3/SourceSans3-Italic%5Bwght%5D.ttf" -o "$WORK/sans-italic.ttf"
curl -sfL "$BASE/sourceserif4/OFL.txt" -o "$OUT/OFL-SourceSerif4.txt"
curl -sfL "$BASE/sourcesans3/OFL.txt" -o "$OUT/OFL-SourceSans3.txt"

# The serif is only used for headings, so the optical size axis is pinned
# rather than shipped. Keeping it doubles the file for no visible benefit.
echo "==> Pinning the optical size axis of Source Serif 4"
"$WORK/venv/bin/fonttools" varLib.instancer \
  "$WORK/serif.ttf" opsz=24 -o "$WORK/serif-pinned.ttf" >/dev/null

subset() {
  "$WORK/venv/bin/pyftsubset" "$1" \
    --output-file="$OUT/$2" \
    --flavor=woff2 \
    --layout-features="$FEATURES" \
    --unicodes="$RANGE" \
    --name-IDs='*' --name-legacy --notdef-outline --recalc-bounds
  printf '    %-36s %s\n' "$2" "$(du -h "$OUT/$2" | cut -f1)"
}

echo "==> Subsetting"
subset "$WORK/serif-pinned.ttf" SourceSerif4-Variable.woff2
subset "$WORK/sans.ttf"         SourceSans3-Variable.woff2
subset "$WORK/sans-italic.ttf"  SourceSans3-Italic-Variable.woff2

echo "==> Done. Review the diff before committing."

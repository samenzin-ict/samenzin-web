# Fonts

Self-hosted, so no visitor IP address is sent to a third party and the
no-cookie-banner position stays intact. Nothing here is fetched at build time.

| Role | Family | Stands in for |
|---|---|---|
| Everything: headings, body, interface | Nunito Sans | Avenir |

The house style (`docs/SamenZin_Visual_Identity_Guidelines.pdf`, page 8) sets
the whole identity in Avenir:

| Use | Avenir | Here |
|---|---|---|
| Titles | Heavy / Bold | Nunito Sans 800 / 700 |
| Subtitles | Medium | Nunito Sans 600 |
| Running text | Book / Roman | Nunito Sans 400 |
| Small labels | Medium, capitals, extra letter spacing | Nunito Sans 600, `uppercase tracking-widest` |

Avenir belongs to Monotype/Linotype and needs a paid web licence to be served
from a website. Nunito Sans is the closest open geometric sans: same round
bowls, single-storey `g`, the same calm, even colour on the page. If the
foundation ever buys an Avenir web licence, replace the two files and the
`src` entries in `index.ts`; nothing else in the site names the family.

Nunito Sans is released under the SIL Open Font License 1.1. The licence text is
in this folder next to the files and must stay with them.

## What is in the files

Variable fonts covering weight 400 to 800, subset to the Google Fonts `latin`
and `latin-ext` ranges. That covers Dutch and also the Turkish, Polish and
other Latin-script names the foundation works with.

| File | Size |
|---|---|
| `NunitoSans-Variable.woff2` | 40 KB |
| `NunitoSans-Italic-Variable.woff2` | 43 KB |

Upstream ships four axes. Width, optical size and x-height (`YTLC`) are pinned
at their defaults, and weight is narrowed to 400–800, which roughly halves the
files. Widen the weight range in `scripts/build-fonts.sh` if a lighter or
heavier weight is ever needed.

## Regenerating

Run `scripts/build-fonts.sh`. It downloads the upstream variable fonts from the
`google/fonts` repository and subsets them. Requires Python 3.

Only rerun this if the character coverage needs to change. The output files are
committed on purpose: the build must not depend on Google being reachable.

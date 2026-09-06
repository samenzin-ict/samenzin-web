# Fonts

Self-hosted, so no visitor IP address is sent to a third party and the
no-cookie-banner position stays intact. Nothing here is fetched at build time.

| Role | Family | Replaces |
|---|---|---|
| Headings | Source Serif 4 | Cambria |
| Body and interface | Source Sans 3 | Calibri |

Both are released under the SIL Open Font License 1.1. The licence text is in
this folder next to the files and must stay with them.

## What is in the files

All three are variable fonts covering weight 400 to 700 in one file, subset to
the Google Fonts `latin` and `latin-ext` ranges. That covers Dutch and also the
Turkish, Polish and other Latin-script names the foundation works with.

| File | Size |
|---|---|
| `SourceSerif4-Variable.woff2` | 70 KB |
| `SourceSans3-Variable.woff2` | 69 KB |
| `SourceSans3-Italic-Variable.woff2` | 67 KB |

Two deliberate omissions:

- **No serif italic.** The serif is only used for headings, which are not set
  in italic. Skipping it saves 180 KB.
- **The optical size axis of Source Serif 4 is pinned at 24.** Keeping the axis
  doubled the file to 166 KB for a face that is only used at heading sizes.

Source Serif 4 has no glyph for the Dutch `ĳ` ligature (U+0133). This is an
upstream gap in the font. It does not matter in practice: Dutch digital text is
written with a separate `i` and `j`. Source Sans 3 does have it.

## Regenerating

Run `scripts/build-fonts.sh`. It downloads the upstream variable fonts from the
`google/fonts` repository and subsets them. Requires Python 3.

Only rerun this if the character coverage needs to change. The output files are
committed on purpose: the build must not depend on Google being reachable.

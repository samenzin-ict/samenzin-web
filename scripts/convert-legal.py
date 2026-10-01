#!/usr/bin/env python3
"""
Turns the Word files in docs/ into the JSON that scripts/load-legal.ts loads.

    python3 scripts/convert-legal.py

Run it again whenever the legal texts change, then re-run the loader.

Why the output goes to .devseed/ and not into the repository: the
privacyverklaring carries the foundation's postal address, e-mail address, KvK
number and RSIN. That is the same reason the real ANBI text is kept out (see
PROGRESS.md), and CLAUDE.md rule 2 says no real addresses in the repository.
Both docs/*.docx and .devseed/ are gitignored.

The Word styling cannot be trusted on its own: the author used "Heading 2" for
body paragraphs as well as for section headings. What reliably marks a heading
is the numbering the document itself uses — "1. Uitgangspunten", "3.2 Contact
met ons opnemen" — so that is what this keys on.
"""
import json
import pathlib
import re
import sys
import zipfile
from html import unescape

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / ".devseed" / "legal.json"

SOURCES = [
    ("privacyverklaring", "Privacyverklaring-samenzin.docx"),
    ("cookiebeleid", "Cookiebeleid-samenzin.docx"),
]

NUMBERED = re.compile(r"^(\d+(?:\.\d+)*)\.?\s+\S")
TEXT_RUN = re.compile(r"<w:t(?=[\s>])[^>]*>(.*?)</w:t>", re.S)
PARA = re.compile(r"<w:p(?:\s[^>]*)?>.*?</w:p>|<w:p(?:\s[^>]*)?/>", re.S)


def text_of(xml: str) -> str:
    return unescape("".join(TEXT_RUN.findall(xml))).replace(" ", " ").strip()


def read_body(path: pathlib.Path) -> str:
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")
    return re.search(r"<w:body>(.*)</w:body>", xml, re.S).group(1)


def parse_table(xml: str) -> list[list[str]]:
    rows = []
    for row in re.findall(r"<w:tr(?:\s[^>]*)?>.*?</w:tr>", xml, re.S):
        cells = [text_of(c) for c in re.findall(r"<w:tc(?:\s[^>]*)?>.*?</w:tc>", row, re.S)]
        if any(cells):
            rows.append(cells)
    return rows


def convert(path: pathlib.Path) -> dict:
    body = read_body(path)
    blocks: list[dict] = []
    title = None
    seen_heading = False

    # Walk tables and paragraphs in document order.
    for match in re.finditer(r"<w:tbl(?:\s[^>]*)?>.*?</w:tbl>|" + PARA.pattern, body, re.S):
        chunk = match.group(0)

        if chunk.startswith("<w:tbl"):
            rows = parse_table(chunk)
            if not rows:
                continue
            if len(rows[0]) == 2:
                # A label/value table, such as "KVK-nummer | 42150088".
                blocks.append(
                    {"type": "ul", "items": [f"{a}: {b}" for a, b in rows if a or b]}
                )
            else:
                # A wider table, such as the cookie list. Rendered as a block per
                # row rather than as a grid: five columns is unreadable on a
                # phone, and CLAUDE.md asks for the small screen first.
                header, *body_rows = rows
                for row in body_rows:
                    blocks.append({"type": "h3", "text": row[0]})
                    blocks.append(
                        {
                            "type": "ul",
                            "items": [
                                f"{header[i]}: {row[i]}"
                                for i in range(1, min(len(header), len(row)))
                                if row[i]
                            ],
                        }
                    )
            continue

        style = re.search(r'<w:pStyle\s+w:val="([^"]*)"', chunk)
        style = style.group(1) if style else ""
        text = text_of(chunk)
        if not text:
            continue

        if style == "Heading" and title is None:
            title = text
            continue

        numbered = NUMBERED.match(text)
        if numbered and len(text) < 120:
            depth = numbered.group(1).count(".")
            blocks.append({"type": "h2" if depth == 0 else "h3", "text": text})
            seen_heading = True
        elif (
            seen_heading
            and style in ("Heading 2", "Heading 3")
            and len(text) < 80
            and not text.endswith(".")
        ):
            # An unnumbered subheading, such as "Een toelichting bij het
            # formulier-cookie". Only after the first numbered heading: the
            # lines above it are the organisation name and the version, which
            # are front matter rather than sections.
            blocks.append({"type": "h3", "text": text})
        elif "<w:numPr>" in chunk:
            if blocks and blocks[-1]["type"] == "ul":
                blocks[-1]["items"].append(text)
            else:
                blocks.append({"type": "ul", "items": [text]})
        else:
            blocks.append({"type": "p", "text": text})

    return {"title": title or path.stem, "blocks": blocks}


def main() -> int:
    documents = {}
    for slug, filename in SOURCES:
        path = ROOT / "docs" / filename
        if not path.exists():
            print(f"Missing {path}. The Word files are gitignored; ask for a copy.", file=sys.stderr)
            return 1
        documents[slug] = convert(path)
        counts: dict[str, int] = {}
        for block in documents[slug]["blocks"]:
            counts[block["type"]] = counts.get(block["type"], 0) + 1
        print(f"  {slug}: {documents[slug]['title']} — {counts}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(documents, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

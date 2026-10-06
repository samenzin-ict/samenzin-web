#!/usr/bin/env python3
"""
Turns the Over ons Word file in docs/ into the JSON that
scripts/load-over-ons.ts publishes.

    python3 scripts/convert-over-ons.py

Run it again whenever the board revises the text, then run the loader.

Why the output goes to .devseed/ and not into the repository: the biographies
carry the board members' names, and CLAUDE.md rule 2 keeps real names out of
git. Both docs/*.docx and .devseed/ are gitignored. The privacyverklaring and
the ANBI text are handled the same way; see scripts/convert-legal.py.

Two things this keys on, neither of them the Word styling:

  * The seven section headings, matched by name. The author used "Heading 3"
    for body paragraphs as well as for headings, so the style tells us nothing.
    Matching the headings by name also means a renamed or dropped section is an
    error here rather than a silently mangled page.
  * The list numbering the document itself carries (w:numPr). Under "Wat wij
    doen" and "Meedoen" the real bullets have it and the closing paragraph does
    not, which is exactly the distinction we need and the one the paragraph
    style gets wrong.

The board members are keyed by their role, never by the name in the heading.
The names come from the ANBI record, which is the one the statutes have to
match, so the website cannot end up spelling a name two ways.
"""
import json
import pathlib
import re
import sys
import zipfile
from html import unescape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "Over_ons-samenzin.docx"
OUT = ROOT / ".devseed" / "over-ons.json"

# In the order they appear on the page. The board section is handled apart,
# because it becomes a block of its own rather than running text.
SECTIONS = [
    "Wie wij zijn",
    "Hoe het begon",
    "Waar wij voor staan",
    "Wat wij doen",
    "Hoe wij werken",
]
BOARD_SECTION = "Het bestuur"
CLOSING_SECTION = "Meedoen"
ALL_HEADINGS = SECTIONS + [BOARD_SECTION, CLOSING_SECTION]

ROLES = ["voorzitter", "secretaris", "penningmeester"]

# The sentence about the ANBI application is not stored as text. It is replaced
# by this marker, and the loader writes whichever sentence matches the status in
# the ANBI record. Otherwise the statement would be in two places and would
# disagree with /anbi on the day the application is granted.
ANBI_MARKER = "{{anbiStatus}}"
ANBI_SENTENCE = re.compile(r"\s*De aanvraag van de ANBI-status[^.]*\.")


def paragraphs(path: pathlib.Path) -> list[tuple[str, bool]]:
    """Every non-empty paragraph as (text, is_list_item)."""
    xml = zipfile.ZipFile(path).read("word/document.xml").decode("utf-8")
    result = []

    for block in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        runs = re.findall(r"<w:t[^>]*>(.*?)</w:t>", block, re.S)
        text = unescape("".join(runs)).strip()

        if not text:
            continue

        result.append((text, "<w:numPr>" in block))

    return result


def main() -> int:
    if not SOURCE.exists():
        print(f"No {SOURCE.relative_to(ROOT)}.", file=sys.stderr)
        return 1

    found = paragraphs(SOURCE)

    # Everything before the first known heading is the document's own title
    # page: "Over ons — websitetekst", the date, and the "Over ons" heading
    # that becomes the page title rather than a section.
    start = next(
        (index for index, (text, _) in enumerate(found) if text in ALL_HEADINGS),
        None,
    )

    if start is None:
        print("Found none of the expected headings. Has the document changed?", file=sys.stderr)
        return 1

    sections: dict[str, list[tuple[str, bool]]] = {}
    current: str | None = None

    for text, is_item in found[start:]:
        if text in ALL_HEADINGS:
            current = text
            sections[current] = []
            continue

        if current is not None:
            sections[current].append((text, is_item))

    missing = [heading for heading in ALL_HEADINGS if heading not in sections]

    if missing:
        print(f"Missing section(s): {', '.join(missing)}", file=sys.stderr)
        return 1

    def to_blocks(heading: str) -> list[dict]:
        """A heading and its paragraphs, with runs of bullets collected."""
        blocks: list[dict] = [{"type": "h2", "text": heading}]

        for text, is_item in sections[heading]:
            text = ANBI_SENTENCE.sub(f" {ANBI_MARKER}", text)

            if is_item and blocks and blocks[-1]["type"] == "ul":
                blocks[-1]["items"].append(text)
            elif is_item:
                blocks.append({"type": "ul", "items": [text]})
            else:
                blocks.append({"type": "p", "text": text})

        return blocks

    body: list[dict] = []

    for heading in SECTIONS:
        body.extend(to_blocks(heading))

    # The board: an introduction, one biography per role, and the closing note
    # about the adviesraad and the commissies. That last one already exists in
    # the ANBI record as boardComposition and is published on /anbi, so it is
    # not repeated here; the block reads it from there.
    board_intro: list[str] = []
    biographies: dict[str, list[str]] = {}
    role_of_heading = re.compile(r"—\s*(" + "|".join(ROLES) + r")\s*$")
    current_role: str | None = None

    for text, _ in sections[BOARD_SECTION]:
        match = role_of_heading.search(text)

        if match:
            current_role = match.group(1)
            biographies[current_role] = []
            continue

        if current_role is None:
            board_intro.append(text)
        else:
            biographies[current_role].append(text)

    absent = [role for role in ROLES if not biographies.get(role)]

    if absent:
        print(f"No biography for: {', '.join(absent)}", file=sys.stderr)
        return 1

    # The last paragraph under the last person is the note about the adviesraad,
    # not part of that biography.
    last = biographies[ROLES[-1]]

    if last and last[-1].startswith("Het bestuur wordt bijgestaan"):
        last.pop()

    document = {
        "title": "Over ons",
        "body": body,
        "board": {
            "heading": BOARD_SECTION,
            "intro": " ".join(board_intro),
            "biographies": biographies,
        },
        "closing": to_blocks(CLOSING_SECTION),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(document, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {OUT.relative_to(ROOT)}")
    print(f"  {len(body)} blocks, {len(biographies)} biographies, {len(document['closing'])} closing blocks")

    return 0


if __name__ == "__main__":
    sys.exit(main())

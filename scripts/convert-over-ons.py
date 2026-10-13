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

A section becomes one of two things, and the document decides which. Where the
paragraphs open with a bold run — "**Taalmaatje** — vrijwilligers oefenen…",
"**Open voor iedereen.** Onze activiteiten…" — they are named points and
become a list of titled items, with whatever precedes them as an introduction
and whatever follows as a closing line. Everything else is running text. That
is what lets the page set a principle as a card and a history as prose without
anybody tagging the Word file.

How each section is then laid out is the small table below. It is presentation
and not content, which is why it lives here and can be changed without touching
the document.

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

# How each section is drawn. A section missing from this table gets the
# defaults: heading beside the text, or cards, on the plain background.
PRESENTATION = {
    "Wie wij zijn": {"layout": "lead"},
    "Waar wij voor staan": {"tone": "soft"},
    "Wat wij doen": {"layout": "rows"},
    "Hoe wij werken": {"layout": "cards", "tone": "soft"},
    "Meedoen": {"layout": "cards", "tone": "strong"},
}

# The sentence about the ANBI application is not stored as text. It is replaced
# by this marker, and the loader writes whichever sentence matches the status in
# the ANBI record. Otherwise the statement would be in two places and would
# disagree with /anbi on the day the application is granted.
ANBI_MARKER = "{{anbiStatus}}"
ANBI_SENTENCE = re.compile(r"\s*De aanvraag van de ANBI-status[^.]*\.")


def paragraphs(path: pathlib.Path) -> list[dict]:
    """Every non-empty paragraph: its text, its runs, whether it is a bullet."""
    xml = zipfile.ZipFile(path).read("word/document.xml").decode("utf-8")
    result = []

    for block in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        runs: list[dict] = []

        for run in re.findall(r"<w:r[ >].*?</w:r>", block, re.S):
            text = unescape("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", run, re.S)))

            if not text:
                continue

            bold = bool(re.search(r"<w:b/>|<w:b ", run))

            # Word splits a word across runs for its own reasons; neighbours
            # that are formatted alike are one run as far as we are concerned.
            if runs and runs[-1]["bold"] == bold:
                runs[-1]["text"] += text
            else:
                runs.append({"text": text, "bold": bold})

        text = "".join(run["text"] for run in runs).strip()

        if not text:
            continue

        result.append({"text": text, "runs": runs, "item": "<w:numPr>" in block})

    return result


def named_point(paragraph: dict) -> dict | None:
    """A paragraph that opens with a bold name, as a title and its explanation.

    "**Taalmaatje** — vrijwilligers oefenen…" and "**Open voor iedereen.** Onze
    activiteiten…" are the same thing written two ways, so the dash that follows
    one and the full stop that ends the other are both dropped.
    """
    runs = paragraph["runs"]

    if len(runs) < 2 or not runs[0]["bold"]:
        return None

    title = runs[0]["text"].strip().rstrip(".").strip()
    text = "".join(run["text"] for run in runs[1:]).strip()
    after_dash = re.sub(r"^[—–-]\s*", "", text)

    # What followed a dash was the middle of a sentence; set apart from its
    # title it is the start of one.
    if after_dash != text:
        text = after_dash[:1].upper() + after_dash[1:]

    if not title or not text:
        return None

    return {"title": title, "text": ANBI_SENTENCE.sub(f" {ANBI_MARKER}", text)}


def to_block(heading: str, found: list[dict]) -> dict:
    """One section of the document as the block the page will draw."""
    look = PRESENTATION.get(heading, {})
    points = [named_point(paragraph) for paragraph in found]

    if any(points):
        first = next(index for index, point in enumerate(points) if point)
        last = max(index for index, point in enumerate(points) if point)

        return {
            "kind": "highlights",
            "heading": heading,
            "intro": " ".join(paragraph["text"] for paragraph in found[:first]),
            "items": [point for point in points if point],
            "outro": " ".join(paragraph["text"] for paragraph in found[last + 1 :]),
            "layout": look.get("layout", "cards"),
            "tone": look.get("tone", "plain"),
        }

    return {
        "kind": "section",
        "heading": heading,
        "body": [
            {"type": "p", "text": ANBI_SENTENCE.sub(f" {ANBI_MARKER}", paragraph["text"])}
            for paragraph in found
        ],
        "layout": look.get("layout", "rail"),
        "tone": look.get("tone", "plain"),
    }


def main() -> int:
    if not SOURCE.exists():
        print(f"No {SOURCE.relative_to(ROOT)}.", file=sys.stderr)
        return 1

    found = paragraphs(SOURCE)

    # Everything before the first known heading is the document's own title
    # page: "Over ons — websitetekst", the date, and the "Over ons" heading
    # that becomes the page title rather than a section.
    start = next(
        (index for index, paragraph in enumerate(found) if paragraph["text"] in ALL_HEADINGS),
        None,
    )

    if start is None:
        print("Found none of the expected headings. Has the document changed?", file=sys.stderr)
        return 1

    sections: dict[str, list[dict]] = {}
    current: str | None = None

    for paragraph in found[start:]:
        if paragraph["text"] in ALL_HEADINGS:
            current = paragraph["text"]
            sections[current] = []
            continue

        if current is not None:
            sections[current].append(paragraph)

    missing = [heading for heading in ALL_HEADINGS if heading not in sections]

    if missing:
        print(f"Missing section(s): {', '.join(missing)}", file=sys.stderr)
        return 1

    # The board: an introduction, one biography per role, and the closing note
    # about the adviesraad and the commissies. That last one already exists in
    # the ANBI record as boardComposition and is published on /anbi, so it is
    # not repeated here; the block reads it from there.
    board_intro: list[str] = []
    biographies: dict[str, list[str]] = {}
    role_of_heading = re.compile(r"—\s*(" + "|".join(ROLES) + r")\s*$")
    current_role: str | None = None

    for paragraph in sections[BOARD_SECTION]:
        text = paragraph["text"]
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

    # The page, top to bottom, in the order the document has it.
    blocks: list[dict] = []

    for heading in ALL_HEADINGS:
        if heading == BOARD_SECTION:
            blocks.append({"kind": "board", "heading": heading, "intro": " ".join(board_intro)})
        else:
            blocks.append(to_block(heading, sections[heading]))

    document = {"title": "Over ons", "blocks": blocks, "biographies": biographies}

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(document, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {OUT.relative_to(ROOT)}")

    for block in blocks:
        detail = (
            f"{len(block['items'])} points, {block['layout']}, {block['tone']}"
            if block["kind"] == "highlights"
            else f"{len(block['body'])} paragraphs, {block['layout']}, {block['tone']}"
            if block["kind"] == "section"
            else f"{len(biographies)} biographies"
        )
        print(f"    {block['kind']:<10} {block['heading']} — {detail}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

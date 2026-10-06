#!/usr/bin/env python3
"""
Turns the Projecten Word file in docs/ into the JSON that
scripts/load-projecten.ts publishes.

    python3 scripts/convert-projecten.py

Run it again whenever the board revises the text, then run the loader.

The output goes to .devseed/ and not into the repository, for the same reason
as the other two converters: these are the foundation's own texts, revised in
Word, and docs/*.docx is gitignored. See scripts/convert-legal.py and
scripts/convert-over-ons.py.

The document has a fixed shape, one block per project:

    N. Title
    Kaarttekst: one line for the card in the overview
    Status: loopt | in voorbereiding, optionally followed by "— a short note"
    ... the body of the project page ...

so that is what this keys on, rather than the paragraph styles. The author used
"Heading2" for the project titles but also for "Projecten" and "Meedoen", and
the labelled lines are ordinary paragraphs, so a numbered "N. Title" heading is
the only marker that means exactly one thing.

Two details carried through from the document because they change how the page
reads. Bullets are taken from the list numbering the document itself holds, not
from the paragraph style, which is wrong on the closing paragraph of a list.
And a bold opening — "**Voor wie:** iedereen die…" — is kept as a run, because
losing it turns six labelled lines into a wall of prose.
"""
import json
import pathlib
import re
import sys
import zipfile
from html import unescape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "Projecten-samenzin.docx"
OUT = ROOT / ".devseed" / "projecten.json"

# "1. Taalmaatje", "7. Studentenhuisvesting en ruimten voor bezinning"
PROJECT_HEADING = re.compile(r"^(\d+)\.\s+(.*\S)\s*$")

CARD_LABEL = "Kaarttekst:"
STATUS_LABEL = "Status:"

# "loopt", "in voorbereiding", "loopt — zwaartepunt van ons werk"
STATUS_LINE = re.compile(r"^(loopt|in voorbereiding)\s*(?:[—–-]\s*(.*\S))?\s*$", re.I)
PHASES = {"loopt": "loopt", "in voorbereiding": "in-voorbereiding"}

# The section that introduces the list, before the first numbered project.
INTRO_HEADING = "Onze initiatieven"

# The invitation that closes the document, after the last numbered project. It
# is kept out of the page: the same three ways to help are already published on
# /over-ons, and the overview ends with the cards themselves. Captured here so
# that adding it later is a change to the loader and not another conversion.
CLOSING_HEADING = "Meedoen"


def paragraphs(path: pathlib.Path) -> list[dict]:
    """Every non-empty paragraph, with its runs and whether it is a list item."""
    xml = zipfile.ZipFile(path).read("word/document.xml").decode("utf-8")
    result = []

    for block in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        runs = []

        for run in re.findall(r"<w:r[ >].*?</w:r>", block, re.S):
            text = unescape("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", run, re.S)))

            if not text:
                continue

            bold = bool(re.search(r"<w:b/>|<w:b ", run))

            # Word splits a word across runs for all sorts of reasons; join
            # neighbours that are formatted the same so "Y|ö|nder" is one run.
            if result is not None and runs and runs[-1]["bold"] == bold:
                runs[-1]["text"] += text
            else:
                runs.append({"text": text, "bold": bold})

        if not runs or not "".join(run["text"] for run in runs).strip():
            continue

        result.append({"runs": runs, "item": "<w:numPr>" in block})

    return result


def plain(paragraph: dict) -> str:
    return "".join(run["text"] for run in paragraph["runs"]).strip()


def inline(paragraph: dict) -> object:
    """A paragraph as the loader wants it: a string, or runs when some is bold."""
    runs = [
        {"text": run["text"], **({"bold": True} if run["bold"] else {})}
        for run in paragraph["runs"]
        if run["text"]
    ]

    if not any(run.get("bold") for run in runs):
        return plain(paragraph)

    # Trim only at the ends, so the space after a bold label survives.
    runs[0]["text"] = runs[0]["text"].lstrip()
    runs[-1]["text"] = runs[-1]["text"].rstrip()

    return [run for run in runs if run["text"]]


def to_blocks(paragraphs_in: list[dict]) -> list[dict]:
    """Paragraphs and bullets, with runs of list items collected into one list."""
    blocks: list[dict] = []

    for paragraph in paragraphs_in:
        if paragraph["item"]:
            if blocks and blocks[-1]["type"] == "ul":
                blocks[-1]["items"].append(inline(paragraph))
            else:
                blocks.append({"type": "ul", "items": [inline(paragraph)]})
        else:
            blocks.append({"type": "p", "text": inline(paragraph)})

    return blocks


def main() -> int:
    if not SOURCE.exists():
        print(f"No {SOURCE.relative_to(ROOT)}.", file=sys.stderr)
        return 1

    found = paragraphs(SOURCE)

    starts = [
        (index, PROJECT_HEADING.match(plain(paragraph)))
        for index, paragraph in enumerate(found)
    ]
    starts = [(index, match) for index, match in starts if match]

    if not starts:
        print("Found no numbered project headings. Has the document changed?", file=sys.stderr)
        return 1

    # The introduction: between its own heading and the first project.
    intro: list[dict] = []
    intro_at = next(
        (index for index, paragraph in enumerate(found) if plain(paragraph) == INTRO_HEADING),
        None,
    )

    if intro_at is not None:
        intro = to_blocks(found[intro_at + 1 : starts[0][0]])

    # Where the last project stops: at the closing invitation, if there is one.
    # Without this it would swallow it, because nothing else follows.
    closing_at = next(
        (
            index
            for index, paragraph in enumerate(found)
            if index > starts[-1][0] and plain(paragraph) == CLOSING_HEADING
        ),
        None,
    )
    tail = closing_at if closing_at is not None else len(found)
    closing = to_blocks(found[closing_at + 1 :]) if closing_at is not None else []

    projects = []
    failed = False

    for position, (index, match) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else tail
        title = match.group(2)
        card = None
        phase = None
        note = None
        body: list[dict] = []

        for paragraph in found[index + 1 : end]:
            text = plain(paragraph)

            if text.startswith(CARD_LABEL):
                card = text[len(CARD_LABEL) :].strip()
                continue

            if text.startswith(STATUS_LABEL):
                status = STATUS_LINE.match(text[len(STATUS_LABEL) :].strip())

                if not status:
                    print(f"  {title}: cannot read the status line {text!r}", file=sys.stderr)
                    failed = True
                    continue

                phase = PHASES[status.group(1).lower()]
                note = status.group(2)
                continue

            body.append(paragraph)

        for label, value in (("Kaarttekst", card), ("Status", phase)):
            if not value:
                print(f"  {title}: no {label} line", file=sys.stderr)
                failed = True

        projects.append(
            {
                "order": int(match.group(1)),
                "title": title,
                "card": card,
                "phase": phase,
                "note": note,
                "body": to_blocks(body),
            }
        )

    if failed:
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"intro": intro, "projects": projects, "closing": closing}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )

    print(f"  wrote {OUT.relative_to(ROOT)}")
    print(f"  {len(intro)} intro blocks, {len(projects)} projects, {len(closing)} closing blocks (not published)")

    for project in projects:
        print(f"    {project['order']}. {project['title']} — {project['phase']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

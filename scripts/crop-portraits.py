#!/usr/bin/env python3
"""
Cuts the board members' photographs to one shape, so a row of portraits looks
like a set rather than three snapshots.

    python3 scripts/crop-portraits.py          # needs Pillow: pip install Pillow

Reads .devseed/portraits.json and writes .devseed/portraits/<role>.jpg. Both
are gitignored: a recognisable photograph of a named person is personal data
and does not belong in the repository (CLAUDE.md rule 2). scripts/load-over-ons.ts
uploads the results to R2 and attaches them to the board.

The configuration names, per role, the source file in docs/ and the crop box in
that file's own pixels:

    {
      "voorzitter": { "file": "a-portrait.jpeg", "box": [110, 0, 609, 623] }
    }

Choosing the box is editorial work and is done by eye, once per photograph. Aim
for the same three things in each: the head the same size, the eyes at roughly
the same height, and the bottom edge across the chest. What this script
guarantees is the rest — the same aspect ratio and the same output size for
every portrait, checked rather than assumed, because that is the part that
looks broken when it drifts and the part nobody notices by eye.

What it cannot do is give three photographs the same background. Three
different rooms stay three different rooms. A tight crop makes that much less
obvious, but if the set still looks mismatched the honest answer is to take
three new photographs against one wall, or to publish no photographs at all:
/over-ons shows them only when every board member has one.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = ROOT / ".devseed" / "portraits.json"
SOURCES = ROOT / "docs"
OUT = ROOT / ".devseed" / "portraits"

# Portrait 4:5, the shape the Over ons block reserves for them. 480px wide is
# twice the width the card gives a portrait, which is what a high-density
# screen asks for; going larger would mean enlarging the smallest photograph,
# which adds bytes and no detail.
RATIO = 4 / 5
WIDTH, HEIGHT = 480, 600
# A crop box is chosen by hand, so it will not be exact to the pixel.
TOLERANCE = 0.01


def main() -> int:
    try:
        from PIL import Image
    except ModuleNotFoundError:
        print("This needs Pillow:  pip install Pillow", file=sys.stderr)
        return 1

    if not CONFIG.exists():
        print(f"No {CONFIG.relative_to(ROOT)}. See the comment at the top of this file.", file=sys.stderr)
        return 1

    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    failed = False

    for role, entry in config.items():
        source = SOURCES / entry["file"]

        if not source.exists():
            print(f"  {role}: no {source.relative_to(ROOT)}", file=sys.stderr)
            failed = True
            continue

        left, top, right, bottom = entry["box"]
        image = Image.open(source)

        if right > image.width or bottom > image.height or left < 0 or top < 0:
            print(f"  {role}: the box falls outside the image ({image.width}x{image.height})", file=sys.stderr)
            failed = True
            continue

        crop = image.crop((left, top, right, bottom))
        ratio = crop.width / crop.height

        if abs(ratio - RATIO) > TOLERANCE:
            print(f"  {role}: the box is {ratio:.3f} wide for its height, not {RATIO:.3f}", file=sys.stderr)
            failed = True
            continue

        if crop.width < WIDTH:
            print(f"  {role}: only {crop.width}px wide, which would be enlarged to {WIDTH}px", file=sys.stderr)
            failed = True
            continue

        target = OUT / f"{role}.jpg"
        crop.convert("RGB").resize((WIDTH, HEIGHT), Image.LANCZOS).save(
            target, "JPEG", quality=88, optimize=True, progressive=True
        )
        print(f"  {role}: {crop.width}x{crop.height} from {entry['file']} -> {WIDTH}x{HEIGHT}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

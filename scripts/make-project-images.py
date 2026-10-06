#!/usr/bin/env python3
"""
Draws the banner for each project: an abstract pattern in the house colours.

    python3 scripts/make-project-images.py      # needs Pillow: pip install Pillow

Writes .devseed/project-images/<n>.png, numbered by the project's place in the
document, which scripts/load-projecten.ts
uploads to R2 and attaches to the project. The directory is gitignored like the
rest of .devseed; the images are reproducible from this file, so there is no
reason to keep them in git.

Why a pattern and not a photograph. docs/design/06-projecten-overzicht-en-detail.png
draws exactly this: a band of overlapping circles, arcs and leaf shapes in the
approved palette, with the project title over it. The grid and the project page
are built around having an image, and both collapse into a column of text
without one. A pattern also costs nothing in rights or in permission, which a
photograph of identifiable people does not.

Each project gets its own arrangement, derived from its title, so the seven look
like a family without looking the same. The same title always draws the same
banner, and the colours never vary, because they come from the palette below.
"""
import hashlib
import json
import pathlib
import random
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / ".devseed" / "projecten.json"
OUT = ROOT / ".devseed" / "project-images"

# docs/design/README.md, the board-approved palette. Keep in step with
# src/styles/brand.css; these are the same six values.
FOREST = (11, 59, 54)
TEAL = (20, 101, 92)
GOLD = (203, 162, 74)
CREAM = (247, 244, 237)
SAGE = (154, 190, 182)  # Interpolated from the mockup's lighter greens.
MIST = (223, 231, 228)

# 8:5. Wide enough for the full-width banner on a project page and still
# sensible when the card crops it to 3:2.
WIDTH, HEIGHT = 1600, 1000
SUPERSAMPLE = 2


def tint(colour: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    """Towards white for a positive amount, towards black for a negative one."""
    target = (255, 255, 255) if amount > 0 else (0, 0, 0)
    weight = abs(amount)
    return tuple(round(c * (1 - weight) + t * weight) for c, t in zip(colour, target))


def draw(name: str, path: pathlib.Path) -> None:
    from PIL import Image, ImageDraw

    seed = int(hashlib.sha256(name.encode()).hexdigest()[:12], 16)
    rng = random.Random(seed)

    w, h = WIDTH * SUPERSAMPLE, HEIGHT * SUPERSAMPLE
    background = rng.choice([CREAM, MIST, tint(SAGE, 0.45)])
    image = Image.new("RGB", (w, h), background)
    pen = ImageDraw.Draw(image, "RGBA")

    def shape(kind: str, cx: float, cy: float, size: float, colour, alpha: int = 255) -> None:
        box = (cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)

        if kind == "circle":
            pen.ellipse(box, fill=colour + (alpha,))
        elif kind == "quarter":
            pen.pieslice(box, rng.choice([0, 90, 180, 270]), 0, fill=colour + (alpha,))
        else:
            # A pointed oval, the leaf in the mockup: the overlap of two circles.
            offset = size * 0.30
            left = Image.new("L", (w, h), 0)
            ImageDraw.Draw(left).ellipse((box[0] - offset, box[1], box[2] - offset, box[3]), fill=255)
            right = Image.new("L", (w, h), 0)
            ImageDraw.Draw(right).ellipse((box[0] + offset, box[1], box[2] + offset, box[3]), fill=255)
            image.paste(
                Image.new("RGB", (w, h), colour),
                (0, 0),
                Image.composite(left, Image.new("L", (w, h), 0), right),
            )

    # One big shape anchored off the right edge carries the composition, the way
    # the mockup's banner does. Everything else is placed around it.
    anchor = rng.choice([TEAL, FOREST, SAGE])
    shape("circle", w * rng.uniform(0.86, 1.04), h * rng.uniform(0.2, 0.8), h * rng.uniform(1.1, 1.5), anchor)

    # Shapes are laid on a loose grid over the right-hand two thirds rather than
    # scattered freely: free placement left some banners almost empty and others
    # a single muddy pile.
    palette = [TEAL, FOREST, SAGE, MIST, CREAM]
    columns, rows = 4, 2

    for column in range(columns):
        for row in range(rows):
            if rng.random() < 0.3:
                continue

            cx = w * (0.38 + (column + rng.uniform(0.2, 0.8)) * 0.62 / columns)
            cy = h * ((row + rng.uniform(0.1, 0.9)) / rows)
            size = h * rng.uniform(0.22, 0.52)
            colour = palette[(seed >> (column * 4 + row * 2)) % len(palette)]
            kind = rng.choice(["circle", "leaf", "quarter", "circle"])
            shape(kind, cx, cy, size, colour, alpha=rng.choice([255, 255, 205]))

    # Exactly one gold accent. Gold is the call-to-action colour in this house
    # style, so more than a touch of it here competes with the donate button.
    shape(
        rng.choice(["circle", "leaf"]),
        w * rng.uniform(0.45, 0.95),
        h * rng.uniform(0.15, 0.85),
        h * rng.uniform(0.12, 0.26),
        GOLD,
    )

    # The title sits over the left of the banner, so that side is faded back to
    # the background colour. Without it the text has no dependable contrast, and
    # no amount of redrawing fixes that.
    veil = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    veil_pen = ImageDraw.Draw(veil)

    for column in range(w):
        strength = max(0.0, 1 - (column / (w * 0.55)) ** 2)
        veil_pen.line([(column, 0), (column, h)], fill=background + (int(240 * strength),))

    image = Image.alpha_composite(image.convert("RGBA"), veil).convert("RGB")
    image.resize((WIDTH, HEIGHT), Image.LANCZOS).save(path, "PNG", optimize=True)


def main() -> int:
    try:
        import PIL  # noqa: F401
    except ModuleNotFoundError:
        print("This needs Pillow:  pip install Pillow", file=sys.stderr)
        return 1

    if not SOURCE.exists():
        print(f"No {SOURCE.relative_to(ROOT)}. Run scripts/convert-projecten.py first.", file=sys.stderr)
        return 1

    projects = json.loads(SOURCE.read_text(encoding="utf-8"))["projects"]
    OUT.mkdir(parents=True, exist_ok=True)

    for project in projects:
        # Numbered, not named: the slug is derived in TypeScript and deriving it
        # a second time here is how the two would quietly disagree.
        target = OUT / f"{project['order']}.png"
        draw(project["title"], target)
        print(f"  {target.name}  {project['title']}  {target.stat().st_size // 1024} KB")

    return 0


if __name__ == "__main__":
    sys.exit(main())

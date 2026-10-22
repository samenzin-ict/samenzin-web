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
draws exactly this: a band of overlapping circles, arcs and leaf shapes, with the
project title over it. The leaf is now the drop from the logo's symbol, which
the house style (docs/SamenZin_Visual_Identity_Guidelines.pdf, page 11) offers
as graphic language of its own. The grid and the project page
are built around having an image, and both collapse into a column of text
without one. A pattern also costs nothing in rights or in permission, which a
photograph of identifiable people does not.

Each project gets its own arrangement, derived from its title, so the seven look
like a family without looking the same. The same title always draws the same
banner, and the colours never vary, because they come from the palette below.
"""
import hashlib
import math
import json
import pathlib
import random
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / ".devseed" / "projecten.json"
OUT = ROOT / ".devseed" / "project-images"

# The house palette. Keep in step with src/styles/brand.css.
NAVY = (29, 35, 51)
OCHRE = (216, 155, 47)
TERRACOTTA = (204, 85, 47)
CREAM = (247, 244, 237)
MIST = (239, 233, 221)

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
    background = rng.choice([CREAM, MIST, tint(OCHRE, 0.75)])
    image = Image.new("RGB", (w, h), background)
    pen = ImageDraw.Draw(image, "RGBA")

    def shape(kind: str, cx: float, cy: float, size: float, colour, alpha: int = 255) -> None:
        box = (cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)

        if kind == "circle":
            pen.ellipse(box, fill=colour + (alpha,))
        elif kind == "quarter":
            pen.pieslice(box, rng.choice([0, 90, 180, 270]), 0, fill=colour + (alpha,))
        else:
            # The drop from the logo's symbol: round at one end, pointed at the
            # other, turned to a random angle. Traced as a polygon from the
            # curve x = sin(t) * sin(t / 2), y = cos(t), whose point is at t = 0.
            angle = rng.uniform(0, 2 * math.pi)
            points = []
            for step in range(120):
                t = 2 * math.pi * step / 120
                x = 0.62 * math.sin(t) * math.sin(t / 2) * size / 2
                y = math.cos(t) * size / 2
                points.append((
                    cx + x * math.cos(angle) - y * math.sin(angle),
                    cy + x * math.sin(angle) + y * math.cos(angle),
                ))
            pen.polygon(points, fill=colour + (alpha,))

    # One big shape anchored off the right edge carries the composition, the way
    # the mockup's banner does. Everything else is placed around it.
    anchor = rng.choice([NAVY, OCHRE, tint(OCHRE, 0.45)])
    shape("circle", w * rng.uniform(0.86, 1.04), h * rng.uniform(0.2, 0.8), h * rng.uniform(1.1, 1.5), anchor)

    # Shapes are laid on a loose grid over the right-hand two thirds rather than
    # scattered freely: free placement left some banners almost empty and others
    # a single muddy pile.
    palette = [NAVY, OCHRE, tint(OCHRE, 0.45), MIST, CREAM]
    columns, rows = 4, 2

    for column in range(columns):
        for row in range(rows):
            if rng.random() < 0.3:
                continue

            cx = w * (0.38 + (column + rng.uniform(0.2, 0.8)) * 0.62 / columns)
            cy = h * ((row + rng.uniform(0.1, 0.9)) / rows)
            size = h * rng.uniform(0.22, 0.52)
            colour = palette[(seed >> (column * 4 + row * 2)) % len(palette)]
            kind = rng.choice(["circle", "drop", "quarter", "drop"])
            shape(kind, cx, cy, size, colour, alpha=rng.choice([255, 255, 205]))

    # Exactly one terracotta accent. The house style lets terracotta work as an
    # accent (guidelines, page 11); more than a touch of it turns loud.
    shape(
        "drop",
        w * rng.uniform(0.45, 0.95),
        h * rng.uniform(0.15, 0.85),
        h * rng.uniform(0.16, 0.30),
        TERRACOTTA,
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

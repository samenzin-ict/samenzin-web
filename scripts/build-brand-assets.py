#!/usr/bin/env python3
"""
Turns the logo files from the media commission into the images the site serves.

    python3 scripts/build-brand-assets.py      # needs Pillow: pip install Pillow

Reads two files from docs/Logo/ and writes:

    src/assets/brand/logo.png           full logo, dark wordmark, for light grounds
    src/assets/brand/logo-negative.png  full logo, white wordmark, for navy grounds
    src/assets/brand/mark.png           the five-petal symbol on its own
    src/app/icon.png                    browser tab icon, every route
    src/app/apple-icon.png              home-screen icon on iOS
    src/app/favicon.ico                 for clients that only ask for /favicon.ico

The SVGs in docs/Logo/ are not real vector files: they are exports that wrap
the same pixels in an <image> element, at 0.5 to 0.9 MB each. The transparent
PNGs are the cleaner source, so those are used.

The negative logo is made rather than taken from the folder. The negatives
there are JPEGs with the navy ground baked in, which would put a visible box
on any background that is not exactly that navy. The guidelines' own
"Negatief / donkerblauw" variant (page 5) is the coloured symbol with a white
wordmark, and that is precisely the positive logo with its navy pixels made
white, keeping each pixel's transparency so the letter edges stay smooth.

Run it again only if the commission sends new logo files. The outputs are
committed so the build never needs Pillow.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "Logo"
ASSETS = ROOT / "src" / "assets" / "brand"
APP = ROOT / "src" / "app"

LOGO_SOURCE = SOURCE / "logo - positive" / "SamenZin Logo.png"
MARK_SOURCE = SOURCE / "icon" / "ICON 01.png"

# The header shows the logo at most ~260 px wide; three times that covers
# high-density screens. next/image makes the smaller sizes from it.
LOGO_WIDTH = 840
MARK_SIZE = 512

# Cream from src/styles/brand.css. iOS draws a home-screen icon on black when
# it has transparency, so the apple icon gets the site's own ground instead.
CREAM = (247, 244, 237, 255)


def is_wordmark(r: int, g: int, b: int) -> bool:
    """The wordmark is navy (about 26, 29, 44). Every petal is far brighter."""
    return r < 90 and g < 90 and b < 110


def main() -> int:
    try:
        from PIL import Image
    except ImportError:
        print("Pillow is missing: pip install Pillow", file=sys.stderr)
        return 1

    for path in (LOGO_SOURCE, MARK_SOURCE):
        if not path.exists():
            print(f"Missing source file: {path.relative_to(ROOT)}", file=sys.stderr)
            return 1

    ASSETS.mkdir(parents=True, exist_ok=True)

    def trimmed(path: Path) -> Image.Image:
        image = Image.open(path).convert("RGBA")
        box = image.getbbox()
        if box is None:
            raise SystemExit(f"{path} is fully transparent")
        return image.crop(box)

    def save(image: Image.Image, path: Path) -> None:
        image.save(path, optimize=True)
        print(f"    {str(path.relative_to(ROOT)):40} {image.width}x{image.height}"
              f"  {path.stat().st_size // 1024} KB")

    # --- Full logo, positive and negative --------------------------------
    logo = trimmed(LOGO_SOURCE)
    logo = logo.resize(
        (LOGO_WIDTH, round(logo.height * LOGO_WIDTH / logo.width)), Image.LANCZOS
    )
    save(logo, ASSETS / "logo.png")

    negative = logo.copy()
    pixels = negative.load()
    for y in range(negative.height):
        for x in range(negative.width):
            r, g, b, a = pixels[x, y]
            if a and is_wordmark(r, g, b):
                pixels[x, y] = (255, 255, 255, a)
    save(negative, ASSETS / "logo-negative.png")

    # --- The symbol on its own --------------------------------------------
    mark = trimmed(MARK_SOURCE)

    def square(size: int, padding: float, ground: tuple[int, int, int, int]) -> Image.Image:
        """The symbol centred on a square canvas with `padding` on each side."""
        canvas = Image.new("RGBA", (size, size), ground)
        inner = round(size * (1 - 2 * padding))
        scale = inner / max(mark.width, mark.height)
        fitted = mark.resize(
            (round(mark.width * scale), round(mark.height * scale)), Image.LANCZOS
        )
        canvas.alpha_composite(
            fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2)
        )
        return canvas

    save(square(MARK_SIZE, 0, (0, 0, 0, 0)), ASSETS / "mark.png")

    # --- App icons (Next.js file conventions) -----------------------------
    save(square(256, 0.04, (0, 0, 0, 0)), APP / "icon.png")
    save(square(180, 0.14, CREAM).convert("RGB"), APP / "apple-icon.png")

    favicon = square(48, 0.02, (0, 0, 0, 0))
    favicon.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"    {'src/app/favicon.ico':40} 16, 32, 48")

    return 0


if __name__ == "__main__":
    sys.exit(main())

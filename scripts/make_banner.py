#!/usr/bin/env python3
"""
Composite the repo banner over a REAL screenshot of the running app.

Unlike make_social_preview.py — which draws its own window chrome because it
has no browser — this takes the frame that scripts/make_demo_gif.mjs records
and lays the same title treatment over it. The only thing synthesised here is
the text.

Run make_demo_gif.mjs --keep-frames first, or just run the pipeline:

    node scripts/make_demo_gif.mjs --keep-frames
    python3 scripts/make_banner.py
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".github/demo-frames/banner-source.png")
DESKTOP = os.path.join(ROOT, ".github/demo-frames/f000.png")
STILL = os.path.join(ROOT, ".github/desktop-still.png")
OUT = os.path.join(ROOT, ".github/social-preview.png")

W, H = 1280, 640
URL = "macos-27-golden-gate.vercel.app"


def font(size, bold=False):
    names = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for n in names:
        if os.path.exists(n):
            return ImageFont.truetype(n, size)
    return ImageFont.load_default()


def cover(img, w, h):
    ratio = max(w / img.width, h / img.height)
    img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.LANCZOS)
    left = (img.width - w) // 2
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def gradient_shade(size, strength=210):
    """Left-to-right darkening so the headline stays legible over any wallpaper.

    Falls off by ~60% across so the window on the right stays readable.
    """
    w, h = size
    mask = Image.new("L", (w, 1))
    px = mask.load()
    for x in range(w):
        t = x / max(w - 1, 1)
        px[x, 0] = int(strength * max(0.0, 1.0 - (t / 0.6)) ** 1.5)
    mask = mask.resize((w, h))
    return Image.new("RGB", size, (4, 6, 14)), mask


def main():
    if not os.path.exists(SRC):
        sys.exit(
            f"missing {SRC}\n"
            "run: node scripts/make_demo_gif.mjs --keep-frames"
        )

    shot = Image.open(SRC).convert("RGB")

    # README still: the clean desktop, no title treatment.
    if os.path.exists(DESKTOP):
        cover(Image.open(DESKTOP).convert("RGB"), 1365, 632).save(STILL, optimize=True)
        print("wrote .github/desktop-still.png")

    # The capture is already wider than the banner, so crop vertically rather
    # than zooming — a horizontal crop would slice the window in half.
    base = cover(shot, W, H)

    # Lightly dim the whole frame; the window still needs to read as a window.
    base = Image.blend(base, Image.new("RGB", (W, H), (6, 8, 16)), 0.10)

    dark, mask = gradient_shade((W, H))
    base = Image.composite(dark, base, mask)

    d = ImageDraw.Draw(base, "RGBA")

    # --- menubar strip -----------------------------------------------------
    bar = Image.new("RGB", (W, 34), (8, 10, 16))
    base.paste(bar, (0, 0))
    d = ImageDraw.Draw(base, "RGBA")
    d.text((20, 10), "●  macOS 27 Golden Gate", font=font(13, True), fill=(240, 244, 255))
    rf = font(13)
    d.text((W - 20 - d.textlength("Sat 14:05   100%", font=rf), 10),
           "Sat 14:05   100%", font=rf, fill=(200, 210, 228))

    # --- title block -------------------------------------------------------
    # Sits in the gradient's dark zone on the left, clear of the window.
    d.text((72, 150), "GOLDEN GATE", font=font(52, True), fill=(255, 255, 255))
    d.text((72, 212), "OS 27", font=font(52, True), fill=(150, 196, 255))
    d.text((72, 288), "A web-based macOS that runs in a tab.",
           font=font(22), fill=(226, 232, 245))
    d.text((72, 322), "52 apps · Liquid Glass · real hardware telemetry",
           font=font(17), fill=(172, 184, 208))

    # URL pill
    d.rounded_rectangle([72, 366, 72 + 372, 366 + 44], radius=10,
                        fill=(255, 255, 255, 26), outline=(255, 255, 255, 54))
    d.text((72 + 18, 376), URL, font=font(17, True), fill=(255, 255, 255))

    d.text((72, 432), "React 19 · Vite · Tailwind v4 · Framer Motion",
           font=font(15), fill=(148, 160, 186))

    # --- tag chips ---------------------------------------------------------
    chips = ["MIT", "TypeScript", "120fps", "52 apps"]
    x = 72
    for c in chips:
        cf = font(13, True)
        w = d.textlength(c, font=cf)
        d.rounded_rectangle([x, 466, x + w + 28, 466 + 30], radius=8,
                            fill=(255, 255, 255, 22), outline=(255, 255, 255, 40))
        d.text((x + 14, 473), c, font=cf, fill=(240, 246, 255))
        x += w + 28 + 12

    base.save(OUT, optimize=True)
    print(f"wrote .github/social-preview.png ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    main()
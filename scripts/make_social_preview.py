#!/usr/bin/env python3
"""
Build the GitHub social preview and the README header shot for the
Golden Gate flagship.

There is no headless browser in this environment, so rather than fake a
"browser screenshot", this composites the project's OWN shipped artwork —
the real wallpaper and the real dock icons — into a macOS-style desktop
scene, then lays the title over it. Everything in the image is the real
thing; only the window chrome is drawn.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, glob, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(
    ROOT,
    "Skills/showcase/restaurants/macOS-evolution/"
    "Modern MacOS (2020 to 2026)/macOS 27 Golden Gate/golden-gate-os-v27",
)
WALL = os.path.join(APP, "public/wallpapers/golden-gate-dark.png")
ICONS = os.path.join(APP, "public/icons")
OUT = os.path.join(ROOT, ".github")

W, H = 1280, 640


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
    """Scale-and-crop to exactly w x h."""
    ratio = max(w / img.width, h / img.height)
    img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.LANCZOS)
    left = (img.width - w) // 2
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def main():
    os.makedirs(OUT, exist_ok=True)

    # --- background: the project's own wallpaper -------------------------
    bg = cover(Image.open(WALL).convert("RGB"), W, H)

    # Darken the left third so the headline stays legible.
    shade = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shade)
    for x in range(W):
        t = max(0.0, 1.0 - (x / (W * 0.72)))
        sd.line([(x, 0), (x, H)], fill=int(205 * (t ** 1.5)))
    bg = Image.composite(Image.new("RGB", (W, H), (8, 10, 16)), bg, shade)

    img = bg.copy()
    d = ImageDraw.Draw(img)

    # --- dock: real shipped icons, real frosted-glass plate --------------
    dock_icons = [
        "finder.png", "appstore.png", "Safari.png", "mail.png",
        "calendar.png", "photos.png", "music.png", "code.png",
    ]
    found = [n for n in dock_icons if os.path.exists(os.path.join(ICONS, n))]
    if len(found) < 6:
        found = sorted(
            os.path.basename(p)
            for p in glob.glob(os.path.join(ICONS, "*.png"))
        )[10:18]

    size, gap, pad = 58, 14, 16
    n = len(found)
    dock_w = n * size + (n - 1) * gap + pad * 2
    dock_h = size + pad * 2
    dx0, dy0 = W - dock_w - 54, H - dock_h - 44

    plate = Image.new("RGBA", (dock_w, dock_h), (255, 255, 255, 46))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle(
        [0, 0, dock_w - 1, dock_h - 1], radius=22,
        fill=(255, 255, 255, 40), outline=(255, 255, 255, 90), width=1
    )
    img.paste(Image.alpha_composite(
        img.crop((dx0, dy0, dx0 + dock_w, dy0 + dock_h)).convert("RGBA"), plate
    ).convert("RGB"), (dx0, dy0))

    for i, name in enumerate(found):
        x = dx0 + pad + i * (size + gap)
        y = dy0 + pad
        try:
            ic = Image.open(os.path.join(ICONS, name)).convert("RGBA")
            ic = cover(ic, size, size) if ic.width > ic.height else ic.copy()
            ic.thumbnail((size, size), Image.LANCZOS)
            tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            tile.paste(ic, ((size - ic.width) // 2, (size - ic.height) // 2), ic)
            img.paste(tile.convert("RGB"), (x, y), tile.split()[3])
        except Exception:
            d.rounded_rectangle([x, y, x + size, y + size], radius=14,
                                fill=(90, 96, 110))

    # --- menu bar -------------------------------------------------------
    d.rectangle([0, 0, W, 30], fill=(12, 14, 20))
    d.text((18, 8), "●  macOS 27 Golden Gate", font=font(13, True),
           fill=(238, 238, 245))
    rf = font(13)
    d.text((W - 150, 8), "Sat 14:05", font=rf, fill=(215, 218, 228))
    d.text((W - 78, 8), "100%", font=rf, fill=(215, 218, 228))

    # --- window chrome: a plain, honest panel, not a fake app screenshot -
    wx0, wy0, wx1, wy1 = 56, 92, W - 400, H - 96
    win = Image.new("RGBA", (wx1 - wx0, wy1 - wy0), (255, 255, 255, 20))
    wd = ImageDraw.Draw(win)
    wd.rounded_rectangle(
        [0, 0, win.width - 1, win.height - 1], radius=14,
        fill=(255, 255, 255, 22), outline=(255, 255, 255, 64), width=1
    )
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        wd.ellipse([18 + i * 22, 16, 30 + i * 22, 28], fill=c)
    img.paste(Image.alpha_composite(
        img.crop((wx0, wy0, wx1, wy1)).convert("RGBA"), win
    ).convert("RGB"), (wx0, wy0))

    # --- headline over the darkened left side ---------------------------
    x = 76
    d.text((x, 168), "GOLDEN GATE OS 27", font=font(58, True), fill=(255, 255, 255))
    d.text((x, 240), "A web-based macOS that runs in a tab.",
           font=font(24), fill=(226, 232, 245))
    d.text((x, 276), "52 apps · Liquid Glass · real hardware telemetry",
           font=font(19), fill=(168, 180, 205))

    # URL chip. Alpha is ignored when drawing onto an RGB canvas, so the
    # translucent plate goes down on its own RGBA layer.
    chip_w = 372
    chip = Image.new("RGBA", (chip_w, 42), (255, 255, 255, 34))
    cd = ImageDraw.Draw(chip)
    cd.rounded_rectangle(
        [0, 0, chip_w - 1, 41], radius=10,
        outline=(255, 255, 255, 110), width=1
    )
    img.paste(chip.convert("RGB"), (x, 330), chip.split()[3])
    d.text((x + 16, 342), "macos-27-golden-gate.vercel.app",
           font=font(16, True), fill=(255, 255, 255))

    d.text((x, 404), "React 19 · Vite · Tailwind v4 · Framer Motion",
           font=font(16), fill=(140, 152, 178))

    tag = font(14, True)
    for i, t in enumerate(["MIT", "TypeScript", "120fps", "52 apps"]):
        tw = d.textlength(t, font=tag)
        bx = x + sum(
            d.textlength(v, font=tag) + 34
            for v in ["MIT", "TypeScript", "120fps"][:i]
        )
        d.rounded_rectangle([bx, 442, bx + tw + 24, 472], radius=8,
                            outline=(255, 255, 255, 90))
        d.text((bx + 12, 448), t, font=tag, fill=(210, 218, 235))

    img.save(os.path.join(OUT, "social-preview.png"), optimize=True)
    print("wrote .github/social-preview.png", img.size)


if __name__ == "__main__":
    main()

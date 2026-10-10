#!/usr/bin/env python3
"""
Draw the India 360 app icon.

Hand-authored rather than traced: an iOS squircle plate with a deep
newspaper-ink gradient, a masthead bar and rule, the numerals 360, and a
three-column mark that fades with depth. Rendered at every delivery size.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "icons")

S = 1024  # master


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def font(size, bold=True):
    cands = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for c in cands:
        if os.path.exists(c):
            return ImageFont.truetype(c, int(size))
    return ImageFont.load_default()


def main():
    os.makedirs(OUT, exist_ok=True)

    # --- plate -------------------------------------------------------------
    # Three-stop gradient: gold masthead -> slate -> deep ink. Stops are kept
    # rich rather than washed, so the icon still reads at 32px.
    img = Image.new("RGB", (S, S))
    d = ImageDraw.Draw(img)
    stops = [(238, 168, 45), (150, 62, 96), (26, 42, 96)]
    for y in range(S):
        t = y / (S - 1)
        if t < 0.5:
            d.line([(0, y), (S, y)], fill=lerp(stops[0], stops[1], t / 0.5))
        else:
            d.line([(0, y), (S, y)], fill=lerp(stops[1], stops[2], (t - 0.5) / 0.5))

    # A restrained specular sweep in the top-left, applied as a real alpha
    # layer so it does not bleach the gradient underneath.
    hl = Image.new("L", (S, S), 0)
    ImageDraw.Draw(hl).ellipse(
        [-S * 0.30, -S * 0.62, S * 0.72, S * 0.30], fill=46
    )
    hl = hl.filter(ImageFilter.GaussianBlur(S * 0.11))
    img = Image.composite(Image.new("RGB", (S, S), (255, 246, 225)), img, hl)

    # inner edge light, the way iOS icons catch a rim
    rim = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(rim).rounded_rectangle(
        [2, 2, S - 3, S - 3], radius=int(S * 0.2237),
        outline=(255, 255, 255, 70), width=max(2, S // 340),
    )

    img = img.convert("RGBA")
    img.alpha_composite(rim)
    d = ImageDraw.Draw(img)

    # --- masthead ----------------------------------------------------------
    pad = S * 0.145
    bar_h = S * 0.040
    d.rounded_rectangle(
        [pad, pad, S - pad, pad + bar_h], radius=bar_h / 2, fill=(255, 255, 255, 240)
    )
    rule_y = pad + bar_h + S * 0.036
    d.rectangle([pad, rule_y, S - pad, rule_y + S * 0.013], fill=(255, 255, 255, 210))

    # --- numerals ----------------------------------------------------------
    f = font(S * 0.285)
    bb = d.textbbox((0, 0), "360", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    tx = (S - tw) / 2 - bb[0]
    ty = rule_y + S * 0.068 - bb[1]
    # one soft drop shadow, not an emboss
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((tx + S * 0.005, ty + S * 0.009), "360", font=f,
                            fill=(0, 0, 0, 95))
    sh = sh.filter(ImageFilter.GaussianBlur(S * 0.006))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    d.text((tx, ty), "360", font=f, fill=(255, 255, 255, 255))

    # --- three columns, fading with depth ----------------------------------
    # textbbox includes font leading, so measure the real glyph bottom to be
    # sure the columns clear the numerals instead of clipping them.
    glyph_bottom = ty + d.textbbox((tx, ty), "360", font=f)[3]
    col_y = glyph_bottom + S * 0.075
    col_h = S * 0.062
    gap = S * 0.026
    cw = (S - pad * 2 - gap * 2) / 3
    for i in range(3):
        x = pad + i * (cw + gap)
        d.rounded_rectangle(
            [x, col_y, x + cw, col_y + col_h],
            radius=S * 0.010,
            fill=(255, 255, 255, 235 - i * 60),
        )

    # --- squircle mask -----------------------------------------------------
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, S - 1, S - 1], radius=int(S * 0.2237), fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    img.putalpha(mask)

    for name, size in [
        ("india360.png", 128),
        ("india360@2x.png", 256),
        ("india360-512.png", 512),
        ("india360-1024.png", 1024),
    ]:
        img.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))
        print("wrote", name, f"({size}px)")

    img.resize((512, 512), Image.LANCZOS).save("/tmp/opencode/i360-preview.png")


if __name__ == "__main__":
    main()

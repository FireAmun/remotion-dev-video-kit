"""Turn your cartoon art into the two head images the rigged character uses.

Input: two images of the SAME character in the SAME pose on a plain light background
(e.g. from Canva / ChatGPT): one with the mouth closed, one with the mouth open.

    python scripts/make_head.py closed.png open.png --head 258 4 510 320 --mouth 470 250 590 300

--head   x0 y0 x1 y1   box around the head (hair to bottom of chin/beard), in pixels of the input
--mouth  x0 y0 x1 y1   box around the mouth (used to blend the open mouth onto the closed face)
--jaw    optional list of x,y points (input pixels) tracing the jaw/beard line; everything below is cut off

Writes public/character/rig/head_closed.png and head_open.png. Then update HEAD in
src/rig/Puppet.tsx (width/height of the crop, pivot = bottom-centre of the chin, eye boxes)
and check the result in the RigTest composition.

Why blend instead of using the open image directly: image generators redraw the whole picture,
so outlines shift a few pixels. Only the mouth is taken from the open image (aligned and colour
matched), so nothing else jitters when the mouth flaps.
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

OUT = Path(__file__).resolve().parent.parent / "public" / "character" / "rig"


def remove_background(rgb: np.ndarray, tol: int = 14) -> np.ndarray:
    """Alpha mask: pixels close to the (plain) background colour and connected to the border become transparent."""
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg_colour = np.median(border, axis=0)
    close = np.abs(rgb - bg_colour).max(axis=2) < tol
    lab, _ = ndi.label(close)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    fg = ndi.binary_fill_holes(~bg)
    fl, n = ndi.label(fg)
    fg = fl == (np.argmax(ndi.sum(fg, fl, range(1, n + 1))) + 1)  # keep the biggest shape (the character)
    return ndi.binary_erosion(fg, iterations=1)


def blend_mouth(closed: np.ndarray, opened: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    """Align the open image to the closed one around the mouth, colour-match it, and paste only the mouth."""
    x0, y0, x1, y1 = box
    cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    yy, xx = np.mgrid[0 : closed.shape[0], 0 : closed.shape[1]]
    e = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    ring = (e > 1.0) & (e < 2.2)
    ga, gb = closed.mean(2), opened.mean(2)
    _, dx, dy = min(
        (np.abs(ga - np.roll(np.roll(gb, dy, 0), dx, 1))[ring].mean(), dx, dy) for dy in range(-10, 11) for dx in range(-10, 11)
    )
    opened = np.roll(np.roll(opened, dy, 0), dx, 1)
    for c in range(3):
        a, b = closed[..., c][ring], opened[..., c][ring]
        opened[..., c] = (opened[..., c] - b.mean()) * (a.std() / (b.std() + 1e-6)) + a.mean()
    mask = Image.new("L", (closed.shape[1], closed.shape[0]), 0)
    ImageDraw.Draw(mask).ellipse((x0, y0, x1, y1), fill=255)
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255
    return closed * (1 - m) + opened.clip(0, 255) * m


def defringe(rgba: np.ndarray, outline=(26, 19, 17)) -> np.ndarray:
    """Semi-transparent edge pixels take a dark outline colour, so no light halo shows on dark scenes."""
    out = rgba.astype(np.float32)
    al = out[..., 3:4] / 255
    w = np.where((al > 0) & (al < 0.95), 1 - al, 0)
    out[..., :3] = out[..., :3] * (1 - w) + np.array(outline) * w
    return out.clip(0, 255).astype(np.uint8)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("closed", type=Path)
    ap.add_argument("open", type=Path)
    ap.add_argument("--head", type=int, nargs=4, required=True, metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--mouth", type=int, nargs=4, required=True, metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--jaw", nargs="*", default=[], help="x,y points along the jaw, left to right")
    args = ap.parse_args()

    closed = np.asarray(Image.open(args.closed).convert("RGB")).astype(np.float32)
    opened = np.asarray(Image.open(args.open).convert("RGB")).astype(np.float32)
    if closed.shape != opened.shape:
        opened = np.asarray(Image.open(args.open).convert("RGB").resize((closed.shape[1], closed.shape[0]))).astype(np.float32)

    alpha = remove_background(closed)
    open_face = blend_mouth(closed, opened, tuple(args.mouth))

    x0, y0, x1, y1 = args.head
    cut = Image.new("L", (closed.shape[1], closed.shape[0]), 0)
    if args.jaw:
        jaw = [tuple(int(v) for v in p.split(",")) for p in args.jaw]
        ImageDraw.Draw(cut).polygon([(x0, y0), (x1, y0), *jaw[::-1]], fill=255)
    else:
        ImageDraw.Draw(cut).rectangle((x0, y0, x1, y1), fill=255)
    cut = np.asarray(cut.filter(ImageFilter.GaussianBlur(1.0)))
    a = np.minimum(alpha * 255, cut).astype(np.uint8)

    OUT.mkdir(parents=True, exist_ok=True)
    for name, img in [("closed", closed), ("open", open_face)]:
        rgba = np.dstack([img.clip(0, 255).astype(np.uint8), a])[y0:y1, x0:x1]
        Image.fromarray(defringe(rgba)).save(OUT / f"head_{name}.png")
    print(f"Wrote {OUT / 'head_closed.png'} and head_open.png ({x1 - x0}x{y1 - y0}).")
    print("Next: set HEAD (width, height, pivot at the chin, eye boxes) in src/rig/Puppet.tsx and check RigTest.")


if __name__ == "__main__":
    main()

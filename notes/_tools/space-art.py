"""Procedural nebula / galaxy art for the site's banners and note thumbnails.

Every image is generated from noise, so it is original and free to use.
Needs Python 3 with numpy, scipy and pillow:  pip install numpy scipy pillow

Examples (run from the site folder):
  python _tools/space-art.py thumbnail roots-and-weights-of-su-3
  python _tools/space-art.py thumbnail roots-and-weights-of-su-3 --style galaxy --palette teal --seed 7
  python _tools/space-art.py banner lie-theory --palette violet --accent ember

Thumbnails go to assets/images/thumbnails/<name>.jpg, banners to
assets/images/banners/<name>.jpg. Same name + seed = same picture; change the
seed to reroll. Palettes: violet, teal, ember, blue.
"""
import numpy as np
from scipy.ndimage import gaussian_filter, zoom, map_coordinates
from PIL import Image
import sys, os

def fbm(h, w, rng, octaves=7, persistence=0.55):
    out = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = 2 ** o
        gh, gw = max(2, h * s // 256 + 2), max(2, w * s // 256 + 2)
        g = rng.standard_normal((gh, gw))
        layer = zoom(g, (h / gh * 1.02, w / gw * 1.02), order=3)[:h, :w]
        out += amp * layer; total += amp; amp *= persistence
    out /= total
    return (out - out.min()) / (out.max() - out.min())

def ridged(h, w, rng):
    n = fbm(h, w, rng, octaves=7)
    return 1 - np.abs(2 * n - 1)

def warp(field, rng, strength):
    h, w = field.shape
    dx = (fbm(h, w, rng, 5) - .5) * strength
    dy = (fbm(h, w, rng, 5) - .5) * strength
    yy, xx = np.mgrid[0:h, 0:w]
    return map_coordinates(field, [yy + dy, xx + dx], order=1, mode='reflect')

def stars(h, w, rng, density=0.0012, big=0.000012):
    img = np.zeros((h, w, 3))
    n = int(h * w * density)
    ys, xs = rng.integers(0, h, n), rng.integers(0, w, n)
    b = rng.power(6, n)[::-1] ** 3
    temps = rng.random(n)
    col = np.stack([0.85 + 0.15 * temps, 0.88 + 0.1 * np.ones(n), 1.0 - 0.25 * temps], 1)
    np.add.at(img, (ys, xs), col * b[:, None] * 1.4)
    img = gaussian_filter(img, (0.6, 0.6, 0)) * 3
    # a few bright stars with halos and diffraction spikes
    nb = max(3, int(h * w * big))
    for _ in range(nb):
        y, x = rng.integers(0, h), rng.integers(0, w)
        r = rng.uniform(1.5, 4.0) * min(h, w) / 600
        c = np.array([1, .95, .9]) if rng.random() < .5 else np.array([.85, .92, 1])
        yy, xx = np.ogrid[-y:h - y, -x:w - x]
        d2 = yy ** 2 + xx ** 2
        halo = np.exp(-d2 / (2 * r ** 2)) + 0.15 * np.exp(-d2 / (2 * (r * 5) ** 2))
        spike_len = r * 5
        sp = (np.exp(-(yy ** 2) / (2 * (r * .25) ** 2)) * np.exp(-np.abs(xx) / spike_len) +
              np.exp(-(xx ** 2) / (2 * (r * .25) ** 2)) * np.exp(-np.abs(yy) / spike_len)) * .25
        img += (halo + sp)[..., None] * c
    return img

def palette(t, stops):
    t = np.clip(t, 0, 1)
    xs = np.array([s[0] for s in stops]); cs = np.array([s[1] for s in stops]) / 255.
    return np.stack([np.interp(t, xs, cs[:, i]) for i in range(3)], -1)

PALETTES = {
    'violet': [(0, (2, 3, 12)), (.35, (30, 12, 70)), (.55, (120, 40, 140)), (.75, (230, 110, 150)), (.9, (255, 200, 170)), (1, (255, 245, 230))],
    'teal':   [(0, (1, 5, 10)), (.35, (6, 40, 70)), (.55, (20, 110, 130)), (.75, (90, 200, 190)), (.9, (220, 240, 200)), (1, (255, 255, 240))],
    'ember':  [(0, (6, 2, 4)), (.35, (60, 15, 20)), (.55, (170, 50, 30)), (.75, (240, 140, 60)), (.9, (255, 220, 150)), (1, (255, 250, 235))],
    'blue':   [(0, (1, 2, 10)), (.35, (10, 20, 70)), (.55, (40, 70, 170)), (.75, (110, 160, 240)), (.9, (210, 225, 255)), (1, (255, 255, 255))],
}

def nebula(h, w, seed, pal, accent=None, mask=None):
    rng = np.random.default_rng(seed)
    gas = warp(ridged(h, w, rng) ** 2.2, rng, min(h, w) * .35)
    body = fbm(h, w, rng, 5)
    if mask is None:
        mask = np.clip((body - .35) * 2.2, 0, 1)
    dens = gaussian_filter(gas * mask, 1.0)
    dens = dens / dens.max()
    img = palette(dens ** .9, PALETTES[pal]) * (0.25 + 0.95 * dens[..., None])
    if accent:
        rng2 = np.random.default_rng(seed + 99)
        a = warp(ridged(h, w, rng2) ** 3, rng2, min(h, w) * .3) * np.clip((fbm(h, w, rng2, 4) - .45) * 3, 0, 1)
        img += palette(a, PALETTES[accent]) * a[..., None] * .8
    # dark dust lanes
    dust = np.clip((fbm(h, w, np.random.default_rng(seed + 7), 6) - .55) * 3, 0, 1)
    img *= (1 - .65 * dust[..., None])
    img += stars(h, w, rng)
    return img

def galaxy(h, w, seed, pal, tilt=.45, angle=.5, arms=2, scale=.38, n=900000):
    rng = np.random.default_rng(seed)
    R = min(h, w) * scale
    # disk particles along logarithmic spiral arms
    r = rng.gamma(2.0, .28, n)
    arm = rng.integers(0, arms, n)
    th = np.log(r + .05) / .28 + arm * 2 * np.pi / arms
    spread = .18 + .35 * r
    th += rng.normal(0, spread, n) / np.maximum(r, .08) * .35
    rr = r + rng.normal(0, .03, n)
    x, y = rr * np.cos(th), rr * np.sin(th)
    # bulge
    nb = n // 5
    bx, by = rng.normal(0, .09, nb), rng.normal(0, .09, nb)
    X = np.concatenate([x, bx]); Y = np.concatenate([y, by])
    # project: tilt + rotate
    Y = Y * tilt
    ca, sa = np.cos(angle), np.sin(angle)
    px = (X * ca - Y * sa) * R + w / 2
    py = (X * sa + Y * ca) * R + h / 2
    ok = (px >= 0) & (px < w) & (py >= 0) & (py < h)
    dens = np.zeros((h, w))
    np.add.at(dens, (py[ok].astype(int), px[ok].astype(int)), 1)
    fine = gaussian_filter(dens, .8)
    smooth = gaussian_filter(dens, 3.5)
    d = fine * .35 + smooth
    d = np.log1p(d / np.percentile(d[d > 0], 60) * 1.5)
    d = d / np.percentile(d, 99.9)
    d = d * (0.45 + 0.9 * fbm(h, w, rng, 7) ** 1.3)
    t = np.clip(d, 0, 1)
    img = palette(t ** .7, PALETTES[pal]) * np.clip(t * 1.3, 0, 1.3)[..., None]
    # dust lanes
    dust = np.clip((fbm(h, w, rng, 7) - .5) * 4, 0, 1) * gaussian_filter(dens, 6) / (gaussian_filter(dens, 6).max() + 1e-9)
    img *= (1 - np.clip(dust * 2.2, 0, .7))[..., None]
    # warm core
    yy, xx = np.mgrid[0:h, 0:w]
    rc = np.hypot((xx - w / 2), (yy - h / 2) / max(tilt, .3)) / R
    img += (np.exp(-(rc / .06) ** 2) * 1.0 + np.exp(-(rc / .18) ** 2) * .25)[..., None] * np.array([1., .88, .7])
    # pink HII knots along arms
    sel = ok[:n] & (rng.random(n) < .00015) & (r[:] > .25)
    knots = np.zeros((h, w))
    np.add.at(knots, (py[:n][sel].astype(int), px[:n][sel].astype(int)), 1)
    img += gaussian_filter(knots, 1.3)[..., None] * np.array([1., .4, .7]) * 1.6
    img += nebula(h, w, seed + 5, pal) * .12 + stars(h, w, rng, density=.0007)
    return img

def tonemap(img, exposure=1.0, vignette=.35):
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w]
    v = 1 - vignette * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / 2
    img = img * exposure * v[..., None]
    img = 1 - np.exp(-img * 1.6)               # filmic-ish
    bloom = gaussian_filter(img, (min(h, w) * .015,) * 2 + (0,))
    img = np.clip(img + .25 * bloom ** 1.5, 0, 1)
    return Image.fromarray((img ** (1 / 1.1) * 255).astype(np.uint8))

def save(img, path, q=86):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, quality=q, optimize=True, progressive=True)
    print(path, os.path.getsize(path) // 1024, 'KB')


if __name__ == '__main__':
    import argparse, zlib
    ap = argparse.ArgumentParser(description="Generate galaxy/nebula art for the site.")
    ap.add_argument("kind", choices=["thumbnail", "banner"])
    ap.add_argument("name", help="output file name without .jpg (use the note's slug for thumbnails)")
    ap.add_argument("--style", choices=["nebula", "galaxy"], default=None, help="default: picked from the name")
    ap.add_argument("--palette", choices=list(PALETTES), default=None, help="default: picked from the name")
    ap.add_argument("--accent", choices=list(PALETTES), default=None, help="second gas colour (nebula only)")
    ap.add_argument("--seed", type=int, default=None, help="default: derived from the name")
    a = ap.parse_args()
    seed = a.seed if a.seed is not None else zlib.crc32(a.name.encode()) % 100000
    rng = np.random.default_rng(seed)
    pals = list(PALETTES)
    style = a.style or ("galaxy" if rng.random() < .35 else "nebula")
    pal = a.palette or pals[rng.integers(len(pals))]
    accent = a.accent or (pals[rng.integers(len(pals))] if style == "nebula" else None)
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "images")
    if a.kind == "thumbnail":
        h, w, folder, q, vig = 600, 960, "thumbnails", 86, .35
    else:
        h, w, folder, q, vig = 640, 2400, "banners", 82, .2
    if style == "galaxy":
        img = galaxy(h, w, seed, pal, tilt=rng.uniform(.3, .9), angle=rng.uniform(-1.5, 1.5),
                     arms=int(rng.integers(2, 4)), scale=.42 if a.kind == "thumbnail" else 1.0,
                     n=900000 if a.kind == "thumbnail" else 1600000)
    else:
        img = nebula(h, w, seed, pal, accent=accent if accent != pal else None)
    path = os.path.normpath(os.path.join(root, folder, a.name + ".jpg"))
    print(f"{style}, palette={pal}" + (f", accent={accent}" if style == "nebula" else "") + f", seed={seed}")
    save(tonemap(img, 1.1, vig), path, q)

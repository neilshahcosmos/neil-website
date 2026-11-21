---
title: Space art generator
description: A small Python tool that paints original galaxies and nebulae from noise. It made every banner and thumbnail on this site.
date: 2026-11-19
stage: protostar
kind: tool
tech: [Python, NumPy, SciPy, Pillow]
topics: [generative art, astrophysics]
cover: /images/covers/space-art-generator.jpg
---

Every image on this site is generated, not photographed. The tool lives at
`notes/_tools/space-art.py` and builds two kinds of picture:

- **Nebulae** from *fractal noise*: several layers of random noise at different scales, added
  together and warped. A colour palette maps the result to glowing gas, and dark dust lanes
  are cut through it.
- **Spiral galaxies** from about a million particles scattered along logarithmic spiral arms,
  with a bulge, dust lanes, and pink star-forming regions along the arms.

Both get a star field with diffraction spikes and a gentle bloom. Run

```bash
python notes/_tools/space-art.py thumbnail my-new-note --style galaxy --palette teal
```

to make one. The same name and seed always produce the same image.

---
title: This garden
description: The site you're reading, a digital garden built with Astro, themed around star formation and wired together with wiki-links and backlinks.
date: 2026-11-21
stage: protostar
kind: site
tech: [Astro, MDX, KaTeX, Netlify]
live: /
topics: [meta, web]
cover: /images/covers/this-garden.jpg
---

A personal site built as a digital garden rather than a blog. Inspired by
[Maggie Appleton's garden](https://maggieappleton.com), rebuilt from scratch with a
cosmological theme.

## How it works

- **Astro** turns Markdown files into static pages. Each kind of page (essays, thoughts,
  projects, reviews) is a folder in `home/src/content/`.
- **Growth stages** (nebula, protostar, star) mark how finished each page is; see
  [[growth-stages-as-star-formation]].
- **Wiki-links**: writing `[[page-name]]` links to another page by its file name, and
  `[[notes:algebra/what-is-a-group]]` links into the [math notes](/notes/).
- **Backlinks** are computed at build time, so every page lists what links to it.
- **Hover previews** fetch a page's title and description when you hover over a link.
- **Math** is typeset with KaTeX: $e^{i\pi} + 1 = 0$.
- The [math notes](/notes/) are a separate Quarto site; this one reads their front matter
  to list them on the homepage. Both are built and deployed together on Netlify.

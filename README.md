# neilshahcosmos.com

Two sites deployed together by Netlify on every push:

- **neilshahcosmos.com**: the main site, from `home/`
- **neilshahcosmos.com/notes/**: math and physics notes, written in Markdown
  with LaTeX and rendered by [Quarto](https://quarto.org), from `notes/`
  (the book is at `/notes/book/`)

```
.
├── home/                    main site: an Astro digital garden (see "The main site" below)
├── notes/                   the Quarto project for the notes
│   ├── _quarto.yml          site config: nav, theme, math, bibliography
│   ├── index.qmd            notes homepage (lists recent notes)
│   ├── about.qmd
│   ├── algebra/             section: index.qmd (auto listing) + one .qmd per note
│   ├── lie-theory/
│   ├── qft/
│   ├── set-theory/
│   ├── _book/               the book, a separate Quarto project, served at /notes/book/
│   │   ├── _quarto.yml      chapter order lives here
│   │   └── *.qmd            one file per chapter
│   ├── _templates/note.qmd  template used by new-note.sh
│   ├── _tools/space-art.py  generates banner/thumbnail art
│   ├── assets/              favicon, banners, thumbnails
│   ├── _macros.html         LaTeX macros available on every HTML page
│   ├── macros.tex           same macros for PDF output
│   ├── theme.scss           fonts, spacing, theorem styling (shared with the book)
│   ├── styles.css           quick CSS tweaks (notes site only)
│   └── references.bib       shared bibliography
├── netlify.toml             Netlify build settings + redirects from old URLs
├── netlify-build.sh         builds home/ (Astro) into dist/, then notes into dist/notes/
├── publish.sh               render check → commit → push (= deploy)
├── preview.sh               live preview of the notes or the book
└── new-note.sh              create a note from the template
```

Everything is built into `dist/` (not committed): the main site at its root,
the notes in `dist/notes/`. Inside `notes/`, folders beginning with `_` are
ignored by the notes project; that is why the book, the templates and the
macro file have that prefix.

The notes used to live at the root of the domain; `netlify.toml` redirects
the old addresses (`/algebra/...`, `/book/...`, etc.) to `/notes/...`.

## The main site (`home/`)

A digital garden built with [Astro](https://astro.build), inspired by Maggie
Appleton's site and themed around star formation. Pages are Markdown files:

```
home/src/content/
├── essays/      longer pieces          -> /essays/<file-name>/
├── thoughts/    short, loose notes     -> /thoughts/<file-name>/
├── projects/    code, games, tools     -> /projects/<file-name>/
└── reviews/     film reviews           -> /reviews/<file-name>/
```

To add a page, copy the `_template.md` in that folder, rename it, and fill in
the front matter. The template explains every field. About and Now are
`home/src/pages/about.md` and `now.md`.

- **Growth stages**: `stage: nebula | protostar | star` (rough → taking shape → mature).
- **Wiki-links**: `[[file-name]]` links to another garden page using its title;
  `[[file-name|other text]]` sets the text; `[[notes:algebra/what-is-a-group]]`
  links into the math notes. Links to pages that don't exist yet show as a
  dimmed "not written yet" marker.
- **Backlinks**: every page lists the pages that link to it, automatically.
- **Hover previews**: hovering an internal link shows that page's title and description.
- **Math**: `$...$` and `$$...$$`, rendered with KaTeX.
- **Math notes on the homepage**: read automatically from the front matter of
  `notes/<section>/*.qmd`. Nothing to do.
- **Covers**: put images in `home/public/images/covers/` and set
  `cover: /images/covers/<name>.jpg`. The space-art tool makes them, for example
  `python notes/_tools/space-art.py banner my-essay` (then move the file there).
- **Example content**: the two film reviews are examples (`example: true`);
  replace or delete them. The rest of the starter content describes real things.
- **Look and feel**: colours, fonts and spacing are at the top of
  `home/src/styles/global.css`; the homepage is `home/src/pages/index.astro`.

Local preview needs [Node.js](https://nodejs.org) (LTS): `./preview.sh home`
runs a live-reloading dev server at <http://localhost:4321>. Links into
`/notes/` don't resolve in that mode; `./preview.sh all` builds everything and
serves it exactly as Netlify will.

## One-time setup

### 1. Install Quarto locally

Download from <https://quarto.org/docs/get-started/> (Windows installer, or
`winget install --id Posit.Quarto`). Check with `quarto --version`.
In VS Code, install the **Quarto** extension for preview, LaTeX completion and
a render button. Run everything below from Git Bash, Cygwin or WSL (if
`./preview.sh` complains about permissions, `bash preview.sh` works the same).

### 2. Try it

```bash
cd /c/neilshahcosmos
./preview.sh          # website at http://localhost:<port>, live reload
./preview.sh book     # the book
```

### 3. Create the GitHub repo and push

```bash
git init -b main
git add -A
git commit -m "Quarto site: initial scaffold"
# create an empty repo on GitHub (no README), then:
git remote add origin git@github.com:<you>/neilshahcosmos.git
git push -u origin main
```

(`gh repo create neilshahcosmos --public --source=. --push` does the GitHub
half in one line if you have the GitHub CLI.)

### 4. Point Netlify at the new repo

In the Netlify dashboard, open the existing site for neilshahcosmos.com:
**Site configuration → Build & deploy → Continuous deployment → Link to a
different repository** and choose the new repo. (Or delete the old site and
**Add new site → Import an existing project**; then re-attach the custom domain
under **Domain management**. DNS does not need to change either way.)

Netlify reads `netlify.toml`, so the build command (`bash netlify-build.sh`)
and publish directory (`dist`) are picked up automatically. Leave the UI's
build settings empty or matching. The first deploy starts as soon as the repo
is linked; watch it under **Deploys**.

Optional: pin `QUARTO_VERSION` in `netlify.toml` to the version you have
locally so Netlify and your machine always agree.

## Daily workflow

```bash
./new-note.sh lie-theory "Roots and weights of su(3)"   # creates notes/lie-theory/roots-and-weights-of-su-3.qmd
./preview.sh                                              # write, watch it render
./publish.sh "Add su(3) roots and weights"               # render check → commit → push → Netlify deploys
```

That's it. `publish.sh` renders locally first so a broken cross-reference or
YAML typo fails on your machine rather than on Netlify; use
`SKIP_RENDER=1 ./publish.sh` to skip that.

Section listing pages (`notes/algebra/index.qmd` etc.) and the homepage pick up new
notes automatically from their front matter (`title`, `description`, `date`,
`categories`). Add `draft: true` to a note's front matter to keep it out of the
published site while you work on it.

## Banners and thumbnails

Every page has a space-art banner behind its title, and every note gets a
thumbnail card in the listings.

- **Site banner**: `notes/assets/images/banner.jpg`, set by `title-block-banner` in
  `_quarto.yml` (used by the homepage and About).
- **Section banners**: `assets/images/banners/<section>.jpg`, set in each
  section's `_metadata.yml`, so the section page and all its notes share one.
- **Per-page override**: in a note's front matter,
  `title-block-banner: ../assets/images/banners/whatever.jpg`, or `false` for none.
- **Thumbnails**: `image: /assets/images/thumbnails/<slug>.jpg` in a note's front
  matter. Notes without one show `thumbnails/default.jpg`. The template has
  this line commented out with the slug already filled in.
- **Making new art**: from `notes/`, `python _tools/space-art.py thumbnail <slug>` generates an
  original galaxy or nebula (needs `pip install numpy scipy pillow`). Add
  `--style galaxy|nebula`, `--palette violet|teal|ember|blue`, `--seed N` to
  steer it; `banner <name>` makes a wide banner instead. Any JPG/PNG works
  too: NASA and ESA/Webb images are free to use with credit.
- Banner/card styling (gradient overlay, hover effects) lives in `styles.css`.

## Writing math

Inline `$...$`, display `$$...$$`. Macros from `_macros.html` work everywhere:
`\R \C \Z`, `\GL \SL \SO \SU \U \Sp`, `\Lie{g} \gl \so \su`, `\Tr \Hom \End \Aut \im`,
`\dd \pd{f}{x} \vb{x} \half \eps`, `\bra{} \ket{} \braket{}{} \expval{}`,
`\abs{} \norm{} \inner{}{} \set{} \comm{}{}`, `\defeq \iso \normal`.
Add your own there (and in `macros.tex` for the PDF).

Numbered equation and reference:

```markdown
$$
[J_i, J_j] = i\,\eps_{ijk} J_k
$$ {#eq-su2}

By @eq-su2 ...
```

Theorem environments (`thm`, `lem`, `cor`, `prp`, `def`, `exm`, `exr`, `rem`)
and proofs:

```markdown
::: {#thm-schur}
## Schur's lemma
Statement.
:::

::: {.proof}
...
:::

As @thm-schur shows ...
```

Callouts: `::: {.callout-note}`, `-tip`, `-warning`, `-important`, with an
optional `## Title` as the first line. Citations: `[@hall2015, ch. 5]` using
keys from `references.bib`; a reference list is appended automatically.

Full reference: <https://quarto.org/docs/authoring/markdown-basics.html> and
<https://quarto.org/docs/authoring/cross-references.html>.

## The book

Chapters are listed in order in `notes/_book/_quarto.yml` under `book.chapters`.
Add a file, add it to the list. Level-1 heading = chapter title; give it an id
(`# Title {#sec-id}`) to cross-reference it.

PDF: install TinyTeX once (`quarto install tinytex`), uncomment the `pdf:`
block in `notes/_book/_quarto.yml`, and run `quarto render _book --to pdf` from `notes/`. The PDF is
written to `dist/notes/book/`. Netlify only renders HTML, so if you want the PDF
online, commit it (e.g. copy it to `notes/downloads/`) and link to it.

## Troubleshooting

- **Netlify build fails downloading Quarto** — set `QUARTO_VERSION` in
  `netlify.toml` to a specific release (see <https://github.com/quarto-dev/quarto-cli/releases>).
- **Unresolved cross-reference (`?thm-foo`)** — the id must start with a known
  prefix (`thm-`, `eq-`, `sec-`, ...) and be unique within the page.
- **Macro not rendering** — check it is in `_macros.html`, that the file is
  valid (no stray `<`), and that the macro name does not clash with a built-in
  TeX command (`\sl`, `\sp`, `\O`, `\H` all do).
- **Scripts fail on Netlify with `^M` errors** — line endings; `.gitattributes`
  forces LF for `*.sh`, run `git add --renormalize .` if the files were
  committed before it existed.

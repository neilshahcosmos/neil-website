# neilshahcosmos.com

Math and physics notes, written in Markdown with LaTeX, rendered by
[Quarto](https://quarto.org), deployed by Netlify on every push.

```
.
├── _quarto.yml          site config: nav, theme, math, bibliography
├── index.qmd            homepage (lists recent notes)
├── about.qmd
├── algebra/             section: index.qmd (auto listing) + one .qmd per note
├── lie-theory/
├── qft/
├── _book/               the book — a separate Quarto project, served at /book/
│   ├── _quarto.yml      chapter order lives here
│   └── *.qmd            one file per chapter
├── _templates/note.qmd  template used by new-note.sh
├── _macros.html         LaTeX macros available on every HTML page
├── macros.tex           same macros for PDF output
├── theme.scss           fonts, spacing, theorem styling (shared with the book)
├── styles.css           quick CSS tweaks (website only)
├── references.bib       shared bibliography
├── netlify.toml         Netlify build settings
├── netlify-build.sh     installs Quarto on Netlify, renders site + book
├── publish.sh           render locally → commit → push (= deploy)
├── preview.sh           live preview of site or book
└── new-note.sh          create a note from the template
```

Folders beginning with `_` are ignored by the website project; that is why the
book, the templates and the macro file have that prefix.

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
and publish directory (`_site`) are picked up automatically. Leave the UI's
build settings empty or matching. The first deploy starts as soon as the repo
is linked; watch it under **Deploys**.

Optional: pin `QUARTO_VERSION` in `netlify.toml` to the version you have
locally so Netlify and your machine always agree.

## Daily workflow

```bash
./new-note.sh lie-theory "Roots and weights of su(3)"   # creates lie-theory/roots-and-weights-of-su-3.qmd
./preview.sh                                              # write, watch it render
./publish.sh "Add su(3) roots and weights"               # render check → commit → push → Netlify deploys
```

That's it. `publish.sh` renders locally first so a broken cross-reference or
YAML typo fails on your machine rather than on Netlify; use
`SKIP_RENDER=1 ./publish.sh` to skip that.

Section listing pages (`algebra/index.qmd` etc.) and the homepage pick up new
notes automatically from their front matter (`title`, `description`, `date`,
`categories`). Add `draft: true` to a note's front matter to keep it out of the
published site while you work on it.

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

Chapters are listed in order in `_book/_quarto.yml` under `book.chapters`.
Add a file, add it to the list. Level-1 heading = chapter title; give it an id
(`# Title {#sec-id}`) to cross-reference it.

PDF: install TinyTeX once (`quarto install tinytex`), uncomment the `pdf:`
block in `_book/_quarto.yml`, and run `quarto render _book --to pdf`. The PDF is
written to `_site/book/`. Netlify only renders HTML, so if you want the PDF
online, commit it (e.g. copy it to `downloads/` in the website) and link to it.

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

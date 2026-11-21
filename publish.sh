#!/usr/bin/env bash
# Publish: render locally (to catch errors early), commit everything, push.
# Netlify sees the push, runs netlify-build.sh, and deploys.
#
#   ./publish.sh                      # commit message defaults to a timestamp
#   ./publish.sh "Add note on Schur"  # custom message
#   SKIP_RENDER=1 ./publish.sh        # skip the local render check
#
# Run from Git Bash / Cygwin / WSL on Windows, or any shell on Linux/macOS.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

msg="${1:-Update notes $(date '+%Y-%m-%d %H:%M')}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "!! This folder is not a git repository yet. See README.md (one-time setup)." >&2
  exit 1
fi

if [[ "${SKIP_RENDER:-0}" != "1" ]]; then
  if ! command -v quarto >/dev/null 2>&1; then
    echo "!! quarto not found on PATH. Install it (https://quarto.org/docs/get-started/)" >&2
    echo "   or run with SKIP_RENDER=1 to let Netlify do the rendering." >&2
    exit 1
  fi
  echo "==> Rendering notes (local check)"
  (cd notes && quarto render)
  echo "==> Rendering book (local check)"
  (cd notes && quarto render _book --to html)
fi

echo "==> Committing"
git add -A
if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -m "${msg}"
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
echo "==> Pushing ${branch}"
git push origin "${branch}"

echo
echo "Pushed. Netlify is building; the site updates in a minute or two."
echo "Build log: https://app.netlify.com/  ->  your site  ->  Deploys"

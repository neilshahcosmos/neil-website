#!/usr/bin/env bash
# Live-reloading local preview.
#   ./preview.sh        # the notes site (served from notes/)
#   ./preview.sh garden # your main site (Astro dev server, live reload)
#   ./preview.sh home   # Claude's reference version (not deployed)
#   ./preview.sh all    # build everything into dist/ and serve it as Netlify would
#   ./preview.sh book   # the book
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/notes"

if [[ "${1:-}" == "garden" || "${1:-}" == "home" ]]; then
  cd "../${1}"
  [[ -d node_modules ]] || npm install
  exec npm run dev
elif [[ "${1:-}" == "all" ]]; then
  cd ..
  (cd garden && { [[ -d node_modules ]] || npm install; } && npm run build)
  (cd notes && quarto render && quarto render _book --to html)
  echo "==> Serving dist/ at http://localhost:4321"
  exec npx --yes serve dist -l 4321
elif [[ "${1:-}" == "book" ]]; then
  exec quarto preview _book
else
  exec quarto preview
fi

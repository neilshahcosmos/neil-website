#!/usr/bin/env bash
# Live-reloading local preview.
#   ./preview.sh        # the notes site (served from notes/)
#   ./preview.sh book   # the book
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/notes"

if [[ "${1:-}" == "book" ]]; then
  exec quarto preview _book
else
  exec quarto preview
fi

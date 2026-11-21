#!/usr/bin/env bash
# Create a new note from the template.
#   ./new-note.sh <section> "<Title>"
#   ./new-note.sh lie-theory "Roots and weights of su(3)"
# Sections: any folder in notes/ with an index.qmd (algebra, lie-theory, qft, set-theory, ...).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/notes"

section="${1:-}"
title="${2:-}"
if [[ -z "${section}" || -z "${title}" ]]; then
  echo "usage: $0 <section> \"<Title>\"" >&2
  exit 1
fi
if [[ ! -f "${section}/index.qmd" ]]; then
  echo "!! No section '${section}' (expected ${section}/index.qmd)" >&2
  exit 1
fi

# Slugify: lowercase, ASCII letters/digits, hyphens.
slug="$(printf '%s' "${title}" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
target="${section}/${slug}.qmd"
if [[ -e "${target}" ]]; then
  echo "!! ${target} already exists" >&2
  exit 1
fi

today="$(date +%Y-%m-%d)"
# Escape characters that are special on the sed replacement side.
esc_title="$(printf '%s' "${title}" | sed -e 's/[\/&]/\\&/g')"

sed -e "s/^title: \"TITLE\"/title: \"${esc_title}\"/" \
    -e "s/^date: DATE/date: ${today}/" \
    -e "s/SLUG/${slug}/g" \
    _templates/note.qmd > "${target}"

echo "Created notes/${target}"

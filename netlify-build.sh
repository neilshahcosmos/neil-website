#!/usr/bin/env bash
# Netlify build script: assemble dist/ from the main site (home/) and the
# Quarto notes (notes/ -> dist/notes/, book -> dist/notes/book/).
# Runs on Netlify's Ubuntu build image; invoked from netlify.toml.
set -euo pipefail

QUARTO_VERSION="${QUARTO_VERSION:-latest}"
ARCH="amd64"
INSTALL_DIR="${HOME}/quarto"

if [[ "${QUARTO_VERSION}" == "latest" ]]; then
  URL="https://quarto.org/download/latest/quarto-linux-${ARCH}.tar.gz"
else
  URL="https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-${ARCH}.tar.gz"
fi

echo "==> Installing Quarto (${QUARTO_VERSION}) from ${URL}"
mkdir -p "${INSTALL_DIR}"
curl -fsSL "${URL}" | tar -xz -C "${INSTALL_DIR}"

QUARTO_BIN="$(find "${INSTALL_DIR}" -type f -path '*/bin/quarto' | head -n 1)"
if [[ -z "${QUARTO_BIN}" ]]; then
  echo "!! Could not find the quarto binary after extraction" >&2
  exit 1
fi
export PATH="$(dirname "${QUARTO_BIN}"):${PATH}"
quarto --version

echo "==> Main site: copying home/ to dist/"
rm -rf dist
mkdir -p dist
# home/ is plain static files for now. If the main site later uses a build
# tool, replace this line with its build command, writing its output to dist/
# (and make sure it does not wipe dist/notes).
cp -R home/. dist/

echo "==> Rendering notes into dist/notes"
(cd notes && quarto render)

echo "==> Rendering book into dist/notes/book"
(cd notes && quarto render _book --to html)

echo "==> Done. Output:"
find dist -maxdepth 2 -type d | sort

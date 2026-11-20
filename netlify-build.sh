#!/usr/bin/env bash
# Netlify build script: install Quarto, render the website and the book.
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

echo "==> Rendering website"
quarto render

echo "==> Rendering book into _site/book"
quarto render _book --to html

echo "==> Done. Output:"
find _site -maxdepth 2 -type d | sort

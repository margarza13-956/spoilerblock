#!/usr/bin/env bash
# SpoilerBlock Packaging Script for Chrome Web Store

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="${SCRIPT_DIR}/dist"
VERSION=$(grep -o '"version": "[^"]*"' "${SCRIPT_DIR}/manifest.json" | cut -d'"' -f4)
ZIP_NAME="spoilerblock-v${VERSION}.zip"
ZIP_PATH="${DIST_DIR}/${ZIP_NAME}"

echo "=========================================="
echo "📦 Packaging SpoilerBlock v${VERSION}..."
echo "=========================================="

# Create dist directory
mkdir -p "${DIST_DIR}"
rm -f "${ZIP_PATH}"

# Navigate to project root
cd "${SCRIPT_DIR}"

# Validate required files exist
REQUIRED_FILES=(
  "manifest.json"
  "background.js"
  "content.js"
  "spoiler-engine.js"
  "spoilerblock.css"
  "popup.html"
  "popup.js"
  "icons/icon16.png"
  "icons/icon32.png"
  "icons/icon48.png"
  "icons/icon128.png"
)

echo "🔍 Validating extension files..."
for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "❌ Error: Required file '${file}' is missing!"
    exit 1
  fi
  echo "  ✅ ${file}"
done

# Validate manifest.json syntax
python3 -c "import json; json.load(open('manifest.json'))" || {
  echo "❌ Error: Invalid manifest.json JSON syntax"
  exit 1
}
echo "  ✅ manifest.json syntax is valid"

# Create the release zip package (excluding git, docs, dev scripts, and dist folder)
echo "🗜️  Creating release ZIP package..."
zip -r "${ZIP_PATH}" \
  manifest.json \
  background.js \
  content.js \
  spoiler-engine.js \
  spoilerblock.css \
  popup.html \
  popup.js \
  icons/*.png \
  -x "*.git*" "*.DS_Store*"

echo ""
echo "🎉 SUCCESS!"
echo "📦 Release bundle generated at: ${ZIP_PATH}"
echo "📊 Package size: $(du -h "${ZIP_PATH}" | cut -f1)"
echo "=========================================="
echo "Next step: Upload '${ZIP_NAME}' to the Chrome Web Store Developer Dashboard!"

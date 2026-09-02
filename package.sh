#!/usr/bin/env bash
# SpoilerBlock Multi-Browser Packaging Script
# Generates store-ready bundles for Chrome Web Store, Firefox AMO, and Edge Add-ons

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="${SCRIPT_DIR}/dist"
VERSION=$(grep -o '"version": "[^"]*"' "${SCRIPT_DIR}/manifest.json" | cut -d'"' -f4)

echo "=========================================================="
echo "📦 Packaging SpoilerBlock v${VERSION} for All Stores..."
echo "=========================================================="

mkdir -p "${DIST_DIR}"
cd "${SCRIPT_DIR}"

# 1. Run Test Suite
echo "🧪 Running Automated Verification Tests..."
node test-suite.js

# 2. Chrome Web Store & Universal Bundle
echo " Chrome Web Store Bundle..."
CHROME_ZIP="${DIST_DIR}/spoilerblock-chrome-v${VERSION}.zip"
UNIVERSAL_ZIP="${DIST_DIR}/spoilerblock-v${VERSION}.zip"
rm -f "${CHROME_ZIP}" "${UNIVERSAL_ZIP}"

zip -r "${CHROME_ZIP}" \
  manifest.json \
  background.js \
  content.js \
  spoiler-engine.js \
  spoilerblock.css \
  popup.html \
  popup.js \
  icons/*.png \
  -x "*.git*" "*.DS_Store*"

cp "${CHROME_ZIP}" "${UNIVERSAL_ZIP}"
echo "  ✅ Generated: ${CHROME_ZIP}"

# 3. Microsoft Edge Add-ons Bundle
echo "🧩 Microsoft Edge Add-ons Bundle..."
EDGE_ZIP="${DIST_DIR}/spoilerblock-edge-v${VERSION}.zip"
rm -f "${EDGE_ZIP}"
cp "${CHROME_ZIP}" "${EDGE_ZIP}"
echo "  ✅ Generated: ${EDGE_ZIP}"

# 4. Firefox AMO (Add-ons) Bundle with Gecko ID
echo "🦊 Firefox AMO Bundle..."
FIREFOX_BUILD_DIR="${DIST_DIR}/firefox-build"
FIREFOX_ZIP="${DIST_DIR}/spoilerblock-firefox-v${VERSION}.zip"
rm -rf "${FIREFOX_BUILD_DIR}" "${FIREFOX_ZIP}"
mkdir -p "${FIREFOX_BUILD_DIR}/icons"

cp background.js content.js spoiler-engine.js spoilerblock.css popup.html popup.js "${FIREFOX_BUILD_DIR}/"
cp icons/*.png "${FIREFOX_BUILD_DIR}/icons/"

# Add Firefox browser_specific_settings to manifest
python3 -c "
import json
with open('manifest.json', 'r') as f:
    data = json.load(f)
data['browser_specific_settings'] = {
    'gecko': {
        'id': 'spoilerblock@margarza.com',
        'strict_min_version': '109.0'
    }
}
data['background'] = {
    'scripts': ['background.js']
}
with open('${FIREFOX_BUILD_DIR}/manifest.json', 'w') as f:
    json.dump(data, f, indent=2)
"

(cd "${FIREFOX_BUILD_DIR}" && zip -r "${FIREFOX_ZIP}" . -x "*.DS_Store*")
rm -rf "${FIREFOX_BUILD_DIR}"
echo "  ✅ Generated: ${FIREFOX_ZIP}"

echo ""
echo "=========================================================="
echo "🎉 ALL PACKAGES CREATED SUCCESSFULLY!"
echo "----------------------------------------------------------"
echo "📁 Chrome Store:   ${CHROME_ZIP} ($(du -h "${CHROME_ZIP}" | cut -f1))"
echo "📁 Edge Store:     ${EDGE_ZIP} ($(du -h "${EDGE_ZIP}" | cut -f1))"
echo "📁 Firefox AMO:    ${FIREFOX_ZIP} ($(du -h "${FIREFOX_ZIP}" | cut -f1))"
echo "📁 Universal:      ${UNIVERSAL_ZIP} ($(du -h "${UNIVERSAL_ZIP}" | cut -f1))"
echo "=========================================================="

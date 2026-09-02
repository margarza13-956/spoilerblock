// SpoilerBlock — Automated Unit & Integration Test Suite

const fs = require('fs');
const path = require('path');
const SpoilerEngine = require('./spoiler-engine.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

console.log('==============================================');
console.log('🧪 Running SpoilerBlock Comprehensive Tests...');
console.log('==============================================\n');

// ── 1. Spoiler Engine Heuristics Tests ──────────────────────────────────────────
console.log('1. Testing SpoilerEngine Heuristic Calculations:');

const deathResult = SpoilerEngine.calculate('Severance: Mark dies in the season finale!', 'Severance');
assert(deathResult.score >= 60 && deathResult.level === 'high', 'Detects death spoiler and assigns high threat level');

const twistResult = SpoilerEngine.calculate('House of the Dragon major plot twist reveals secret identity of the dragonrider', 'House of the Dragon');
assert(twistResult.score >= 40, 'Detects plot twist + secret identity and scores correctly');

const leakResult = SpoilerEngine.calculate('Arcane season 2 major leak: Silco was the true villain all along', 'Arcane');
assert(leakResult.score >= 50, 'Detects leaked ending / major leak patterns');

const endingResult = SpoilerEngine.calculate('The ending of Succession explained and how Logan Roy betrayed his kids', 'Succession');
assert(endingResult.score >= 40 && endingResult.indicators.length > 0, 'Detects ending explained and betrayal');

const safeResult = SpoilerEngine.calculate("I'm so excited to see Severance tomorrow, don't spoil anything please!", 'Severance');
assert(safeResult.score === 0 && safeResult.level === 'safe', 'Suppresses non-spoiler phrases asking not to spoil');

const unrelatedResult = SpoilerEngine.calculate('Just having a sandwich for lunch.', 'Severance');
assert(unrelatedResult.score === 0, 'Returns 0 score when title is not mentioned');

// ── 2. Sports Blackout Heuristics Tests ────────────────────────────────────────
console.log('\n2. Testing Sports Blackout Mode Heuristics:');

const sportsScore = SpoilerEngine.calculate('Live Sports: Chiefs defeated 49ers 25-22 in overtime super bowl winner', 'Live Sports');
assert(sportsScore.score >= 60, 'Detects score pattern (25-22) and championship winner');

const f1Result = SpoilerEngine.calculate('Live Sports: Verstappen takes pole position and becomes grand prix winner at Monaco', 'Live Sports');
assert(f1Result.score >= 50, 'Detects F1 race outcomes and podium/pole position');

const ufcResult = SpoilerEngine.calculate('Live Sports: Main event ended in round 2 knockout victory for the new UFC champion', 'Live Sports');
assert(ufcResult.score >= 50, 'Detects UFC knockout and champion outcome');

// ── 3. Levenshtein Fuzzy Match Algorithm ──────────────────────────────────────
console.log('\n3. Testing Fuzzy Match (Levenshtein Distance):');

assert(levenshtein('severance', 'severence') === 1, 'Levenshtein distance for 1-letter typo is 1');
assert(levenshtein('targaryen', 'targaryan') === 1, 'Levenshtein distance for Targaryen misspelling is 1');
assert(levenshtein('helly', 'kelly') === 1, 'Levenshtein distance for near-miss name is 1');
assert(levenshtein('ironman', 'batman') > 2, 'Levenshtein distance for completely different word > 2');

// ── 4. License Key Validation Logic ───────────────────────────────────────────
console.log('\n4. Testing Pro License Key Validation:');

function validateLicenseKey(key) {
  const k = (key || '').trim().toUpperCase();
  return k.startsWith('PRO-') || k.startsWith('SB-') || k === 'LIFETIME' || k.length >= 8;
}

assert(validateLicenseKey('PRO-VIP-ACCESS') === true, 'Accepts PRO- prefixed license keys');
assert(validateLicenseKey('SB-COMMUNITY-2026') === true, 'Accepts SB- prefixed keys');
assert(validateLicenseKey('LIFETIME') === true, 'Accepts LIFETIME promo code');
assert(validateLicenseKey('12345678') === true, 'Accepts 8+ char alphanumeric keys from Stripe/Gumroad');
assert(validateLicenseKey('ABC') === false, 'Rejects short invalid keys');
assert(validateLicenseKey('') === false, 'Rejects empty key');

// ── 5. Manifest V3 & Extension Files Validation ──────────────────────────────
console.log('\n5. Testing Manifest V3 & File Integrity:');

const manifestPath = path.join(__dirname, 'manifest.json');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert(manifestContent.manifest_version === 3, 'Manifest version is 3');
assert(manifestContent.permissions.includes('storage'), 'Includes storage permission');
assert(manifestContent.permissions.includes('activeTab'), 'Includes activeTab permission');

const expectedHosts = [
  'https://www.facebook.com/*',
  'https://x.com/*',
  'https://twitter.com/*',
  'https://www.reddit.com/*',
  'https://www.youtube.com/*',
  'https://www.instagram.com/*',
  'https://www.threads.net/*',
  'https://www.tiktok.com/*',
  'https://bsky.app/*'
];

const hasAllHosts = expectedHosts.every(h => manifestContent.host_permissions.includes(h));
assert(hasAllHosts, 'Manifest includes host permissions for all 8 supported social networks');

const icons = ['icons/icon16.png', 'icons/icon32.png', 'icons/icon48.png', 'icons/icon128.png'];
const allIconsExist = icons.every(iconPath => fs.existsSync(path.join(__dirname, iconPath)));
assert(allIconsExist, 'All extension icon sizes (16, 32, 48, 128) exist');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n==============================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('==============================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

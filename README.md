# SpoilerBlock — Browser Extension (Phase 1 MVP)

Hides social media spoilers on Facebook, X (Twitter), and Reddit for movies, TV shows, books, and games you haven't finished yet.

## What It Does

- Add titles to your watchlist with spoiler keywords (character names, plot points, etc.)
- As you scroll Facebook, X, or Reddit, matching posts are blurred with a "Possible spoiler" overlay
- Click to reveal any blocked post, or flag it as a false positive
- Everything runs locally — no data is sent anywhere

## Install (Developer Mode)

1. Download/copy this `spoilerblock/` folder
2. Open `chrome://extensions` (or `edge://extensions` in Edge)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `spoilerblock/` folder
6. The SpoilerBlock icon appears in your toolbar — click it to manage your watchlist

## Usage

1. Click the extension icon to open the popup
2. Add a title (e.g., "Severance S2"), pick the media type, and enter spoiler keywords (e.g., "Mark, Helly, Cold Harbor")
3. Browse Facebook/X/Reddit normally — posts containing those keywords will be blurred
4. Click **Reveal** to see a blocked post, or **Not a spoiler** to whitelist that keyword

## Settings

- **Match Mode:** Whole word (default, conservative), Partial match (broader), Fuzzy match (catches misspellings/near-misses)
- **Blur Level:** Heavy (12px) or Light (4px)
- **Pause/Resume:** Temporarily disable all blocking

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — state management, watchlist CRUD, stats |
| `content.js` | Content script — feed scanning, keyword matching, DOM blur |
| `spoilerblock.css` | Overlay/blur styles (injected on supported sites) |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic — add/remove titles, settings, stats display |
| `icons/` | Extension icons (needs 16/48/128px PNGs) |

## Supported Platforms (Phase 1)

- ✅ YouTube (Video titles, recommendations & comments)
- ✅ Facebook
- ✅ X (Twitter)
- ✅ Reddit

## Roadmap (Phases 2-3)

- Auto-generated spoiler keyword packs from community databases
- AI-powered spoiler detection for posts that don't match exact keywords
- Instagram, YouTube, TikTok support
- Cross-device watchlist sync
- Chrome Web Store publication

## Privacy

All keyword matching happens in your browser. No post content, user data, or watchlist is ever sent to any server. The extension has zero network permissions.

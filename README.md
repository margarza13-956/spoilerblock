# SpoilerBlock — Multi-Platform Social Media Spoiler Blocker 🛡️

Hides spoilers across **YouTube, X (Twitter), Reddit, Facebook, Instagram, Threads, TikTok, and Bluesky** for movies, TV shows, books, video games, and live sports you haven't caught up on yet.

---

## ✨ Features

- **8 Supported Social Platforms:** Real-time scanning & blur overlays across YouTube, X, Reddit, Facebook, Instagram, Threads, TikTok, and Bluesky.
- **✨ 1-Click Auto Keywords:** Instant character and plot keyword generation for 5,000+ popular titles (e.g., *Severance, House of the Dragon, Stranger Things, Arcane, Dune, Shogun, GTA 6*).
- **⚽ Sports Blackout Mode:** Auto-masks live scores, race podiums, and match outcomes (NFL, NBA, F1, Premier League, Champions League, UFC).
- **Match Modes:** Whole word (default), Partial match, and Fuzzy match (tolerates typos).
- **Adjustable Blur:** Heavy (12px) or Light (4px) with interactive "Click to reveal" and "Not a spoiler" whitelisting.
- **100% Private & Local:** Zero analytics, telemetry, or network calls. Everything runs locally in your browser.

---

## 📦 Install (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/margarza13-956/spoilerblock.git
   ```
2. Open your browser's extension manager:
   - Chrome / Brave: `chrome://extensions`
   - Edge: `edge://extensions`
   - Firefox: `about:debugging#/runtime/this-firefox`
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `spoilerblock/` directory.
5. Pin the SpoilerBlock icon to your toolbar.

---

## 🧪 Automated Testing

Run the built-in test suite to verify detection heuristics, sports pattern matching, fuzzy distance, and manifest integrity:

```bash
node test-suite.js
```

---

## 📦 Building Store Releases

Generate release bundles for Chrome Web Store, Firefox AMO, and Microsoft Edge:

```bash
./package.sh
```

Output packages will be placed in `dist/`:
- `dist/spoilerblock-chrome-v1.0.0.zip`
- `dist/spoilerblock-firefox-v1.0.0.zip`
- `dist/spoilerblock-edge-v1.0.0.zip`
- `dist/spoilerblock-v1.0.0.zip`

---

## 🌐 Supported Platforms

| Platform | Areas Protected |
| :--- | :--- |
| **YouTube** | Video titles, recommendation sidebars, search results, and comments |
| **X (Twitter)** | Timeline tweets, replies, quoted posts, and media |
| **Reddit** | Post titles, card previews, comments, and community feeds |
| **Facebook** | Feed posts, community group updates, and comments |
| **Instagram** | Feed captions, explore cards, and comments |
| **Threads** | Thread posts and timeline replies |
| **TikTok** | Video captions and comment sections |
| **Bluesky** | Feed posts, timeline cards, and replies |

---

## 📄 Privacy Policy

All keyword matching and DOM filtering occurs purely client-side inside the local extension sandbox. No user data or browsing activity is ever collected or transmitted.

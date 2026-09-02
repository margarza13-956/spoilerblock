# 🚀 Store Publication Kit for SpoilerBlock
### Chrome Web Store • Firefox AMO • Microsoft Edge Add-ons

This document contains everything needed to publish **SpoilerBlock** across the major browser extension stores.

---

## 1. Store Metadata & Copy

### 🏷️ Extension Title
```
SpoilerBlock — Social Media Spoiler Blocker
```

### 📝 Short Description (Max 132 characters)
```
Hides social media spoilers on YouTube, X, Reddit, Facebook, Instagram, TikTok, Threads & Bluesky for movies, TV shows & sports.
```
*(Character count: 128 / 132)*

### 📖 Detailed Description (Markdown format for Store Listing)
```markdown
Shield yourself from unwanted spoilers while browsing social media! 🛡️

SpoilerBlock automatically scans and blurs spoilers for your favorite movies, TV shows, books, video games, and live sports across YouTube, X (Twitter), Reddit, Facebook, Instagram, Threads, TikTok, and Bluesky.

Whether you're waiting for the weekend to binge the latest season finale or haven't watched the new blockbuster release yet, SpoilerBlock ensures your feeds remain completely spoiler-free.

---

### ✨ Key Features

* 🎯 **Smart Feed Detection:** Automatically identifies spoiler discussions and video thumbnails across YouTube, X (Twitter), Reddit, Facebook, Instagram, Threads, TikTok, and Bluesky in real time.
* 🪄 **1-Click Auto Keywords:** Instantly populate character names, major twists, and keywords for 5,000+ popular movies, shows, and games.
* ⚽ **Sports Blackout Mode:** Delay-friendly protection that masks live match scores, race podiums, and championship outcomes (NFL, NBA, F1, Premier League, Champions League, UFC).
* 🌫️ **Customizable Blur Overlays:** Choose between Heavy (12px) or Light (4px) blur effects with a clean "Possible Spoiler" overlay.
* 👁️ **One-Click Reveal:** Click any blurred post to instantly reveal it if you change your mind.
* ⚙️ **Flexible Matching Modes:**
  - **Whole Word (Default):** Exact word boundary matching for minimal false positives.
  - **Partial Match:** Catches broad phrases and substring occurrences.
  - **Fuzzy Match:** Smart typo and near-miss matching (Levenshtein distance).
* 🚫 **"Not a Spoiler" Whitelisting:** Easily flag false positives with one click to permanently whitelist harmless terms.
* ⏸️ **Instant Pause/Resume:** Toggle protection on/off with a single click from the extension popup.
* 🔒 **100% Private & Local:** Zero analytics, zero tracking, and zero remote servers. All matching happens directly on your device.

---

### 🎮 Supported Platforms (8 Major Networks)

* ✅ **YouTube** — Video titles, recommendation cards, search results, and comments.
* ✅ **X (Twitter)** — Feed tweets, replies, quotes, and media.
* ✅ **Reddit** — Post titles, previews, comments, and threads.
* ✅ **Facebook** — Main feed posts and community groups.
* ✅ **Instagram** — Feed captions, explore cards, and comments.
* ✅ **Threads** — Thread posts and replies.
* ✅ **TikTok** — Video captions and comment threads.
* ✅ **Bluesky** — Feed posts, timeline items, and replies.

---

### 🚀 How to Use

1. Click the **SpoilerBlock** icon in your browser toolbar.
2. Click **+ Add Title** and enter the movie, show, or game you're watching (e.g., "Severance", "House of the Dragon", "Arcane").
3. Click **✨ Auto Keywords** or type custom keywords.
4. Browse your favorite social platforms with peace of mind!

---

### 🛡️ Privacy Guarantee

SpoilerBlock does NOT collect, track, store, or transmit your personal data, feeds, or browsing history. Everything runs 100% locally in your browser.
```

---

## 2. Reviewer Justifications (Single Purpose & Permissions)

When submitting to the Chrome Web Store / Firefox AMO / Edge Developer Dashboard:

### 📌 Single Purpose Description
```
SpoilerBlock's single purpose is to protect users from unwanted social media spoilers by blurring matching posts in real time based on user-defined watchlists.
```

### 🔑 Permission Justifications

| Permission | Justification for Store Reviewer |
| :--- | :--- |
| **`storage`** | Used exclusively to save the user's custom watchlist, keyword filters, and extension settings locally in `chrome.storage.local`. |
| **`activeTab`** | Used to allow the extension popup to communicate with and trigger re-scanning of the active social media tab. |
| **Host Permissions (`facebook.com`, `x.com`, `reddit.com`, `youtube.com`, `instagram.com`, `threads.net`, `tiktok.com`, `bsky.app`)** | Required solely to inject the content script and CSS stylesheet onto supported social platforms to scan DOM elements and apply blur overlays to spoiler posts. |

---

## 3. Store Packages Generated

Build all packages anytime by running `./package.sh`:

| Store | Upload File | Location |
| :--- | :--- | :--- |
| **Google Chrome Web Store** | `spoilerblock-chrome-v1.0.0.zip` | `dist/` |
| **Microsoft Edge Add-ons** | `spoilerblock-edge-v1.0.0.zip` | `dist/` |
| **Mozilla Firefox AMO** | `spoilerblock-firefox-v1.0.0.zip` | `dist/` |
| **Universal / GitHub Release** | `spoilerblock-v1.0.0.zip` | `dist/` |

---

## 4. Privacy Policy Link
Public privacy policy URL for store listings:
```
https://margarza13-956.github.io/spoilerblock/privacy-policy.html
```

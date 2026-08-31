# 🚀 Chrome Web Store Publication Kit for SpoilerBlock

This document contains everything needed to publish **SpoilerBlock** to the Google Chrome Web Store Developer Dashboard.

---

## 1. Store Metadata & Copy

### 🏷️ Extension Title
```
SpoilerBlock — Social Media Spoiler Blocker
```

### 📝 Short Description (Max 132 characters)
```
Hides social media spoilers on YouTube, X, Reddit, and Facebook for movies, TV shows, and games with smart blur overlays.
```
*(Character count: 121 / 132)*

### 📖 Detailed Description (Markdown format for Store Listing)
```markdown
Shield yourself from unwanted spoilers while browsing social media! 🛡️

SpoilerBlock automatically scans and blurs spoilers for your favorite movies, TV shows, books, and video games across YouTube, X (Twitter), Reddit, and Facebook.

Whether you're waiting for the weekend to binge the latest season finale or haven't watched the new blockbuster release yet, SpoilerBlock ensures your feeds remain completely spoiler-free.

---

### ✨ Key Features

* 🎯 **Smart Feed Detection:** Automatically identifies spoiler discussions and video thumbnails across YouTube, X (Twitter), Reddit, and Facebook in real time.
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

### 🎮 Supported Platforms

* ✅ **YouTube** — Video titles, recommendation cards, and comments.
* ✅ **X (Twitter)** — Feed tweets, replies, and quoted tweets.
* ✅ **Reddit** — Post titles, previews, and comments.
* ✅ **Facebook** — Main feed posts and community group updates.

---

### 🚀 How to Use

1. Click the **SpoilerBlock** icon in your browser toolbar.
2. Click **+ Add Title** and enter the movie, show, or game you're watching (e.g., "Severance", "House of the Dragon").
3. Add spoiler keywords (character names, plot points, etc.).
4. Browse your favorite social platforms with peace of mind!

---

### 🛡️ Privacy Guarantee

SpoilerBlock does NOT collect, track, store, or transmit your personal data, feeds, or browsing history. Everything runs 100% locally in your browser.
```

---

## 2. Reviewer Justifications (Single Purpose & Permissions)

When submitting to the Chrome Web Store, Google requires explanations for requested permissions:

### 📌 Single Purpose Description
```
SpoilerBlock's single purpose is to protect users from unwanted social media spoilers by blurring matching posts in real time based on user-defined watchlists.
```

### 🔑 Permission Justifications

| Permission | Justification for Google Reviewer |
| :--- | :--- |
| **`storage`** | Used exclusively to save the user's custom watchlist, keyword filters, and extension settings locally in `chrome.storage.local`. |
| **`activeTab`** | Used to allow the extension popup to communicate with and trigger re-scanning of the active social media tab. |
| **Host Permissions (`facebook.com`, `x.com`, `twitter.com`, `reddit.com`)** | Required solely to inject the content script and CSS stylesheet onto supported social platforms to scan DOM elements and apply blur overlays to spoiler posts. |

---

## 3. Store Graphic Asset Specifications

To publish, prepare the following image assets:

| Asset | Required Size | Format | Purpose |
| :--- | :--- | :--- | :--- |
| **Extension Icon** | 128 x 128 px | PNG | High-res icon in store searches *(Provided in `icons/icon128.png`)* |
| **Store Screenshots** | 1280 x 800 px (or 640 x 400 px) | PNG/JPEG | 1 to 5 screenshots demonstrating the popup UI, active blurred post, and watchlist settings. |
| **Small Promo Tile** (Optional) | 440 x 280 px | PNG/JPEG | Displayed on Chrome Web Store category pages. |
| **Marquee Promo Tile** (Optional) | 1400 x 560 px | PNG/JPEG | Displayed if featured on the Chrome Web Store homepage. |

---

## 4. Privacy Policy Link
Google requires a public privacy policy URL:
```
https://margarza13-956.github.io/spoilerblock/privacy-policy.html
```
*(Enabled simply by turning on GitHub Pages on the `main` branch of your repository!)*

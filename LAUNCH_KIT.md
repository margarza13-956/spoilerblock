# 🚀 SpoilerBlock Launch & Viral Marketing Playbook

This kit contains ready-to-use launch copy, community templates, short-form video scripts, and tactical strategies to get your first **1,000 to 10,000+ users** with zero ad spend.

---

## 📅 The Viral Launch Timing Strategy

Spoiler blockers have **seasonal/event-driven viral spikes**. The highest conversion days are:
* **Sunday & Monday evenings:** Big TV show finale / premiere nights (*House of the Dragon, Severance, Stranger Things, The Last of Us*).
* **Race & Match Days:** F1 Grand Prix Sundays, UEFA Champions League final, Super Bowl, NBA Finals (for fans in different time zones watching delayed replays).
* **Blockbuster Movie Opening Weekends:** Marvel, Star Wars, or DC theatrical premieres.

---

## 1. 🔴 Reddit Launch Strategy (Highest Converting Channel)

> **Rule:** Never sound like a spammy marketer on Reddit. Position yourself as a fellow fan / indie dev solving your own frustration.

### Template A: TV & Film Fan Subreddits
**Target Subreddits:** `r/television`, `r/movies`, `r/SeveranceAppleTVPlus`, `r/HouseOfTheDragon`, `r/StrangerThings`, `r/TheLastOfUs`

* **Post Title:** 
  > *I got tired of having season finales spoiled on social media before I could watch them, so I built a free, privacy-first spoiler blocker extension.*
* **Post Body:**
  ```markdown
  Hey everyone,

  Like a lot of people here, I work during the week and usually have to wait a couple of days before I can catch up on new episodes of [Show Name / my favorite shows].

  Inevitably, I'll open Twitter/X, Reddit, or YouTube during my lunch break and immediately see a post title or thumbnail revealing a character death or plot twist.

  Traditional blockers only match 1 or 2 static words and miss everything else. So I built **SpoilerBlock**:

  - 🛡️ **How it works:** You add a show to your watchlist (e.g. "Severance"), and as you scroll YouTube, X, Reddit, or Facebook, posts discussing plot twists, deaths, or major characters are automatically blurred with a clean "Possible Spoiler" overlay.
  - 👁️ **One-Click Reveal:** If you want to read it anyway, just click the post to reveal it.
  - 🔒 **100% Privacy:** No user data or browsing history leaves your device. Everything runs completely locally in the browser (zero remote servers).

  It's completely free to use. 

  👉 **Chrome Web Store / GitHub:** [Link to your extension / GitHub]

  I'd love your feedback—what other platforms or shows should I add preset keyword packs for?
  ```

---

### Template B: Sports Subreddits (Delayed-Watchers)
**Target Subreddits:** `r/formula1`, `r/soccer`, `r/nba`, `r/nfl`

* **Post Title:**
  > *For anyone living in a different time zone who watches recorded races/matches: I built a free tool to hide scores on social feeds until you watch.*
* **Post Body:**
  ```markdown
  If you live in a timezone where matches or Grand Prix start at 3 AM and you watch the replay the next afternoon, opening YouTube or Twitter in the morning is a minefield.

  I built a lightweight browser extension called **SpoilerBlock** that auto-blurs match scores, podium results, and game outcomes across YouTube, Reddit, X, and Facebook until you've watched the event.

  - Works on YouTube video cards, Twitter feeds, and Reddit feeds.
  - Local matching only with zero tracking.

  Link: [Your link here]

  Hope this saves someone's race weekend / match day!
  ```

---

### Template C: Maker & Tech Communities
**Target Subreddits:** `r/SideProject`, `r/InternetIsBeautiful`, `r/chrome_extensions`, `r/webdev`

* **Post Title:**
  > *Show SideProject: SpoilerBlock — An open-source Manifest V3 extension that blurs social media spoilers in real time*
* **Post Body:**
  ```markdown
  Hey r/SideProject!

  I built **SpoilerBlock**, a Manifest V3 browser extension that scans social feeds (YouTube, X, Reddit, Facebook) and applies non-destructive blur overlays over potential spoilers.

  ### Tech Stack & Architecture:
  - **Manifest V3** with local MutationObservers for infinite scroll feeds.
  - **Heuristic Spoiler Detection Engine:** Combines Levenshtein fuzzy matching, keyword indices, and contextual pattern scoring (detecting death indicators, plot twist phrases, match scores).
  - **Zero Telemetry / Privacy First:** 100% on-device matching with zero external server dependencies.

  GitHub: https://github.com/margarza13-956/spoilerblock
  Chrome Web Store: [Your Link]

  Feedback on the DOM observer performance and detection logic is super appreciated!
  ```

---

## 2. 🟠 Hacker News ("Show HN") Launch

* **Submission Title:**
  > `Show HN: SpoilerBlock – Open-source, local-only spoiler blocker for social media`
* **URL:** `https://github.com/margarza13-956/spoilerblock` (or your Chrome Web Store link)
* **First Comment (Post immediately after submitting):**
  ```markdown
  Hi HN!

  I built SpoilerBlock because existing content blockers are either unmaintained, collect too much telemetry, or rely solely on naive single-keyword string matches that break on common phrases.

  SpoilerBlock runs entirely client-side on Manifest V3. It intercepts feed elements on YouTube, X (Twitter), Reddit, and Facebook, evaluating text against local keyword indices and contextual sentiment patterns (e.g. plot twists, deaths, post-credit scenes, match scores). Matching DOM containers are blurred with interactive unblur/whitelist controls.

  - Zero network permissions required.
  - Local state stored strictly in chrome.storage.local.
  - Open source on GitHub: https://github.com/margarza13-956/spoilerblock

  Would love to hear HN's thoughts on improving the heuristic engine and DOM observer efficiency on high-throughput infinite feeds!
  ```

---

## 3. 🐦 X (Twitter) & Threads Launch Thread

* **Tweet 1 (The Hook):**
  > Having a major movie or season finale spoiled while scrolling Twitter is the absolute worst.
  > 
  > So I built a free browser extension that automatically blurs out spoilers in real-time across X, YouTube, and Reddit. 🛡️🧵👇
  > 
  > *(Attach 5-second screen recording GIF of a spoiler tweet getting blurred)*

* **Tweet 2 (How it works):**
  > How it works:
  > 1. Add what you're watching (e.g. "Severance" or "House of the Dragon")
  > 2. Pick keywords or use 1-click Auto Keyword Packs
  > 3. Browse in peace — any post mentioning deaths, endings, or plot twists gets blurred with a "Click to reveal" button.

* **Tweet 3 (Privacy & Link):**
  > 🔒 100% private: All detection happens locally in your browser. Zero tracking, zero ads, zero data collected.
  > 
  > Try it out here: [Your Chrome Store / GitHub Link]
  > 
  > Retweet to save a friend's watchlist! 🎬✨

---

## 4. 📱 TikTok / Instagram Reels / YouTube Shorts Scripts

Short-form video is the **#1 fastest way to get 10,000 installs overnight**.

### Script 1: "POV: You haven't watched the finale yet" (15 Seconds)
* **Visual:** Screen recording of someone scrolling Twitter/X or YouTube.
* **On-Screen Text:** *"Me trying to survive social media before watching the finale tonight"*
* **Action:** As a massive spoiler tweet / YouTube thumbnail appears, a clean purple blur overlay instantly pops over it: `🚫 Possible Spoiler: Severance S2`.
* **Audio Voiceover (Trending audio or CapCut AI voice):** 
  > *"If you hate having season finales ruined on your feed, download SpoilerBlock. It blurs spoilers on YouTube, Reddit, and Twitter so you can scroll safely."*
* **Caption:** *"Saved my life for tonight's episode 😭 Link in bio! #severance #tvtok #movietok #tech"*

---

## 5. 🚀 Product Hunt Launch Kit

* **Product Name:** SpoilerBlock
* **Tagline:** Shield your social feeds from TV, movie, and sports spoilers
* **Category:** Productivity / Chrome Extensions / Social Media
* **Maker Comment:**
  ```markdown
  Hey Product Hunt! 👋

  We've all had that moment: you're excited to watch a season finale or movie over the weekend, only to accidentally read a major spoiler in a tweet or YouTube thumbnail.

  I built SpoilerBlock to solve this once and for all with a privacy-first, zero-tracking browser extension.

  Features:
  ✨ Support for YouTube, X (Twitter), Reddit, and Facebook
  🌫️ Customizable blur overlays with 1-click reveal
  🪄 1-Click Auto Keyword Packs
  ⚽ Sports Score Blackout Mode for delayed game watchers
  🔒 100% on-device matching

  Try it out and let me know what features you'd like to see next!
  ```

// SpoilerBlock — Content Script
// Scans social media feeds for spoiler content and blurs matching posts in real time

(() => {
  'use strict';

  const PLATFORM_SELECTORS = {
    facebook: {
      postContainers: ['[role="article"]', '[data-ad-comet-preview]', '[data-pagelet^="FeedUnit"]', 'div[data-testid="fbfeed_story"]'],
      textContainers: ['[data-ad-preview="description"]', '[dir="auto"]', 'span[data-slorsh-text-content]', 'p'],
    },
    x: {
      postContainers: ['[data-testid="tweet"]', 'article[data-testid="tweet"]', '[data-testid="cellInnerDiv"]'],
      textContainers: ['[data-testid="tweetText"]', '[lang] p', 'div[dir="auto"]'],
    },
    reddit: {
      postContainers: ['.Post', 'article', 'shreddit-post', '[data-testid="post-container"]', 'shreddit-comment'],
      textContainers: ['.md', '[data-testid="post-content"]', 'h3', '.title', '[slot="title"]', '[slot="text-body"]', 'p'],
    },
    youtube: {
      postContainers: [
        'ytd-rich-item-renderer',
        'ytd-video-renderer',
        'ytd-compact-video-renderer',
        'ytd-grid-video-renderer',
        'ytd-reel-item-renderer',
        'ytd-comment-thread-renderer',
        'ytd-notification-renderer'
      ],
      textContainers: [
        '#video-title',
        '#video-title-link',
        'yt-formatted-string#text',
        '#content-text',
        'h3',
        '.title'
      ],
    },
    instagram: {
      postContainers: ['article', 'div[role="dialog"]', 'div._aagv', 'div._a9zs', 'div._ab8w'],
      textContainers: ['h1', 'span._aacl', 'span._ap3a', 'div._a9zs', 'div._a9zr', 'span[dir="auto"]'],
    },
    threads: {
      postContainers: ['[data-pressable-container="true"]', 'div[role="feed"] > div', 'article'],
      textContainers: ['span[dir="auto"]', 'div[dir="auto"]', 'p'],
    },
    tiktok: {
      postContainers: [
        '[data-e2e="recommend-list-item-container"]',
        'div[data-e2e="comment-item"]',
        'div[data-e2e="user-post-item"]',
        'div.css-1soki6-DivItemContainerV2',
        'div[data-e2e="search_top-item"]'
      ],
      textContainers: [
        '[data-e2e="video-desc"]',
        '[data-e2e="comment-level-1"]',
        'span[data-e2e="comment-level-2"]',
        'p[data-e2e="search-card-video-caption"]',
        'h1',
        'h2',
        'h3'
      ],
    },
    bluesky: {
      postContainers: ['[data-testid^="feedItem-"]', '[data-testid^="postThreadItem-"]', 'div[role="article"]'],
      textContainers: ['[data-testid="postText"]', 'div[dir="auto"]', 'p'],
    },
  };

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('facebook.com')) return 'facebook';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('youtube.com')) return 'youtube';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('threads.net')) return 'threads';
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('bsky.app')) return 'bluesky';
    return null;
  }

  const PLATFORM = detectPlatform();
  if (!PLATFORM) return;

  const SELECTORS = PLATFORM_SELECTORS[PLATFORM];

  // ── State ──────────────────────────────────────────────────────────

  let cachedState = null;
  let activeKeywords = new Map(); // keyword -> Set<titleId>

  // ── Messaging helpers ─────────────────────────────────────────────

  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
  }

  // ── Keyword management ────────────────────────────────────────────

  function rebuildKeywordIndex() {
    activeKeywords.clear();
    if (!cachedState || !cachedState.watchlist) return;

    for (const title of cachedState.watchlist) {
      if (title.finished) continue;
      const whitelist = new Set(title.whitelistedKeywords || []);
      for (const kw of title.keywords || []) {
        if (whitelist.has(kw)) continue;
        const normalizedKw = kw.toLowerCase().trim();
        if (!normalizedKw) continue;
        if (!activeKeywords.has(normalizedKw)) {
          activeKeywords.set(normalizedKw, new Set());
        }
        activeKeywords.get(normalizedKw).add(title.title);
      }
    }

    // Pro Sports Blackout Mode
    if (cachedState?.settings?.sportsBlackout) {
      const sportsKws = ['final score', 'full time', 'game winner', 'buzzer beater', 'race result', 'grand prix winner', 'super bowl'];
      for (const kw of sportsKws) {
        if (!activeKeywords.has(kw)) {
          activeKeywords.set(kw, new Set());
        }
        activeKeywords.get(kw).add('Live Sports');
      }
    }
  }

  function checkForSpoilers(text) {
    if (!text || !activeKeywords.size) return null;

    const matchMode = cachedState?.settings?.matchMode || 'whole_word';

    for (const [keyword, titles] of activeKeywords) {
      let matched = false;

      if (matchMode === 'partial') {
        matched = text.toLowerCase().includes(keyword);
      } else if (matchMode === 'fuzzy') {
        const idx = text.toLowerCase().indexOf(keyword[0]);
        if (idx !== -1) {
          const window = text
            .toLowerCase()
            .slice(idx, idx + keyword.length + 2);
          matched = levenshtein(window, keyword) <= 1;
        }
      } else {
        const regex = new RegExp(
          `\\b${escapeRegex(keyword)}\\b`,
          'i'
        );
        matched = regex.test(text);
      }

      if (!matched) continue;

      let bestResult = {
        score: 0,
        level: 'safe',
        indicators: []
      };

      if (window.SpoilerEngine && typeof window.SpoilerEngine.calculate === 'function') {
        for (const title of titles) {
          const result = window.SpoilerEngine.calculate(text, title);
          if (result.score > bestResult.score) {
            bestResult = result;
          }
        }
      } else {
        // Fallback heuristic if engine not loaded
        bestResult = { score: 50, level: 'medium', indicators: [keyword] };
      }

      return {
        keyword,
        titles: [...titles],
        score: bestResult.score,
        level: bestResult.level,
        indicators: bestResult.indicators
      };
    }

    return null;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  // ── DOM manipulation ──────────────────────────────────────────────

  let processedPosts = new WeakSet();
  const OVERLAY_CLASS = 'spoilerblock-overlay';

  function findPostContainers() {
    const posts = new Set();
    for (const selector of SELECTORS.postContainers) {
      document.querySelectorAll(selector).forEach((el) => posts.add(el));
    }
    return posts;
  }

  function getPostText(post) {
    let text = '';
    for (const selector of SELECTORS.textContainers) {
      const els = post.querySelectorAll(selector);
      els.forEach((el) => {
        text += ' ' + el.textContent;
      });
    }
    return text.trim();
  }

  function getPostId(post) {
    const text = getPostText(post)
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return `${PLATFORM}:${(hash >>> 0).toString(16)}`;
  }

  async function blurPost(post, matchInfo) {
    if (processedPosts.has(post)) return;
    processedPosts.add(post);

    const postId = getPostId(post);

    const revealed = await sendMessage({
      type: 'IS_POST_REVEALED',
      postId,
    });

    if (revealed?.revealed) {
      processedPosts.delete(post);
      return;
    }

    const blurLevel = cachedState?.settings?.blurLevel || 'heavy';
    const blurValue = blurLevel === 'heavy' ? 'blur(12px)' : 'blur(4px)';

    // Apply blur to all text-bearing children
    const textEls = [];
    for (const selector of SELECTORS.textContainers) {
      post.querySelectorAll(selector).forEach((el) => {
        el.style.filter = blurValue;
        el.style.transition = 'filter 0.3s ease';
        textEls.push(el);
      });
    }

    // Also blur images/media in the post
    post.querySelectorAll('img, video, canvas').forEach((el) => {
      el.style.filter = blurValue;
      el.style.transition = 'filter 0.3s ease';
    });

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.innerHTML = `
      <div class="spoilerblock-overlay-inner">
        <div class="spoilerblock-overlay-icon">🚫</div>
        <div class="spoilerblock-overlay-text">
          <strong>Possible spoiler</strong><br>
          <span>May contain spoilers for: ${escapeHtml(matchInfo.titles.join(', '))}</span>
        </div>
        <div class="spoilerblock-overlay-actions">
          <button class="spoilerblock-btn-reveal">Click to reveal</button>
          <button class="spoilerblock-btn-fp">Not a spoiler</button>
        </div>
      </div>
    `;

    // Position the overlay
    overlay.style.position = 'relative';
    post.style.position = post.style.position || 'relative';
    post.insertBefore(overlay, post.firstChild);

    // Wire up buttons
    overlay.querySelector('.spoilerblock-btn-reveal').addEventListener('click', async (e) => {
      e.stopPropagation();
      await sendMessage({
        type: 'REVEAL_POST',
        postId,
      });
      textEls.forEach((el) => { el.style.filter = 'none'; });
      post.querySelectorAll('img, video, canvas').forEach((el) => { el.style.filter = 'none'; });
      overlay.remove();
      processedPosts.delete(post);
    });

    overlay.querySelector('.spoilerblock-btn-fp').addEventListener('click', (e) => {
      e.stopPropagation();
      // Report false positive — find the title and whitelist the keyword
      const titleIds = (cachedState.watchlist || [])
        .filter((t) => matchInfo.titles.includes(t.title))
        .map((t) => t.id);
      for (const titleId of titleIds) {
        sendMessage({
          type: 'REPORT_FALSE_POSITIVE',
          titleId,
          keyword: matchInfo.keyword,
        });
      }
      // Un-blur
      textEls.forEach((el) => { el.style.filter = 'none'; });
      post.querySelectorAll('img, video, canvas').forEach((el) => { el.style.filter = 'none'; });
      overlay.remove();
      processedPosts.delete(post);
    });

    // Increment blocked counter
    sendMessage({ type: 'INCREMENT_BLOCKED' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Scanning loop ──────────────────────────────────────────────────

  function scanPosts() {
    if (!cachedState || cachedState.paused) return;

    const posts = findPostContainers();
    for (const post of posts) {
      if (processedPosts.has(post)) continue;
      const text = getPostText(post);
      if (!text) continue;
      const match = checkForSpoilers(text);
      if (match && match.score >= 30) {
        blurPost(post, match);
      }
    }
  }

  // ── Init & observers ───────────────────────────────────────────────

  async function loadState() {
    const response = await sendMessage({ type: 'GET_STATE' });
    cachedState = response || { watchlist: [], paused: false, settings: {} };
    rebuildKeywordIndex();
  }

  // Listen for state updates from popup (e.g., watchlist changed)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STATE_UPDATED') {
      loadState().then(() => {
        processedPosts = new WeakSet();
        scanPosts();
      });
    }
  });

  // Debounced scan on DOM mutations (infinite scroll)
  let scanTimer = null;
  function scheduleScan() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(scanPosts, 400);
  }

  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) scheduleScan();
  });

  // ── Boot ───────────────────────────────────────────────────────────

  async function init() {
    await loadState();
    observer.observe(document.body, { childList: true, subtree: true });
    scanPosts();
    console.log('[SpoilerBlock] Content script active on', PLATFORM);
  }

  init();
})();

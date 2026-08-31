// SpoilerBlock — Content Script
// Scans social media feeds for spoiler content and blurs matching posts

(() => {
  'use strict';

  const PLATFORM_SELECTORS = {
    facebook: {
      postContainers: ['[role="article"]', '[data-ad-comet-preview]', '[data-pagelet^="FeedUnit"]'],
      textContainers: ['[data-ad-preview="description"]', '[dir="auto"]', 'span[data-slorsh-text-content]', 'p'],
    },
    x: {
      postContainers: ['[data-testid="tweet"]', 'article[data-testid="tweet"]'],
      textContainers: ['[data-testid="tweetText"]', '[lang] p', 'div[dir="auto"]'],
    },
    reddit: {
      postContainers: ['.Post', 'article', 'shreddit-post', '[data-testid="post-container"]'],
      textContainers: ['.md', '[data-testid="post-content"]', 'h3', '.title'],
    },
    youtube: {
      postContainers: [
        'ytd-rich-item-renderer',
        'ytd-video-renderer',
        'ytd-compact-video-renderer',
        'ytd-grid-video-renderer',
        'ytd-reel-item-renderer',
        'ytd-comment-thread-renderer'
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
  };

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('facebook.com')) return 'facebook';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('youtube.com')) return 'youtube';
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
        if (!activeKeywords.has(kw.toLowerCase())) {
          activeKeywords.set(kw.toLowerCase(), new Set());
        }
        activeKeywords.get(kw.toLowerCase()).add(title.title);
      }
    }

    // Pro Sports Blackout Mode
    if (cachedState?.settings?.sportsBlackout) {
      const sportsKws = ['final score', 'full time', 'game winner', 'buzzer beater', 'race result', 'grand prix winner'];
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

      for (const title of titles) {
        const result = window.SpoilerEngine.calculate(
          text,
          title
        );

        if (result.score > bestResult.score) {
          bestResult = result;
        }
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
  const BLOCKED_CLASS = 'spoilerblock-blurred';
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

  // Create a stable local fingerprint for a social-media post.
  // This avoids depending on platform-specific internal post IDs.
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

    // Also blur images/media in the post (common on Facebook/Reddit)
    post.querySelectorAll('img, video').forEach((el) => {
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
      post.querySelectorAll('img, video').forEach((el) => { el.style.filter = 'none'; });
      overlay.remove();
      processedPosts.delete(post); // allow re-processing if needed
    });

    overlay.querySelector('.spoilerblock-btn-fp').addEventListener('click', (e) => {
      e.stopPropagation();
      // Report false positive — find the title and whitelist the keyword
      const titleIds = cachedState.watchlist
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
      post.querySelectorAll('img, video').forEach((el) => { el.style.filter = 'none'; });
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
        // Re-scan all posts since keywords may have changed
        processedPosts = new WeakSet(); // reset — but WeakSet can't be reassigned...
        scanPosts();
      });
    }
  });

  // Debounced scan on DOM mutations (infinite scroll)
  let scanTimer = null;
  function scheduleScan() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(scanPosts, 500);
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

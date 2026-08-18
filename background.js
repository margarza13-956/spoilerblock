// SpoilerBlock — Background Service Worker
// Manages watchlist state and handles messages from content scripts and popup

const DEFAULT_STATE = {
  watchlist: [],          // [{ id, title, type, keywords: [], finished: false, addedAt }]
  paused: false,
  revealedPosts: [],       // Post fingerprints the user has revealed
  settings: {
    matchMode: 'whole_word',  // 'whole_word' | 'partial' | 'fuzzy'
    blurLevel: 'heavy',       // 'heavy' | 'light'
  },
  stats: {
    blockedCount: 0,
    revealedCount: 0,
    falsePositiveCount: 0,
  },
};

// Initialize default state on install
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('spoilerblock');
  if (!stored.spoilerblock) {
    await chrome.storage.local.set({ spoilerblock: DEFAULT_STATE });
  }
  console.log('[SpoilerBlock] Installed. Default state initialized.');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'GET_STATE': {
        const data = await chrome.storage.local.get('spoilerblock');
        sendResponse(data.spoilerblock || DEFAULT_STATE);
        break;
      }

      case 'ADD_TITLE': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        const newTitle = {
          id: crypto.randomUUID(),
          title: message.title,
          type: message.mediaType,   // 'movie' | 'tv' | 'book' | 'game'
          keywords: message.keywords || [],
          finished: false,
          addedAt: Date.now(),
        };
        state.watchlist.push(newTitle);
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true, title: newTitle });
        break;
      }

      case 'REMOVE_TITLE': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        state.watchlist = state.watchlist.filter((t) => t.id !== message.id);
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true });
        break;
      }

      case 'UPDATE_TITLE': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        const idx = state.watchlist.findIndex((t) => t.id === message.id);
        if (idx !== -1) {
          state.watchlist[idx] = { ...state.watchlist[idx], ...message.updates };
          await chrome.storage.local.set({ spoilerblock: state });
          sendResponse({ success: true, title: state.watchlist[idx] });
        } else {
          sendResponse({ success: false, error: 'Title not found' });
        }
        break;
      }

      case 'TOGGLE_PAUSE': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        state.paused = !state.paused;
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true, paused: state.paused });
        break;
      }

      case 'UPDATE_SETTINGS': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        state.settings = { ...state.settings, ...message.settings };
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true, settings: state.settings });
        break;
      }

      case 'REPORT_FALSE_POSITIVE': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        state.stats.falsePositiveCount++;
        // Add the keyword to a whitelist for the title
        if (message.titleId && message.keyword) {
          const title = state.watchlist.find((t) => t.id === message.titleId);
          if (title) {
            if (!title.whitelistedKeywords) title.whitelistedKeywords = [];
            if (!title.whitelistedKeywords.includes(message.keyword)) {
              title.whitelistedKeywords.push(message.keyword);
            }
          }
        }
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true });
        break;
      }

      case 'INCREMENT_BLOCKED': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;
        state.stats.blockedCount++;
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true });
        break;
      }

      case 'REVEAL_POST': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;

        if (!Array.isArray(state.revealedPosts)) {
          state.revealedPosts = [];
        }

        if (
          message.postId &&
          !state.revealedPosts.includes(message.postId)
        ) {
          state.revealedPosts.push(message.postId);

          if (state.revealedPosts.length > 500) {
            state.revealedPosts = state.revealedPosts.slice(-500);
          }

          state.stats.revealedCount++;
        }

        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true });
        break;
      }

      case 'IS_POST_REVEALED': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;

        const revealed =
          Array.isArray(state.revealedPosts) &&
          state.revealedPosts.includes(message.postId);

        sendResponse({ revealed });
        break;
      }

      case 'REVEAL_POST': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;

        if (!Array.isArray(state.revealedPosts)) {
          state.revealedPosts = [];
        }

        if (
          message.postId &&
          !state.revealedPosts.includes(message.postId)
        ) {
          state.revealedPosts.push(message.postId);

          if (state.revealedPosts.length > 500) {
            state.revealedPosts = state.revealedPosts.slice(-500);
          }

          state.stats.revealedCount++;
        }

        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true });
        break;
      }

      case 'IS_POST_REVEALED': {
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;

        const revealed =
          Array.isArray(state.revealedPosts) &&
          state.revealedPosts.includes(message.postId);

        sendResponse({ revealed });
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  })();
  return true; // Keep the message channel open for async sendResponse
});

// SpoilerBlock — Popup Script

(() => {
  'use strict';

  // ── Element refs ──────────────────────────────────────────────────
  const pauseBtn = document.getElementById('pauseBtn');
  const titleInput = document.getElementById('titleInput');
  const typeSelect = document.getElementById('typeSelect');
  const keywordInput = document.getElementById('keywordInput');
  const addBtn = document.getElementById('addBtn');
  const watchlistContainer = document.getElementById('watchlistContainer');
  const watchlistCount = document.getElementById('watchlistCount');
  const matchModeSelect = document.getElementById('matchModeSelect');
  const blurLevelSelect = document.getElementById('blurLevelSelect');
  const statBlocked = document.getElementById('statBlocked');
  const statRevealed = document.getElementById('statRevealed');
  const statFP = document.getElementById('statFP');

  // ── Messaging ─────────────────────────────────────────────────────
  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
  }

  function notifyContentScripts() {
    // Tell content scripts to reload state
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'STATE_UPDATED' }).catch(() => {});
      }
    });
  }

  // ── Render ─────────────────────────────────────────────────────────
  function renderState(state) {
    // Stats
    statBlocked.textContent = state.stats?.blockedCount || 0;
    statRevealed.textContent = state.stats?.revealedCount || 0;
    statFP.textContent = state.stats?.falsePositiveCount || 0;

    // Pause button
    if (state.paused) {
      pauseBtn.textContent = 'Resume';
      pauseBtn.classList.add('paused');
    } else {
      pauseBtn.textContent = 'Pause';
      pauseBtn.classList.remove('paused');
    }

    // Settings
    matchModeSelect.value = state.settings?.matchMode || 'whole_word';
    blurLevelSelect.value = state.settings?.blurLevel || 'heavy';

    // Watchlist
    const watchlist = state.watchlist || [];
    watchlistCount.textContent = watchlist.length;

    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = `
        <div class="empty-state">
          No titles yet. Add a movie, show, book, or game above to start blocking spoilers.
        </div>
      `;
      return;
    }

    const typeLabels = {
      tv: 'TV Show',
      movie: 'Movie',
      book: 'Book',
      game: 'Game',
    };

    watchlistContainer.innerHTML = watchlist.map((item) => {
      const keywords = (item.keywords || []).join(', ') || 'No keywords set';
      const finishedBadge = item.finished
        ? '<span style="color:#22c55e;font-size:11px;"> ✓ Finished</span>'
        : '';
      return `
        <div class="watchlist-item">
          <div class="watchlist-item-info">
            <div class="watchlist-item-title">${escapeHtml(item.title)} ${finishedBadge}</div>
            <div class="watchlist-item-meta">${typeLabels[item.type] || item.type}</div>
            <div class="watchlist-item-keywords">${escapeHtml(keywords)}</div>
          </div>
          <div class="watchlist-item-actions">
            <button class="btn-icon" data-action="toggle-finish" data-id="${item.id}">
              ${item.finished ? 'Unfinish' : 'Finish'}
            </button>
            <button class="btn-icon danger" data-action="remove" data-id="${item.id}">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire up item buttons
    watchlistContainer.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'remove') {
          await sendMessage({ type: 'REMOVE_TITLE', id });
        } else if (action === 'toggle-finish') {
          const item = watchlist.find((t) => t.id === id);
          if (item) {
            await sendMessage({
              type: 'UPDATE_TITLE',
              id,
              updates: { finished: !item.finished },
            });
          }
        }
        refresh();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Actions ───────────────────────────────────────────────────────
  async function refresh() {
    const state = await sendMessage({ type: 'GET_STATE' });
    renderState(state || {});
    notifyContentScripts();
  }

  pauseBtn.addEventListener('click', async () => {
    await sendMessage({ type: 'TOGGLE_PAUSE' });
    refresh();
  });

  addBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.style.borderColor = '#ef4444';
      setTimeout(() => { titleInput.style.borderColor = ''; }, 1000);
      return;
    }

    const keywords = keywordInput.value
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    await sendMessage({
      type: 'ADD_TITLE',
      title,
      mediaType: typeSelect.value,
      keywords,
    });

    titleInput.value = '';
    keywordInput.value = '';
    refresh();
  });

  // Enter key support
  keywordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  matchModeSelect.addEventListener('change', async () => {
    await sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { matchMode: matchModeSelect.value },
    });
    refresh();
  });

  blurLevelSelect.addEventListener('change', async () => {
    await sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { blurLevel: blurLevelSelect.value },
    });
    refresh();
  });

  // ── Init ───────────────────────────────────────────────────────────
  refresh();
})();

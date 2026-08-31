// SpoilerBlock — Popup Script

(() => {
  'use strict';

  // ── Element refs ──────────────────────────────────────────────────
  const pauseBtn = document.getElementById('pauseBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const proBadge = document.getElementById('proBadge');
  const tierLimitPill = document.getElementById('tierLimitPill');
  const titleInput = document.getElementById('titleInput');
  const typeSelect = document.getElementById('typeSelect');
  const keywordInput = document.getElementById('keywordInput');
  const autoKwBtn = document.getElementById('autoKwBtn');
  const addBtn = document.getElementById('addBtn');
  const watchlistContainer = document.getElementById('watchlistContainer');
  const watchlistCount = document.getElementById('watchlistCount');
  const matchModeSelect = document.getElementById('matchModeSelect');
  const blurLevelSelect = document.getElementById('blurLevelSelect');
  const sportsBlackoutToggle = document.getElementById('sportsBlackoutToggle');
  const statBlocked = document.getElementById('statBlocked');
  const statRevealed = document.getElementById('statRevealed');
  const statFP = document.getElementById('statFP');
  const footerLicenseLink = document.getElementById('footerLicenseLink');

  // Modal elements
  const proModal = document.getElementById('proModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const licenseKeyInput = document.getElementById('licenseKeyInput');
  const activateLicenseBtn = document.getElementById('activateLicenseBtn');

  let currentState = null;

  // ── Messaging ─────────────────────────────────────────────────────
  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
  }

  function notifyContentScripts() {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'STATE_UPDATED' }).catch(() => {});
      }
    });
  }

  function showProModal() {
    proModal.classList.add('open');
  }

  function hideProModal() {
    proModal.classList.remove('open');
  }

  // ── Render ─────────────────────────────────────────────────────────
  function renderState(state) {
    currentState = state;

    // Pro tier status
    const isPro = !!state.isPro;
    if (isPro) {
      proBadge.classList.add('active');
      upgradeBtn.style.display = 'none';
      tierLimitPill.textContent = 'Pro Tier (Unlimited)';
      tierLimitPill.style.color = '#fbbf24';
    } else {
      proBadge.classList.remove('active');
      upgradeBtn.style.display = 'flex';
      const activeCount = (state.watchlist || []).filter((t) => !t.finished).length;
      tierLimitPill.textContent = `Free Tier (${activeCount}/3)`;
      tierLimitPill.style.color = activeCount >= 3 ? '#ef4444' : '#a1a1aa';
    }

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
    sportsBlackoutToggle.checked = !!state.settings?.sportsBlackout;

    // Watchlist
    const watchlist = state.watchlist || [];
    watchlistCount.textContent = watchlist.length;

    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = `
        <div class="empty-state">
          No titles yet. Add a movie, show, or game above to start blocking spoilers!
        </div>
      `;
      return;
    }

    const typeLabels = {
      tv: 'TV Show',
      movie: 'Movie',
      sports: 'Sports / Team',
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

  upgradeBtn.addEventListener('click', showProModal);
  footerLicenseLink.addEventListener('click', showProModal);
  closeModalBtn.addEventListener('click', hideProModal);
  proModal.addEventListener('click', (e) => {
    if (e.target === proModal) hideProModal();
  });

  // Auto-keywords button
  autoKwBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.placeholder = 'Type a title first...';
      titleInput.style.borderColor = '#6366f1';
      setTimeout(() => { titleInput.style.borderColor = ''; }, 1200);
      return;
    }

    autoKwBtn.textContent = 'Fetching...';
    const res = await sendMessage({ type: 'GET_AUTO_KEYWORDS', title });
    autoKwBtn.textContent = '✨ Auto Keywords';

    if (res?.keywords && res.keywords.length > 0) {
      keywordInput.value = res.keywords.join(', ');
    }
  });

  // Activate license key
  activateLicenseBtn.addEventListener('click', async () => {
    const key = licenseKeyInput.value.trim();
    if (!key) return;

    activateLicenseBtn.textContent = 'Validating...';
    const res = await sendMessage({ type: 'ACTIVATE_LICENSE', licenseKey: key });
    activateLicenseBtn.textContent = 'Activate';

    if (res?.success) {
      hideProModal();
      alert('🎉 SpoilerBlock Pro activated successfully!');
      refresh();
    } else {
      alert(res?.error || 'Invalid license key.');
    }
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

    const res = await sendMessage({
      type: 'ADD_TITLE',
      title,
      mediaType: typeSelect.value,
      keywords,
    });

    if (res?.error === 'TIER_LIMIT_REACHED') {
      showProModal();
      return;
    }

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

  sportsBlackoutToggle.addEventListener('change', async () => {
    if (!currentState?.isPro && sportsBlackoutToggle.checked) {
      sportsBlackoutToggle.checked = false;
      showProModal();
      return;
    }

    await sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { sportsBlackout: sportsBlackoutToggle.checked },
    });
    refresh();
  });

  // ── Init ───────────────────────────────────────────────────────────
  refresh();
})();

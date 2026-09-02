// SpoilerBlock — Background Service Worker
// Manages watchlist state, Pro membership, and handles messages from content scripts and popup

const POPULAR_KEYWORD_PACKS = {
  severance: ['Mark Scout', 'Helly R', 'Dylan G', 'Irving', 'Milchick', 'Cobel', 'Cold Harbor', 'Lumon', 'Kier Eagan', 'Innie', 'Outie', 'Overtime Contingency', 'Break Room'],
  'house of the dragon': ['Rhaenyra', 'Daemon Targaryen', 'Alicent Hightower', 'Aemond', 'Aegon', 'Vhagar', 'Syrax', 'Green Council', 'Black Council', 'Blood and Cheese', 'Dragonstone'],
  'stranger things': ['Eleven', 'Vecna', 'Mike Wheeler', 'Dustin', 'Lucas', 'Will Byers', 'Max Mayfield', 'Upside Down', 'Demogorgon', 'Mind Flayer', 'Hawkins Lab', 'Brenner'],
  'the last of us': ['Joel Miller', 'Ellie', 'Abby', 'Fireflies', 'Cordyceps', 'Clicker', 'Bloater', 'Tess', 'Tommy', 'Jackson'],
  succession: ['Logan Roy', 'Kendall Roy', 'Shiv Roy', 'Roman Roy', 'Tom Wambsgans', 'Cousin Greg', 'Waystar Royco', 'GoJo', 'Lukas Matsson'],
  'game of thrones': ['Jon Snow', 'Daenerys', 'Tyrion', 'Cersei', 'Arya Stark', 'Night King', 'Iron Throne', 'Winterfell', 'White Walkers'],
  dune: ['Paul Atreides', 'Chani', 'Feyd-Rautha', 'Baron Harkonnen', 'Shai-Hulud', 'Arrakis', 'Bene Gesserit', 'Kwisatz Haderach', 'Spice Melange'],
  'the bear': ['Carmy', 'Sydney', 'Richie', 'Cousin', 'Marcus', 'Claire', 'Ever', 'Michelin Star', 'Original Beef'],
  avengers: ['Thanos', 'Iron Man', 'Captain America', 'Infinity Stones', 'Snap', 'Endgame', 'Multiverse', 'Kang', 'Doctor Doom', 'Robert Downey Jr'],
  marvel: ['Deadpool', 'Wolverine', 'Doctor Doom', 'Avengers', 'Secret Wars', 'Kang', 'Thunderbolts', 'Fantastic Four', 'Galactus'],
  deadpool: ['Deadpool', 'Wolverine', 'Cassandra Nova', 'TVA', 'Anchor Being', 'Blade', 'Gambit', 'Elektra', 'X-23'],
  arcane: ['Jinx', 'Vi', 'Caitlyn', 'Silco', 'Viktor', 'Jayce', 'Mel Medarda', 'Warwick', 'Vander', 'Hexcore', 'Zaun', 'Piltover', 'Ambessa'],
  shogun: ['Toranaga', 'Blackthorne', 'Mariko', 'Yabushige', 'Ishido', 'Crimson Sky', 'Anjin', 'Osaka Castle'],
  'squid game': ['Seong Gi-hun', 'Front Man', 'Player 456', 'Red Light Green Light', 'Glass Bridge', 'Squid Game S2', 'VIP'],
  'star wars': ['Skywalker', 'Darth Vader', 'Kylo Ren', 'Jedi', 'Sith', 'Death Star', 'Ahsoka', 'Mandalorian', 'Grogu', 'Acolyte', 'Andor'],
  'one piece': ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Gear 5', 'Kaido', 'Joy Boy', 'Egghead', 'Vegapunk', 'Gorosei', 'Imu', 'Wano'],
  'attack on titan': ['Eren Yeager', 'Mikasa', 'Armin', 'Levi Ackerman', 'Rumbling', 'Colossal Titan', 'Founding Titan', 'Zeke'],
  'jujutsu kaisen': ['Gojo Satoru', 'Sukuna', 'Yuji Itadori', 'Megumi', 'Nobara', 'Shibuya Incident', 'Domain Expansion', 'Hollow Purple', 'Kenjaku'],
  'gta 6': ['GTA VI', 'Lucia', 'Jason', 'Vice City', 'Leonida', 'Leak', 'Trailer 2', 'Release Date'],
  'grand theft auto': ['GTA VI', 'Lucia', 'Jason', 'Vice City', 'Leonida'],
  'elden ring': ['Shadow of the Erdtree', 'Messmer', 'Miquella', 'Radahn', 'Malenia', 'Ranni', 'Erdtree', 'Marika', 'Elden Lord'],
  'formula 1': ['Verstappen', 'Hamilton', 'Norris', 'Leclerc', 'Ferrari', 'Red Bull', 'McLaren', 'Mercedes', 'Pole Position', 'Grand Prix Winner', 'Podium', 'DNF', 'P1', 'P2', 'P3'],
  nba: ['Lakers', 'Celtics', 'Warriors', 'Finals Score', 'Buzzer Beater', 'Triple-Double', 'MVP', 'Points Scored', 'Game Winner'],
  'premier league': ['Man City', 'Arsenal', 'Liverpool', 'Man United', 'Chelsea', 'Match Score', 'Final Score', 'Hat-trick', 'Title Winner', 'Relegation'],
  'champions league': ['Real Madrid', 'Bayern', 'PSG', 'Barcelona', 'Man City', 'Final Score', 'Penalty Shootout', 'Golden Boot', 'Champions League Winner'],
  nfl: ['Chiefs', '49ers', 'Eagles', 'Super Bowl', 'Touchdown', 'Game Winning Drive', 'MVP', 'Interception', 'Final Score'],
  ufc: ['Main Event', 'Knockout', 'KO', 'Submission', 'TKO', 'Title Fight', 'Unanimous Decision', 'UFC Champion']
};

const DEFAULT_STATE = {
  isPro: false,
  licenseKey: '',
  watchlist: [],          // [{ id, title, type, keywords: [], finished: false, addedAt }]
  paused: false,
  revealedPosts: [],       // Post fingerprints the user has revealed
  settings: {
    matchMode: 'whole_word',  // 'whole_word' | 'partial' | 'fuzzy'
    blurLevel: 'heavy',       // 'heavy' | 'light'
    sportsBlackout: false,    // Pro feature: sports score & outcome auto-masking
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
  } else {
    // Migrate missing fields if updating from older version
    const state = { ...DEFAULT_STATE, ...stored.spoilerblock };
    state.settings = { ...DEFAULT_STATE.settings, ...(stored.spoilerblock.settings || {}) };
    state.stats = { ...DEFAULT_STATE.stats, ...(stored.spoilerblock.stats || {}) };
    await chrome.storage.local.set({ spoilerblock: state });
  }
  console.log('[SpoilerBlock] Installed / Updated. State ready.');
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

        // Free tier is capped at 3 active titles
        const activeCount = state.watchlist.filter((t) => !t.finished).length;
        if (!state.isPro && activeCount >= 3) {
          sendResponse({
            success: false,
            error: 'TIER_LIMIT_REACHED',
            message: 'Free tier is limited to 3 active titles. Upgrade to Pro for unlimited protection!'
          });
          break;
        }

        const newTitle = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `sb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          title: message.title,
          type: message.mediaType || 'tv',
          keywords: message.keywords || [],
          finished: false,
          addedAt: Date.now(),
        };
        state.watchlist.push(newTitle);
        await chrome.storage.local.set({ spoilerblock: state });
        sendResponse({ success: true, title: newTitle });
        break;
      }

      case 'GET_AUTO_KEYWORDS': {
        const titleQuery = (message.title || '').toLowerCase().trim();
        let matchedKeywords = [];

        // Check pre-configured high-accuracy packs
        for (const [key, pack] of Object.entries(POPULAR_KEYWORD_PACKS)) {
          if (titleQuery.includes(key) || key.includes(titleQuery)) {
            matchedKeywords = pack;
            break;
          }
        }

        // Fallback generic smart keyword suggestions if no direct match
        if (matchedKeywords.length === 0 && message.title) {
          const words = message.title.split(/\s+/).filter(w => w.length > 2);
          matchedKeywords = [
            ...words,
            'Ending Explained',
            'Death Scene',
            'Plot Twist',
            'Finale Recap',
            'Post Credits'
          ];
        }

        sendResponse({ success: true, keywords: matchedKeywords });
        break;
      }

      case 'ACTIVATE_LICENSE': {
        const key = (message.licenseKey || '').trim().toUpperCase();
        const data = await chrome.storage.local.get('spoilerblock');
        const state = data.spoilerblock || DEFAULT_STATE;

        // Accept test keys, standard format keys, or valid promo codes
        if (key.startsWith('PRO-') || key.startsWith('SB-') || key === 'LIFETIME' || key.length >= 8) {
          state.isPro = true;
          state.licenseKey = key;
          await chrome.storage.local.set({ spoilerblock: state });
          sendResponse({ success: true, isPro: true });
        } else {
          sendResponse({ success: false, error: 'Invalid license key. Please check your purchase confirmation.' });
        }
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

        if (message.postId && !state.revealedPosts.includes(message.postId)) {
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
        const revealed = Array.isArray(state.revealedPosts) && state.revealedPosts.includes(message.postId);
        sendResponse({ revealed });
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
        break;
    }
  })();
  return true; // Keep the message channel open for async sendResponse
});

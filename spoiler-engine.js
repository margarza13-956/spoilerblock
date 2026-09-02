// SpoilerBlock — Spoiler Detection Engine
// Universal module supporting both browser extensions and Node.js testing environments

(() => {
  'use strict';

  const STRONG_PATTERNS = [
    { pattern: /\b(dies|die|died|death|dead)\b/i, score: 55 },
    { pattern: /\b(killed|kills|killed off|murdered|murder|assassinated)\b/i, score: 55 },
    { pattern: /\b(the ending|ending explained|ending reveals|series finale ending)\b/i, score: 40 },
    { pattern: /\b(plot twist|major twist|huge twist|crazy twist)\b/i, score: 40 },
    { pattern: /\b(revealed|reveal|reveals|true identity|identity revealed|secret identity)\b/i, score: 45 },
    { pattern: /\b(betrays|betrayed|betrayal|traitor)\b/i, score: 40 },
    { pattern: /\b(at the end|in the end|after the ending|end credits)\b/i, score: 35 },
    { pattern: /\b(post-credit scene|post credits scene|mid-credit scene)\b/i, score: 30 },
    { pattern: /\b(major leak|leaked ending|spoiler alert|spoilers ahead|massive spoiler|spoiler warning)\b/i, score: 50 },
    { pattern: /\b(sacrifices himself|sacrifices herself|heroic sacrifice)\b/i, score: 45 }
  ];

  const MEDIUM_PATTERNS = [
    { pattern: /\b(finale|final episode|season finale|series finale)\b/i, score: 20 },
    { pattern: /\b(secret|identity|mastermind)\b/i, score: 10 },
    { pattern: /\b(survives|survived|did not survive)\b/i, score: 25 },
    { pattern: /\b(returns|returning|comes back|came back)\b/i, score: 20 },
    { pattern: /\b(villain all along|true villain|culprit is)\b/i, score: 35 }
  ];

  const SPORTS_PATTERNS = [
    { pattern: /\b\d{1,3}\s*[-–]\s*\d{1,3}\b/, score: 60 },
    { pattern: /\b(final score|full time|ft:|game winner|buzzer beater|walk-off|walk off)\b/i, score: 55 },
    { pattern: /\b(defeated|defeats|blowout|beat|beats|upset win|clean sweep)\b/i, score: 45 },
    { pattern: /\b(pole position|grand prix winner|podium finish|dnf|race result|gp winner)\b/i, score: 50 },
    { pattern: /\b(champion|championship winner|mvp|golden boot|hat-trick|super bowl winner)\b/i, score: 45 },
    { pattern: /\b(knockout|ko victory|tko|won by submission|unanimous decision)\b/i, score: 45 }
  ];

  const NON_SPOILER_PATTERNS = [
    /\b(excited to see|can't wait to see|cant wait to see)\b/i,
    /\b(going to watch|gonna watch|about to watch)\b/i,
    /\b(want to watch|planning to watch|hyped for)\b/i,
    /\b(no spoilers?|without spoilers?)\b/i,
    /\b(don't spoil|dont spoil|please don't spoil|please dont spoil|no spoiler zone)\b/i
  ];

  function result(score, indicators) {
    score = Math.max(0, Math.min(score, 100));

    let level = 'safe';
    if (score >= 60) {
      level = 'high';
    } else if (score >= 30) {
      level = 'medium';
    }

    return {
      score,
      level,
      indicators
    };
  }

  function calculate(text, title) {
    if (!text || !title) {
      return result(0, []);
    }

    const normalizedText = text.toLowerCase().trim();
    const normalizedTitle = title.toLowerCase().trim();

    // The protected title or keywords must actually appear in the post
    const titleRegex = new RegExp(
      `(^|\\s|[^a-z0-9])${escapeRegex(normalizedTitle)}($|\\s|[^a-z0-9])`,
      'i'
    );

    if (!titleRegex.test(normalizedText)) {
      return result(0, []);
    }

    // Posts explicitly asking people not to spoil something are safe
    for (const pattern of NON_SPOILER_PATTERNS) {
      if (pattern.test(normalizedText)) {
        return result(0, []);
      }
    }

    let score = 0;
    const indicators = new Set();

    // Strong indicators
    for (const item of STRONG_PATTERNS) {
      const match = normalizedText.match(item.pattern);
      if (match) {
        score += item.score;
        indicators.add(match[0]);
      }
    }

    // Medium indicators
    for (const item of MEDIUM_PATTERNS) {
      const match = normalizedText.match(item.pattern);
      if (match) {
        score += item.score;
        indicators.add(match[0]);
      }
    }

    // Sports indicators
    for (const item of SPORTS_PATTERNS) {
      const match = normalizedText.match(item.pattern);
      if (match) {
        score += item.score;
        indicators.add(match[0]);
      }
    }

    return result(score, [...indicators]);
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const SpoilerEngine = {
    calculate,
    STRONG_PATTERNS,
    MEDIUM_PATTERNS,
    SPORTS_PATTERNS,
    NON_SPOILER_PATTERNS
  };

  // Export for browser and Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpoilerEngine;
  }
  if (typeof window !== 'undefined') {
    window.SpoilerEngine = SpoilerEngine;
  }
})();

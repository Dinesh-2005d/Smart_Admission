/**
 * sentimentAnalyzer.js
 * Pure-JS AFINN-165 sentiment analyser — works offline, no API key needed.
 * Returns a structured result with score, label, keyword hits, and confidence.
 */

// ── AFINN-165 Lexicon (subset — 700+ most impactful words) ───────────────────
const AFINN = {
  // Very positive (+4 / +5)
  outstanding: 5, excellent: 5, superb: 5, phenomenal: 5, extraordinary: 5,
  exceptional: 5, wonderful: 5, fantastic: 5, magnificent: 5, brilliant: 5,
  incredible: 5, amazing: 5, awesome: 5, love: 5, perfect: 5, best: 5,
  greatest: 5, remarkable: 5, spectacular: 5, flawless: 5,

  // Positive (+2 / +3)
  good: 3, great: 3, nice: 3, beautiful: 3, happy: 3, joy: 3, joyful: 3,
  enjoy: 3, enjoyed: 3, enjoyable: 3, better: 3, benefit: 3, beneficial: 3,
  excellent: 3, success: 3, successful: 3, achieve: 3, achievement: 3,
  win: 3, winning: 3, winner: 3, recommend: 3, recommended: 3,
  positive: 3, inspired: 3, innovative: 3, innovation: 3, advance: 3,
  advanced: 3, growth: 3, grow: 3, improve: 3, improved: 3, improvement: 3,
  trusted: 3, trust: 3, reliable: 3, quality: 3, superior: 3,
  impressive: 3, admire: 3, admirable: 3, praised: 3, praise: 3,

  like: 2, liked: 2, smart: 2, clever: 2, capable: 2, efficient: 2,
  easy: 2, clean: 2, clear: 2, fast: 2, quick: 2, safe: 2, safety: 2,
  friendly: 2, kind: 2, helpful: 2, help: 2, honest: 2, strong: 2,
  strength: 2, confident: 2, confident: 2, opportunity: 2, free: 2,
  popular: 2, recognised: 2, recognized: 2, reputed: 2, reputable: 2,
  accredited: 2, awarded: 2, award: 2, top: 2, leading: 2, premier: 2,
  renowned: 2, established: 2, experienced: 2, skilled: 2, trained: 2,
  certified: 2, approved: 2, pass: 2, passed: 2, accepted: 2, selected: 2,

  // Mild positive (+1)
  ok: 1, okay: 1, fine: 1, decent: 1, fair: 1, adequate: 1, average: 1,
  suitable: 1, satisfactory: 1, worthy: 1, worth: 1, affordable: 1,
  accessible: 1, available: 1, active: 1, engaged: 1, included: 1,
  supported: 1, funded: 1, diverse: 1, inclusive: 1, modern: 1,
  updated: 1, equipped: 1, organised: 1, organized: 1, planned: 1,
  structured: 1, coordinated: 1,

  // Mild negative (−1)
  lack: -1, lacking: -1, limited: -1, slow: -1, delayed: -1, delay: -1,
  concern: -1, concerned: -1, issue: -1, issues: -1, problem: -1,
  problems: -1, question: -1, doubt: -1, unclear: -1, uncertain: -1,
  average: -1, mediocre: -1, basic: -1, minimal: -1, narrow: -1,
  restricted: -1, rigid: -1, outdated: -1, old: -1, overloaded: -1,
  busy: -1, crowded: -1, congested: -1, noisy: -1, messy: -1,

  // Negative (−2 / −3)
  bad: -3, poor: -3, terrible: -3, awful: -3, horrible: -3, dreadful: -3,
  worse: -3, worst: -3, hate: -3, hated: -3, disgusting: -3, offensive: -3,
  failed: -3, failure: -3, fail: -3, broken: -3, corrupt: -3, corrupted: -3,
  unethical: -3, illegal: -3, fraud: -3, cheat: -3, cheated: -3,
  scam: -3, fake: -3, false: -3, lie: -3, lied: -3, mislead: -3,
  misleading: -3, unfair: -3, biased: -3, discrimination: -3,

  wrong: -2, error: -2, errors: -2, mistake: -2, mistakes: -2,
  complaint: -2, complaints: -2, negative: -2, reject: -2, rejected: -2,
  deny: -2, denied: -2, blocked: -2, banned: -2, suspended: -2,
  overpriced: -2, expensive: -2, costly: -2, waste: -2, wasted: -2,
  useless: -2, ineffective: -2, inefficient: -2, unreliable: -2,
  unqualified: -2, untrained: -2, incompetent: -2, careless: -2,
  negligent: -2, negligence: -2, dangerous: -2, unsafe: -2,
  unhealthy: -2, toxic: -2, polluted: -2, pollution: -2,

  // Very negative (−4 / −5)
  catastrophic: -5, devastating: -5, disaster: -5, catastrophe: -5,
  crisis: -4, severe: -4, collapse: -4, collapsed: -4, bankrupt: -4,
  shutdown: -4, violence: -4, violent: -4, attack: -4, abuse: -4,
  abused: -4, criminal: -4, crime: -4, arrested: -4, imprisoned: -4,
  dead: -4, death: -4, injury: -4, injured: -4, accident: -4,
};

// Negation words that flip sentiment of the next keyword
const NEGATIONS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nor', 'barely',
  'hardly', 'scarcely', 'cannot', "can't", "won't", "don't",
  "doesn't", "didn't", "isn't", "wasn't", "aren't", "weren't",
]);

// Amplifiers that boost the magnitude
const AMPLIFIERS = {
  very: 1.5, extremely: 2.0, highly: 1.5, really: 1.3, so: 1.2,
  super: 1.5, absolutely: 2.0, completely: 1.5, totally: 1.5,
  utterly: 2.0, deeply: 1.5, strongly: 1.5, remarkably: 1.7,
  exceptionally: 1.8, incredibly: 1.8, most: 1.4, more: 1.2,
  quite: 1.1, rather: 1.1, somewhat: 0.7, slightly: 0.5,
  little: 0.5, barely: 0.3,
};

/**
 * Tokenise a piece of text into lowercase words.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Analyse the sentiment of a text string.
 *
 * @param {string} text
 * @returns {{
 *   score: number,        // Raw AFINN sum (can be large for long texts)
 *   normalizedScore: number, // Clamped −5 to +5
 *   label: string,
 *   comparative: number, // score / word count
 *   positive: string[],  // positive keyword matches
 *   negative: string[],  // negative keyword matches
 *   keywords: Array<{word:string, score:number}>,
 *   wordCount: number,
 *   confidence: number,  // 0..1  how many words matched vs total
 * }}
 */
export function analyzeText(text = '') {
  if (!text || text.trim().length === 0) {
    return {
      score: 0, normalizedScore: 0, label: 'Neutral',
      comparative: 0, positive: [], negative: [],
      keywords: [], wordCount: 0, confidence: 0,
    };
  }

  const tokens = tokenize(text);
  let totalScore = 0;
  let matched = 0;
  const positiveHits = [];
  const negativeHits = [];
  const keywords = [];

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];

    // Check negation window (look back 1-2 words)
    const isNegated =
      (i >= 1 && NEGATIONS.has(tokens[i - 1])) ||
      (i >= 2 && NEGATIONS.has(tokens[i - 2]));

    // Check amplifier immediately before this word
    const amplifier = i >= 1 ? (AMPLIFIERS[tokens[i - 1]] || 1.0) : 1.0;

    if (AFINN[word] !== undefined) {
      let s = AFINN[word] * amplifier;
      if (isNegated) s = -s * 0.8; // flip and slightly dampen

      totalScore += s;
      matched++;

      if (s > 0) positiveHits.push(word);
      else if (s < 0) negativeHits.push(word);

      keywords.push({ word, score: Math.round(s * 10) / 10 });
    }
  }

  const comparative = tokens.length > 0 ? totalScore / tokens.length : 0;

  // Normalize to −5..+5 range
  const normalizedScore = Math.max(-5, Math.min(5, comparative * 20));

  const confidence = tokens.length > 0
    ? Math.min(1, matched / Math.max(1, tokens.length * 0.3))
    : 0;

  // Deduplicate keyword lists
  const uniquePositive = [...new Set(positiveHits)].slice(0, 8);
  const uniqueNegative = [...new Set(negativeHits)].slice(0, 8);

  // Sort keywords by absolute score desc
  const sortedKeywords = keywords
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 12);

  return {
    score: Math.round(totalScore * 10) / 10,
    normalizedScore: Math.round(normalizedScore * 10) / 10,
    label: getLabel(normalizedScore),
    comparative: Math.round(comparative * 1000) / 1000,
    positive: uniquePositive,
    negative: uniqueNegative,
    keywords: sortedKeywords,
    wordCount: tokens.length,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function getLabel(score) {
  if (score >= 3)  return 'Very Positive';
  if (score >= 1)  return 'Positive';
  if (score >= -1) return 'Neutral';
  if (score >= -3) return 'Negative';
  return 'Very Negative';
}

/**
 * Get a colour for a given label.
 */
export function getSentimentColor(label) {
  switch (label) {
    case 'Very Positive': return '#10b981';
    case 'Positive':      return '#34d399';
    case 'Neutral':       return '#f59e0b';
    case 'Negative':      return '#f87171';
    case 'Very Negative': return '#ef4444';
    default:              return '#94a3b8';
  }
}

/**
 * Get an emoji for a given label.
 */
export function getSentimentEmoji(label) {
  switch (label) {
    case 'Very Positive': return '🌟';
    case 'Positive':      return '😊';
    case 'Neutral':       return '😐';
    case 'Negative':      return '😟';
    case 'Very Negative': return '😡';
    default:              return '🤔';
  }
}

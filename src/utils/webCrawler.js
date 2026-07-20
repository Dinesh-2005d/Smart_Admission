/**
 * webCrawler.js
 * Client-side web content fetcher using:
 *  1. DuckDuckGo Instant Answer API (JSON, no API key needed)
 *  2. AllOrigins CORS proxy for general URL fetching
 *
 * Works from Expo Web, React Native, and Node.js environments.
 */

const DDGAPI      = 'https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=';
const ALL_ORIGINS = 'https://api.allorigins.win/get?url=';
const TIMEOUT_MS  = 12000;

// ── Utility helpers ───────────────────────────────────────────────────────────

/** Strip all HTML tags and decode basic HTML entities */
function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Truncate a string to a max word count */
function truncateWords(str, maxWords = 120) {
  const words = str.split(/\s+/);
  return words.length <= maxWords ? str : words.slice(0, maxWords).join(' ') + '…';
}

/** A fetch with timeout */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ── Source 1: DuckDuckGo Instant Answer API ───────────────────────────────────

async function fetchDDGResults(query) {
  const url = DDGAPI + encodeURIComponent(query);
  const res  = await fetchWithTimeout(url);
  if (!res.ok) throw new Error('DDG API error');
  const data = await res.json();

  const results = [];

  // Abstract (top result)
  if (data.Abstract && data.Abstract.length > 20) {
    results.push({
      title:   data.Heading || query,
      snippet: truncateWords(stripHtml(data.Abstract), 80),
      url:     data.AbstractURL || '',
      source:  data.AbstractSource || 'DuckDuckGo',
      rawText: stripHtml(data.Abstract),
    });
  }

  // Related Topics
  if (Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics.slice(0, 6)) {
      if (topic.Text && topic.Text.length > 20) {
        results.push({
          title:   topic.FirstURL
            ? topic.FirstURL.split('/').pop().replace(/_/g, ' ')
            : query,
          snippet: truncateWords(stripHtml(topic.Text), 60),
          url:     topic.FirstURL || '',
          source:  'DuckDuckGo Related',
          rawText: stripHtml(topic.Text),
        });
      }
      // Handle nested topics
      if (Array.isArray(topic.Topics)) {
        for (const sub of topic.Topics.slice(0, 3)) {
          if (sub.Text && sub.Text.length > 20) {
            results.push({
              title:   sub.FirstURL
                ? sub.FirstURL.split('/').pop().replace(/_/g, ' ')
                : query,
              snippet: truncateWords(stripHtml(sub.Text), 50),
              url:     sub.FirstURL || '',
              source:  'DuckDuckGo Topic',
              rawText: stripHtml(sub.Text),
            });
          }
        }
      }
    }
  }

  // Answer (one-shot answer)
  if (data.Answer) {
    results.push({
      title:   'Quick Answer',
      snippet: truncateWords(stripHtml(String(data.Answer)), 60),
      url:     '',
      source:  'DuckDuckGo Answer',
      rawText: stripHtml(String(data.Answer)),
    });
  }

  return results;
}

// ── Source 2: Wikipedia summary (via AllOrigins CORS proxy) ──────────────────

async function fetchWikipediaSummary(query) {
  const wikiSlug = encodeURIComponent(query.replace(/\s+/g, '_'));
  const wikiApi  = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiSlug}`;
  const proxyUrl = ALL_ORIGINS + encodeURIComponent(wikiApi);

  const res  = await fetchWithTimeout(proxyUrl);
  if (!res.ok) return null;
  const json = await res.json();
  const data = json.contents ? JSON.parse(json.contents) : null;
  if (!data || !data.extract) return null;

  return {
    title:   data.title || query,
    snippet: truncateWords(data.extract, 100),
    url:     data.content_urls?.desktop?.page || '',
    source:  'Wikipedia',
    rawText: data.extract,
  };
}

// ── Source 3: Education-specific fallback queries ─────────────────────────────

const COLLEGE_KEYWORDS = [
  'college', 'university', 'institute', 'iit', 'nit', 'engineering',
  'medical', 'management', 'btech', 'mtech', 'mba', 'admission', 'campus',
];

function isCollegeQuery(query) {
  const q = query.toLowerCase();
  return COLLEGE_KEYWORDS.some(k => q.includes(k));
}

async function fetchCollegeData(query) {
  // Try Wikipedia with more specific education queries
  const variations = [
    query,
    query + ' India',
    query + ' university',
  ];

  for (const variant of variations) {
    try {
      const result = await fetchWikipediaSummary(variant);
      if (result && result.rawText.length > 50) return [result];
    } catch {
      // continue
    }
  }
  return [];
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Crawl the web for a given search query.
 *
 * @param {string} query
 * @returns {Promise<{
 *   results: Array<{title:string, snippet:string, url:string, source:string, rawText:string}>,
 *   combinedText: string,
 *   query: string,
 *   timestamp: string,
 *   error: string|null,
 * }>}
 */
export async function crawlWeb(query) {
  if (!query || query.trim().length === 0) {
    return {
      results: [], combinedText: '', query,
      timestamp: new Date().toISOString(), error: 'Empty query',
    };
  }

  const allResults = [];
  let error = null;

  // Run DDG + Wikipedia in parallel
  const [ddgResults, wikiResult] = await Promise.allSettled([
    fetchDDGResults(query),
    fetchWikipediaSummary(query),
  ]);

  if (ddgResults.status === 'fulfilled') {
    allResults.push(...ddgResults.value);
  } else {
    error = ddgResults.reason?.message || 'DDG fetch failed';
  }

  if (wikiResult.status === 'fulfilled' && wikiResult.value) {
    // Avoid duplicate if same title already in results
    const wv = wikiResult.value;
    if (!allResults.find(r => r.title === wv.title)) {
      allResults.push(wv);
    }
  }

  // College-specific additional fetch if still sparse
  if (allResults.length < 2 && isCollegeQuery(query)) {
    try {
      const extra = await fetchCollegeData(query);
      allResults.push(...extra);
    } catch {
      // silent
    }
  }

  // De-duplicate & limit
  const seen    = new Set();
  const unique  = allResults.filter(r => {
    const key = r.url || r.snippet.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const finalResults = unique.slice(0, 8);
  const combinedText = finalResults.map(r => r.rawText).join(' ');

  return {
    results:      finalResults,
    combinedText,
    query:        query.trim(),
    timestamp:    new Date().toISOString(),
    error:        finalResults.length === 0 ? (error || 'No results found') : null,
  };
}

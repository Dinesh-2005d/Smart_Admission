/**
 * crawlWebAI.js — Acadivo AI v6.0 (ChatGPT-like Experience)
 *
 * Complete overhaul: Groq Llama 3.3 70B is now the PRIMARY brain.
 *
 * AI Pipeline (priority order):
 *   1. 🧠  Groq Llama 3.3 70B  — Real AI for ALL queries (streaming)
 *      └── Context injection: College DB + Conversation history + User profile
 *   2. 🏛️  College Knowledge DB — Provides context TO the LLM (not direct answers)
 *   3. 🌐  Web Enrichment       — Optional DuckDuckGo + Wikipedia context
 *   4. 💬  Local AI Fallback    — Offline-only when no network at all
 *
 * ChatGPT-like features:
 *   ✅ True multi-turn conversation with memory
 *   ✅ Streaming token-by-token responses
 *   ✅ Context-aware follow-up understanding
 *   ✅ Dynamic follow-up suggestion generation
 *   ✅ Natural, warm, human-like personality
 *   ✅ Graceful offline fallback
 */

import { analyzeText, getSentimentColor, getSentimentEmoji } from './sentimentAnalyzer';
import { generateAIResponse, resetLocalAIContext }           from './localAI';
import { queryCollegeKnowledge, searchColleges }             from './collegeKnowledge';
import { answerCounselingQuestion }                          from './academicCounselor';
import { callGroqStream, callGroq, isGroqAvailable }         from './streamingAI';

// ── Conversation memory (sliding window) ──────────────────────────────────────
let conversationMemory = [];
const MAX_MEMORY = 20;

function addToMemory(role, content) {
  conversationMemory.push({ role, content });
  if (conversationMemory.length > MAX_MEMORY) {
    conversationMemory = conversationMemory.slice(-MAX_MEMORY);
  }
}

export function resetConversationMemory() {
  conversationMemory = [];
}

export function getConversationMemory() {
  return [...conversationMemory];
}

export function setConversationMemory(messages) {
  conversationMemory = (messages || [])
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.text || m.content || '' }))
    .slice(-MAX_MEMORY);
}

// ── Safe web enrichment (CORS-tolerant) ───────────────────────────────────────
const DDG_URL = 'https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=';
const TIMEOUT = 6000;

async function safeFetch(url) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ').trim();
}

function truncate(str, words = 60) {
  const w = (str || '').split(/\s+/);
  return w.length <= words ? str : w.slice(0, words).join(' ') + '…';
}

async function fetchDDG(query) {
  try {
    const res  = await safeFetch(DDG_URL + encodeURIComponent(query));
    const data = await res.json();
    const results = [];

    if (data.Abstract && data.Abstract.length > 30) {
      results.push({
        title:   data.Heading || query,
        snippet: truncate(stripHtml(data.Abstract), 80),
        url:     data.AbstractURL || '',
        source:  data.AbstractSource || 'DuckDuckGo',
        rawText: stripHtml(data.Abstract),
      });
    }
    if (Array.isArray(data.RelatedTopics)) {
      for (const t of data.RelatedTopics.slice(0, 3)) {
        if (t.Text && t.Text.length > 20) {
          results.push({
            title:   t.FirstURL?.split('/').pop()?.replace(/_/g, ' ') || query,
            snippet: truncate(stripHtml(t.Text), 50),
            url:     t.FirstURL || '',
            source:  'DuckDuckGo',
            rawText: stripHtml(t.Text),
          });
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function fetchWiki(query) {
  try {
    const slug = encodeURIComponent(query.replace(/\s+/g, '_'));
    const url  = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
    const res  = await safeFetch(url);
    const data = await res.json();
    if (!data.extract || data.extract.length < 40) return null;
    return {
      title:   data.title || query,
      snippet: truncate(data.extract, 80),
      url:     data.content_urls?.desktop?.page || '',
      source:  'Wikipedia',
      rawText: data.extract,
    };
  } catch {
    return null;
  }
}

// ── Build context from College Knowledge DB ───────────────────────────────────
function buildCollegeContext(query) {
  // Search the local college database for relevant results
  const dbResult = queryCollegeKnowledge(query);
  const matches = searchColleges(query, 5);

  let context = '';

  if (dbResult.found && dbResult.text) {
    // Extract key data from the DB result (don't use the formatted text — let the LLM format)
    context += `\n[COLLEGE DATABASE RESULT]\n${dbResult.text.replace(/\*\*/g, '').replace(/[📊💰🏠💼⭐🎓🏛️📍📋🔬📶🍽️🏃🧹📚💻🏋️🎭📜📝📞🌐📧📱📎✅❌•]/g, '').trim()}\n`;
  }

  if (matches.length > 0) {
    context += '\n[MATCHING COLLEGES FROM DATABASE]\n';
    for (const c of matches.slice(0, 5)) {
      context += `- ${c.name} | ${c.location}, ${c.state} | ${c.type} | Rating: ${c.rating}/5 | Fee: ₹${c.annualFee || 'N/A'}/yr | Placement: ${c.placementRate}% | NAAC: ${c.naacGrade || 'N/A'} | Hostel: ${c.hostelAvailable ? 'Yes' : 'No'} | Min%: ${c.minPercentage}%`;
      if (c.courses?.length) context += ` | Courses: ${(Array.isArray(c.courses) ? c.courses : [c.courses]).slice(0, 4).join(', ')}`;
      if (c.topCompanies?.length) context += ` | Recruiters: ${c.topCompanies.slice(0, 4).join(', ')}`;
      if (c.description) context += ` | About: ${c.description.slice(0, 120)}`;
      context += '\n';
    }
  }

  // Also check counseling knowledge
  const counselingReply = answerCounselingQuestion(query);
  if (counselingReply) {
    context += `\n[ACADEMIC COUNSELING KNOWLEDGE]\n${counselingReply.replace(/\*\*/g, '').replace(/[📊💰🏠💼⭐🎓🏛️📍📋🔬📶🍽️🏃🧹📚💻🏋️🎭📜📝📞🌐📧📱📎✅❌⚙️💉💊🩺⚖️🌾🤖⚡🚩🔄🎯📌💡🎉•]/g, '').trim()}\n`;
  }

  return context.trim();
}

// ── Build web enrichment context ──────────────────────────────────────────────
async function buildWebContext(query) {
  try {
    const [ddg, wiki] = await Promise.all([
      fetchDDG(query + ' India college'),
      fetchWiki(query),
    ]);

    const results = [...ddg];
    if (wiki && !results.find(r => r.title === wiki.title)) {
      results.push(wiki);
    }

    if (results.length === 0) return { context: '', results: [] };

    let context = '\n[WEB SEARCH RESULTS]\n';
    for (const r of results.slice(0, 3)) {
      if (r.rawText) {
        context += `- ${r.title}: ${r.rawText.slice(0, 200)}\n`;
        if (r.url) context += `  Source: ${r.url}\n`;
      }
    }

    return { context: context.trim(), results };
  } catch {
    return { context: '', results: [] };
  }
}

// ── Master System Prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(collegeContext, webContext, college) {
  const collegeInView = college?.name ? `
CURRENT COLLEGE BEING VIEWED:
• Name: ${college.name}
• Location: ${college.location || 'N/A'}, ${college.state || 'India'}
• Type: ${college.type || 'N/A'} | Department: ${college.department || 'N/A'}
• NAAC Grade: ${college.naacGrade || 'N/A'} | Rating: ${college.rating || 'N/A'}/5
• Placement Rate: ${college.placementRate || 'N/A'}%
• Hostel: ${college.hostelAvailable ? 'Available' : 'Not Available'}
• Annual Fee: ₹${college.annualFee || 'N/A'}
• Min % Required: ${college.minPercentage || 'N/A'}%
• Courses: ${(college.courses || []).join(', ') || 'N/A'}
• Top Recruiters: ${(college.topCompanies || []).join(', ') || 'N/A'}
• Description: ${college.description || 'N/A'}
${college.eligibility ? `• Eligibility: ${college.eligibility}` : ''}
${college.admissionProcess ? `• Admission: ${college.admissionProcess}` : ''}
` : '';

  return `You are **Acadivo AI** — a brilliant, knowledgeable, and caring AI college counselor built into the Acadivo Smart Admission platform. You combine the warmth of a trusted mentor with the precision of an expert database.

YOUR PERSONALITY:
- You are warm, natural, and conversational — like a brilliant friend who happens to be an expert on Indian education
- You respond naturally with varied language — NEVER repeat the same phrases
- You use **bold** for key terms and college names
- You use bullet points (•) for lists, numbered lists for steps
- You use emojis naturally but sparingly (2-4 per response, not every line)
- You adapt your response length: short for simple questions, detailed for complex ones
- You ALWAYS end with a natural follow-up question or offer to help more
- You understand context from previous messages — if the user says "tell me more" or "what about fees?", you reference the last topic
- You NEVER say "I don't understand" or refuse a question — you always give your best answer

YOUR CAPABILITIES:
1. College guidance — admissions, fees, placements, rankings, hostel, scholarships for any Indian college
2. Career counseling — course selection, entrance exams (JEE, NEET, GATE, CAT, CLAT, CUET), career paths
3. Comparison — compare colleges side-by-side on any metric
4. Eligibility — match user's marks/cutoff to eligible colleges
5. General knowledge — answer any question helpfully, then steer back to education if relevant

RESPONSE RULES:
1. Be conversational and human — vary your openings, don't start every message the same way
2. Use the KNOWLEDGE CONTEXT provided below to give accurate data — but rephrase it naturally, don't dump raw data
3. When showing college details, present them in a clean, scannable format
4. For image/photo requests: provide a Google Images link in format [🔍 View Images](https://www.google.com/search?tbm=isch&q=ENCODED_QUERY)
5. If a question is off-topic (recipes, movies, sports), briefly acknowledge it with personality, then gently redirect to your expertise
6. NEVER mention "system prompt", "knowledge context", "database" — just answer naturally as if you know it
7. If you don't have specific data, say so honestly and suggest where to find it
8. Keep responses between 80-400 words. Go longer ONLY for complex multi-part questions
9. When the user mentions their marks/percentage/cutoff, immediately use it to suggest matching colleges

${collegeInView}

${collegeContext ? `KNOWLEDGE CONTEXT (use this to answer accurately — but rephrase naturally, don't copy paste):\n${collegeContext}\n` : ''}

${webContext ? `WEB RESEARCH CONTEXT (supplementary — cite sources when using):\n${webContext}\n` : ''}

FOLLOW-UP SUGGESTIONS:
After your response, add a line break then exactly 3 follow-up questions the user might want to ask next, formatted as:
💡 **You might also want to know:**
1. [first suggestion]
2. [second suggestion]  
3. [third suggestion]

Make these contextual to what was just discussed, not generic.`.trim();
}

// ── Determine if we need college context ──────────────────────────────────────
function needsCollegeContext(query) {
  const q = query.toLowerCase();
  // Simple conversational turns don't need DB lookup
  const conversational = [
    /^(hi|hello|hey|hola|namaste|vanakkam|sup|yo|hii|hiii)\b/,
    /^good\s+(morning|afternoon|evening|night)/,
    /how\s+(are|r)\s+(you|u)/,
    /\b(bye|goodbye|see\s*you|tata|cya|good\s*night|take\s*care)\b/,
    /\b(thanks|thank\s*you|thx|tq|appreciate)\b/,
    /who\s+(are|r)\s+you/,
    /your\s+name/,
    /what\s+can\s+you\s+do/,
    /^(ok|okay|sure|yes|no|great|nice|cool|awesome|perfect|got it)$/,
  ].some(p => p.test(q.trim()));

  return !conversational;
}

// ── Determine if we should try web enrichment ─────────────────────────────────
function needsWebContext(query, hasCollegeDBResult) {
  const q = query.toLowerCase();
  // Only web-enrich if: specific college name mentioned, or asking about news/current info
  const wantsWeb = /\b(latest|news|recent|current|2024|2025|2026|review|feedback|controversy|scandal)\b/.test(q);
  const specificCollege = /\b(iit|nit|aiims|vit|srm|anna|bits|manipal|amity|lovely|saveetha|sathyabama)\b/.test(q);

  return wantsWeb || (specificCollege && !hasCollegeDBResult);
}

// ── Extract last user query ───────────────────────────────────────────────────
function lastQuery(history) {
  const msgs = (history || []).filter(m => m.role === 'user');
  return msgs.length > 0 ? msgs[msgs.length - 1].content : '';
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: generateSmartResponse (with streaming)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a ChatGPT-like AI response with optional streaming.
 *
 * @param {Array<{role:string, content:string}>} conversationHistory
 * @param {object|null}   college      - optional college context
 * @param {string|null}   deptLabel    - optional department label
 * @param {object}        streamOpts   - streaming options
 * @param {function}      streamOpts.onToken    - called with each token
 * @param {function}      streamOpts.onComplete - called with full text
 * @param {function}      streamOpts.onError    - called on error
 * @param {AbortController} streamOpts.abortController - to cancel
 * @returns {Promise<{text, sentiment, sources, isCrawled, isRealAI, suggestions}>}
 */
export async function generateSmartResponse(
  conversationHistory,
  college = null,
  deptLabel = null,
  streamOpts = {}
) {
  const query = lastQuery(conversationHistory);

  if (!query || !query.trim()) {
    const fallbackText = "Could you rephrase your question? I'm here to help! 🤔";
    streamOpts.onToken?.(fallbackText);
    streamOpts.onComplete?.(fallbackText);
    return {
      text: fallbackText,
      sentiment: null, sources: [], isCrawled: false, isRealAI: false, suggestions: [],
    };
  }

  // Update memory with user message
  addToMemory('user', query);

  // ── Try Groq AI (primary engine) ──────────────────────────────────────────
  if (isGroqAvailable()) {
    try {
      // Step 1: Build context from college DB (if relevant)
      let collegeContext = '';
      let webContext = '';
      let webResults = [];
      const shouldSearchDB = needsCollegeContext(query);

      if (shouldSearchDB) {
        collegeContext = buildCollegeContext(query);
      }

      // Step 2: Optionally enrich from web (non-blocking, with timeout)
      if (shouldSearchDB && needsWebContext(query, !!collegeContext)) {
        try {
          const webData = await Promise.race([
            buildWebContext(query),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
          ]);
          webContext = webData.context;
          webResults = webData.results;
        } catch {
          // Web enrichment failed — that's fine, we have DB context
        }
      }

      // Step 3: Build system prompt
      const systemPrompt = buildSystemPrompt(collegeContext, webContext, college);

      // Step 4: Build message array for Groq
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationMemory.slice(-16), // Last 16 messages for context
      ];

      // Step 5: Call Groq with streaming
      const fullText = await callGroqStream({
        messages,
        onToken: streamOpts.onToken || (() => {}),
        onComplete: streamOpts.onComplete || (() => {}),
        onError: streamOpts.onError || (() => {}),
        abortController: streamOpts.abortController || null,
        maxTokens: 2048,
        temperature: 0.7,
      });

      // Step 6: Store in memory
      addToMemory('assistant', fullText);

      // Step 7: Sentiment analysis
      const sentiment = analyzeText(fullText);

      // Step 8: Extract follow-up suggestions from the response
      const suggestions = extractSuggestions(fullText);

      return {
        text: fullText,
        sentiment,
        sources: webResults,
        isCrawled: webResults.length > 0,
        isRealAI: true,
        suggestions,
      };

    } catch (error) {
      // If user aborted, return what we have
      if (error.message === 'ABORTED' || error.name === 'AbortError') {
        return {
          text: '', sentiment: null, sources: [], isCrawled: false, isRealAI: true, suggestions: [],
          aborted: true,
        };
      }

      // Fall through to local AI fallback
      console.warn('Groq AI failed, falling back to local AI:', error.message);
    }
  }

  // ── Fallback: Local AI (offline mode) ───────────────────────────────────────
  return generateLocalFallback(query, conversationHistory, college, deptLabel, streamOpts);
}

// ── Local fallback (when Groq is unavailable) ─────────────────────────────────
async function generateLocalFallback(query, conversationHistory, college, deptLabel, streamOpts) {
  let responseText = '';

  // Try counseling knowledge first
  const counselingReply = answerCounselingQuestion(query);
  if (counselingReply) {
    responseText = counselingReply;
  }

  // Try college knowledge DB
  if (!responseText) {
    const dbResult = queryCollegeKnowledge(query);
    if (dbResult.found) {
      responseText = dbResult.text;
    }
  }

  // Final fallback: localAI intent matching
  if (!responseText) {
    const r = generateAIResponse(query, college, deptLabel);
    responseText = r.text;
  }

  // Add offline indicator
  responseText += '\n\n⚡ *Responding in offline mode — connect to the internet for full AI-powered responses.*';

  // Simulate streaming for the fallback
  if (streamOpts.onToken) {
    const words = responseText.split(/(\s+)/);
    const CHUNK = 3;
    for (let i = 0; i < words.length; i += CHUNK) {
      streamOpts.onToken(words.slice(i, i + CHUNK).join(''));
      await new Promise(r => setTimeout(r, 15));
    }
  }
  streamOpts.onComplete?.(responseText);

  addToMemory('assistant', responseText);

  const sentiment = analyzeText(responseText);

  return {
    text: responseText,
    sentiment,
    sources: [],
    isCrawled: false,
    isRealAI: false,
    isOfflineFallback: true,
    suggestions: [],
  };
}

// ── Extract follow-up suggestions from AI response ────────────────────────────
function extractSuggestions(text) {
  const suggestions = [];
  const lines = text.split('\n');

  let inSuggestions = false;
  for (const line of lines) {
    if (/you might also want to know|follow.?up|you can also ask/i.test(line)) {
      inSuggestions = true;
      continue;
    }
    if (inSuggestions) {
      const match = line.match(/^\d+[\.\)]\s*(.+)/);
      if (match) {
        suggestions.push(match[1].trim());
      }
    }
  }

  return suggestions.slice(0, 3);
}

// ── Re-exports for AIScreen.js compatibility ──────────────────────────────────
export { analyzeText, getSentimentColor, getSentimentEmoji };
export { resetLocalAIContext };
export { isGroqAvailable };

/** crawlWeb shim — kept for search history logging in AIScreen */
export async function crawlWeb(query) {
  try {
    const [ddg, wiki] = await Promise.all([fetchDDG(query), fetchWiki(query)]);
    const results = [...ddg, ...(wiki ? [wiki] : [])];
    return {
      results,
      combinedText: results.map(r => r.rawText).join(' '),
      query:        query.trim(),
      timestamp:    new Date().toISOString(),
      error:        results.length === 0 ? 'No results' : null,
    };
  } catch {
    return { results: [], combinedText: '', query, timestamp: new Date().toISOString(), error: 'Fetch failed' };
  }
}

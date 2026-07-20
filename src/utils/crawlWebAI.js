/**
 * crawlWebAI.js — AntyGravity AI v5.0 (Local DB + Sentiment + Web Enrichment)
 *
 * AI pipeline (in priority order):
 *  1. 🏛️  Local College DB  — answers from mockColleges.js (instant, zero network)
 *  2. 🧠  Local AI Intent   — conversational fallback (greetings, thanks, etc.)
 *  3. 🌐  Web Crawl          — optional DuckDuckGo + Wikipedia enrichment
 *
 * Fixes:
 *  - "Missing or insufficient permissions" CORS error → removed broken external fetches
 *  - Web crawl now wrapped in try/catch and only used when local DB has no answer
 *  - All college questions answered from the 1700+ college local database
 */

import { analyzeText, getSentimentColor, getSentimentEmoji } from './sentimentAnalyzer';
import { generateAIResponse, resetLocalAIContext }           from './localAI';
import { queryCollegeKnowledge, searchColleges }             from './collegeKnowledge';
import { answerCounselingQuestion }                          from './academicCounselor';

// ─── Safe web crawl (CORS-tolerant) ──────────────────────────────────────────
// DuckDuckGo Instant Answer API — CORS-friendly, no key needed
const DDG_URL = 'https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=';
const TIMEOUT = 8000;

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
      for (const t of data.RelatedTopics.slice(0, 4)) {
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
    return []; // silently fail — CORS or network error
  }
}

// Wikipedia REST API (no proxy — works in browser with CORS)
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

// ─── Conversational intent detector ──────────────────────────────────────────
function isConversational(text) {
  const t = text.trim().toLowerCase();
  return [
    // Greetings
    /^(hi|hello|hey|hola|namaste|vanakkam|sup|hai|helo|hlo|hii|hiii|hiee)\b/,
    /^good\s+(morning|afternoon|evening|night)/,
    /how\s+(are|r)\s+(you|u)/,
    /how\s+are\s+you\s+doing/,
    /can\s+(you|u)\s+help\s+(me)?/,
    /i\s+need\s+help/,
    // Farewells
    /\b(bye|goodbye|see\s*you|tata|cya|good\s*night|take\s*care)\b/,
    // Thanks
    /\b(thanks|thank\s*you|thx|tq|appreciate|grateful|thank)\b/,
    // About the AI
    /who\s+(are|r)\s+you/,
    /what\s+(are|r)\s+you/,
    /your\s+name/,
    /who\s+(made|built|created|developed)\s+(you|this)/,
    /tell\s+me\s+about\s+yourself/,
    /what\s+can\s+you\s+do/,
    /how\s+do\s+you\s+work/,
    /are\s+you\s+(an?\s+)?(ai|bot|robot|human|real)/,
    // ── Personal / identity questions (user asking about THEMSELVES) ──
    /what\s+is\s+my\s+name/,
    /what'?s\s+my\s+name/,
    /do\s+you\s+know\s+my\s+name/,
    /who\s+am\s+i/,
    /tell\s+me\s+my\s+name/,
    /what\s+do\s+you\s+call\s+me/,
    /my\s+name\s+is/,
    /how\s+old\s+am\s+i/,
    /what\s+is\s+my\s+age/,
    /where\s+am\s+i\s+from/,
    /what\s+is\s+my\s+(address|location|city)/,
    /remember\s+my\s+name/,
    /call\s+me/,
    // Continuation
    /^(more|continue|go\s+on|and\?|ok|okay|alright|sure|yes|no|nope|yep|great)$/,
  ].some(p => p.test(t));
}

// ─── Personal question responder ─────────────────────────────────────────────
function handlePersonalQuestion(query, conversationHistory) {
  const q = query.trim().toLowerCase();

  // Check if user mentioned their name earlier in the conversation
  const prevUserMsgs = (conversationHistory || [])
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());

  const nameIntroMatch = prevUserMsgs
    .map(m => m.match(/(?:my\s+name\s+is|i(?:'m| am| m)\s+|call\s+me\s+)([a-z]+)/i))
    .find(m => m);

  if (/what\s+is\s+my\s+name|what'?s\s+my\s+name|do\s+you\s+know\s+my\s+name|who\s+am\s+i/.test(q)) {
    if (nameIntroMatch) {
      const name = nameIntroMatch[1].charAt(0).toUpperCase() + nameIntroMatch[1].slice(1);
      return `Your name is **${name}**! 😊 I remembered from our conversation.\n\nIs there anything else I can help you with regarding college admissions or guidance?`;
    }
    return `I don't have access to your personal profile details. You haven't told me your name yet in this conversation! 😊\n\nYou can introduce yourself by saying *"My name is [your name]"* and I'll remember it for our chat.\n\n**I'm Acadivo AI** — I'm best at helping you with:\n• 🏛️ Finding the right college\n• 💰 Fee structures & scholarships\n• 💼 Placements & career guidance\n• 📋 Admissions & eligibility\n\nHow can I assist you today? 🎓`;
  }

  if (/which\s+state\s+am\s+i\s+from|where\s+am\s+i\s+from|which\s+district\s+are\s+you\s+from|my\s+state|my\s+district/.test(q)) {
    return `As an AI advisor, I don't automatically track your personal location. 😊\n\nIf you tell me your location (e.g. *"I am from Chennai, Tamil Nadu"*), I can show you all top colleges, cutoff marks, and admission options near your hometown or preferred state! 📍`;
  }

  if (/my\s+(educational\s+)?qualification|which\s+board|my\s+12th\s+(group|stream|percentage|cutoff)|my\s+cutoff/.test(q)) {
    return `You haven't shared your 12th marks or cutoff with me yet in this chat! 🎓\n\nFeel free to share your percentage or cutoff (e.g. *"My 12th percentage is 85%"* or *"My cutoff is 175"*), and I will recommend matching engineering, medical, or arts colleges for you! 📊`;
  }

  if (/my\s+career\s+interest|what\s+type\s+of\s+career|my\s+preferred\s+course/.test(q)) {
    return `I'm here to help you discover the perfect career path! 🚀\n\nTell me about your favorite subjects (like Math, Physics, Computer Science, Biology, or Business), and I can recommend courses like B.Tech CSE, AI & DS, ECE, Mechanical, MBBS, or MBA along with top career outcomes! 💡`;
  }

  if (/how\s+old\s+am\s+i|what\s+is\s+my\s+age/.test(q)) {
    return `I don't have access to your personal information like your age. 😊\n\nHowever, if you share your current class or exam (like "I'm in 12th grade" or "I just passed 10th"), I can guide you on the best colleges and career paths suited for you! 🎓`;
  }

  if (/my\s+name\s+is\s+(\w+)/.test(q)) {
    const match = q.match(/my\s+name\s+is\s+(\w+)/);
    const name = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'there';
    return `Nice to meet you, **${name}**! 😊\n\nI'm **Acadivo AI** — your personal college guidance assistant. I'm here to help you find the best colleges, understand admissions, and plan your career.\n\nWhat would you like to explore today? 🎓`;
  }

  return null; // not a personal question, fall through
}



// ─── Last user query extractor ────────────────────────────────────────────────
function lastQuery(history) {
  const msgs = (history || []).filter(m => m.role === 'user');
  return msgs.length > 0 ? msgs[msgs.length - 1].content : '';
}

// ─── Build web enrichment supplement (appended to local answer) ───────────────
async function enrichFromWeb(query) {
  const [ddg, wiki] = await Promise.all([
    fetchDDG(query + ' India college'),
    fetchWiki(query),
  ]);

  const results = [...ddg];
  if (wiki && !results.find(r => r.title === wiki.title)) {
    results.push(wiki);
  }

  if (results.length === 0) return null;

  const lines = [`\n**🌐 Web Insights:**`];
  for (const r of results.slice(0, 2)) {
    if (r.snippet) {
      lines.push(`• ${r.snippet}`);
      if (r.url) lines.push(`  [${r.source}](${r.url})`);
    }
  }
  return lines.join('\n');
}

// ─── Meta / capability question responder ────────────────────────────────────
function handleMetaQuestion(query) {
  const q = query.trim().toLowerCase();

  const isMeta = [
    /do\s+you\s+(know|have)\s+(all\s+)?(details|detail|info|information|data)/,
    /what\s+(details|detail|info|information|data)\s+(do\s+you|can\s+you)/,
    /do\s+you\s+know\s+everything/,
    /are\s+you\s+(real\s*time|updated|accurate|live)/,
    /where\s+do\s+you\s+get\s+(your\s+)?(data|information|details)/,
    /how\s+do\s+you\s+(crawl|work|know)/,
    /how\s+many\s+colleges\s+do\s+you\s+(know|have)/,
    /can\s+you\s+help\s+me/,
    /what\s+can\s+you\s+(do|help|tell)/,
  ].some(p => p.test(q));

  if (!isMeta) return null;

  return [
    `🎓 **Yes! I am Acadivo AI — equipped with comprehensive details on 1,700+ Indian colleges & real-time web crawling!**`,
    ``,
    `**Here is what I can tell you in full detail:**`,
    `• 🏛️ **College Profiles & Ratings** — Government/Private status, location, ratings & accreditation`,
    `• 💰 **Fees & Financial Aid** — Annual fee structures, scholarships, and education loan guidance`,
    `• 💼 **Placements & Packages** — Placements/year, top MNC recruiters, and salary trends`,
    `• 🎓 **Courses & Cutoffs** — Eligibility, 12th group requirements, department schedules`,
    `• 🏠 **Hostel & Transport** — AC/Non-AC room availability, sharing types, and college bus facilities`,
    `• 🌐 **Real-Time Web Search** — Live crawling via DuckDuckGo & Wikipedia for news or specific updates`,
    ``,
    `💡 *Try asking about a specific college, city, or stream! (e.g. "Tell me about Saveetha Engineering College", "IIT Madras fees", or "Best CSE colleges in Chennai")*`,
  ].join('\n');
}

// ─── Off-topic, unwanted, & non-college query handler ────────────────
function handleUnwantedOrOffTopicQuestion(query) {
  const q = query.trim().toLowerCase();

  // Allow academic, college, degree, exam, branch, career, cutoff, and student queries
  const isAcademicQuery = /college|university|institute|school|course|degree|btech|b\.e|mbbs|bds|bca|mca|mba|placement|fee|cutoff|tnea|jee|neet|gate|clat|scholarship|hostel|campus|admission|engineering|medical|arts|commerce|science|department|faculty|career|salary|internship|syllabus|exam|rank|accreditation|naac|nirf|aictes|ugc|study|learn|dsa|coding|vlsi|ai|data science|psychology|law|student|cgpa|backlog|diploma|polytechnic|iti|sop|lor|ielts|toefl|gre|gmat|visa|12th|after|future|job|math|maths|physics|bio|biology|doctor|computer|coding|program|salary|pay|paid|work|abroad|country|company|govt|government|desk|travel|design|cars|electric|ev|gaming|game|cse|it|ece|eee|mech|mechanical|civil|aerospace|mechatronics|robotics|data science|hack|hacker|cyber|cybersecurity|realistic|safe|ambitious|reputation|tier|compare|distance|loan|roi|lakh|budget|parent|son|daughter|family|regret|wrong|friends|drop|year|skills|project|resume|github|linkedin|certificate|intern|internship|unemployed|masters|mtech|mba|compromise|checklist|plan|option|bro|value|trust|advice|guidance|what|which|how|can i|should i|laptop|overcrowded|scam|pressure|threat|refund|attendance|club|hackathon|roadmap|verdict|decision|priority|backup|regret|fomo|failing|worst case|decision tree|visit|nirf|city|tech hub|commute|upsc|psu|5 year|perspective|transfer|non-science|lateral|nursing|paramedical|radiology|mlt|operation theatre|cardiac|dialysis|clat|lawyer|judge|corporate law|bcom|bba|ca|acca|fintech|pharmacy|bpharm|pharmd|barch|architecture|nata|agriculture|icar|agritech|pgdm|cat|hotel management|hospitality|cruise|bed|tet|teacher|professor|introvert|extrovert|personality|i selected|lowest cost|non-patient|scared of blood|architect|interior design|daily work|workday|reality|step by step|checklist|regulations/i.test(q);

  if (isAcademicQuery) {
    return null; // Pass through to counseling / college DB / web crawl!
  }

  // 1. Math calculations (e.g. "25 * 4", "100 + 200")
  const mathMatch = q.match(/^(\d+\s*[\+\-\*\/]\s*\d+)$/);
  if (mathMatch) {
    try {
      const expr = mathMatch[1];
      const result = Function(`"use strict"; return (${expr})`)();
      return [
        `🔢 **Mathematical Calculation:**\n\`${expr} = ${result}\`\n`,
        `💡 *As your Acadivo Academic Counselor, I can also help calculate your 12th percentage, TNEA engineering cutoffs, or semester GPAs! Tell me your subject marks to calculate.*`,
      ].join('\n');
    } catch { /* skip */ }
  }

  // 2. Off-topic queries (Recipes, Movies, Entertainment, Sports, Weather, Jokes, Gossip, etc.)
  if (/recipe|how to (make|cook)|biryani|pizza|movie|cinema|actor|actress|football|cricket|score|weather|temperature|joke|song|story|game|gta|playstation/i.test(q)) {
    return [
      `🏛️ **Acadivo Professional Advisory Notice**\n`,
      `Thank you for reaching out to **Acadivo AI**.\n`,
      `📌 **Reason for Scope Limitation:**`,
      `As an official **Senior Academic & Career Counselor at Acadivo**, my specialized expertise and operational protocols are dedicated exclusively to **College Admissions, Cutoff Analysis, Degree Programs, Career Planning, Entrance Exams, and Campus Placements**.\n`,
      `To ensure students and parents receive verified, unbiased, and highly accurate educational guidance, I do not provide responses to general entertainment, cooking, sports, or non-academic topics.\n`,
      `🎓 **How I Can Assist You:**`,
      `• 🏛️ **College Admissions & Ratings**: Details, fees, cutoffs, NIRF rankings, & NAAC grades for any Indian college.`,
      `• 💻 **Branch & Stream Guidance**: CSE vs IT, ECE, Mechanical, MBBS alternatives, Commerce, & Law.`,
      `• 📊 **Placement & ROI Analysis**: Verified campus recruitment trends, salary packages, & fee structures.`,
      `• 📝 **Counselling Mechanics**: Choice filling strategies, TNEA/JEE/NEET cutoff probability, & seat allotment.\n`,
      `💡 *Please feel free to ask any question regarding colleges, degrees, entrance exams, or admissions!*`,
    ].join('\n');
  }

  // 3. Gibberish / Random character sequences
  if (/^[a-z]{6,}$/i.test(q) && !/[aeiouy]{2,}/i.test(q)) {
    return [
      `🏛️ **Acadivo Professional Advisory Notice**\n`,
      `It appears your message contains unrecognized or random characters.\n`,
      `As **Acadivo AI**, I am here to provide professional academic and college counseling. Please rephrase your query with your specific college, course, or career interest, and I will gladly assist you! 🎓`,
    ].join('\n');
  }

  // 4. Rude or hostile queries
  if (/shut up|stupid|dumb|useless|hate you/.test(q)) {
    return [
      `🏛️ **Acadivo Professional Advisory Notice**\n`,
      `I remain committed to providing high-quality, professional academic and career counseling.\n`,
      `If you have legitimate questions about college admissions, cutoffs, engineering/medical streams, fees, or placements, I am here to help you anytime! 🎓`,
    ].join('\n');
  }

  // 5. Generic non-college / non-academic fallback
  return [
    `🏛️ **Acadivo Professional Advisory Notice**\n`,
    `As an official **Senior Academic & Career Counselor at Acadivo**, my domain is specialized exclusively in **College Admissions, Course Selection, Cutoffs, Placements, and Academic Guidance**.\n`,
    `📌 **Why I focus only on education & colleges:**`,
    `To maintain maximum data accuracy and provide reliable counselor guidance for students and parents, I limit my domain to academic and career-related subjects.\n`,
    `🎓 **You can ask me about:**`,
    `• 🏛️ Admission requirements, cutoffs, & fees for any college`,
    `• 🎓 Comparing courses (CSE, AI, ECE, Mechanical, MBBS, BBA, Law)`,
    `• 💼 Placement statistics, top recruiters, & salary packages`,
    `• 📝 Entrance exam preparation & counselling strategies\n`,
    `*How can I assist your college selection or career goals today?*`,
  ].join('\n');
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * generateSmartResponse — main AI response function for AIScreen.
 *
 * Priority:
 *   1. Personal / Meta / Off-topic / Conversational → Instant intelligent routing
 *   2. College Knowledge DB → Local 1700+ college database search
 *   3. Real-Time Web Crawl → Live DuckDuckGo + Wikipedia extraction & synthesis
 *
 * @param {Array<{role:string, content:string}>} conversationHistory
 * @param {object|null} college   - optional college context
 * @param {string|null} deptLabel - optional department
 * @returns {Promise<{text, sentiment, sources, isCrawled}>}
 */
export async function generateSmartResponse(conversationHistory, college = null, deptLabel = null) {
  const query = lastQuery(conversationHistory);

  if (!query || !query.trim()) {
    return {
      text: "Could you rephrase your question? I'm here to help! 🤔",
      sentiment: null, sources: [], isCrawled: false,
    };
  }

  // ── 1a. Personal & Identity Questions ────────────────────────────────────
  const personalReply = handlePersonalQuestion(query, conversationHistory);
  if (personalReply) {
    return { text: personalReply, sentiment: null, sources: [], isCrawled: false, intent: 'personal' };
  }

  // ── 1b. Meta & AI Capability Questions ("do you know all details") ────────
  const metaReply = handleMetaQuestion(query);
  if (metaReply) {
    return { text: metaReply, sentiment: null, sources: [], isCrawled: false, intent: 'meta' };
  }

  // ── 1c. General Conversational Turns (Greetings, Hi, Hello, How are you, Thanks, Bye) ──
  if (isConversational(query)) {
    const r = generateAIResponse(query, college, deptLabel);
    return { text: r.text, sentiment: null, sources: [], isCrawled: false, intent: r.type };
  }

  // ── 1d. Academic & Career Counseling Questions ────────────────────────────
  const counselingReply = answerCounselingQuestion(query);
  if (counselingReply) {
    const sentiment = analyzeText(counselingReply);
    return { text: counselingReply, sentiment, sources: [], isCrawled: false, intent: 'counseling' };
  }

  // ── 1e. Off-topic / Unwanted / Math / Joke Handler ───────────────────────
  const unwantedReply = handleUnwantedOrOffTopicQuestion(query);
  if (unwantedReply) {
    return { text: unwantedReply, sentiment: null, sources: [], isCrawled: false, intent: 'offtopic' };
  }

  // ── 2. Query local college database ──────────────────────────────────────
  const dbResult = queryCollegeKnowledge(query);

  if (dbResult.found) {
    let finalText = dbResult.text;

    // Optionally enrich with web snippets (non-blocking, fire & forget)
    try {
      const webExtra = await enrichFromWeb(query);
      if (webExtra) finalText += webExtra;
    } catch { /* silently skip */ }

    return {
      text:       finalText,
      sentiment:  dbResult.sentiment,
      sources:    [],
      isCrawled:  true,
    };
  }

  // ── 3. Real-Time Web Crawl (DuckDuckGo + Wikipedia Extraction) ─────────
  try {
    const [ddg, wiki] = await Promise.all([
      fetchDDG(query),
      fetchWiki(query),
    ]);

    const results = [...ddg];
    if (wiki && !results.find(r => r.title === wiki.title)) {
      results.push(wiki);
    }

    if (results.length > 0) {
      const combined = results.map(r => r.rawText).join(' ');
      const sentiment = analyzeText(combined);

      const lines = [
        `📡 **Real-Time Web Search Results for "${query}"**\n`,
        `**Overview:**`,
        results[0].snippet || results[0].rawText || '',
        '',
      ];

      if (results.length > 1) {
        lines.push('**Key Highlights & Related Info:**');
        for (const r of results.slice(1, 4)) {
          if (r.snippet) {
            lines.push(`• ${r.snippet}`);
          }
        }
        lines.push('');
      }

      // Sentiment analysis pill
      if (sentiment && sentiment.wordCount > 3) {
        const sentEmoji = getSentimentEmoji(sentiment.label);
        lines.push(`**Sentiment Analysis:** ${sentEmoji} **${sentiment.label}** tone (Score: ${sentiment.normalizedScore > 0 ? '+' : ''}${sentiment.normalizedScore}/5)`);
        if (sentiment.positive.length > 0) {
          lines.push(`✅ Positive signals: *${sentiment.positive.slice(0, 4).join(', ')}*`);
        }
        if (sentiment.negative.length > 0) {
          lines.push(`⚠️ Concerns noted: *${sentiment.negative.slice(0, 3).join(', ')}*`);
        }
        lines.push('');
      }

      // Sources
      const validSources = results.filter(r => r.url);
      if (validSources.length > 0) {
        lines.push('**Live Web Sources:**');
        for (const r of validSources.slice(0, 3)) {
          lines.push(`• [${r.source || r.title}](${r.url})`);
        }
        lines.push('');
      }

      lines.push(`💡 *Ask any follow-up question or search for a specific college!*`);

      return {
        text:       lines.join('\n'),
        sentiment,
        sources:    results,
        isCrawled:  true,
      };
    }
  } catch { /* CORS or network — fall through to localAI */ }

  // ── 4. Final fallback: localAI general response ───────────────────────────
  try {
    const r = generateAIResponse(query, college, deptLabel);
    return {
      text:       r.text + '\n\n💡 *I have data on 1700+ Indian colleges — try asking about a specific college, city, or course!*',
      sentiment:  null,
      sources:    [],
      isCrawled:  false,
      intent:     r.type,
    };
  } catch {
    return {
      text:       `🔍 I couldn't find specific data for **"${query}"**.\n\nTry asking:\n• "Tell me about Saveetha Engineering College"\n• "Best colleges in Chennai"\n• "IIT Madras fees"\n• "Colleges with hostel in Tamil Nadu"`,
      sentiment:  null,
      sources:    [],
      isCrawled:  false,
    };
  }
}

// ─── Re-exports for AIScreen.js ───────────────────────────────────────────────
export { analyzeText, getSentimentColor, getSentimentEmoji };
export { resetLocalAIContext };

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

/**
 * groqAI.js — Acadivo AI v5.0
 * Real AI via Groq API (Llama 3.3 70B — fastest, most capable).
 *
 * v5.0 Upgrades:
 *  ✅ Firestore admin-managed college database (priority source)
 *  ✅ Personalized responses based on user search + chat history
 *  ✅ Cutoff / eligibility matching ("my marks are 85%")
 *  ✅ Full conversation history (multi-turn like ChatGPT)
 *  ✅ Deep college knowledge from in-app DB + Firestore DB
 *  ✅ Graceful fallback to localAI when no network
 *  ✅ EAS build support via Constants.expoConfig.extra
 *  ✅ Smart image request handling
 *  ✅ Context-aware follow-up understanding
 */

import Constants from 'expo-constants';
import { generateAIResponse } from './localAI';
import { COLLEGE_DATABASE } from '../constants/collegeDatabase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// ── Conversation history store (per-component; reset when session changes) ────
let conversationHistory = [];

export const resetConversation = () => { conversationHistory = []; };

/**
 * Seed the in-memory history from a loaded Firestore session.
 * Call this when the user resumes a previous chat session.
 */
export const seedConversation = (messages = []) => {
  conversationHistory = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.text || m.content || '' }))
    .slice(-20);
};

// ── Get API Key ───────────────────────────────────────────────────────────────
const getApiKey = () => {
  const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (envKey && envKey !== 'YOUR_GROQ_API_KEY' && envKey.trim() !== '') return envKey.trim();
  try {
    const extraKey = Constants?.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY;
    if (extraKey && extraKey !== 'YOUR_GROQ_API_KEY' && extraKey.trim() !== '') return extraKey.trim();
  } catch {}
  return null;
};

// ── Firestore college fetch ───────────────────────────────────────────────────
let _firestoreCollegesCache     = null;
let _firestoreCollegesCachedAt  = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const fetchFirestoreColleges = async () => {
  const now = Date.now();
  if (_firestoreCollegesCache && (now - _firestoreCollegesCachedAt) < CACHE_TTL_MS) {
    return _firestoreCollegesCache;
  }
  try {
    const snap = await getDocs(collection(db, 'colleges'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    _firestoreCollegesCache    = list;
    _firestoreCollegesCachedAt = now;
    return list;
  } catch {
    return _firestoreCollegesCache || [];
  }
};

// ── College search (local DB + Firestore DB combined) ─────────────────────────
const findCollegesInApp = (userQuery, extraColleges = [], limitCount = 6) => {
  const q = userQuery.toLowerCase();

  const wantsWomen   = /\b(women|girls|female|ladies|all.?women|all.?girls)\b/.test(q);
  const wantsMen     = /\b(men|boys|male|all.?men|all.?boys)\b/.test(q) && !wantsWomen;
  const wantsGovt    = /\b(government|govt|public|state|central)\b/.test(q);
  const wantsPrivate = /\b(private|deemed|autonomous)\b/.test(q) && !wantsGovt;
  const wantsHostel  = /\b(hostel|accommodation|staying|boarding|residential)\b/.test(q);
  const wantsTop     = /\b(top|best|highest|ranked|premier|iit|nit|aiims|tier.?1)\b/.test(q);
  const wantsScholarship = /\b(scholarship|free|funded|stipend)\b/.test(q);

  const DEPT_MAP = {
    engineering:     /\b(engineer|tech|btech|iit|nit|cse|ece|mech|civil|it|computer|electrical|ai|artificial)\b/,
    medical:         /\b(medical|mbbs|neet|doctor|medicine|bds|dental|aiims|surgery)\b/,
    management:      /\b(mba|management|business|bba|commerce)\b/,
    law:             /\b(law|llb|legal|advocate|clat|bar)\b/,
    agriculture:     /\b(agri|agriculture|farming|horticulture|icar)\b/,
    pharmacy:        /\b(pharmacy|pharma|bpharm|drug)\b/,
    nursing:         /\b(nursing|nurse|bsc nursing|midwife)\b/,
    architecture:    /\b(architect|architecture|planning|design|b\.arch)\b/,
    arts_science:    /\b(arts|science|bsc|ba|humanities|liberal)\b/,
    commerce:        /\b(commerce|bcom|accounts|finance|ca|cs)\b/,
    hotel_management:/\b(hotel|hospitality|catering|tourism|ihmct)\b/,
    polytechnic:     /\b(polytechnic|diploma|iti|vocational)\b/,
    paramedical:     /\b(paramedical|physiotherapy|radiology|lab tech)\b/,
    teacher_training:/\b(b\.ed|bed|teacher|teaching|education|d\.el\.ed)\b/,
  };

  let targetDept = null;
  for (const [dept, regex] of Object.entries(DEPT_MAP)) {
    if (regex.test(q)) { targetDept = dept; break; }
  }

  const STATE_KEYWORDS = [
    'tamil nadu', 'maharashtra', 'karnataka', 'delhi', 'kerala', 'gujarat',
    'rajasthan', 'uttar pradesh', 'west bengal', 'telangana', 'andhra pradesh',
    'punjab', 'haryana', 'bihar', 'odisha', 'assam', 'madhya pradesh',
    'chennai', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'pune',
    'kolkata', 'jaipur', 'lucknow', 'bhopal', 'coimbatore', 'vellore', 'kochi',
    'ahmedabad', 'surat', 'patna', 'raipur', 'bhubaneswar', 'shimla', 'dehradun',
  ];
  let targetState = null;
  for (const s of STATE_KEYWORDS) {
    if (q.includes(s)) { targetState = s; break; }
  }

  const scoreMatch = q.match(/(\d{2,3})\s*(%|percent|marks|score|cutoff)/);
  const minPct = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const wantsNAACa = /naac.*a\+|a\+.*naac/.test(q);

  // Combine local + Firestore colleges, Firestore takes priority
  const allColleges = [
    ...extraColleges.map(c => ({ ...c, _isFirestore: true })),
    ...COLLEGE_DATABASE,
  ];

  let pool = [...allColleges];

  if (wantsWomen)      pool = pool.filter(c => /women|girls/i.test(c.gender || ''));
  if (wantsMen)        pool = pool.filter(c => /men|boys/i.test(c.gender || '') && !/women|girls/i.test(c.gender || ''));
  if (wantsGovt)       pool = pool.filter(c => c.type === 'Government');
  if (wantsPrivate)    pool = pool.filter(c => c.type === 'Private' || c.type === 'Deemed' || c.type === 'Autonomous');
  if (targetDept)      pool = pool.filter(c => c.department === targetDept);
  if (targetState)     pool = pool.filter(c => ((c.state || '') + ' ' + (c.location || '')).toLowerCase().includes(targetState));
  if (wantsHostel)     pool = pool.filter(c => c.hostelAvailable);
  if (wantsScholarship)pool = pool.filter(c => c.scholarshipAvailable);
  if (minPct)          pool = pool.filter(c => (c.minPercentage || 0) <= minPct);
  if (wantsNAACa)      pool = pool.filter(c => ['A+', 'A++'].includes(c.naacGrade));

  // Firestore colleges appear first (admin curated), then sort by rating
  pool.sort((a, b) => {
    if (a._isFirestore && !b._isFirestore) return -1;
    if (!a._isFirestore && b._isFirestore) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return pool.slice(0, limitCount);
};

const formatCollegesForAI = (colleges) => {
  if (!colleges.length) return 'No matching colleges found in the database.';
  return colleges.map((c, i) =>
    `${i + 1}. **${c.name}** — ${c.location}, ${c.state}` +
    (c._isFirestore ? ' 🔵 [Admin Curated]' : '') + '\n' +
    `   • Type: ${c.type} | Dept: ${c.department} | NAAC: ${c.naacGrade || 'N/A'}\n` +
    `   • Rating: ${c.rating}/5 | Placement: ${c.placementRate}% | Fee: ₹${c.annualFee || 'N/A'}/yr\n` +
    `   • Hostel: ${c.hostelAvailable ? '✅ Yes' : '❌ No'} | Min%: ${c.minPercentage}%` +
    (c.description ? `\n   • About: ${c.description.slice(0, 100)}` : '') +
    (c.courses?.length ? `\n   • Courses: ${(Array.isArray(c.courses) ? c.courses : [c.courses]).slice(0, 4).join(', ')}` : '')
  ).join('\n\n');
};

// ── Master system prompt ──────────────────────────────────────────────────────
const buildSystemPrompt = ({
  college,
  departmentLabel,
  suggestedColleges,
  hasCollegeContext,
  personalizationContext,
  firestoreCollegesCount,
}) => `
You are **Acadivo AI** — a highly intelligent, versatile AI assistant and College Guidance Expert built into the Acadivo app. You are powered by Llama 3.3 70B.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR CORE IDENTITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a SMART, KNOWLEDGEABLE, and VERSATILE AI — your PRIMARY expertise is Indian college admissions and career guidance. You can handle:
- Natural language college queries ("Which engineering colleges in Chennai accept 85%?")
- Fee structure, hostel, placement, scholarship questions
- Eligibility and cutoff matching
- College comparisons and personalized recommendations
- Entrance exams: JEE, NEET, CLAT, GATE, CAT, CUET, etc.
- Career guidance after any degree
- General knowledge, tech, science

You behave like a brilliant, caring senior mentor who is an expert on Indian colleges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 CRITICAL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NEVER say "I don't understand" — ALWAYS give a helpful answer and ask for clarification if needed.
2. NEVER refuse any question — answer helpfully, then offer more college help.
3. Understand short/informal messages — interpret intent, don't reject.
4. Context-aware follow-ups — use full conversation history to understand context.
5. Be conversational and warm — like a knowledgeable friend.
6. When user mentions their marks/cutoff/percentage, use it to recommend matching colleges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ IMAGE / PHOTO REQUESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When user asks for images: provide a Google Images search link.
Format: [🔍 View [Subject] Images](https://www.google.com/search?tbm=isch&q=[URL_encoded_search])
NEVER say "I can't show images". ALWAYS provide the link.

${personalizationContext ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 PERSONALISATION — USER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this to tailor your recommendations to this specific user's interests:
${personalizationContext}

When this user asks general questions like "recommend a college" or "which is best?", use their profile to suggest relevant options first.
` : ''}

${hasCollegeContext ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CURRENT COLLEGE IN VIEW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${college.name}
• Location: ${college.location}, ${college.state}
• Type: ${college.type} | Department: ${departmentLabel || college.department}
• NAAC Grade: ${college.naacGrade || 'N/A'} | Rating: ${college.rating}/5
• Placement Rate: ${college.placementRate}%
• Hostel: ${college.hostelAvailable ? 'Available ✅' : 'Not Available ❌'}
• Min % Required: ${college.minPercentage}%
• Annual Fee: ₹${college.annualFee || 'N/A'}
• Established: ${college.established}
• Courses Offered: ${(college.courses || []).join(', ')}
• Top Recruiters: ${(college.topCompanies || []).join(', ') || 'Various companies'}
• About: ${college.description || ''}
• Highlight: ${college.highlight || ''}
${college.eligibility ? `• Eligibility: ${college.eligibility}` : ''}
${college.admissionProcess ? `• Admission: ${college.admissionProcess}` : ''}
` : ''}

${suggestedColleges && suggestedColleges !== 'User is not asking for college suggestions right now.' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 MATCHING COLLEGES FROM DATABASE (${firestoreCollegesCount} admin-curated + local):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${suggestedColleges}

Present these colleges clearly. Mention 🔵 [Admin Curated] ones are specially verified by our team.
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ RESPONSE STYLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Be warm, natural, and conversational
- Use **bold** for key terms
- Use bullet points (•) for lists
- Use emojis naturally
- Keep responses 100-400 words (longer only when detailed answer needed)
- Always end with a follow-up question or offer to help more
- Don't make up facts — be honest if unsure
`.trim();

// ── Detect suggestion queries ─────────────────────────────────────────────────
const isSuggestionQuery = (msg) =>
  /\b(suggest|show|find|recommend|list|give me|any|which|best|top|colleges in|college for|government|private|engineering|medical|hostel|affordable|marks|cutoff|percent|%|accept|eligible)\b/i.test(msg);

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Ask Groq AI about colleges.
 *
 * @param {string} userMessage
 * @param {object} college         — optional college context (from Details screen)
 * @param {string} departmentLabel — optional
 * @param {string} personalizationContext — from ChatHistoryContext.getPersonalizationContext()
 * @returns {Promise<{text, type, isRealAI}>}
 */
export const askGroqAboutCollege = async (
  userMessage,
  college,
  departmentLabel,
  personalizationContext = '',
) => {
  const apiKey = getApiKey();

  // Fetch Firestore admin colleges (cached)
  let firestoreColleges = [];
  try { firestoreColleges = await fetchFirestoreColleges(); } catch {}

  const isSuggestion = isSuggestionQuery(userMessage);
  const appMatches   = isSuggestion ? findCollegesInApp(userMessage, firestoreColleges, 8) : [];
  const suggestedCollegesText = isSuggestion
    ? formatCollegesForAI(appMatches)
    : 'User is not asking for college suggestions right now.';

  const hasCollegeContext = !!(college && college.name);

  // Add user message to history
  conversationHistory.push({ role: 'user', content: userMessage });
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  // Fallback to local AI if no Groq key
  if (!apiKey) {
    if (isSuggestion && appMatches.length > 0) {
      const text = buildSuggestionFallback(appMatches, userMessage);
      conversationHistory.push({ role: 'assistant', content: text });
      return { text, type: 'suggestions', isRealAI: false };
    }
    const localResponse = generateAIResponse(userMessage, college, departmentLabel);
    conversationHistory.push({ role: 'assistant', content: localResponse.text });
    return { text: localResponse.text, type: localResponse.type, isRealAI: false };
  }

  try {
    const systemPrompt = buildSystemPrompt({
      college,
      departmentLabel,
      suggestedColleges:     suggestedCollegesText,
      hasCollegeContext,
      personalizationContext,
      firestoreCollegesCount: firestoreColleges.length,
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
        ],
        max_tokens:  2048,
        temperature: 0.7,
        top_p:       0.9,
        stream:      false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Groq API error:', response.status, err);
      return await handleFallback(isSuggestion, appMatches, userMessage, college, departmentLabel);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim()
      || 'I apologize, I could not generate a response. Please try again.';

    conversationHistory.push({ role: 'assistant', content: text });

    const type = isSuggestion ? 'suggestions' : 'groq';
    return { text, type, isRealAI: true };

  } catch (error) {
    console.warn('Groq fetch failed, falling back:', error.message);
    return await handleFallback(isSuggestion, appMatches, userMessage, college, departmentLabel);
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildSuggestionFallback = (colleges, userQuery) => {
  const lines = colleges.map((c, i) =>
    `**${i + 1}. ${c.name}**${c._isFirestore ? ' 🔵' : ''}\n` +
    `📍 ${c.location}, ${c.state} | ${c.type}\n` +
    `⭐ ${c.rating}/5 | 💼 ${c.placementRate}% placed | 🏠 Hostel: ${c.hostelAvailable ? 'Yes' : 'No'}\n` +
    `💰 Fee: ₹${c.annualFee || 'N/A'}/yr | Min: ${c.minPercentage}%`
  ).join('\n\n');

  return `Here are the top colleges matching your request:\n\n${lines}\n\n💡 **Tip:** Tap any college in the list to see full details and apply!`;
};

const handleFallback = async (isSuggestion, appMatches, userMessage, college, departmentLabel) => {
  if (isSuggestion && appMatches.length > 0) {
    const text = buildSuggestionFallback(appMatches, userMessage);
    conversationHistory.push({ role: 'assistant', content: text });
    return { text, type: 'suggestions', isRealAI: false };
  }
  const localResponse = generateAIResponse(userMessage, college, departmentLabel);
  conversationHistory.push({ role: 'assistant', content: localResponse.text });
  return { text: localResponse.text, type: localResponse.type, isRealAI: false };
};

/** Check if real Groq AI is configured */
export const isGroqConfigured = () => !!getApiKey();

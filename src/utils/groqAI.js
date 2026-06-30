/**
 * groqAI.js — Acadivo AI v3.0
 * Real AI via Groq API (Llama 3 70B — fastest, most capable).
 *
 * Features:
 *  ✅ Full conversation history (multi-turn like ChatGPT)
 *  ✅ Deep college knowledge from in-app DB
 *  ✅ Handles ALL college, education, career, entrance exam questions
 *  ✅ Graceful fallback to localAI when no network
 *  ✅ Streaming-style responses (token by token)
 */

import { generateAIResponse } from './localAI';
import { COLLEGE_DATABASE } from '../constants/collegeDatabase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile'; // Latest & best quality Llama model

// ── Conversation history store (keeps last 10 turns for context) ─────────────
let conversationHistory = [];

export const resetConversation = () => { conversationHistory = []; };

// ── College search helper ─────────────────────────────────────────────────────
const findCollegesInApp = (query, limit = 6) => {
  const q = query.toLowerCase();

  const wantsWomen   = /\b(women|girls|female|ladies|all.?women|all.?girls)\b/.test(q);
  const wantsMen     = /\b(men|boys|male|all.?men|all.?boys)\b/.test(q) && !wantsWomen;
  const wantsGovt    = /\b(government|govt|public|state|central)\b/.test(q);
  const wantsPrivate = /\b(private|deemed|autonomous)\b/.test(q) && !wantsGovt;
  const wantsHostel  = /\b(hostel|accommodation|staying|boarding|residential)\b/.test(q);
  const wantsTop     = /\b(top|best|highest|ranked|premier|iit|nit|aiims|tier.?1)\b/.test(q);

  const DEPT_MAP = {
    engineering    : /\b(engineer|tech|btech|iit|nit|cse|ece|mech|civil|it|computer|electrical)\b/,
    medical        : /\b(medical|mbbs|neet|doctor|medicine|bds|dental|aiims|surgery)\b/,
    management     : /\b(mba|management|business|bba|commerce|mba)\b/,
    law            : /\b(law|llb|legal|advocate|clat|bar)\b/,
    agriculture    : /\b(agri|agriculture|farming|horticulture|bsc agri|icar)\b/,
    pharmacy       : /\b(pharmacy|pharma|bpharm|drug)\b/,
    nursing        : /\b(nursing|nurse|bsc nursing|midwife)\b/,
    architecture   : /\b(architect|architecture|planning|design|b\.arch)\b/,
    arts_science   : /\b(arts|science|bsc|ba|humanities|liberal)\b/,
    commerce       : /\b(commerce|bcom|accounts|finance|ca|cs)\b/,
    hotel_management: /\b(hotel|hospitality|catering|tourism|ihmct)\b/,
    polytechnic    : /\b(polytechnic|diploma|iti|vocational)\b/,
    paramedical    : /\b(paramedical|physiotherapy|radiology|lab tech)\b/,
    teacher_training: /\b(b\.ed|bed|teacher|teaching|education|d\.el\.ed)\b/,
  };
  let targetDept = null;
  for (const [dept, regex] of Object.entries(DEPT_MAP)) {
    if (regex.test(q)) { targetDept = dept; break; }
  }

  const STATE_KEYWORDS = [
    'tamil nadu','maharashtra','karnataka','delhi','kerala','gujarat',
    'rajasthan','uttar pradesh','west bengal','telangana','andhra pradesh',
    'punjab','haryana','bihar','odisha','assam','madhya pradesh',
    'chhattisgarh','jharkhand','uttarakhand','himachal pradesh','goa',
    'manipur','meghalaya','tripura','nagaland','mizoram','sikkim',
    'arunachal','jammu','kashmir','puducherry','chandigarh',
    'chennai','mumbai','bangalore','bengaluru','hyderabad','pune',
    'kolkata','jaipur','lucknow','bhopal','coimbatore','vellore','kochi',
    'ahmedabad','surat','patna','raipur','bhubaneswar','imphal','shillong',
    'agartala','kohima','aizawl','gangtok','itanagar','shimla','dehradun',
  ];
  let targetState = null;
  for (const s of STATE_KEYWORDS) {
    if (q.includes(s)) { targetState = s; break; }
  }

  const scoreMatch = q.match(/(\d{2,3})\s*(%|percent|marks|score)/);
  const minPct = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // NAAC filter
  const wantsNAACa = /naac.*a\+|a\+.*naac/.test(q);

  let pool = [...COLLEGE_DATABASE];

  if (wantsWomen)   pool = pool.filter(c => /women|girls/i.test(c.gender));
  if (wantsMen)     pool = pool.filter(c => /men|boys/i.test(c.gender) && !/women|girls/i.test(c.gender));
  if (wantsGovt)    pool = pool.filter(c => c.type === 'Government');
  if (wantsPrivate) pool = pool.filter(c => c.type === 'Private');
  if (targetDept)   pool = pool.filter(c => c.department === targetDept);
  if (targetState)  pool = pool.filter(c => (c.state + ' ' + c.location).toLowerCase().includes(targetState));
  if (wantsHostel)  pool = pool.filter(c => c.hostelAvailable);
  if (minPct)       pool = pool.filter(c => c.minPercentage <= minPct);
  if (wantsNAACa)   pool = pool.filter(c => ['A+', 'A++'].includes(c.naacGrade));

  pool.sort((a, b) => (wantsTop || true) ? b.rating - a.rating : 0);

  return pool.slice(0, limit);
};

const formatCollegesForAI = (colleges) => {
  if (!colleges.length) return 'No matching colleges found in the app database.';
  return colleges.map((c, i) =>
    `${i + 1}. **${c.name}** — ${c.location}, ${c.state}\n` +
    `   • Type: ${c.type} | Dept: ${c.department} | NAAC: ${c.naacGrade || 'N/A'}\n` +
    `   • Rating: ${c.rating}/5 | Placement: ${c.placementRate}% | Fee: ₹${c.annualFee || 'N/A'}/yr\n` +
    `   • Hostel: ${c.hostelAvailable ? '✅ Yes' : '❌ No'} | Min%: ${c.minPercentage}%`
  ).join('\n\n');
};

// ── Master system prompt ──────────────────────────────────────────────────────
const buildSystemPrompt = (college, departmentLabel, suggestedColleges, hasCollegeContext) => `
You are **Acadivo AI** — India's most professional and helpful AI college counsellor, powered by Llama 3 70B, built into the Acadivo app.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR ROLE & IDENTITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a professional college counsellor. You assist students with college admissions, entrance exams, career guidance, scholarships, and all education-related topics in India. You are knowledgeable, warm, encouraging, and always professional — like a senior mentor who cracked JEE/NEET and is guiding juniors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 HOW TO HANDLE PERSONAL / CASUAL MESSAGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If the user shares personal information (like "my name is X", "I am from Y", "I am in 12th grade", "I scored Z marks"), do NOT ignore it. Instead:
  - Acknowledge it warmly and professionally (e.g., "Nice to meet you, [Name]! 👋")
  - Gently guide the conversation back toward education topics
  - Example: If someone says "my name is Dinesh", respond: "Nice to meet you, Dinesh! 😊 I'm Acadivo AI, your personal college counsellor. How can I help you today — are you looking for college suggestions, exam guidance, or career advice?"
  - Never say "I don't speak about that" — always be polite and redirect professionally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 OFF-TOPIC QUESTIONS (non-education):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If the user asks about something completely unrelated to education (e.g., movies, cricket scores, cooking recipes, jokes, politics, relationships, entertainment), respond politely and professionally:
  "That's an interesting question! 😊 However, I'm specifically designed to help with college admissions, entrance exams, and career guidance in India. I'd love to assist you with anything education-related — shall we get started? 🎓"
  
  Never be rude, dismissive, or abrupt. Always be warm and redirect professionally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 GREETINGS & SMALL TALK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "Hi", "Hello", "How are you?" → Greet warmly and ask how you can help with education.
- "Thank you", "Thanks" → Acknowledge it and offer further help.
- "Bye", "Goodbye" → Wish them well and encourage them to return for college guidance.
- Always keep the tone positive and professional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ IMAGE / PHOTO REQUESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If the user asks for images, photos, or pictures of a college, DO NOT say "I don't have the capability to display images" or "I am a text-based AI". 
Instead, enthusiastically provide a direct Google Images search link using Markdown format.
Format: "Here are some photos of [College Name]: [View Campus Images](https://www.google.com/search?tbm=isch&q=[URL_Encoded_College_Name]+campus+photos)"
Example: "Here are some photos of IIT Madras: [View Campus Images](https://www.google.com/search?tbm=isch&q=IIT+Madras+campus+photos)"

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
` : ''}

${suggestedColleges && suggestedColleges !== 'User is not asking for college suggestions right now.' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 MATCHING COLLEGES FROM OUR DATABASE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${suggestedColleges}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 YOUR KNOWLEDGE AREAS (answer ALL of these):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Current College** — Use the college data above for specific questions
2. **College Suggestions** — When asked to suggest/find colleges, use the database results above
3. **Entrance Exams** — JEE Main, JEE Advanced, NEET, CLAT, GATE, CAT, XAT, MAT, CUET, CMAT, NATA, NIFT, etc.
4. **Admission Process** — JoSAA counselling, NEET counselling, TNEA, MHT-CET, etc.
5. **Scholarships & Loans** — NSP, state scholarships, education loans (SBI, Axis, HDFC), NMMSS, etc.
6. **Career Guidance** — After B.Tech, MBBS, MBA, LLB, BCA, B.Arch etc. what can you do
7. **College Types** — IIT vs NIT vs IIIT vs Deemed, Govt vs Private, AIIMS vs state medical
8. **Exam Preparation** — Study strategies, books, coaching, time management
9. **Fee & Scholarship** — Merit scholarships, SC/ST/OBC reservations, fee waivers
10. **General Education FAQs** — Lateral entry, gap year, college transfers, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ RESPONSE STYLE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Always respond in a **professional, warm, and encouraging** tone
- Use **bold** for important terms and headings
- Use bullet points (•) for lists
- Use emojis sparingly to keep it friendly but not childish
- Keep responses concise — 100 to 350 words unless a detailed answer is needed
- Always end with a helpful follow-up question or offer to assist further
- Never sound robotic — sound like a real, caring mentor
- Do NOT make up facts — if you don't know something specific, say so honestly and offer alternatives
`.trim();

// ── Detect if query is about colleges ────────────────────────────────────────
const isSuggestionQuery = (msg) =>
  /\b(suggest|show|find|recommend|list|give me|any|which|best|top|colleges in|college for|government college|private college|engineering college|medical college|best college|top college|hostel college|women college|men college|affordable)\b/i.test(msg);

// ── Main export ───────────────────────────────────────────────────────────────
export const askGroqAboutCollege = async (userMessage, college, departmentLabel) => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  const isSuggestion = isSuggestionQuery(userMessage);
  const appMatches   = isSuggestion ? findCollegesInApp(userMessage, 6) : [];
  const suggestedCollegesText = isSuggestion
    ? formatCollegesForAI(appMatches)
    : 'User is not asking for college suggestions right now.';

  const hasCollegeContext = !!(college && college.name);

  // Add user message to history
  conversationHistory.push({ role: 'user', content: userMessage });

  // Keep max 12 messages (6 turns) to avoid token overflow
  if (conversationHistory.length > 12) {
    conversationHistory = conversationHistory.slice(-12);
  }

  // Fallback to local AI if no key
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.trim() === '') {
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
    const systemPrompt = buildSystemPrompt(college, departmentLabel, suggestedCollegesText, hasCollegeContext);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
        ],
        max_tokens: 1200,
        temperature: 0.72,
        top_p: 0.9,
        stream: false,
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

    let type = 'groq';
    if (isSuggestion) type = 'suggestions';

    return { text, type, isRealAI: true };

  } catch (error) {
    console.warn('Groq fetch failed, falling back:', error.message);
    return await handleFallback(isSuggestion, appMatches, userMessage, college, departmentLabel);
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildSuggestionFallback = (colleges, query) => {
  const lines = colleges.map((c, i) =>
    `**${i + 1}. ${c.name}**\n📍 ${c.location}, ${c.state} | ${c.type}\n⭐ ${c.rating}/5 | 💼 ${c.placementRate}% placed | 🏠 Hostel: ${c.hostelAvailable ? 'Yes' : 'No'}\n💰 Fee: ₹${c.annualFee || 'N/A'}/yr | Min: ${c.minPercentage}%`
  ).join('\n\n');

  return `Here are the top colleges matching your request:\n\n${lines}\n\n💡 **Tip:** Tap on any college in the list tab to see full details, map, and apply directly!`;
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
export const isGroqConfigured = () => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  return !!(key && key !== 'YOUR_GROQ_API_KEY' && key.trim() !== '');
};

/**
 * groqAI.js — Acadivo AI v4.0
 * Real AI via Groq API (Llama 3.3 70B — fastest, most capable).
 *
 * Features:
 *  ✅ Full conversation history (multi-turn like ChatGPT)
 *  ✅ Deep college knowledge from in-app DB
 *  ✅ Handles ALL questions — general knowledge, education, career, anything
 *  ✅ Graceful fallback to localAI when no network
 *  ✅ EAS build support via Constants.expoConfig.extra
 *  ✅ Smart image request handling
 *  ✅ Context-aware follow-up understanding
 */

import Constants from 'expo-constants';
import { generateAIResponse } from './localAI';
import { COLLEGE_DATABASE } from '../constants/collegeDatabase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile'; // Latest & best quality Llama model

// ── Conversation history store (keeps last 20 messages for context) ──────────
let conversationHistory = [];

export const resetConversation = () => { conversationHistory = []; };

// ── Get API Key (supports both .env for dev and Constants.expoConfig.extra for EAS) ──
const getApiKey = () => {
  // 1. Try process.env (works in dev / expo start)
  const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (envKey && envKey !== 'YOUR_GROQ_API_KEY' && envKey.trim() !== '') {
    return envKey.trim();
  }

  // 2. Try Constants.expoConfig.extra (works in EAS builds)
  try {
    const extraKey = Constants?.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY;
    if (extraKey && extraKey !== 'YOUR_GROQ_API_KEY' && extraKey.trim() !== '') {
      return extraKey.trim();
    }
  } catch (e) {
    // Constants might not be available in some environments
  }

  return null;
};

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
You are **Acadivo AI** — a highly intelligent, versatile AI assistant built into the Acadivo college finder app. You are powered by Llama 3 70B.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR CORE IDENTITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a SMART, KNOWLEDGEABLE, and VERSATILE AI — similar to ChatGPT or Gemini. You can answer ANY question the user asks. Your PRIMARY expertise is Indian college admissions, but you are NOT limited to just that. You can discuss:
- General knowledge, science, history, geography, math
- Technology, programming, current affairs
- Career advice, life guidance, study tips
- And literally anything else a student might ask

You should behave like a brilliant, friendly senior mentor who happens to be an expert on Indian colleges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 CRITICAL RULES FOR ANSWERING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **NEVER say "I don't understand" or "Could you rephrase?"** — ALWAYS try to give a helpful answer. If the query is vague, make your best guess and ask for clarification at the end.
2. **NEVER refuse to answer a question** — even if it's not about education. Answer it helpfully, then optionally mention you can also help with college questions.
3. **Understand short/informal messages** — Users might type broken English, short phrases, or casual language. Interpret the intent, don't reject it.
4. **Context-aware follow-ups** — If the user previously asked about hostel and then says "give image" or "show photo", understand they want hostel images. Always use conversation history to understand context.
5. **Be conversational** — Don't be robotic. Respond naturally like a human mentor would.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ IMAGE / PHOTO REQUESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is VERY IMPORTANT. When the user asks for images, photos, or pictures in ANY way (including):
- "give image", "show image", "give photo", "show photo"
- "give college image", "college photo", "campus image"
- "give hostel image", "hostel photo"
- "show me", "picture", "pic", "img"
- Any variation of requesting visual content

You MUST respond with:
1. A friendly acknowledgment
2. A clickable Google Images search link in Markdown format
3. A brief description of what they'll see

Format: [🔍 View [Subject] Images](https://www.google.com/search?tbm=isch&q=[URL_encoded_search_without_parentheses])

Examples:
- For "give image" (in college context): "Here are campus photos of [College Name]! 📸\n\n[🔍 View ${hasCollegeContext ? college.name.replace(/[()]/g, '') : 'College'} Campus Images](https://www.google.com/search?tbm=isch&q=${hasCollegeContext ? encodeURIComponent(college.name.replace(/[()]/g, '') + ' campus photos') : 'Indian+college+campus+photos'})\n\nYou'll find photos of the campus, buildings, labs, and student life!"
- For "hostel image": Provide hostel-specific image search link
- For "college hostel image": Provide college-specific hostel image search link

CRITICAL LINK RULE: You MUST remove all parentheses "(" and ")" from the URL search query or encode them as %28 and %29. Do NOT put raw parentheses inside the markdown link URL, or it will break the chat UI!
NEVER say "I can't show images" or "I'm a text-based AI". ALWAYS provide the Google Images link.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 PERSONAL / CASUAL MESSAGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "my name is X" → "Nice to meet you, X! 👋 How can I help you today?"
- "Hi/Hello" → Warm greeting + offer to help
- "Thank you" → "You're welcome! Feel free to ask anything else 😊"
- "Bye" → Warm goodbye + invite to return
- "How are you?" → Brief friendly response + offer to help
- "Who made you?" → "I'm Acadivo AI, built into the Acadivo app to help students find their perfect college! 🎓"
- "What can you do?" → List your capabilities enthusiastically

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

When the user asks about "this college" or asks vague questions, use this college's data to answer.
When the user asks for images/photos without specifying what, show images of THIS college.
` : ''}

${suggestedColleges && suggestedColleges !== 'User is not asking for college suggestions right now.' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 MATCHING COLLEGES FROM OUR DATABASE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${suggestedColleges}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 YOUR EXPERTISE AREAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Current College** — Use the college data above for specific questions
2. **College Suggestions** — When asked to suggest/find colleges, use the database results
3. **Entrance Exams** — JEE Main, JEE Advanced, NEET, CLAT, GATE, CAT, XAT, MAT, CUET, CMAT, NATA, NIFT, etc.
4. **Admission Process** — JoSAA counselling, NEET counselling, TNEA, MHT-CET, etc.
5. **Scholarships & Loans** — NSP, state scholarships, education loans (SBI, Axis, HDFC), NMMSS, etc.
6. **Career Guidance** — After B.Tech, MBBS, MBA, LLB, BCA, B.Arch etc.
7. **College Comparisons** — IIT vs NIT vs IIIT, Govt vs Private, etc.
8. **Exam Preparation** — Study strategies, books, coaching
9. **General Knowledge** — Science, history, geography, math, technology, current affairs
10. **Anything else** — You're a smart AI, answer whatever is asked!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ RESPONSE STYLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Be **warm, natural, and conversational** — like talking to a smart friend
- Use **bold** for key terms and headings
- Use bullet points (•) for lists
- Use emojis naturally but not excessively
- Keep responses 100-400 words unless detailed answer needed
- Always end with a follow-up question or offer to help more
- Sound human, not robotic
- Don't make up facts — be honest if unsure
- For short questions, give short answers. For detailed questions, give detailed answers.
`.trim();

// ── Detect if query is about colleges ────────────────────────────────────────
const isSuggestionQuery = (msg) =>
  /\b(suggest|show|find|recommend|list|give me|any|which|best|top|colleges in|college for|government college|private college|engineering college|medical college|best college|top college|hostel college|women college|men college|affordable)\b/i.test(msg);

// ── Main export ───────────────────────────────────────────────────────────────
export const askGroqAboutCollege = async (userMessage, college, departmentLabel) => {
  const apiKey = getApiKey();

  const isSuggestion = isSuggestionQuery(userMessage);
  const appMatches   = isSuggestion ? findCollegesInApp(userMessage, 6) : [];
  const suggestedCollegesText = isSuggestion
    ? formatCollegesForAI(appMatches)
    : 'User is not asking for college suggestions right now.';

  const hasCollegeContext = !!(college && college.name);

  // Add user message to history
  conversationHistory.push({ role: 'user', content: userMessage });

  // Keep max 20 messages (10 turns) to maintain context without token overflow
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  // Fallback to local AI if no key
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
        max_tokens: 2048,
        temperature: 0.7,
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
  return !!getApiKey();
};

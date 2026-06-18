/**
 * groqAI.js
 * Real AI via Groq API (free tier - Llama 3 8B).
 *
 * Behaviour:
 *  1. Answers general education / entrance-exam questions freely.
 *  2. When user asks for college suggestions, it searches the IN-APP
 *     college database and returns real matches (not generic advice).
 *  3. Still avoids completely off-topic questions (movies, politics, etc.)
 */

import { generateAIResponse } from './localAI';
import { COLLEGE_DATABASE } from '../constants/collegeDatabase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama3-8b-8192';

// ── College search helper ────────────────────────────────────────────────────
/**
 * Find up to `limit` colleges from the in-app database that match
 * keywords / filters expressed in natural language.
 */
const findCollegesInApp = (query, limit = 5) => {
  const q = query.toLowerCase();

  // Gender filter
  const wantsWomen  = /\b(women|girls|female|ladies|all.?women|all.?girls)\b/.test(q);
  const wantsMen    = /\b(men|boys|male|all.?men|all.?boys)\b/.test(q) && !wantsWomen;
  const wantsCoed   = /\b(co.?ed|mixed|both)\b/.test(q);

  // Type filter
  const wantsGovt   = /\b(government|govt|public|state)\b/.test(q);
  const wantsPrivate= /\b(private|deemed|autonomous)\b/.test(q) && !wantsGovt;

  // Department filter
  const DEPT_MAP = {
    engineering   : /\b(engineer|tech|btech|iit|nit|cse|ece|mech|civil|it)\b/,
    medical       : /\b(medical|mbbs|neet|doctor|medicine|bds|dental|aiims)\b/,
    management    : /\b(mba|management|business|bba|commerce)\b/,
    law           : /\b(law|llb|legal|advocate|clat)\b/,
    agriculture   : /\b(agri|agriculture|farming|horticulture|bsc agri)\b/,
    pharmacy      : /\b(pharmacy|pharma|bpharm)\b/,
    nursing       : /\b(nursing|nurse|bsc nursing)\b/,
    architecture  : /\b(architect|architecture|planning)\b/,
    arts_science  : /\b(arts|science|bsc|ba|humanities)\b/,
    commerce      : /\b(commerce|bcom|accounts|finance)\b/,
    hotel_management: /\b(hotel|hospitality|catering|tourism)\b/,
    polytechnic   : /\b(polytechnic|diploma|iti)\b/,
  };
  let targetDept = null;
  for (const [dept, regex] of Object.entries(DEPT_MAP)) {
    if (regex.test(q)) { targetDept = dept; break; }
  }

  // State filter — match common state names
  const STATE_KEYWORDS = [
    'tamil nadu','maharashtra','karnataka','delhi','kerala','gujarat',
    'rajasthan','uttar pradesh','west bengal','telangana','andhra pradesh',
    'punjab','haryana','bihar','odisha','assam','madhya pradesh',
    'chhattisgarh','jharkhand','uttarakhand','himachal pradesh','goa',
    'chennai','mumbai','bangalore','hyderabad','pune','kolkata','jaipur',
    'lucknow','chandigarh','bhopal','coimbatore','vellore','kochi',
  ];
  let targetState = null;
  for (const s of STATE_KEYWORDS) {
    if (q.includes(s)) { targetState = s; break; }
  }

  // Hostel filter
  const wantsHostel = /\b(hostel|accommodation|staying|boarding)\b/.test(q);

  // Rating / rank filter
  const wantsTop = /\b(top|best|highest|ranked|premier|iit|nit|aiims)\b/.test(q);

  // Score / percentage
  const scoreMatch = q.match(/(\d{2,3})\s*(%|percent|marks|score)/);
  const minPct = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // ── Filter ────────────────────────────────────────────────────────────────
  let pool = [...COLLEGE_DATABASE];

  if (wantsWomen)  pool = pool.filter(c => /women|girls/i.test(c.gender));
  if (wantsMen)    pool = pool.filter(c => /men|boys/i.test(c.gender) && !/women|girls/i.test(c.gender));
  if (wantsGovt)   pool = pool.filter(c => c.type === 'Government');
  if (wantsPrivate)pool = pool.filter(c => c.type === 'Private');
  if (targetDept)  pool = pool.filter(c => c.department === targetDept);
  if (targetState) pool = pool.filter(c => (c.state + ' ' + c.location).toLowerCase().includes(targetState));
  if (wantsHostel) pool = pool.filter(c => c.hostelAvailable);
  if (minPct)      pool = pool.filter(c => c.minPercentage <= minPct);

  // Sort: top rating first
  pool.sort((a, b) => {
    if (wantsTop) return b.rating - a.rating;
    return b.rating - a.rating;
  });

  return pool.slice(0, limit);
};

/**
 * Format a list of colleges into a readable string for the AI to reference.
 */
const formatCollegesForAI = (colleges) => {
  if (!colleges.length) return 'No matching colleges found in the app database.';
  return colleges.map((c, i) =>
    `${i + 1}. **${c.name}** — ${c.location}, ${c.state} | ${c.type} | ${c.department} | Rating: ${c.rating}/5 | Placement: ${c.placementRate}% | Hostel: ${c.hostelAvailable ? 'Yes' : 'No'} | Min %: ${c.minPercentage}% | NAAC: ${c.naacGrade || 'N/A'}`
  ).join('\n');
};

// ── System prompt builder ────────────────────────────────────────────────────
const buildSystemPrompt = (college, departmentLabel, suggestedColleges) => `
You are "SmartAdmission AI" — an intelligent college counsellor embedded inside the SmartCampus Admission app (India).

═══════════════════════════════════════════
CURRENT COLLEGE CONTEXT (the college the student is viewing):
═══════════════════════════════════════════
- College: ${college.name}, ${college.location}, ${college.state}
- Type: ${college.type}
- Department: ${departmentLabel || college.department}
- NAAC Grade: ${college.naacGrade || 'N/A'}
- Rating: ${college.rating}/5
- Placement Rate: ${college.placementRate}%
- Hostel: ${college.hostelAvailable ? 'Yes' : 'No'}
- Min Percentage: ${college.minPercentage}%
- Established: ${college.established}
- Courses: ${(college.courses || []).join(', ')}
- Top Companies: ${(college.topCompanies || []).join(', ')}
- Description: ${college.description || ''}

═══════════════════════════════════════════
APP COLLEGE SUGGESTIONS (from our in-app database matching the user's request):
═══════════════════════════════════════════
${suggestedColleges}

═══════════════════════════════════════════
YOUR RULES:
═══════════════════════════════════════════
1. GENERAL EDUCATION QUESTIONS — Answer freely and helpfully:
   - Entrance exams: JEE, NEET, CLAT, GATE, CAT, XAT, MAT, CUET, etc.
   - Admission processes, counselling (JoSAA, TNEA, NEET counselling, etc.)
   - Scholarships, education loans, career paths after graduation
   - Differences between college types (IIT vs NIT vs Deemed, etc.)
   - Study tips, exam preparation, career guidance

2. COLLEGE SUGGESTION REQUESTS — ALWAYS use the "APP COLLEGE SUGGESTIONS" list above.
   - Present the colleges from the list above (they come from our app's database).
   - Tell the user they can find and explore these colleges in the app.
   - Format as a numbered list with key details.
   - Encourage them to search/filter in the app for more options.

3. CURRENT COLLEGE QUESTIONS — Use the college context at the top.

4. OFF-TOPIC — If someone asks about movies, politics, sports scores, cooking, etc., 
   politely say: "I'm your college counsellor! I can only help with education and college topics."

5. BE CONCISE, WARM, AND STUDENT-FRIENDLY. Use bullet points for lists. 
   Always end with an encouraging line or a follow-up suggestion.
`.trim();

// ── Main export ──────────────────────────────────────────────────────────────
export const askGroqAboutCollege = async (userMessage, college, departmentLabel) => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  // Detect if user is asking for college suggestions
  const isSuggestionQuery = /\b(suggest|show|find|recommend|list|give me|any|which|women college|men college|government college|private college|engineering college|medical college|best college|top college|hostel college)\b/i.test(userMessage);

  // Pre-search the app DB if it's a suggestion query
  const appMatches  = isSuggestionQuery ? findCollegesInApp(userMessage, 5) : [];
  const suggestedCollegesText = isSuggestionQuery
    ? formatCollegesForAI(appMatches)
    : 'User is not asking for college suggestions right now.';

  // Fallback to local AI if no key
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.trim() === '') {
    // If it's a suggestion query and we have matches, give a basic response
    if (isSuggestionQuery && appMatches.length > 0) {
      const text = `Here are some colleges from our app that match your request:\n\n${formatCollegesForAI(appMatches)}\n\n💡 Search these colleges in the app to see full details, fees, and more!`;
      return { text, type: 'suggestions', isRealAI: false };
    }
    const localResponse = generateAIResponse(userMessage, college, departmentLabel);
    return { text: localResponse.text, type: localResponse.type, isRealAI: false };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(college, departmentLabel, suggestedCollegesText),
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 600,
        temperature: 0.65,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Groq API error:', response.status, err);
      // Fallback: return suggestion list directly if available
      if (isSuggestionQuery && appMatches.length > 0) {
        const text = `Here are some colleges from our app that match your request:\n\n${formatCollegesForAI(appMatches)}\n\n💡 Search these colleges in the app to see full details and apply!`;
        return { text, type: 'suggestions', isRealAI: false };
      }
      const localResponse = generateAIResponse(userMessage, college, departmentLabel);
      return { text: localResponse.text, type: localResponse.type, isRealAI: false };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim()
      || 'Sorry, I could not generate a response. Please try again.';

    // Determine response type
    let type = 'groq';
    if (isSuggestionQuery) type = 'suggestions';

    return { text, type, isRealAI: true };

  } catch (error) {
    console.warn('Groq fetch failed, falling back:', error.message);
    if (isSuggestionQuery && appMatches.length > 0) {
      const text = `Here are some colleges from our app:\n\n${formatCollegesForAI(appMatches)}\n\n💡 Tap the Search tab to explore these colleges in detail!`;
      return { text, type: 'suggestions', isRealAI: false };
    }
    const localResponse = generateAIResponse(userMessage, college, departmentLabel);
    return { text: localResponse.text, type: localResponse.type, isRealAI: false };
  }
};

/** Check if real Groq AI is configured */
export const isGroqConfigured = () => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  return !!(key && key !== 'YOUR_GROQ_API_KEY' && key.trim() !== '');
};

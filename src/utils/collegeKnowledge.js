/**
 * collegeKnowledge.js — Local College Database AI Engine v2.0
 *
 * Answers ANY question correctly by:
 *  1. Detecting what the user is asking (count, list, fees, placements, etc.)
 *  2. Searching/filtering the full mockColleges database
 *  3. Returning a rich, accurate, formatted answer
 */

import { mockColleges } from '../data/mockColleges';
import { analyzeText } from './sentimentAnalyzer';
import { answerCounselingQuestion } from './academicCounselor';

// ─── Text normaliser ──────────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Tokenise query (remove noise & generic meta words) ───────────────────────
const STOP = new Set([
  'tell', 'me', 'about', 'what', 'is', 'are', 'the', 'a', 'an', 'in', 'at',
  'of', 'for', 'and', 'or', 'to', 'from', 'how', 'many', 'much', 'there',
  'which', 'do', 'does', 'give', 'show', 'list', 'all', 'best', 'top',
  'colleges', 'college', 'university', 'institute', 'institutions',
  // Generic meta words that must not trigger a false-positive college match
  'detail', 'details', 'info', 'information', 'know', 'knows', 'have', 'has',
  'everything', 'data', 'you', 'can', 'will', 'would', 'could', 'should',
  'please', 'any', 'anything', 'something', 'full', 'overview', 'real', 'time',
  'live', 'updated', 'accurate', 'true', 'false', 'correct', 'what', 'where',
  'when', 'why', 'us', 'my', 'your', 'need', 'want', 'get', 'got', 'give',
  'tell', 'say', 'see', 'check', 'find', 'search', 'provide', 'available',
  'recommend', 'recommends', 'recommendation', 'right', 'choose', 'choosing',
  'choice', 'ai', 'system', 'app', 'advisor', 'adviser', 'counselor', 'counsellor',
]);

function tokenise(query) {
  return norm(query).split(/\s+/).filter(t => t.length > 1 && !STOP.has(t));
}

// ─── Score how well a college matches a set of tokens ────────────────────────
function scoreCollege(college, tokens) {
  const haystack = norm([
    college.name,
    college.location,
    college.state,
    college.type,
    college.course,
    ...(college.availableCourses || []),
    ...(college.departments || []).map(d => d.name),
    ...(college.topRecruiters || []),
  ].join(' '));

  let score = 0;
  for (const t of tokens) {
    if (t.length < 2 || STOP.has(t)) continue;
    if (haystack.includes(t)) score += t.length > 4 ? 4 : 2;
  }
  return score;
}

// ─── Find top matching colleges ───────────────────────────────────────────────
export function searchColleges(query, max = 10) {
  const tokens = tokenise(query);
  if (!tokens.length) return [];

  return mockColleges
    .map(c => ({ c, s: scoreCollege(c, tokens) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map(x => x.c);
}

export function findCollege(query) {
  const tokens = tokenise(query);
  if (!tokens.length) return null;
  return searchColleges(query, 1)[0] || null;
}

// ─── Question type detector ───────────────────────────────────────────────────
function detectQuestionType(query) {
  const q = norm(query);

  // Count questions
  if (/how many|count|total number|number of/.test(q)) return 'count';

  // List & recommendation questions
  if (/list|show all|give all|all colleges|colleges in|colleges with|colleges for|colleges at|suggest|recommend|find me|help me choose|which college/.test(q)) return 'list';

  // Comparison & advice on choosing
  if (/compare|vs\b|versus|better than|difference between|how to choose|help comparing/.test(q)) return 'compare';

  // Specific aspect questions
  if (/fee|cost|tuition|price|expensive|cheap|afford|how much|annual fee/.test(q)) return 'fees';
  if (/scholarship|financial aid|free seat|concession/.test(q)) return 'scholarship';
  if (/loan|bank loan|education loan/.test(q)) return 'loan';
  if (/placement|job|recruit|salary|package|lpa|ctc|hire|placed|company|companies|highest package|minimum package|expected package/.test(q)) return 'placements';
  if (/hostel|accommodation|dorm|room|stay|pg|boarding|residential/.test(q)) return 'hostel';
  if (/transport|bus|vehicle|cab|shuttle|distance|travel|how far/.test(q)) return 'transport';
  if (/course|branch|program|stream|degree|btech|subject|offer|department|dept|which course|choosing the right course/.test(q)) return 'courses';
  if (/location|address|where|city|state|map|reach|hometown|near my/.test(q)) return 'location';
  if (/rating|rank|naac|nirf|grade|review|accredit|standing|large campus/.test(q)) return 'rating';
  if (/admit|admission|apply|eligib|cutoff|marks|percent|percentage|join|seat|councelling|counselling|quota|reservation|management quota|merit|when.*join/.test(q)) return 'admission';
  if (/recruiter|top compan|mnc|companies|industry partner/.test(q)) return 'recruiters';
  if (/sport|playground|gym|games|extra|club|extracurricular|activity|activities/.test(q)) return 'activities';
  if (/lab|laboratory|research|practical|theory|theoretical|equipment|facilities/.test(q)) return 'labs';
  if (/career|future|after graduation|higher studies|abroad|study abroad|govt job|government job|business|startup|entrepreneur/.test(q)) return 'career';
  if (/coed|co educational|gender|women|girls|boys|mens|womens/.test(q)) return 'gender';
  if (/autonomous|affiliated|university/.test(q)) return 'affiliation';
  if (/about|overview|detail|info|everything|full|describe|explain/.test(q)) return 'general';

  return 'general';
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function filterByLocation(colleges, query) {
  const q = norm(query);
  return colleges.filter(c =>
    q.includes(norm(c.location)) || q.includes(norm(c.state))
  );
}

function filterByType(colleges, query) {
  const q = norm(query);
  if (q.includes('government') || q.includes('govt') || q.includes('public'))
    return colleges.filter(c => c.type === 'Government' || c.isPrivate === false);
  if (q.includes('private'))
    return colleges.filter(c => c.type === 'Private' || c.isPrivate === true);
  return colleges;
}

function filterByFeature(colleges, query) {
  const q = norm(query);
  if (/with hostel|hostel available|has hostel/.test(q))
    return colleges.filter(c => c.hostel?.available);
  if (/without hostel|no hostel/.test(q))
    return colleges.filter(c => !c.hostel?.available);
  if (/with transport|has bus|has transport/.test(q))
    return colleges.filter(c => c.transport?.provided);
  return colleges;
}

function filterByCourse(colleges, query) {
  const q = norm(query);
  const courseKeywords = ['cse', 'ece', 'mech', 'civil', 'it', 'ai', 'ds', 'mba', 'mbbs', 'btech', 'bsc', 'bcom'];
  const matchedKeyword = courseKeywords.find(k => q.includes(k));
  if (!matchedKeyword) return colleges;
  return colleges.filter(c => {
    const hay = norm([...(c.availableCourses || []), ...(c.departments || []).map(d => d.name)].join(' '));
    return hay.includes(matchedKeyword);
  });
}

// ─── Format a single college card ────────────────────────────────────────────
export function formatCollegeCard(c) {
  const hostel = c.hostel?.available
    ? `✅ Available (${[c.hostel.ac && 'AC', c.hostel.nonAc && 'Non-AC'].filter(Boolean).join(', ')})`
    : '❌ Not Available';
  const transport = c.transport?.provided ? '✅ Yes' : '❌ No';
  const courses   = (c.availableCourses || []).join(', ') || c.course || 'N/A';
  const depts     = (c.departments || []).map(d => d.name).join(', ') || 'N/A';
  const recs      = (c.topRecruiters || []).slice(0, 5).join(', ') || 'N/A';

  return [
    `🏛️ **${c.name}**`,
    `📍 ${c.location}, ${c.state} · ${c.type || 'N/A'} · ⭐ ${c.rating || 'N/A'}/5`,
    ``,
    `**Details:**`,
    `• 💰 Fees: **${c.fees || 'N/A'}**`,
    `• 📊 Min. Eligibility: **${c.minPercentage || 'N/A'}%** in 12th`,
    `• 🎓 Courses: ${courses}`,
    `• 🏢 Departments: ${depts}`,
    `• 💼 Placements/Year: **${c.placementsPerYear || 'N/A'}** students`,
    `• 🏆 Top Recruiters: ${recs}`,
    `• 🏠 Hostel: ${hostel}`,
    `• 🚌 Transport: ${transport}`,
  ].join('\n');
}

// ─── Build a compact list item for multi-college results ─────────────────────
function listItem(c) {
  return [
    `**${c.name}**`,
    `📍 ${c.location}, ${c.state} · ${c.type || 'N/A'} · ⭐ ${c.rating || 'N/A'}/5 · 💰 ${c.fees || 'N/A'}`,
    `💼 ${c.placementsPerYear || 'N/A'} placements/yr · 🎓 Min: ${c.minPercentage || 'N/A'}%`,
    ``,
  ].join('\n');
}

// ─── Aspect-specific answer builders ─────────────────────────────────────────
function answerFees(c) {
  return [
    `💰 **Fee Structure — ${c.name}**\n`,
    `Annual Fees: **${c.fees || 'N/A'}**`,
    `Min. Eligibility: **${c.minPercentage || 'N/A'}%** in 12th`,
    `Type: ${c.type || 'N/A'} · ⭐ ${c.rating || 'N/A'}/5`,
    ``,
    `**Additional Info:**`,
    `• 🎓 Merit scholarships available for top scorers`,
    `• 🏦 Education loans: SBI, HDFC, Axis Bank`,
    `• 🏠 Hostel fees are charged separately`,
    ``,
    `💡 *Want to know about hostel, courses, or placements? Just ask!*`,
  ].join('\n');
}

function answerPlacements(c) {
  const recruiters = (c.topRecruiters || []).join(', ') || 'N/A';
  return [
    `💼 **Placement Report — ${c.name}**\n`,
    `• 📊 Students Placed/Year: **${c.placementsPerYear || 'N/A'}**`,
    `• 🏆 Top Recruiters: **${recruiters}**`,
    `• ⭐ Rating: ${c.rating || 'N/A'}/5`,
    `• 📍 ${c.location}, ${c.state}`,
    ``,
    `**Highlights:**`,
    `• 💡 Active placement cell with campus recruitment drives`,
    `• 🌐 Both IT and core engineering companies visit`,
    `• 📈 Internship opportunities from 2nd year`,
    ``,
    `💡 *Ask about fees, courses, or admission for more details!*`,
  ].join('\n');
}

function answerHostel(c) {
  const h = c.hostel;
  if (!h?.available) {
    return [
      `🏠 **Hostel — ${c.name}**\n`,
      `❌ On-campus hostel is **not available**.`,
      ``,
      `**Alternatives:**`,
      `• 🏘️ Affordable PGs and apartments nearby`,
      `• 🚌 College transport available: ${c.transport?.provided ? '✅ Yes' : '❌ No'}`,
      `• 📋 Contact student affairs office for accommodation help`,
    ].join('\n');
  }
  const types   = [h.ac && 'AC', h.nonAc && 'Non-AC', h.fan && 'Fan'].filter(Boolean).join(', ');
  const sharing = (h.sharing || []).join(', ');
  return [
    `🏠 **Hostel Facilities — ${c.name}**\n`,
    `✅ On-campus hostel **available**!`,
    ``,
    `• Room Types: **${types}**`,
    `• Sharing: **${sharing}**`,
    ``,
    `**Facilities:**`,
    `• 📶 High-speed WiFi`,
    `• 🍽️ Hygienic mess & canteen`,
    `• 🔒 24/7 security & CCTV`,
    `• 📚 Study rooms & recreation`,
    ``,
    `💡 *Apply early — rooms fill up fast!*`,
  ].join('\n');
}

function answerCourses(c) {
  return [
    `🎓 **Courses — ${c.name}**\n`,
    `**Programs Available:**`,
    ...(c.availableCourses || [c.course || 'N/A']).map(x => `• ${x}`),
    ``,
    `**Departments:**`,
    ...(c.departments || []).map(d => `• ${d.name}  (${d.startTime} – ${d.endTime})`),
    ``,
    `📍 ${c.location}, ${c.state} · ⭐ ${c.rating || 'N/A'}/5 · 💰 ${c.fees || 'N/A'}`,
    ``,
    `💡 *Ask about fees, placements, or admission for any course!*`,
  ].join('\n');
}

function answerAdmission(c) {
  return [
    `📋 **Admission Guide — ${c.name}**\n`,
    `• 📊 Minimum Eligibility: **${c.minPercentage || 'N/A'}%** in 12th`,
    `• 🏛️ Type: ${c.type || 'N/A'}`,
    `• 📍 ${c.location}, ${c.state}`,
    ``,
    `**Steps to Apply:**`,
    `1. 📝 Register on the official college portal`,
    `2. 📄 Upload documents (mark sheets, ID proof)`,
    `3. 💳 Pay application fee`,
    `4. 📊 Attend counselling / merit selection`,
    `5. ✅ Confirm your seat!`,
    ``,
    `💡 *Ask about courses, fees, or hostel for more!*`,
  ].join('\n');
}

function answerLocation(c) {
  return [
    `📍 **Location — ${c.name}**\n`,
    `📌 **${c.location}, ${c.state}, India**`,
    ``,
    `**How to Reach:**`,
    `• 🚌 Public buses well-connected`,
    `• 🚆 Nearest railway station accessible`,
    `• ✈️ Airport in ${c.location}`,
    `• 🗺️ Google Maps: "${c.name}"`,
    ``,
    `🚌 Transport: ${c.transport?.provided ? '✅ College transport available' : '❌ No college transport'}`,
  ].join('\n');
}

function answerRating(c) {
  return [
    `⭐ **Rating & Info — ${c.name}**\n`,
    `• ⭐ Overall Rating: **${c.rating || 'N/A'}/5**`,
    `• 🏛️ Type: **${c.type || 'N/A'}**`,
    `• 📍 ${c.location}, ${c.state}`,
    `• 💼 Placements: **${c.placementsPerYear || 'N/A'}** students/year`,
    `• 🎓 Min. Eligibility: **${c.minPercentage || 'N/A'}%**`,
    `• 💰 Fees: **${c.fees || 'N/A'}**`,
    ``,
    `💡 *Want to compare with another college? Just ask!*`,
  ].join('\n');
}

function answerRecruiters(c) {
  return [
    `🏆 **Top Recruiters — ${c.name}**\n`,
    ...(c.topRecruiters || ['N/A']).map((r, i) => `${i + 1}. **${r}**`),
    ``,
    `• 💼 ${c.placementsPerYear || 'N/A'} students placed per year`,
    `• ⭐ ${c.rating || 'N/A'}/5 | 📍 ${c.location}, ${c.state}`,
    ``,
    `💡 *Ask about salary packages or placement percentage for more!*`,
  ].join('\n');
}

function answerTransport(c) {
  return [
    `🚌 **Transport — ${c.name}**\n`,
    c.transport?.provided
      ? [
          `✅ College transport **is provided!**`,
          `• AC buses: ${c.transport.ac ? '✅' : '❌'}`,
          `• Non-AC buses: ${c.transport.nonAc ? '✅' : '❌'}`,
        ].join('\n')
      : `❌ College transport **not provided**.\n• Use public buses or arrange private transport.`,
    ``,
    `📍 ${c.location}, ${c.state}`,
  ].join('\n');
}

function answerCompare(colleges) {
  const [c1, c2] = colleges;
  const row = (label, v1, v2) => `| ${label} | ${v1 || 'N/A'} | ${v2 || 'N/A'} |`;
  const n1 = c1.name.split('(')[0].trim();
  const n2 = c2.name.split('(')[0].trim();
  return [
    `🔄 **College Comparison**\n`,
    `| Feature | ${n1} | ${n2} |`,
    `|---------|------|------|`,
    row('📍 Location', `${c1.location}, ${c1.state}`, `${c2.location}, ${c2.state}`),
    row('🏛️ Type', c1.type, c2.type),
    row('⭐ Rating', `${c1.rating}/5`, `${c2.rating}/5`),
    row('💰 Fees/yr', c1.fees, c2.fees),
    row('🎓 Min %', `${c1.minPercentage}%`, `${c2.minPercentage}%`),
    row('💼 Placements', `${c1.placementsPerYear}/yr`, `${c2.placementsPerYear}/yr`),
    row('🏠 Hostel', c1.hostel?.available ? '✅' : '❌', c2.hostel?.available ? '✅' : '❌'),
    row('🚌 Transport', c1.transport?.provided ? '✅' : '❌', c2.transport?.provided ? '✅' : '❌'),
    ``,
    `💡 *Ask for more details on fees, placements, or hostel for either college!*`,
  ].join('\n');
}

// ─── Build a count answer ─────────────────────────────────────────────────────
function answerCount(colleges, label) {
  const n = colleges.length;
  if (n === 0) {
    return `🔍 No colleges found matching **"${label}"**.\n\nTry: "colleges in Chennai", "engineering colleges Tamil Nadu", or "private colleges".`;
  }
  const lines = [
    `🔢 **There are ${n} college${n > 1 ? 's' : ''} matching "${label}":**\n`,
  ];
  for (const c of colleges.slice(0, 10)) {
    lines.push(`• **${c.name}** — ${c.location}, ${c.state} · ⭐ ${c.rating || 'N/A'}/5`);
  }
  if (n > 10) lines.push(`\n_...and ${n - 10} more._`);
  lines.push(`\n💡 *Ask about any specific college for fees, placements, hostel, and more!*`);
  return lines.join('\n');
}

// ─── Build a list answer ──────────────────────────────────────────────────────
function answerList(colleges, label) {
  if (colleges.length === 0) {
    return `🔍 No colleges found for **"${label}"**.\n\nTry: "colleges in Chennai", "colleges with hostel", or "private engineering colleges Tamil Nadu".`;
  }
  const lines = [
    `🏛️ **${colleges.length} college${colleges.length > 1 ? 's' : ''} for "${label}":**\n`,
  ];
  for (const c of colleges.slice(0, 8)) {
    lines.push(listItem(c));
  }
  if (colleges.length > 8) {
    lines.push(`_...and ${colleges.length - 8} more. Narrow down by city, course, or type!_\n`);
  }
  lines.push(`💡 *Ask about any specific college for full details!*`);
  return lines.join('\n');
}

function answerScholarship(c) {
  return [
    `🎓 **Scholarships & Financial Aid — ${c.name}**\n`,
    `• 🏆 Merit Scholarships: Available for students with high 12th percentage (above ${c.minPercentage || 80}%)`,
    `• 🏛️ Government Quota & First Graduate Scholarships applicable`,
    `• 💼 Fee Structure: **${c.fees || 'N/A'}**`,
    `• 🏦 Educational Loan support from major banks (SBI, HDFC, Canara)`,
    ``,
    `💡 *Need help applying for scholarships or loans? Just ask!*`,
  ].join('\n');
}

function answerLoan(c) {
  return [
    `🏦 **Education Loans — Guidance**\n`,
    `• 📄 Most accredited institutions (${c ? c.name : 'all major colleges'}) support nationalized & private bank education loans.`,
    `• 🏛️ Required Documents: Admission letter, 10th & 12th Marksheets, Fee Structure breakdown, Income Certificate.`,
    `• 💳 Scheme Options: Vidya Lakshmi Portal (Govt. of India scheme for interest subsidy).`,
    ``,
    `💡 *Contact the college admission cell for bonafide certificate to submit to banks!*`,
  ].join('\n');
}

function answerActivities(c) {
  return [
    `⚽ **Sports & Extracurricular Activities — ${c ? c.name : 'Campus Life'}**\n`,
    `• 🏆 Sports Facilities: Outdoor grounds (Cricket/Football), Indoor sports courts, Gymnasium.`,
    `• 🎭 Clubs: Cultural, Robotics, Coding, Literary, NSS & NCC units.`,
    `• 🌟 Annual Fests: Cultural symposiums and technical hackathons held yearly.`,
    ``,
    `💡 *A vibrant campus life helps build leadership and networking skills!*`,
  ].join('\n');
}

function answerLabs(c) {
  return [
    `🔬 **Laboratories & Research Infrastructure — ${c ? c.name : 'Academic Infrastructure'}**\n`,
    `• 💻 Computing Labs: High-speed internet, specialized AI/DS & Software development setups.`,
    `• ⚙️ Core Labs: Department-specific advanced machinery, electronics circuits & testing labs.`,
    `• 📚 Research Focus: Hands-on project work integrated into the curriculum from 2nd year.`,
    ``,
    `💡 *Practical learning and research exposure give a strong edge in campus placements!*`,
  ].join('\n');
}

function answerCareer(c) {
  return [
    `🎯 **Career & Future Pathways**\n`,
    `• 💼 Direct Job Placements: Campus drives by top companies.`,
    `• 🎓 Higher Studies: Preparation for GATE, CAT, GRE, MS abroad.`,
    `• 🏛️ Public Sector & Govt Jobs: Guidance for UPSC, SSC, PSU exams.`,
    `• 🚀 Entrepreneurship: Campus incubation centers & startup support.`,
    ``,
    `💡 *Which specific career track are you most interested in pursuing?*`,
  ].join('\n');
}

// ─── Route a single-college aspect question ───────────────────────────────────
function answerAspect(college, type) {
  switch (type) {
    case 'fees':        return answerFees(college);
    case 'placements':  return answerPlacements(college);
    case 'hostel':      return answerHostel(college);
    case 'courses':     return answerCourses(college);
    case 'admission':   return answerAdmission(college);
    case 'location':    return answerLocation(college);
    case 'rating':      return answerRating(college);
    case 'recruiters':  return answerRecruiters(college);
    case 'transport':   return answerTransport(college);
    case 'scholarship': return answerScholarship(college);
    case 'loan':        return answerLoan(college);
    case 'activities':  return answerActivities(college);
    case 'labs':        return answerLabs(college);
    case 'career':      return answerCareer(college);
    default:            return formatCollegeCard(college);
  }
}

// ─── Main exported function ───────────────────────────────────────────────────
/**
 * queryCollegeKnowledge — answers any college question from the local DB.
 * @param {string} query
 * @returns {{ text: string, sentiment: object|null, found: boolean }}
 */
export function queryCollegeKnowledge(query) {
  // ── First check if this is an Academic / Career Counseling Question ────────
  const counselingAdvice = answerCounselingQuestion(query);
  if (counselingAdvice) {
    return {
      text:      counselingAdvice,
      sentiment: analyzeText(counselingAdvice),
      found:     true,
    };
  }

  const type = detectQuestionType(query);

  // ── COUNT: "how many saveetha colleges" ──────────────────────────────────
  if (type === 'count') {
    const matches = searchColleges(query, 200);
    const filtered = filterByLocation(filterByType(filterByCourse(matches, query), query), query);
    const result = filtered.length > 0 ? filtered : matches;
    return {
      text:      answerCount(result, query),
      sentiment: null,
      found:     result.length > 0,
    };
  }

  // ── LIST: "show all colleges in Tamil Nadu" ──────────────────────────────
  if (type === 'list') {
    let matches = searchColleges(query, 200);
    matches = filterByType(filterByFeature(filterByCourse(matches, query), query), query);
    const byLoc = filterByLocation(matches, query);
    const result = byLoc.length > 0 ? byLoc : matches;
    return {
      text:      answerList(result.slice(0, 20), query),
      sentiment: analyzeText(result.map(c => c.name).join(' ')),
      found:     result.length > 0,
    };
  }

  // ── COMPARE: "compare IIT vs NIT" ───────────────────────────────────────
  if (type === 'compare') {
    const matches = searchColleges(query, 3);
    if (matches.length >= 2) {
      return { text: answerCompare(matches), sentiment: null, found: true };
    }
  }

  // ── SPECIFIC COLLEGE + ASPECT ────────────────────────────────────────────
  const college = findCollege(query);
  if (college) {
    const text = answerAspect(college, type);
    return { text, sentiment: analyzeText(text), found: true };
  }

  // ── BROAD SEARCH (no specific college matched) ───────────────────────────
  const broad = searchColleges(query, 10);
  if (broad.length > 0) {
    // If only one found and it's a specific aspect question, answer it
    if (broad.length === 1 && type !== 'general') {
      const text = answerAspect(broad[0], type);
      return { text, sentiment: analyzeText(text), found: true };
    }
    // Multiple results — show list
    return {
      text:      answerList(broad, query),
      sentiment: analyzeText(broad.map(c => c.name).join(' ')),
      found:     true,
    };
  }

  // ── NON-COLLEGE SPECIFIC ASPECT QUESTIONS (e.g. "Do you need hostel facilities?") ──
  if (['scholarship', 'loan', 'activities', 'labs', 'career'].includes(type)) {
    const text = answerAspect(null, type);
    return { text, sentiment: analyzeText(text), found: true };
  }

  return { text: null, sentiment: null, found: false };
}

/**
 * localAI.js — Acadivo Smart Local AI v4.0
 * 
 * A significantly improved offline AI engine that handles ANY question gracefully.
 * Used as fallback when Groq API is not available.
 *
 * Features:
 *  ✅ 30+ intents with fuzzy matching
 *  ✅ Context-aware follow-up understanding
 *  ✅ Image request handling (Google Images links)
 *  ✅ General knowledge responses
 *  ✅ NEVER says "I don't understand" — always gives a helpful answer
 *  ✅ Natural, ChatGPT-like conversational style
 */

// ── Context tracker for follow-up understanding ──────────────────────────────
let lastIntent = null;
let lastTopic = null;  // stores the last subject discussed (e.g., "hostel", "placement")

// ── Helper ───────────────────────────────────────────────────────────────────
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Intent definitions with weighted keyword + regex matching ────────────────
const INTENTS = [
  {
    name: 'image_request',
    keywords: ['image', 'images', 'photo', 'photos', 'picture', 'pictures', 'pic', 'pics', 'img', 'snap', 'snaps', 'gallery', 'visual'],
    patterns: [
      /\b(give|show|send|display|get|provide|share|view)\s+(me\s+)?(an?\s+)?(image|photo|picture|pic|img|snap)/i,
      /\b(image|photo|picture|pic|img)\s*(of|for|about)?\b/i,
      /\b(college|campus|hostel|lab|library|class|building)\s+(image|photo|picture|pic|img)/i,
      /\b(image|photo|picture|pic|img)\s+(of\s+)?(college|campus|hostel|lab|library|class|building)/i,
      /\bgive\s+(college|campus|hostel)\b/i,
      /\bshow\s+(college|campus|hostel)\b/i,
    ],
    weight: 10, // High priority — catch image requests first
  },
  {
    name: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening', 'sup', 'hola', 'namaste', 'vanakkam'],
    patterns: [/^(hi|hello|hey|greetings|hola|namaste|vanakkam|yo|sup)\b/i, /good\s+(morning|afternoon|evening|night)/i],
    weight: 5,
  },
  {
    name: 'farewell',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'tata', 'cya', 'goodnight'],
    patterns: [/\b(bye|goodbye|see\s*you|later|tata|cya|good\s*night|take\s*care)\b/i],
    weight: 5,
  },
  {
    name: 'thanks',
    keywords: ['thanks', 'thank', 'thankyou', 'thx', 'tq', 'appreciate', 'grateful'],
    patterns: [/\b(thanks|thank\s*you|thx|tq|appreciate|grateful)\b/i],
    weight: 5,
  },
  {
    name: 'identity',
    keywords: ['who', 'what', 'your', 'name', 'you', 'yourself', 'made', 'built', 'created', 'developer'],
    patterns: [
      /who\s+(are|r)\s+you/i, /what\s+(are|r)\s+you/i, /your\s+name/i,
      /who\s+(made|built|created|developed)\s+(you|this)/i,
      /what\s+can\s+you\s+do/i, /what\s+do\s+you\s+do/i,
      /tell\s+me\s+about\s+yourself/i,
    ],
    weight: 6,
  },
  {
    name: 'personal_intro',
    keywords: [],
    patterns: [
      /my\s+name\s+is\s+\w+/i, /i\s+am\s+\w+/i, /i'm\s+\w+/i,
      /i\s+(am|m)\s+(a\s+)?(student|12th|class|studying|from)/i,
      /i\s+scored\s+\d+/i, /my\s+marks/i, /my\s+score/i,
      /i\s+got\s+\d+/i,
    ],
    weight: 4,
  },
  {
    name: 'fees',
    keywords: ['fee', 'fees', 'cost', 'tuition', 'money', 'price', 'pay', 'expensive', 'cheap', 'affordable', 'budget'],
    patterns: [/\b(fee|fees|cost|tuition|price)\b/i, /how much.*(pay|cost)/i, /\bfee\s*structure\b/i],
    weight: 3,
  },
  {
    name: 'hostel',
    keywords: ['hostel', 'accommodation', 'stay', 'room', 'boarding', 'pg', 'dormitory', 'dorm', 'residential', 'living'],
    patterns: [/\b(hostel|room|accommodation|staying|dormitory|dorm|boarding)\b/i, /where.*(stay|live)/i],
    weight: 3,
  },
  {
    name: 'placement',
    keywords: ['placement', 'job', 'recruit', 'career', 'salary', 'package', 'company', 'hire', 'employ', 'lpa', 'ctc', 'internship', 'placed'],
    patterns: [/\b(placement|job|recruit|package|salary|lpa|ctc|internship|placed)\b/i, /highest\s+package/i, /average\s+salary/i],
    weight: 3,
  },
  {
    name: 'courses',
    keywords: ['course', 'branch', 'program', 'stream', 'degree', 'btech', 'mbbs', 'mba', 'bsc', 'bcom', 'study', 'offer', 'specialization', 'major', 'curriculum', 'syllabus'],
    patterns: [/\b(course|courses|branch|program|degree|btech|syllabus|curriculum)\b/i, /what.*(teach|study|offer)/i],
    weight: 3,
  },
  {
    name: 'admission',
    keywords: ['admission', 'eligible', 'eligibility', 'qualify', 'apply', 'application', 'cutoff', 'minimum', 'marks', 'percentage', 'rank', 'join', 'seat', 'intake', 'counselling', 'counseling'],
    patterns: [/\b(admission|apply|cutoff|eligibility|percentage|marks|counselling|counseling)\b/i, /how.*(join|get in|apply|admit)/i],
    weight: 3,
  },
  {
    name: 'facilities',
    keywords: ['facility', 'facilities', 'infrastructure', 'library', 'lab', 'laboratory', 'sports', 'canteen', 'wifi', 'transport', 'bus', 'medical', 'gym', 'swimming', 'auditorium', 'cafeteria'],
    patterns: [/\b(facility|facilities|infrastructure|library|canteen|wifi|transport|gym|auditorium|lab)\b/i],
    weight: 3,
  },
  {
    name: 'location',
    keywords: ['location', 'address', 'where', 'city', 'state', 'map', 'distance', 'reach', 'direction', 'route', 'nearby'],
    patterns: [/\b(location|address|map|distance|direction|route)\b/i, /how.*(reach|get there)/i, /where\s+(is|are)/i],
    weight: 3,
  },
  {
    name: 'rating',
    keywords: ['rating', 'rank', 'ranking', 'naac', 'nirf', 'best', 'reputation', 'good', 'review', 'accreditation'],
    patterns: [/\b(rating|rank|ranking|naac|nirf|review|accreditation)\b/i, /how good/i, /is it good/i],
    weight: 3,
  },
  {
    name: 'scholarship',
    keywords: ['scholarship', 'financial', 'aid', 'loan', 'waiver', 'free', 'concession', 'freeseats', 'merit'],
    patterns: [/\b(scholarship|loan|waiver|financial\s*aid|free\s*seat|merit\s*seat)\b/i],
    weight: 3,
  },
  {
    name: 'about',
    keywords: ['about', 'tell', 'describe', 'overview', 'history', 'founded', 'established', 'information', 'info', 'details', 'full', 'everything', 'all'],
    patterns: [
      /\b(about|overview|history|details|full\s*details)\b/i,
      /tell\s+(me\s+)?(about|everything|all|full)/i,
      /\b(describe|explain)\s+(this|the)?\s*(college|university|institute)\b/i,
    ],
    weight: 3,
  },
  {
    name: 'compare',
    keywords: ['compare', 'comparison', 'vs', 'versus', 'better', 'difference', 'which'],
    patterns: [/\b(compare|comparison|vs|versus)\b/i, /which.*(better|best)/i, /difference\s+between/i],
    weight: 3,
  },
  {
    name: 'exam_prep',
    keywords: ['prepare', 'preparation', 'study', 'tips', 'strategy', 'books', 'coaching', 'mock', 'practice', 'revision'],
    patterns: [/how\s+to\s+(prepare|study|crack)/i, /\b(preparation|coaching|mock\s*test|practice|revision)\b/i, /tips\s+for/i],
    weight: 3,
  },
  {
    name: 'entrance_exam',
    keywords: ['jee', 'neet', 'clat', 'gate', 'cat', 'xat', 'mat', 'cuet', 'cmat', 'nata', 'nift', 'upsc', 'ssc', 'ibps', 'tnea', 'eamcet', 'kcet', 'comedk', 'wbjee', 'mhtcet'],
    patterns: [/\b(jee|neet|clat|gate|cat|xat|mat|cuet|cmat|nata|nift|upsc|ssc|tnea|eamcet|kcet|comedk|wbjee|mhtcet)\b/i, /entrance\s+(exam|test)/i],
    weight: 3,
  },
  {
    name: 'campus_life',
    keywords: ['campus', 'life', 'club', 'fest', 'event', 'cultural', 'technical', 'hackathon', 'nss', 'ncc', 'extracurricular'],
    patterns: [/\b(campus\s*life|college\s*life|student\s*life|fest|hackathon|extracurricular|clubs)\b/i],
    weight: 3,
  },
  {
    name: 'alumni',
    keywords: ['alumni', 'alumnus', 'notable', 'famous', 'pass', 'graduated', 'former'],
    patterns: [/\b(alumni|alumnus|notable|famous)\s*(student|people|person)?/i, /who\s+(graduated|passed\s*out)/i],
    weight: 3,
  },
  {
    name: 'contact',
    keywords: ['contact', 'phone', 'email', 'website', 'official', 'number', 'call', 'reach'],
    patterns: [/\b(contact|phone|email|website|number)\b/i],
    weight: 3,
  },
  {
    name: 'gender',
    keywords: ['gender', 'boys', 'girls', 'women', 'men', 'coed', 'mixed', 'coeducation'],
    patterns: [/\b(gender|boys\s*only|girls\s*only|coed|mixed|coeducation)\b/i, /only\s*(boys|girls|men|women)/i],
    weight: 3,
  },
  {
    name: 'students',
    keywords: ['student', 'students', 'crowd', 'people', 'demographics', 'batch', 'strength', 'peers', 'intake'],
    patterns: [/\b(student|students|crowd|demographics|batch|strength|intake)\b/i, /how\s+many\s+students/i],
    weight: 3,
  },
  {
    name: 'language',
    keywords: ['language', 'languages', 'speak', 'medium', 'instruction', 'english', 'hindi', 'regional', 'tongue', 'tamil'],
    patterns: [/\b(language|speak|medium|instruction)\b/i, /what.*speak/i],
    weight: 3,
  },
  {
    name: 'general_knowledge',
    keywords: ['capital', 'president', 'country', 'planet', 'science', 'math', 'history', 'geography', 'formula', 'explain', 'meaning', 'define', 'definition', 'what', 'why', 'how'],
    patterns: [
      /what\s+is\s+(the\s+)?(capital|president|meaning|definition|formula)/i,
      /explain\s+(me\s+)?(about\s+)?/i,
      /who\s+is\s+(the\s+)?(president|pm|prime\s*minister|ceo|founder)/i,
    ],
    weight: 2,
  },
  {
    name: 'follow_up',
    keywords: ['more', 'else', 'another', 'also', 'continue', 'elaborate', 'detail', 'further', 'expand', 'explain'],
    patterns: [
      /\b(tell\s+me\s+more|more\s+details|more\s+info|anything\s+else|go\s+on|continue|elaborate)\b/i,
      /^(more|continue|go\s+on|and\s*\?)$/i,
    ],
    weight: 2,
  },
];

const STOP_WORDS = new Set(['is', 'are', 'am', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'it', 'and', 'or', 'but', 'i', 'me', 'my', 'do', 'does', 'did', 'can', 'will', 'would', 'should', 'could', 'please', 'want', 'need']);

// ── Smart Intent Classifier ──────────────────────────────────────────────────
class LocalAIEngine {
  constructor() {
    this.context = null;
    this.lastSubject = null; // tracks "hostel", "placement", etc.
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0 && !STOP_WORDS.has(word));
  }

  // Extract what subject the user is talking about (for context follow-ups)
  extractSubject(text) {
    const q = text.toLowerCase();
    const subjects = [
      { name: 'hostel', pattern: /\b(hostel|accommodation|dorm|dormitory|room|pg)\b/ },
      { name: 'placement', pattern: /\b(placement|job|recruit|salary|package|company|hire)\b/ },
      { name: 'campus', pattern: /\b(campus|college|institute|university|building)\b/ },
      { name: 'lab', pattern: /\b(lab|laboratory|computer\s*lab|science\s*lab)\b/ },
      { name: 'library', pattern: /\b(library|reading\s*room|books)\b/ },
      { name: 'canteen', pattern: /\b(canteen|cafeteria|mess|food)\b/ },
      { name: 'sports', pattern: /\b(sports|playground|ground|gym|swimming)\b/ },
      { name: 'classroom', pattern: /\b(class|classroom|lecture\s*hall|auditorium)\b/ },
      { name: 'fees', pattern: /\b(fee|fees|tuition|cost|money|price)\b/ },
      { name: 'courses', pattern: /\b(course|branch|program|degree|syllabus)\b/ },
      { name: 'admission', pattern: /\b(admission|eligibility|apply|cutoff)\b/ },
    ];
    for (const s of subjects) {
      if (s.pattern.test(q)) return s.name;
    }
    return null;
  }

  classifyIntent(text) {
    const tokens = this.tokenize(text);
    const textLower = text.toLowerCase().trim();

    let bestIntent = 'general_chat';
    let maxScore = 0;

    for (const intent of INTENTS) {
      let score = 0;

      // Regex pattern matches (strongest signals)
      for (const pattern of intent.patterns) {
        if (pattern.test(textLower)) {
          score += 5 * (intent.weight || 3);
        }
      }

      // Keyword matches
      for (const token of tokens) {
        if (intent.keywords.includes(token)) {
          score += 1 * (intent.weight || 3);
        }
      }

      // Fuzzy partial keyword match (for typos like "hostal" → "hostel")
      for (const token of tokens) {
        for (const keyword of intent.keywords) {
          if (token.length >= 4 && keyword.length >= 4 && token !== keyword) {
            if (keyword.includes(token) || token.includes(keyword)) {
              score += 0.5 * (intent.weight || 3);
            }
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent.name;
      }
    }

    // Update subject context
    const subject = this.extractSubject(text);
    if (subject) {
      this.lastSubject = subject;
    }

    // If classified as image_request, preserve lastSubject for context
    if (bestIntent === 'image_request' && !subject) {
      // User said "give image" without specifying what — use last subject
      // lastSubject stays as is
    }

    // Store last intent for follow-ups
    if (bestIntent !== 'follow_up') {
      this.context = bestIntent;
    }

    return bestIntent;
  }

  // ── Build Google Images link ─────────────────────────────────────────────────
  buildImageLink(college, subject) {
    const collegeName = college?.name || 'college';
    let searchQuery = '';
    let label = '';

    switch (subject) {
      case 'hostel':
        searchQuery = `${collegeName} hostel rooms photos`;
        label = `${collegeName} Hostel`;
        break;
      case 'lab':
        searchQuery = `${collegeName} laboratory photos`;
        label = `${collegeName} Labs`;
        break;
      case 'library':
        searchQuery = `${collegeName} library photos`;
        label = `${collegeName} Library`;
        break;
      case 'canteen':
        searchQuery = `${collegeName} canteen cafeteria photos`;
        label = `${collegeName} Canteen`;
        break;
      case 'sports':
        searchQuery = `${collegeName} sports ground photos`;
        label = `${collegeName} Sports`;
        break;
      case 'classroom':
        searchQuery = `${collegeName} classroom photos`;
        label = `${collegeName} Classrooms`;
        break;
      case 'placement':
        searchQuery = `${collegeName} placement drive company visit photos`;
        label = `${collegeName} Placement Drive`;
        break;
      default:
        searchQuery = `${collegeName} campus photos`;
        label = `${collegeName} Campus`;
        break;
    }

    // Remove parentheses to prevent breaking Markdown links in the chat UI
    const safeQuery = searchQuery.replace(/[()]/g, '');
    const encodedQuery = encodeURIComponent(safeQuery).replace(/%20/g, '+');
    return { label, url: `https://www.google.com/search?tbm=isch&q=${encodedQuery}` };
  }

  generateResponse(intent, college, departmentLabel) {
    const name = college?.name || 'this college';
    const deptName = departmentLabel ? departmentLabel.split('(')[0].trim() : 'your selected';
    const fee = college?.annualFee ? `₹${parseInt(college.annualFee).toLocaleString('en-IN')}` : 'N/A';

    switch (intent) {

      // ── Image requests ─────────────────────────────────────────────────────
      case 'image_request': {
        const subject = this.lastSubject || 'campus';
        const { label, url } = this.buildImageLink(college, subject);
        return pickRandom([
          `📸 Here are photos of **${label}**!\n\n[🔍 View ${label} Images](${url})\n\nTap the link above to see real campus photos, buildings, and facilities. 🏛️`,
          `Sure! Here are the latest images of **${label}** 📷\n\n[🔍 Browse ${label} Photos](${url})\n\nYou'll find real photos of the campus and infrastructure!`,
          `Of course! Check out these photos of **${label}** 🖼️\n\n[🔍 See ${label} Gallery](${url})\n\nWant to know something else about ${name}?`,
        ]);
      }

      // ── Greetings ──────────────────────────────────────────────────────────
      case 'greeting':
        return pickRandom([
          `Hello there! 👋 Welcome to **Acadivo AI**! I'm your personal college assistant. How can I help you today?\n\nYou can ask me about:\n• 🏛️ College details & facilities\n• 💰 Fees & scholarships\n• 📊 Placements & career\n• 📸 Campus photos\n• 📋 Admissions & eligibility\n\nAsk me anything! 😊`,
          `Hey! 😊 Great to have you here! I'm **Acadivo AI** — your smart college assistant.\n\nI can help with fees, placements, courses, hostel info, campus photos, and much more! What would you like to know?`,
          `Hi there! 👋 I'm your AI college counsellor at **Acadivo**. Ask me about ${name} or any college-related topic — I'm here to help! 🎓`,
        ]);

      // ── Farewell ───────────────────────────────────────────────────────────
      case 'farewell':
        return pickRandom([
          `Goodbye! 👋 It was great chatting with you. Come back anytime you need college guidance. All the best for your future! 🌟`,
          `See you later! 😊 Best of luck with your college journey. I'm always here if you need help! 🎓`,
          `Take care! 🙏 Wishing you the very best. Feel free to come back whenever you have questions about colleges!`,
        ]);

      // ── Thanks ─────────────────────────────────────────────────────────────
      case 'thanks':
        return pickRandom([
          `You're welcome! 😊 Happy to help. If you have more questions about ${name} or any other college, feel free to ask! 🎓`,
          `Glad I could help! 🙌 Don't hesitate to ask if anything else comes to mind. I'm always here for you!`,
          `My pleasure! 😄 Good luck with your college journey. Ask me anything anytime!`,
        ]);

      // ── Identity ───────────────────────────────────────────────────────────
      case 'identity':
        return pickRandom([
          `I'm **Acadivo AI** 🤖 — a smart college assistant built into the Acadivo app!\n\n**Here's what I can do:**\n• 🏛️ Give detailed info about any college\n• 📊 Share placement stats & salary packages\n• 💰 Explain fee structures & scholarships\n• 📸 Show campus photos & images\n• 📋 Guide you through admission processes\n• 🎯 Help with entrance exam preparation\n• 🗺️ Provide college locations & directions\n\nAsk me anything! 😊`,
          `Hey! I'm **Acadivo AI** — your personal college counsellor! 🎓\n\nI can answer questions about colleges, admissions, fees, placements, campus life, and much more. Think of me as your senior mentor who knows everything about Indian colleges! 😊\n\nWhat would you like to know?`,
        ]);

      // ── Personal intro ─────────────────────────────────────────────────────
      case 'personal_intro': {
        const nameMatch = college?.name ? college.name : 'your dream college';
        return pickRandom([
          `Nice to meet you! 😊 Welcome to Acadivo!\n\nI'm here to help you find ${nameMatch} and guide your college journey. What would you like to know — fees, placements, admissions, or something else? 🎓`,
          `That's great! 👋 Thanks for sharing! I'm your personal college counsellor here at Acadivo.\n\nLet me help you explore your options! Would you like to know about courses, placements, or admission requirements?`,
        ]);
      }

      // ── Fees ───────────────────────────────────────────────────────────────
      case 'fees':
        this.lastSubject = 'fees';
        return pickRandom([
          `💰 **Fee Structure at ${name}:**\n\nThe annual tuition fee for **${deptName}** department is approximately **${fee}** per year.\n\n**Additional details:**\n• 📋 Hostel fees are charged separately\n• 🎓 Merit scholarships available for top scorers\n• 🏦 Education loans available from major banks (SBI, HDFC, Axis)\n• 💵 Some states offer fee waivers for SC/ST/OBC students\n\nWant to know about scholarships or payment options? 😊`,
          `The fee for **${deptName}** at ${name} is around **${fee}** per year.\n\nThis is a competitive fee for the quality of education offered! 💡 Many students also avail scholarships and education loans. Want me to explain those options?`,
        ]);

      // ── Hostel ─────────────────────────────────────────────────────────────
      case 'hostel':
        this.lastSubject = 'hostel';
        if (college?.hostelAvailable) {
          return pickRandom([
            `🏠 **Hostel Facilities at ${name}:**\n\nYes! The college provides excellent **on-campus hostel** facilities.\n\n**Highlights:**\n• 🔒 24/7 security with CCTV surveillance\n• 📶 High-speed WiFi in all rooms\n• 🍽️ Hygienic mess with varied menu\n• 🧹 Regular housekeeping\n• 📚 Study rooms & common areas\n• 🏋️ Gym & recreation facilities\n\n**Tip:** Apply early as rooms fill up fast! 📝\n\nWant to see hostel photos? Just ask "show hostel image"! 📸`,
            `✅ Yes! **${name}** has great on-campus hostel accommodation for students!\n\nThe hostels come with WiFi, 24/7 security, mess facilities, and study rooms. It's a safe and comfortable environment for students.\n\nWould you like to see photos of the hostel or know about hostel fees? 🏠`,
          ]);
        } else {
          return pickRandom([
            `🏠 Currently, **${name}** does not have on-campus hostel facilities.\n\n**But don't worry!** Here are your options:\n• 🏘️ Plenty of affordable PGs nearby\n• 🏢 Student apartments within walking distance\n• 🚌 Good public transport connectivity\n• 📋 The college student affairs office can help you find accommodation\n\nWant to know about the college location and nearby facilities? 📍`,
          ]);
        }

      // ── Placement ──────────────────────────────────────────────────────────
      case 'placement': {
        this.lastSubject = 'placement';
        const rate = college?.placementRate ? `**${college.placementRate}%**` : 'excellent';
        const companies = college?.topCompanies ? college.topCompanies.slice(0, 5).join(', ') : 'top MNCs and startups';
        return pickRandom([
          `📊 **Placement Report for ${name}:**\n\n• **Overall Placement Rate:** ${rate}\n• **Top Recruiters:** ${companies}\n• **Department:** ${deptName}\n\n**Placement Highlights:**\n• 💼 Active placement cell with dedicated TPO\n• 🤝 Regular campus recruitment drives\n• 💰 Competitive salary packages\n• 🌐 Both IT and core company placements\n• 📈 Internship opportunities from 2nd year\n\nWant to know about specific companies or salary packages? 💡`,
          `The placement rate at **${name}** is ${rate} for ${deptName}! 🎯\n\nTop companies that recruit here include **${companies}**.\n\nThe college has a dedicated placement cell that organizes regular campus drives, mock interviews, and skill development workshops. 💼\n\nAny specific questions about career prospects?`,
        ]);
      }

      // ── Courses ────────────────────────────────────────────────────────────
      case 'courses': {
        this.lastSubject = 'courses';
        const courses = college?.courses ? college.courses.join(', ') : 'a wide variety of programs';
        return pickRandom([
          `🎓 **Courses Offered at ${name}:**\n\n${courses}\n\n**Key highlights:**\n• 📖 Industry-aligned curriculum\n• 🔬 Practical lab sessions\n• 👨‍🏫 Experienced faculty\n• 🏢 Internship opportunities\n• 📜 Recognized by UGC/AICTE\n\nWant details about any specific course or branch? 📚`,
          `Here are the courses available at **${name}**:\n\n${courses}\n\nAll programs are affiliated with the university and recognized by relevant bodies. The curriculum is regularly updated to match industry requirements! 📝\n\nNeed details on eligibility or fee for a specific course?`,
        ]);
      }

      // ── Admission ──────────────────────────────────────────────────────────
      case 'admission': {
        this.lastSubject = 'admission';
        const req = college?.minPercentage ? `**${college.minPercentage}%**` : 'a good academic record';
        return pickRandom([
          `📋 **Admission Guide for ${name}:**\n\n• **Minimum Eligibility:** ${req} in 12th grade\n• **Entrance Exams:** JEE Main / TNEA / State-level counselling\n• **Application:** Online through official website\n\n**Steps to Apply:**\n1. 📝 Register on the official portal\n2. 📄 Upload required documents\n3. 💳 Pay application fee\n4. 📊 Attend counselling based on your rank\n5. ✅ Secure your seat!\n\nNeed help with any specific step? I'm here! 🎓`,
          `To get admission at **${name}**, you need at least ${req} in your 12th exams.\n\nThe admission process typically goes through state or national level counselling. Make sure you register and attend the counselling sessions on time!\n\nWant to know about cutoff marks or counselling dates? 📋`,
        ]);
      }

      // ── Facilities ─────────────────────────────────────────────────────────
      case 'facilities':
        this.lastSubject = 'campus';
        return pickRandom([
          `🏛️ **Campus Facilities at ${name}:**\n\n• 🔬 Modern laboratories with latest equipment\n• 📚 Well-stocked library with digital access\n• 🏃 Sports grounds — cricket, football, basketball\n• 🍽️ Hygienic canteen & cafeteria\n• 📶 Campus-wide high-speed WiFi\n• 🚌 Transport facility for day scholars\n• 🏥 On-campus medical center\n• 🎭 Auditorium for events & seminars\n• 💻 Computer labs with internet\n• 🏋️ Gym & fitness center\n\nWant to see photos of the campus? Ask "show campus image"! 📸`,
          `**${name}** has top-notch infrastructure! 🏢\n\nFrom advanced labs to a comprehensive library, sports facilities, WiFi-enabled campus, and great canteens — everything a student needs is right here!\n\nWould you like to know more about any specific facility?`,
        ]);

      // ── Location ───────────────────────────────────────────────────────────
      case 'location':
        this.lastSubject = 'campus';
        return pickRandom([
          `📍 **Location of ${name}:**\n\nThe college is located in **${college?.location || 'a prime location'}**, ${college?.state || 'India'}.\n\n**How to Reach:**\n• 🚌 Well-connected by public buses\n• 🚆 Nearest railway station is easily accessible\n• ✈️ Airport connectivity available\n• 🗺️ Tap the **Map** button on the college details page for exact directions!\n\nNeed help with anything else? 😊`,
        ]);

      // ── Rating ─────────────────────────────────────────────────────────────
      case 'rating':
        return pickRandom([
          `⭐ **Ratings & Accreditation of ${name}:**\n\n• **Overall Rating:** ${college?.rating || 'N/A'}/5\n• **NAAC Grade:** ${college?.naacGrade || 'N/A'}\n• **Type:** ${college?.type || 'N/A'}\n\nThis is a highly rated institution known for academic excellence and student outcomes! 🏆\n\nWant to compare with other colleges?`,
        ]);

      // ── Scholarship ────────────────────────────────────────────────────────
      case 'scholarship':
        return pickRandom([
          `💰 **Scholarship & Financial Aid at ${name}:**\n\n**Available Options:**\n• 🏅 **Merit Scholarships** — For top-ranking students\n• 🎓 **Government Scholarships** — NSP, State-level schemes\n• 💵 **Fee Waivers** — For economically weaker sections\n• 🏦 **Education Loans** — SBI Scholar Loan, HDFC Credila, Axis Bank\n• 📋 **Category-based** — SC/ST/OBC concessions as per govt norms\n\n**Tips:**\n• Apply for NSP (National Scholarship Portal) early\n• Check your state government website for local scholarships\n• Banks usually offer loans at 8-12% interest for education\n\nNeed help applying for any specific scholarship? 🎓`,
        ]);

      // ── About ──────────────────────────────────────────────────────────────
      case 'about':
        this.lastSubject = 'campus';
        return pickRandom([
          `ℹ️ **About ${name}:**\n\n${college?.description || `${name} is a well-known educational institution.`}\n\n**Quick Facts:**\n• 📍 Location: ${college?.location || 'N/A'}, ${college?.state || 'India'}\n• 🏛️ Type: ${college?.type || 'N/A'}\n• ⭐ Rating: ${college?.rating || 'N/A'}/5\n• 📊 NAAC: ${college?.naacGrade || 'N/A'}\n• 💼 Placement: ${college?.placementRate || 'N/A'}%\n• 🏠 Hostel: ${college?.hostelAvailable ? 'Available ✅' : 'Not Available ❌'}\n• 💰 Annual Fee: ${fee}\n\n${college?.highlight || ''}\n\nWant to know more about any specific aspect? 😊`,
        ]);

      // ── Compare ────────────────────────────────────────────────────────────
      case 'compare':
        return pickRandom([
          `🔄 **College Comparison Tips:**\n\nWhen comparing colleges, look at these key factors:\n\n• ⭐ **NAAC/NIRF Ranking** — Higher is better\n• 💼 **Placement Rate** — Check average packages\n• 💰 **Fee Structure** — Compare value for money\n• 🏛️ **Infrastructure** — Labs, library, campus\n• 📍 **Location** — City vs rural, connectivity\n• 🏠 **Hostel** — Quality and availability\n• 👨‍🏫 **Faculty** — Qualifications and experience\n\nWant me to compare specific colleges? Just name them! 🎯`,
        ]);

      // ── Exam Prep ──────────────────────────────────────────────────────────
      case 'exam_prep':
        return pickRandom([
          `📚 **Exam Preparation Guide:**\n\n**General Tips for Any Entrance Exam:**\n\n1. 📖 **Understand the syllabus** — Know exactly what topics are covered\n2. 📅 **Create a timetable** — Allocate time for each subject\n3. 🔄 **Practice previous year papers** — This is the #1 strategy!\n4. 📝 **Take mock tests** — Simulate exam conditions\n5. 🧠 **Focus on weak areas** — Don't just revise what you know\n6. 💪 **Stay consistent** — 3-4 hours daily > 12 hours on weekends\n7. 😴 **Sleep well** — Your brain needs rest to retain info\n\n**Popular Resources:**\n• NCERT books (foundation)\n• PYQs from official websites\n• Apps: Unacademy, PW, Byju's\n\nWhich exam are you preparing for? I can give specific guidance! 🎯`,
        ]);

      // ── Entrance Exams ─────────────────────────────────────────────────────
      case 'entrance_exam':
        return pickRandom([
          `📝 **Indian Entrance Exams Guide:**\n\n**Engineering:**\n• JEE Main — National level, for NITs/IIITs\n• JEE Advanced — For IITs only\n• State exams: TNEA, KCET, MHT-CET, WBJEE, EAMCET\n\n**Medical:**\n• NEET UG — Single exam for MBBS/BDS across India\n\n**Management:**\n• CAT — For IIMs | XAT — For XLRI | MAT/CMAT\n\n**Law:**\n• CLAT — National law universities\n\n**Others:**\n• CUET — Central universities\n• NATA — Architecture\n• NIFT — Fashion/Design\n\nWhich exam would you like to know more about? 🎓`,
        ]);

      // ── Campus Life ────────────────────────────────────────────────────────
      case 'campus_life':
        this.lastSubject = 'campus';
        return pickRandom([
          `🎉 **Campus Life at ${name}:**\n\nCollege life here is vibrant and exciting!\n\n• 🎭 **Cultural Fests** — Annual celebrations with music, dance, drama\n• 💻 **Technical Events** — Hackathons, coding contests, workshops\n• 🏃 **Sports** — Inter-college tournaments\n• 📚 **Clubs** — Coding club, debate club, photography, robotics\n• 🤝 **NSS/NCC** — Community service and leadership\n• 🎨 **Extracurricular** — Art, music, dance activities\n\nCollege is about more than just academics — it's where you grow as a person! 🌟\n\nWant to see campus photos? Just say "show campus image"! 📸`,
        ]);

      // ── Alumni ─────────────────────────────────────────────────────────────
      case 'alumni':
        return pickRandom([
          `🎓 **Alumni Network of ${name}:**\n\nThe college has a strong alumni network with graduates placed in top companies and positions worldwide!\n\n**Benefits of a strong alumni network:**\n• 🤝 Mentorship opportunities\n• 💼 Job referrals and networking\n• 📈 Industry connections\n• 🎯 Career guidance from experienced professionals\n\nMany alumni actively participate in campus recruitment drives and guest lectures.\n\nWant to know about the placement companies? 💼`,
        ]);

      // ── Contact ────────────────────────────────────────────────────────────
      case 'contact':
        return pickRandom([
          `📞 **Contact ${name}:**\n\nFor official inquiries, I recommend:\n\n• 🌐 Visit the **official website** (search "${name}" on Google)\n• 📧 Email the admissions department directly\n• 📱 Call the college office during working hours\n• 📍 Visit the campus in person for a tour!\n\n**Tip:** Most colleges respond faster on their official email than phone! 📧\n\nNeed help with anything else?`,
        ]);

      // ── Gender ─────────────────────────────────────────────────────────────
      case 'gender':
        return pickRandom([
          `👥 **${name}** is a **${college?.gender || 'co-education'}** institution.\n\nThe college promotes an inclusive, diverse, and safe environment for all students! The campus has proper facilities and security measures for everyone.\n\nAny other questions? 😊`,
        ]);

      // ── Students ───────────────────────────────────────────────────────────
      case 'students':
        return pickRandom([
          `👥 **Student Community at ${name}:**\n\nThe college has a vibrant and diverse student body from across the country!\n\n• 📊 Active student council\n• 🤝 Diverse peer group from many states\n• 📚 Competitive yet collaborative atmosphere\n• 🎯 Strong focus on academic and personal growth\n\nThe student community is one of the best parts of college life! 🌟`,
        ]);

      // ── Language ───────────────────────────────────────────────────────────
      case 'language':
        return pickRandom([
          `🗣️ **Language & Medium of Instruction at ${name}:**\n\n• 📖 Primary medium: **English**\n• 🗣️ Students speak various regional languages on campus\n• 📝 Exams and assignments are in English\n• 🌍 Multi-cultural environment — you'll hear many languages!\n\nDon't worry if English isn't your first language — most colleges have supportive environments to help you adapt! 😊`,
        ]);

      // ── Follow-up ──────────────────────────────────────────────────────────
      case 'follow_up': {
        const prevTopic = this.context || 'about';
        // Re-generate response for the previous topic with more detail
        return this.generateResponse(prevTopic, college, departmentLabel);
      }

      // ── General Knowledge ──────────────────────────────────────────────────
      case 'general_knowledge':
        return pickRandom([
          `🧠 That's a great question! While I'm primarily designed to help with college information, I'll do my best to answer.\n\nFor detailed answers on general knowledge, science, or current affairs, I recommend checking **Google** or **Wikipedia** for the most accurate and up-to-date information.\n\nBut don't forget — I'm an expert on Indian colleges! 🎓 Ask me about admissions, exams, placements, and I'll give you detailed answers! 😊`,
          `Interesting question! 🤔 I'm primarily a college counselling AI, so my expertise is strongest in education-related topics.\n\nFor this specific query, you might get a better answer from Google or other AI assistants. But for anything college-related — fees, admissions, placements, courses — I'm your go-to expert! 🎓\n\nWhat would you like to know about colleges?`,
        ]);

      // ── Personal Intro ─────────────────────────────────────────────────────
      case 'personal':
        return pickRandom([
          `Nice to meet you! 😊 I'm glad you're here.\n\nI'm **Acadivo AI** — your personal college counsellor. I can help you find the right college, understand admissions, and plan your career!\n\nWhat are you looking for? Tell me about your interests and I'll guide you! 🎯`,
        ]);

      // ── DEFAULT: Smart general response ────────────────────────────────────
      case 'general_chat':
      default: {
        // Check if the message is very short (1-3 words) — likely a follow-up
        const wordCount = text?.split(/\s+/).length || 0;
        if (wordCount <= 3 && this.lastSubject) {
          // Try to interpret short messages as related to last subject
          const subject = this.lastSubject;
          return pickRandom([
            `I'd be happy to help with that! 😊\n\nBased on our conversation, here's what I can tell you about **${subject}** at ${name}:\n\nFor more specific information, try asking something like:\n• "Tell me about ${subject}"\n• "Show ${subject} images"\n• "What are the ${subject} facilities?"\n\nWhat exactly would you like to know? 🎓`,
            `Sure thing! 😊 Regarding **${subject}** at ${name} — I have lots of information available!\n\nCould you tell me what specifically you'd like to know? For example:\n• Details & features\n• Photos & images\n• Availability & facilities\n\nI'm here to help! 🤝`,
          ]);
        }

        // Truly unknown — give a helpful, friendly response (NEVER say "I don't understand")
        return pickRandom([
          `Great question! 😊 Let me help you with that.\n\nI'm **Acadivo AI** — I know a lot about **${name}** and Indian colleges in general. Here are some things I can tell you about:\n\n• 📋 **Admissions** — Eligibility, cutoffs, process\n• 💰 **Fees** — Fee structure & scholarships\n• 💼 **Placements** — Companies, packages, rates\n• 🏠 **Hostel** — Availability & facilities\n• 🎓 **Courses** — Programs offered\n• 📸 **Campus Photos** — Just say "show image"\n• 📍 **Location** — Directions & map\n\nWhat would you like to explore? 🎯`,
          `I appreciate your question! 😊\n\nAs your college assistant for **${name}**, I can provide detailed information about:\n\n• Admissions, fees, placements, courses\n• Hostel, facilities, campus life\n• Entrance exams & career guidance\n• Campus photos & gallery\n\nTry asking something like "tell me about placements" or "show campus image"!\n\nHow can I help you? 🎓`,
          `Hey! 👋 I'd love to help you out.\n\nHere at **Acadivo AI**, I specialize in everything about **${name}** — from admissions to placements, fees to hostel, and much more!\n\n📸 Want photos? Just say **"show image"**\n💰 Want fee details? Ask **"fee structure"**\n💼 Want placements? Ask **"placement details"**\n\nGo ahead, ask me anything! 😊`,
        ]);
      }
    }
  }
}

const engine = new LocalAIEngine();

export const generateAIResponse = (text, college, departmentLabel) => {
  const intent = engine.classifyIntent(text);
  return {
    text: engine.generateResponse(intent, college, departmentLabel),
    type: intent
  };
};

// Reset context when conversation is cleared
export const resetLocalAIContext = () => {
  engine.context = null;
  engine.lastSubject = null;
};

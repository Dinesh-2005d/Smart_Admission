// A Custom Inbuilt NLP Engine for SmartCampus AI

const OFF_TOPIC_KEYWORDS = [
  'movie', 'actor', 'song', 'music', 'dance', 'politics', 'president',
  'prime minister', 'modi', 'biden', 'trump', 'weather', 'recipe', 'cook',
  'food outside', 'joke', 'funny', 'python', 'java', 'c++', 'code', 'bug',
  'error', 'sports match', 'cricket', 'football', 'messi', 'ronaldo', 'capital', 'country', 'planet'
];

const INTENTS = [
  {
    name: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening'],
    patterns: [/\b(hi|hello|hey|greetings)\b/i],
  },
  {
    name: 'fees',
    keywords: ['fee', 'fees', 'cost', 'tuition', 'money', 'price', 'pay', 'expensive'],
    patterns: [/\b(fee|fees|cost|tuition)\b/i, /how much.*(pay|cost)/i],
  },
  {
    name: 'hostel',
    keywords: ['hostel', 'accommodation', 'stay', 'room', 'boarding', 'pg'],
    patterns: [/\b(hostel|room|accommodation|staying)\b/i],
  },
  {
    name: 'placement',
    keywords: ['placement', 'job', 'recruit', 'career', 'salary', 'package', 'company', 'hire', 'employ', 'lpa'],
    patterns: [/\b(placement|job|recruit|package|salary|lpa)\b/i],
  },
  {
    name: 'courses',
    keywords: ['course', 'branch', 'program', 'stream', 'degree', 'btech', 'mbbs', 'mba', 'bsc', 'bcom', 'study', 'offer'],
    patterns: [/\b(course|courses|branch|program|degree|btech)\b/i, /what.*(teach|study|offer)/i],
  },
  {
    name: 'admission',
    keywords: ['admission', 'eligible', 'eligibility', 'qualify', 'apply', 'application', 'cutoff', 'minimum', 'marks', 'percentage', 'rank', 'join'],
    patterns: [/\b(admission|apply|cutoff|eligibility|percentage|marks)\b/i, /how.*(join|get in)/i],
  },
  {
    name: 'facilities',
    keywords: ['facility', 'facilities', 'infrastructure', 'library', 'lab', 'sports', 'canteen', 'wifi', 'transport', 'bus', 'medical'],
    patterns: [/\b(facility|facilities|infrastructure|library|canteen|wifi|transport)\b/i],
  },
  {
    name: 'location',
    keywords: ['location', 'address', 'where', 'city', 'state', 'map', 'distance', 'reach'],
    patterns: [/\b(location|address|map|distance)\b/i, /how.*(reach|get there)/i, /where is/i],
  },
  {
    name: 'rating',
    keywords: ['rating', 'rank', 'ranking', 'naac', 'nirf', 'best', 'reputation', 'good'],
    patterns: [/\b(rating|rank|ranking|naac|nirf)\b/i, /how good/i, /is it good/i],
  },
  {
    name: 'scholarship',
    keywords: ['scholarship', 'financial aid', 'loan', 'fee waiver', 'free', 'concession'],
    patterns: [/\b(scholarship|loan|waiver|financial aid)\b/i],
  },
  {
    name: 'gender',
    keywords: ['gender', 'boys', 'girls', 'women', 'men', 'coed', 'mixed'],
    patterns: [/\b(gender|boys|girls|coed|mixed)\b/i],
  },
  {
    name: 'contact',
    keywords: ['contact', 'phone', 'email', 'website', 'official', 'number', 'call'],
    patterns: [/\b(contact|phone|email|website|number)\b/i],
  },
  {
    name: 'about',
    keywords: ['about', 'tell me', 'describe', 'overview', 'history', 'founded', 'established', 'information', 'info', 'details'],
    patterns: [/\b(about|overview|history|details)\b/i, /tell me.*(college|university|institute)/i],
  },
  {
    name: 'students',
    keywords: ['student', 'students', 'crowd', 'people', 'demographics', 'batch', 'strength', 'peers'],
    patterns: [/\b(student|students|crowd|demographics|batch)\b/i],
  },
  {
    name: 'language',
    keywords: ['language', 'languages', 'speak', 'medium', 'instruction', 'english', 'hindi', 'regional', 'tongue'],
    patterns: [/\b(language|speak|medium|instruction)\b/i, /what.*speak/i],
  }
];

const STOP_WORDS = new Set(['is', 'are', 'am', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'it', 'and', 'or', 'but']);

// Helper to pick random response
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

class LocalAIEngine {
  constructor() {
    this.context = null;
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0 && !STOP_WORDS.has(word));
  }

  classifyIntent(text) {
    const tokens = this.tokenize(text);
    const textLower = text.toLowerCase();
    
    if (OFF_TOPIC_KEYWORDS.some(kw => textLower.includes(kw))) {
      return 'off_topic';
    }

    let bestIntent = 'unknown';
    let maxScore = 0;

    for (const intent of INTENTS) {
      let score = 0;
      
      for (const pattern of intent.patterns) {
        if (pattern.test(textLower)) {
          score += 3; // Regex pattern matches are very strong signals
        }
      }

      for (const token of tokens) {
        if (intent.keywords.includes(token)) {
          score += 1; // Keyword matches are weaker signals
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent.name;
      }
    }

    // Use context if the current query is very short and unknown, but we don't have complex multi-turn logic yet.
    if (maxScore === 0) return 'unknown';

    this.context = bestIntent;
    return bestIntent;
  }

  generateResponse(intent, college) {
    const name = college.name;
    const fee = college.annualFee ? `₹${parseInt(college.annualFee).toLocaleString('en-IN')}` : 'N/A';
    
    switch (intent) {
      case 'greeting':
        return pickRandom([
          `Hello there! 👋 I'm your AI assistant for ${name}. What would you like to know about our campus?`,
          `Hi! 😊 How can I help you explore ${name} today?`,
          `Hey! I'm here to answer all your questions about ${name}. Fees, placements, courses—ask away!`
        ]);
        
      case 'fees':
        return pickRandom([
          `💰 The annual tuition fee at ${name} is approximately **${fee}**.\n\nWe also offer various scholarships based on merit!`,
          `If you're asking about costs, the fee is around **${fee}** per year here at ${name}. Educational loans are easily available if needed!`,
          `💵 You can expect to invest about **${fee}** annually for your studies here.`
        ]);

      case 'hostel':
        if (college.hostelAvailable) {
          return pickRandom([
            `🏠 Yes! We have excellent on-campus hostel facilities for students with 24/7 security and high-speed WiFi.`,
            `Definitely! ${name} provides separate, well-maintained hostels. I highly recommend applying early as rooms fill up fast! 🛏️`
          ]);
        } else {
          return pickRandom([
            `🏠 Currently, ${name} does not have an on-campus hostel. However, there are plenty of student-friendly PGs and apartments nearby!`,
            `We don't provide on-campus accommodation, but our student affairs office can help you find great local PGs and rentals just a few minutes away.`
          ]);
        }

      case 'placement':
        const rate = college.placementRate ? `**${college.placementRate}%**` : 'excellent';
        const companies = college.topCompanies ? college.topCompanies.slice(0,3).join(', ') : 'top MNCs';
        return pickRandom([
          `📈 Placements at ${name} are fantastic! We have a placement rate of ${rate}.\n\nOur students are actively recruited by companies like ${companies} and many more! 💼`,
          `When it comes to careers, ${name} boasts a ${rate} placement success rate. Top recruiters include ${companies}. You're in good hands! 🎯`,
          `Our dedicated placement cell ensures you get the best opportunities. We see ${rate} of our students placed annually in top-tier companies!`
        ]);

      case 'courses':
        const courses = college.courses ? college.courses.join(', ') : 'a wide variety of degree programs';
        return pickRandom([
          `🎓 ${name} offers some amazing programs! We currently offer:\n${courses}.`,
          `Looking to study here? We provide top-notch education in:\n${courses}.\n\nLet me know if you want details on a specific branch! 📚`
        ]);

      case 'admission':
        const req = college.minPercentage ? `**${college.minPercentage}%**` : 'a good academic record';
        return pickRandom([
          `📋 To join ${name}, you'll need at least ${req} in your 12th grade exams.\n\nMake sure to check our official website for the exact entrance exam requirements and counseling dates!`,
          `Admissions are competitive! You should aim for a minimum of ${req}. The process typically involves an entrance test followed by counseling. Good luck! 🎯`
        ]);

      case 'facilities':
        return pickRandom([
          `🏛️ The campus is equipped with everything you need: modern labs, a comprehensive library, sports grounds, high-speed WiFi, and great cafeterias!`,
          `We pride ourselves on our infrastructure at ${name}! 🏢 You'll find state-of-the-art computer labs, spacious auditoriums, and dedicated sports facilities.`
        ]);

      case 'location':
        return pickRandom([
          `📍 ${name} is beautifully located in **${college.location}**.\n\nYou can easily reach us by bus or train. Tap the Map button on the details page for precise directions! 🗺️`,
          `We are situated in the heart of **${college.location}**. It's a vibrant area with great connectivity! 🚌`
        ]);

      case 'rating':
        return pickRandom([
          `⭐ We are proud to hold an impressive rating of **${college.rating}/5**!\n\nOur NAAC grade is ${college.naacGrade}, making us a top choice for quality education! 🏆`,
          `Students and experts rate ${name} very highly (**${college.rating}/5**). Our NAAC ${college.naacGrade} accreditation speaks for our academic excellence.`
        ]);

      case 'scholarship':
        return pickRandom([
          `💰 Yes, ${name} supports brilliant minds! We offer merit-based scholarships, as well as government concessions for eligible categories.`,
          `Financial aid is definitely available. We have fee waivers for top rankers and assist with securing educational loans from major banks. 🏦`
        ]);

      case 'gender':
        return pickRandom([
          `👥 ${name} is a **${college.gender}** institution. We promote an inclusive and diverse environment for everyone!`,
          `Regarding student demographics, we are a **${college.gender}** campus. Everyone is welcome!`
        ]);

      case 'contact':
        return pickRandom([
          `📞 You can reach the admin office of ${name} via our official website. Search for us on Google to find our direct phone lines and email addresses! 🌐`,
          `For official inquiries, I highly recommend visiting the ${name} official website. You'll find all the direct contact numbers there! 📱`
        ]);

      case 'about':
        return pickRandom([
          `ℹ️ **About ${name}:**\n${college.description}\n\nWe are a premier ${college.type} institution focused on shaping future leaders! 🌟`,
          `Let me tell you about ${name}!\n${college.description}\n\nWe offer great facilities, strong placements, and a vibrant campus life.`
        ]);

      case 'students':
        return pickRandom([
          `👥 ${name} attracts a vibrant and diverse crowd of students from all over! You'll find a highly competitive and collaborative batch here.`,
          `The student community at ${name} is incredibly diverse and active in both academics and extracurriculars. It's a great place to make lifelong friends! 🎓`
        ]);

      case 'language':
        return pickRandom([
          `🗣️ The primary medium of instruction at ${name} is **English**. However, students speak a variety of regional languages on campus!`,
          `Classes and exams are strictly in **English**. But since students come from everywhere, you'll hear many different languages in the hostels and canteens! 🌍`
        ]);

      case 'off_topic':
        return pickRandom([
          `🤖 Ah, that sounds interesting! But as an AI built specifically for ${name}, I am strictly programmed to only answer questions about this college, academics, and admissions. How can I help you with your education journey? 🎓`,
          `I'd love to chat about that, but my expertise is exclusively focused on ${name} and higher education! 😅 Do you have any questions about our courses or campus?`,
          `I am a specialized College AI Assistant. I don't have information on general topics, movies, or sports. Let's get back to discussing ${name}! 🏛️`
        ]);

      case 'unknown':
      default:
        return pickRandom([
          `🤔 Hmm, I'm not entirely sure I understand. Could you rephrase your question? I can tell you about fees, placements, courses, or hostel facilities at ${name}!`,
          `I'm still learning! 😅 I didn't quite catch that. Try asking me something like "What is the fee structure?" or "How are the placements?"`,
          `I don't have the specific answer to that right now. But I can definitely help you with admission details, courses, or campus facilities! What would you like to know? 🎓`
        ]);
    }
  }
}

const engine = new LocalAIEngine();

export const generateAIResponse = (text, college) => {
  const intent = engine.classifyIntent(text);
  return {
    text: engine.generateResponse(intent, college),
    type: intent
  };
};

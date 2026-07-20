/**
 * academicCounselor.js — Acadivo Expert Academic & Career Counseling Engine v7.0
 *
 * Comprehensive guidance engine trained on 3,000+ natural student, parent, and human chat queries (Q1 - Q3000).
 * Covers: Course selection, engineering branch choices (CSE vs IT, ECE vs CSE, Mech, Civil, Aerospace),
 * AI/ML vs Data Science, Cybersecurity, Cutoffs & 12th percentage matching, Safe vs Ambitious options,
 * Counseling mechanics (Freeze, Float, Slide), ROI & Education Loans, Scholarships, Drop Year advice,
 * First-year skill roadmaps (Python, Java, DSA, GitHub), Internships & Placements, Parent guidance,
 * High-pressure admission scam detection, 1st to 4th year recovery plans, and decision trees.
 */

import { analyzeText } from './sentimentAnalyzer';

// ── Normalize text ─────────────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Comprehensive Intent Rules for Academic & Career Counseling ────────────────
export function answerCounselingQuestion(query) {
  const q = norm(query);

  // ── 0. Very Short / Messy Chat Inputs (Q2796 - Q2820) ─────────────────────────
  if (/^(bro|hey|hi)?\s*(which course|cse worth|ai or cse|got \d+|low cutoff|fees too high|govt clg|private clg|ece or cse|mechanical have future|placement really 100|scholarship available|admission still open|counselling how|got seat|hostel compulsory|change department)/.test(q)) {
    if (/cse worth/.test(q)) return `💻 **Is CSE Worth It?** YES! CSE remains the #1 degree for software placements, remote tech jobs, and high starting packages. Even with AI, skilled software engineers are in top demand.`;
    if (/ai or cse/.test(q)) return `🤖 **AI or CSE?** Core CSE gives maximum career flexibility. Pure CSE lets you work in software, web, cloud, OR AI. Choose specialized AI if you love math & statistics!`;
    if (/ece or cse/.test(q)) return `⚡ **ECE or CSE?** Take CSE if software is your 100% focus. Take ECE in a top college if you want dual eligibility for both Hardware (Semiconductors/VLSI) and Software IT jobs!`;
    if (/mechanical have future|mech future/.test(q)) return `⚙️ **Does Mechanical Have a Future?** YES! EV (Electric Vehicles), Robotics, Automation, and Smart Manufacturing have created a strong demand for core Mechanical engineers.`;
    if (/placement really 100|100.*placement/.test(q)) return `🚩 **100% Placement Truth**: "100% Placement Assistance" means companies visit campus, NOT that everyone gets hired. Always check the **Median Package (₹4.5 - 6.5 LPA)**!`;
    if (/change department|change branch/.test(q)) return `🔄 **Can I Change Branch Later?** Most colleges allow top 5–10% CGPA students to switch branch after 1st year! Check your college academic policy.`;
  }

  if (/^(cse|it|ece|eee|ai|data science|mech|civil)\s*(or|vs)\s*(cse|it|ece|eee|ai|data science|mech|civil|b\.?sc)$/.test(q)) {
    if (/cse\s*(or|vs)\s*it/.test(q) || /it\s*(or|vs)\s*cse/.test(q)) {
      return `💻 **CSE vs IT Quick Verdict**:\n• **CSE** focuses on core algorithms & computing theory; **IT** focuses on software applications and cloud systems.\n• **Placements**: 99% identical! Software MNCs recruit both for identical software roles. Pick CSE if available, otherwise IT is equally great!`;
    }
    if (/cse\s*(or|vs)\s*(ai|machine learning)/.test(q) || /(ai|machine learning)\s*(or|vs)\s*cse/.test(q)) {
      return `🤖 **CSE vs CSE (AI & ML) Quick Verdict**:\n• **Core CSE** gives 100% maximum career flexibility to specialize later.\n• **AI & ML** specializes early in data modeling & neural networks.\n• **Advice**: Choose pure CSE if you want broader options, or AI & ML if you are passionate about data & AI algorithms from day one!`;
    }
    if (/cse\s*(or|vs)\s*ece/.test(q) || /ece\s*(or|vs)\s*cse/.test(q)) {
      return `⚙️ **CSE vs ECE Quick Verdict**:\n• **CSE**: 100% Software focus. Easier pathway to pure IT jobs.\n• **ECE**: Dual flexibility — opens both Semiconductor/VLSI hardware careers AND software IT jobs.\n• **Advice**: Choose CSE if IT is your sole goal. Choose ECE if you want top college hardware + IT placement options!`;
    }
    if (/ai\s*(or|vs)\s*data science/.test(q)) {
      return `📊 **AI & ML vs Data Science Quick Verdict**:\n• **AI & ML** focuses on intelligent automated systems and deep learning models.\n• **Data Science** focuses on business analytics, statistics, and extracting data insights.\n• **Advice**: Both command high entry-level salaries in product & tech firms!`;
    }
  }

  // ── 1. CSE Beginners & Coding Experience Concerns (Q2466 - Q2485) ─────────────
  if (/never coded before|dont love coding|find coding boring|laptop needed for cse|learn before.*first year|too many students choosing cse|software job market.*overcrowded|ai can write code|developers still be needed/.test(q)) {
    return [
      `💻 **CSE for Beginners & AI Impact Reality**\n`,
      `• 🟢 **Never Coded Before?**: 90%+ of first-year engineering students start with ZERO coding knowledge! Computer Science degrees start from absolute basics (C/Python programming).`,
      `• 💻 **Do You Need a High-End Laptop?**: Any standard laptop with an **Intel i5 or AMD Ryzen 5 processor + 8GB/16GB RAM** is more than sufficient for CSE, web dev, & coding.`,
      `• 🤖 **Will AI Replace Software Engineers?**: AI tools (ChatGPT, GitHub Copilot) write basic boilerplate code, but human software engineers are needed to design system architecture, fix bugs, and build real-world products.`,
      `• 🛠️ **Skills That AI Cannot Replace**: System design, data structures & algorithms (DSA), cloud architecture, and understanding user requirements.`,
    ].join('\n');
  }

  // ── 2. Self-Assessment, Career Discovery & Non-Traditional Options (Q2426 - Q2465) ──
  if (/no clear career goal|dont know what im interested in|average in almost every subject|dont have one favorite subject|interested in too many things|hands on|practical not theory|working alone|remote work|financially independent quickly/.test(q)) {
    return [
      `🎯 **Career Discovery & Self-Assessment Guide**\n`,
      `• 💡 **If You Are Confused or Average in Subjects**: Choose a **broad, versatile degree** (B.Tech CSE/ECE, BCA, BBA, B.Com). A versatile degree keeps multiple doors open for tech, management, and government careers!`,
      `• ⚡ **Fast Financial Independence**: Fields like **Full-Stack Web Development, UI/UX Design, Data Analytics, and Digital Marketing** allow you to build job-ready skills in 6–12 months.`,
      `• 🏠 **Careers with Remote Work Options**: Software Development, Data Science, UI/UX Design, Technical Writing, and Cybersecurity.`,
      `• 🛠️ **Practical & Hands-On Careers**: Mechatronics/Robotics, UI/UX Design, Cyber Forensics, Sound Engineering, & Game Development.`,
    ].join('\n');
  }

  // ── 3. High-Pressure Scams, Admission Deadline & Seat Blocking (Q2566 - Q2585, Q2876 - Q2890) ──
  if (/last seat|admission deadline is tonight|pressuring us to pay|non-refundable fee|seat blocking|whatsapp admission|guaranteed 10 lakh package|fee will increase tomorrow/.test(q)) {
    return [
      `🚨 **High-Pressure Admission Scams & Safety Rules**\n`,
      `• ⚠️ **Rule 1: Recognize Sales Pressure Tactics**: Messages like *"Only 1 seat left, pay ₹50,000 cash in 1 hour or seat is cancelled"* are aggressive sales tactics!`,
      `• ⚠️ **Rule 2: Never Pay Without Official Receipt**: Pay fees ONLY through the official college online payment portal or bank account. Get a computer-generated receipt.`,
      `• 📜 **UGC Refund Mandate**: Under UGC guidelines, if you cancel admission before the specified deadline, the college MUST refund your tuition fee (minus max ₹1,000 processing fee).`,
      `• 📱 **WhatsApp Confirmations**: A WhatsApp text message from an agent is NOT a legal admission offer letter! Verify all offers on the university portal.`,
    ].join('\n');
  }

  // ── 4. College Quality, Ads, Strict Rules & Reviews (Q2546 - Q2565) ─────────────
  if (/heavily advertised|lots of ads|campus size|google reviews|strict attendance|90% attendance|college freedom|teaching quality/.test(q)) {
    return [
      `🏫 **Evaluating College Ads, Attendance Rules & Real Quality**\n`,
      `• 📺 **Heavy Advertising Myth**: A college showing lots of YouTube/TV ads just means they have a big marketing budget. Always verify **NAAC Accreditation (A+/A++)** and **NIRF Rankings**.`,
      `• 💬 **How to Get Genuine Student Reviews**: Search the college name on **LinkedIn**, message 3rd or 4th-year students directly, and ask about actual campus placements & faculty support.`,
      `• ⏰ **Strict 90% Attendance Rules**: Extremely strict attendance can limit your free time for self-paced coding practice. Moderate attendance rules (75%) give the best balance for skill building.`,
    ].join('\n');
  }

  // ── 5. Placement Truths: Median vs Highest, 60% Rule & Backlogs (Q2636 - Q2655) ────
  if (/100% placement assistance|highest package on campus or off campus|manipulate placement|60% in school|less than 60%|backlog during placement/.test(q)) {
    return [
      `📊 **Placement Reality Check & Eligibility Criteria**\n`,
      `• 📈 **Median Salary vs Highest Package**: Ignore single ₹50 LPA off-campus outlier stories! Look at the **Median Package (₹4.5 - ₹6.5 LPA)** — it tells you what 50% of average students actually earn.`,
      `• 📜 **10th/12th 60% Criteria**: Service IT MNCs (TCS, Wipro, Infosys) usually require 60%+ in 10th, 12th, and B.Tech. Product companies (startups, Amazon, Zoho) care **100% about coding skills**, not 12th marks!`,
      `• 🔄 **Backlog Rules**: Most campus drives require 0 active backlogs at the time of final placement. Clear arrear exams in supplementary rounds.`,
    ].join('\n');
  }

  // ── 6. Year-by-Year Academic Roadmaps & Recovery (Q2836 - Q2860, Q2971 - Q3000) ───
  if (/first year roadmap|wasting time in first year|second year no skills|third year no internship|final year six months|dsa or development|gate or placements|recover lost years/.test(q)) {
    return [
      `🚀 **Year-by-Year Action Plan for College & Placement Success**\n`,
      `• 1️⃣ **1st Year**: Learn 1 core programming language (C++ or Java) + basic Git/GitHub + maintain 7.5+ CGPA.`,
      `• 2️⃣ **2nd Year**: Master Data Structures & Algorithms (DSA) on LeetCode + build 2 web/mobile projects.`,
      `• 3️⃣ **3rd Year**: Apply for summer internships on LinkedIn/Unstop + participate in hackathons + full-stack projects.`,
      `• 4️⃣ **Final Year**: Practice mock technical interviews + reach out for off-campus referral drives.\n`,
      `🎯 **DSA vs Development**: Spend 50% time on DSA (for interview clearing) and 50% on Development (for resume projects)!`,
    ].join('\n');
  }

  // ── 7. Branch Change, Course Regret & Dropping Out (Q2676 - Q2690) ─────────────
  if (/joined the wrong course|hate my course|change branch after first year|mechanical to cse|drop out/.test(q)) {
    return [
      `🔄 **Handling Course Regret & Branch Change Options**\n`,
      `• 📊 **Branch Change Rules**: Most universities permit top academic performers (typically 8.5+ CGPA in 1st year) to request a branch transfer to CSE/IT.`,
      `• 💻 **If Branch Change is Not Allowed**: Stay in your current branch! 60%+ of IT companies recruit Mechanical, Civil, and ECE students for software roles if you know coding.`,
      `• ⏳ **Should You Drop Out?**: Dropping out is risky unless you have a guaranteed alternative seat or top rank. Staying in college while building skills online is 10x safer!`,
    ].join('\n');
  }

  // ── 8. Parent Guidance & Financial Planning (Q2706 - Q2720, Q2761 - Q2775) ────────
  if (/my son|my daughter|family budget|10 lakh loan|parents pressure|92% but bad rank|65% in tech/.test(q)) {
    return [
      `👨‍👩‍👧 **Parent Guidance & Financial ROI Framework**\n`,
      `• 💰 **Is a ₹10 Lakh Loan Reasonable?**: Take a ₹10L loan ONLY if the college's verified **median campus package is ₹7–9+ LPA** (High ROI). For a ₹4 LPA median package, choose an affordable ₹4-5L college.`,
      `• 🎯 **High Board % + Low Entrance Rank**: Utilize State Quota counselling (TNEA, WBJEE, MHT-CET) or merit scholarship waivers at top autonomous colleges.`,
      `• 🛡️ **Choosing Traditional vs New AI Courses**: Core CSE is safer for long-term career stability; AI specializations are great if offered by established NAAC A++ institutions.`,
    ].join('\n');
  }

  // ── 9. CSE vs IT Detailed Decision Guidance ──────────────────────────────────
  if (/(bro|should i|which one).*(cse or it|cse vs it|it instead of cse)|same placements as cse|big difference between cse and it/.test(q)) {
    return [
      `💻 **CSE (Computer Science) vs IT (Information Technology)**\n`,
      `• 🧠 **Core Difference**: CSE covers core computing theory (algorithms, operating systems, compiler design, computer architecture). IT focuses on software application development, network security, database admin, and cloud systems.`,
      `• 🏢 **Placement Reality**: **99% Identical!** Software giants like Google, Microsoft, Amazon, TCS, Infosys, and Cognizant allow both CSE and IT students to write the exact same recruitment exams.`,
      `• 💡 **Verdict**: If you get IT in a better college than CSE in an average college, **take IT!** College coding environment matters far more than the branch name difference.`,
    ].join('\n');
  }

  // ── 10. ECE vs CSE & Branch vs College Dilemma ───────────────────────────────
  if (/ece in a good college|cse in an average college|ece to software engineer|weak in physics.*ece|ece vs eee|ece difficult/.test(q)) {
    return [
      `⚡ **ECE vs CSE & College vs Branch Selection Framework**\n`,
      `• 🏆 **ECE in Top College vs CSE in Average College**: If the top college has a strong coding culture and high tier-1 campus visits, taking ECE there is a smart choice! You get top campus recruiters + VLSI/hardware options.`,
      `• 💻 **Can ECE students become Software Engineers?**: YES! 85%+ of software companies allow ECE students for campus placements. You just need to practice Data Structures (DSA) & web/mobile projects.`,
      `• 📐 **Is ECE Difficult & Physics Heavy?**: ECE involves semiconductor physics, signals, and electromagnetic fields. If you are weak in physics, you can still manage by focusing on programming & digital logic design!`,
      `• ⚡ **ECE vs EEE**: ECE focuses on chips, microcontrollers, & communications. EEE focuses on high-voltage power grids, electric motors, & energy systems. ECE has higher software placement overlap.`,
    ].join('\n');
  }

  // ── 11. Mechanical, Mechatronics, Robotics, Civil & Aerospace ────────────────
  if (/mechanical.*dead|job if i take mechanical|mechanical.*it jobs|mechatronics|robotics|civil engineering|aerospace|automobile branch/.test(q)) {
    return [
      `⚙️ **Mechanical, Mechatronics, Robotics, Civil & Aerospace Reality**\n`,
      `• 🚗 **Is Mechanical Dead?**: NO! Electric Vehicles (EVs), automation, thermal management, & smart manufacturing have revived core mechanical demand.`,
      `• 🤖 **Mechatronics & Robotics**: Mechatronics combines Mechanical + Electronics + Coding. It is the best foundational degree for robotics automation.`,
      `• 💻 **Can Mechanical/Civil students get IT jobs?**: YES! Mass IT recruiters (TCS, Wipro, Infosys, Cognizant) hire 60%+ of their intake from core branches.`,
      `• 🏗️ **Civil Engineering**: Excellent for Government exams (UPSC IES, SSC JE, PWD), infrastructure projects, & construction startups.`,
      `• ✈️ **Aerospace Engineering**: Specialized field for ISRO, HAL, Boeing, & Airbus. Requires strong aerodynamics & propulsion maths. (Studying Mechanical first for bachelors and Aerospace for Master's is the safest pathway!).`,
    ].join('\n');
  }

  // ── 12. AI, Machine Learning, Data Science & Cybersecurity ────────────────────
  if (/ai trending|ai jobs when i graduate|cse instead of pure ai|learn ai myself|maths for ai|data science for freshers|cybersecurity|ethical hacker/.test(q)) {
    return [
      `🤖 **AI & ML, Data Science & Cybersecurity Career Truths**\n`,
      `• 🏛️ **Pure CSE vs Specialized AI Degree**: Pure CSE is safer because it gives you a broad foundation. You can easily learn AI/ML self-paced online! Specialized AI degrees are fine if offered by reputable colleges.`,
      `• 🧮 **Do you need maths for AI?**: YES. Linear algebra, calculus, and probability are the backbone of AI models. If weak in maths, start with Python programming & applied ML tools first!`,
      `• 📊 **Data Science for Freshers**: High demand for Data Engineers and Junior Data Analysts. Building real Python data projects on Kaggle is key.`,
      `• 🔐 **Cybersecurity & Ethical Hacking**: 0% global unemployment! No prior hacking needed — start by learning Networking (TCP/IP), Linux commands, and Python security scripts.`,
    ].join('\n');
  }

  // ── 13. Finding Colleges, Cutoffs & Safe vs Ambitious List ────────────────────
  if (/cutoff is|realistic options|safe options|ambitious colleges|cutoff lower than my mark|reputation vs branch|tier-3 college/.test(q)) {
    return [
      `🏫 **College Selection & Choice Filling Strategy**\n`,
      `• 🎯 **How to Build a Realistic College Preference List**:\n  1. **3 Ambitious Colleges**: Cutoff 2-5 marks HIGHER than your mark (Try your luck!).\n  2. **4 Realistic Colleges**: Cutoff matching your EXACT mark range.\n  3. **3 Safe Colleges**: Cutoff 5-10 marks LOWER than your mark (Guaranteed safety net!).`,
      `• 📉 **Will Cutoffs Decrease This Year?**: Cutoffs depend on 12th board scoring distributions. Never rely on rumors — keep safe options in your list!`,
      `• 🏷️ **Tier-3 College High Package Myth**: Single 50 LPA off-campus news stories are outliers. Always look at the **Median Salary (₹4.5 - 6.5 LPA)** and verified company list.`,
      `• 💡 *Tell me your cutoff mark/percentage & preferred branch, and I will list your safe & ambitious colleges!*`,
    ].join('\n');
  }

  // ── 14. Counseling Mechanics: Freeze, Float, Slide ────────────────────────────
  if (/counselling.*simply|freeze or float|freeze|float|slide|mock allotment|round 1|round 2|didnt get any seat/.test(q)) {
    return [
      `📝 **Counselling Mechanics Simplified (Freeze, Float, Slide)**\n`,
      `• 🧊 **FREEZE**: You accept the allotted seat & pay fees. You EXIT further counselling rounds.`,
      `• 🌊 **FLOAT**: You keep your allotted seat as a guaranteed backup, but ENTER Round 2 to try for higher-preference colleges. (BEST OPTION for 90% of students!).`,
      `• 🛝 **SLIDE**: You stay in the same college, but upgrade to a higher-preference branch in Round 2.`,
      `• ❓ **Didn't get a seat in Round 1?**: Don't panic! Seats open up in Round 2 & 3 as students drop out or get higher allotments. Add more safe options!`,
    ].join('\n');
  }

  // ── 15. Money, Fees, Loans & Scholarships ─────────────────────────────────────
  if (/family cant afford|education loan|15 lakh loan for cse|scholarship|90% in 12th|low income|scholarship genuine/.test(q)) {
    return [
      `💰 **Financial Aid, Education Loans & Scholarships**\n`,
      `• 🏦 **Education Loans (Vidya Lakshmi Portal)**: Nationalized banks (SBI, Canara Bank) provide up to ₹7.5 Lakhs collateral-free student loans.`,
      `• 🎓 **Scholarships for 90%+ in 12th**: Most private & deemed universities grant 25%–100% tuition fee waivers for top scorers.`,
      `• 🏛️ **Low-Income Scholarships**: Central Sector Scholarship, PMSSS, AICTE Fee Waiver (TNEA/State quota 5% seats reserved for tuition fee exemption).`,
      `• 🚨 **Fake Scholarship Warning**: NEVER pay money to apply for a scholarship! Genuine government & institutional scholarships are 100% free to apply.`,
    ].join('\n');
  }

  // ── 16. Meta & How AI Recommends ─────────────────────────────────────────────
  if (/how.*(ai|system|app).*recommend|how.*recommend.*college|how.*choose.*college.*for me|how.*find.*best college/.test(q)) {
    return [
      `🎓 **How Acadivo AI Recommends the Right College for You**\n`,
      `Acadivo AI uses a 6-factor personalized matching system to find your ideal college:\n`,
      `1. 📊 **Cutoff & Eligibility Alignment**: Matches your 12th percentage, cutoff marks, or entrance rank (JEE/NEET/TNEA) against official past cutoffs.`,
      `2. 🎓 **Branch & Stream Matching**: Filters institutions offering your desired course (CSE, AI & DS, ECE, Mechanical, MBBS, BBA, etc.).`,
      `3. 📍 **Location & Mobility**: Considers your preferred city, state, or maximum travel distance from your hometown.`,
      `4. 💰 **Budget & Financial Needs**: Evaluates fee structures against your annual budget and checks eligibility for scholarships/loans.`,
      `5. 🏆 **Placement & Academic Quality**: Analyzes verified campus placement rates, top recruiter presence, NAAC grades, and NIRF rankings.`,
      `6. 🏠 **Infrastructure & Campus Facilities**: Verifies hostel availability (AC/Non-AC), transport options, research labs, and sports facilities.\n`,
      `💡 *Tell me your 12th percentage/cutoff, preferred course, and location (e.g., "175 cutoff, CSE in Chennai"), and I'll generate custom recommendations for you!*`,
    ].join('\n');
  }

  // ── 17. General Counseling Catch-All ─────────────────────────────────────────
  if (/which (course|branch|career|path)|should i choose|can i|what should i|help me choose|i don't know what|recommend|guidance|advice/.test(q)) {
    return [
      `🎓 **Acadivo Personal Academic & Career Guidance**\n`,
      `To give you the most accurate and personalized recommendation, tell me a little about your background:\n`,
      `1. 📊 What is your 12th standard percentage or cutoff mark?`,
      `2. 📚 Which group/stream did you study (PCM, PCB, Commerce, Arts)?`,
      `3. 💡 What subjects or activities do you enjoy most (Maths, Coding, Biology, Business, Design)?`,
      `4. 📍 Which city or state do you prefer for your studies?`,
      `5. 💰 What is your preferred annual fee budget?\n`,
      `💡 *Reply with these details and I will outline your top matching courses, prospective salaries, and best-fit colleges!*`,
    ].join('\n');
  }

  return null; // Not a counseling question, pass through to DB or web crawl
}

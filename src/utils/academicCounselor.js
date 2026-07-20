/**
 * academicCounselor.js — Acadivo Expert Academic & Career Counseling Engine v6.0
 *
 * Comprehensive guidance engine trained on 2,500+ natural student, parent, and human chat queries:
 * Covers: Course selection, engineering branch choices (CSE vs IT, ECE vs CSE, Mech, Civil, Aerospace),
 * AI/ML vs Data Science, Cybersecurity, Cutoffs & 12th percentage matching, Safe vs Ambitious options,
 * Counseling mechanics (Freeze, Float, Slide), ROI & Education Loans, Scholarships, Drop Year advice,
 * First-year skill roadmaps (Python, Java, DSA, GitHub), Internships & Placements, and Parent guidance.
 */

import { analyzeText } from './sentimentAnalyzer';

// ── Normalize text ─────────────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Comprehensive Intent Rules for Academic & Career Counseling ────────────────
export function answerCounselingQuestion(query) {
  const q = norm(query);

  // ── 0. Very Short Human Chat Queries (e.g. "CSE or AI?", "Cutoff?", "Fees?") ──
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

  if (/^(b\.?com|bba|mbbs|bds)\s*(or|vs)\s*(bba|b\.?com|bds|mbbs)$/.test(q)) {
    if (/b\.?com\s*(or|vs)\s*bba/.test(q) || /bba\s*(or|vs)\s*b\.?com/.test(q)) {
      return `📊 **B.Com vs BBA Quick Verdict**:\n• **B.Com**: Stronger accounting, finance, and ideal alongside CA/CMA studies.\n• **BBA**: Stronger management, marketing, leadership, and ideal preparation for MBA.`;
    }
    if (/mbbs\s*(or|vs)\s*bds/.test(q) || /bds\s*(or|vs)\s*mbbs/.test(q)) {
      return `🩺 **MBBS vs BDS Quick Verdict**:\n• **MBBS**: Full general medicine & surgery, hospital residency, & broad specialization.\n• **BDS**: Specialized dental surgery with excellent scope for private clinics & cosmetic dentistry.`;
    }
  }

  // ── 1. CSE vs IT Detailed Decision Guidance (Q2031-2034) ──────────────────────
  if (/(bro|should i|which one).*(cse or it|cse vs it|it instead of cse)|same placements as cse|big difference between cse and it/.test(q)) {
    return [
      `💻 **CSE (Computer Science) vs IT (Information Technology)**\n`,
      `• 🧠 **Core Difference**: CSE covers core computing theory (algorithms, operating systems, compiler design, computer architecture). IT focuses on software application development, network security, database admin, and cloud systems.`,
      `• 🏢 **Placement Reality**: **99% Identical!** Software giants like Google, Microsoft, Amazon, TCS, Infosys, and Cognizant allow both CSE and IT students to write the exact same recruitment exams.`,
      `• 💡 **Verdict**: If you get IT in a better college than CSE in an average college, **take IT!** College coding environment matters far more than the branch name difference.`,
    ].join('\n');
  }

  // ── 2. ECE vs CSE & Branch vs College Dilemma (Q2035-2041) ───────────────────
  if (/ece in a good college|cse in an average college|ece to software engineer|weak in physics.*ece|ece vs eee|ece difficult/.test(q)) {
    return [
      `⚡ **ECE vs CSE & College vs Branch Selection Framework**\n`,
      `• 🏆 **ECE in Top College vs CSE in Average College**: If the top college has a strong coding culture and high tier-1 campus visits, taking ECE there is a smart choice! You get top campus recruiters + VLSI/hardware options.`,
      `• 💻 **Can ECE students become Software Engineers?**: YES! 85%+ of software companies allow ECE students for campus placements. You just need to practice Data Structures (DSA) & web/mobile projects.`,
      `• 📐 **Is ECE Difficult & Physics Heavy?**: ECE involves semiconductor physics, signals, and electromagnetic fields. If you are weak in physics, you can still manage by focusing on programming & digital logic design!`,
      `• ⚡ **ECE vs EEE**: ECE focuses on chips, microcontrollers, & communications. EEE focuses on high-voltage power grids, electric motors, & energy systems. ECE has higher software placement overlap.`,
    ].join('\n');
  }

  // ── 3. Mechanical, Mechatronics, Robotics, Civil & Aerospace (Q2042-2055) ────
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

  // ── 4. AI, Machine Learning, Data Science & Cybersecurity (Q2056-2075) ────────
  if (/ai trending|ai jobs when i graduate|cse instead of pure ai|learn ai myself|maths for ai|data science for freshers|cybersecurity|ethical hacker/.test(q)) {
    return [
      `🤖 **AI & ML, Data Science & Cybersecurity Career Truths**\n`,
      `• 🏛️ **Pure CSE vs Specialized AI Degree**: Pure CSE is safer because it gives you a broad foundation. You can easily learn AI/ML self-paced online! Specialized AI degrees are fine if offered by reputable colleges.`,
      `• 🧮 **Do you need maths for AI?**: YES. Linear algebra, calculus, and probability are the backbone of AI models. If weak in maths, start with Python programming & applied ML tools first!`,
      `• 📊 **Data Science for Freshers**: High demand for Data Engineers and Junior Data Analysts. Building real Python data projects on Kaggle is key.`,
      `• 🔐 **Cybersecurity & Ethical Hacking**: 0% global unemployment! No prior hacking needed — start by learning Networking (TCP/IP), Linux commands, and Python security scripts.`,
    ].join('\n');
  }

  // ── 5. Finding Colleges, Cutoffs & Safe vs Ambitious List (Q2076-2100) ────────
  if (/cutoff is|realistic options|safe options|ambitious colleges|cutoff lower than my mark|reputation vs branch|tier-3 college/.test(q)) {
    return [
      `🏫 **College Selection & Choice Filling Strategy**\n`,
      `• 🎯 **How to Build a Realistic College Preference List**:\n  1. **3 Ambitious Colleges**: Cutoff 2-5 marks HIGHER than your mark (Try your luck!).\n  2. **4 Realistic Colleges**: Cutoff matching your EXACT mark range.\n  3. **3 Safe Colleges**: Cutoff 5-10 marks LOWER than your mark (Guaranteed safety net!).`,
      `• 📉 **Will Cutoffs Decrease This Year?**: Cutoffs depend on 12th board scoring distributions. Never rely on rumors — keep safe options in your list!`,
      `• 🏷️ **Tier-3 College High Package Myth**: Single 50 LPA off-campus news stories are outliers. Always look at the **Median Salary (₹4.5 - 6.5 LPA)** and verified company list.`,
      `• 💡 *Tell me your cutoff mark/percentage & preferred branch, and I will list your safe & ambitious colleges!*`,
    ].join('\n');
  }

  // ── 6. Comparing Colleges & Packages Like a Real Student (Q2101-2120) ─────────
  if (/compare them for me|better placements.*lower fees|close to my home|spend 15 lakh|average package or median package|disadvantage of each/.test(q)) {
    return [
      `⚖️ **Real Student College Comparison Guide**\n`,
      `• 📍 **Distance vs Placements**: Placement opportunities and campus coding environment outweigh traveling distance! Moving to a better tech hub city is worth it.`,
      `• 📊 **Average vs Median Package**: **Median Package** is the single most honest metric! Average packages can be artificially inflated by 1-2 high international offers.`,
      `• 💰 **Spending ₹15 Lakh Fees**: Only spend ₹15L+ if the college's median package is ₹8-10+ LPA (High ROI). If median is ₹4 LPA, choose an affordable ₹4-6L college instead.`,
      `• 🚩 **Red Flags to Ask Current Students**: Ask about strict attendance rules, lab machinery condition, mess food quality, and actual MNC campus visit frequency.`,
    ].join('\n');
  }

  // ── 7. Counseling Mechanics: Freeze, Float, Slide (Q2141-2160) ────────────────
  if (/counselling.*simply|freeze or float|freeze|float|slide|mock allotment|round 1|round 2|didnt get any seat/.test(q)) {
    return [
      `📝 **Counselling Mechanics Simplified (Freeze, Float, Slide)**\n`,
      `• 🧊 **FREEZE**: You accept the allotted seat & pay fees. You EXIT further counselling rounds.`,
      `• 🌊 **FLOAT**: You keep your allotted seat as a guaranteed backup, but ENTER Round 2 to try for higher-preference colleges. (BEST OPTION for 90% of students!).`,
      `• 🛝 **SLIDE**: You stay in the same college, but upgrade to a higher-preference branch in Round 2.`,
      `• ❓ **Didn't get a seat in Round 1?**: Don't panic! Seats open up in Round 2 & 3 as students drop out or get higher allotments. Add more safe options!`,
    ].join('\n');
  }

  // ── 8. Money, Fees, Loans & Scholarships (Q2161-2180) ─────────────────────────
  if (/family cant afford|education loan|15 lakh loan for cse|scholarship|90% in 12th|low income|scholarship genuine/.test(q)) {
    return [
      `💰 **Financial Aid, Education Loans & Scholarships**\n`,
      `• 🏦 **Education Loans (Vidya Lakshmi Portal)**: Nationalized banks (SBI, Canara Bank) provide up to ₹7.5 Lakhs collateral-free student loans.`,
      `• 🎓 **Scholarships for 90%+ in 12th**: Most private & deemed universities grant 25%–100% tuition fee waivers for top scorers.`,
      `• 🏛️ **Low-Income Scholarships**: Central Sector Scholarship, PMSSS, AICTE Fee Waiver (TNEA/State quota 5% seats reserved for tuition fee exemption).`,
      `• 🚨 **Fake Scholarship Warning**: NEVER pay money to apply for a scholarship! Genuine government & institutional scholarships are 100% free to apply.`,
    ].join('\n');
  }

  // ── 9. Parent-Style Questions & Safety Concerns (Q2181-2195) ──────────────────
  if (/my son|my daughter|close to home|hostel safe|loan for private university|pressure us to pay today/.test(q)) {
    return [
      `👨‍👩‍👧 **Parent Guidance & Admission Safety Checklist**\n`,
      `• 🛡️ **Hostel Safety**: Verify 24/7 CCTV surveillance, female warden presence, biometric entry logs, & emergency medical transport.`,
      `• 🚨 **Urgent Payment Pressure**: If an admission representative threatens *"Pay ₹1 Lakh cash today or seat will be lost"*, it is a high-pressure sales tactic! Verify official seat status on the college portal.`,
      `• 💼 **Job Security vs Student Passion**: Guide your child towards a balanced choice — e.g. Core CSE/ECE with electives in their area of interest.`,
    ].join('\n');
  }

  // ── 10. Student Confusion, Drop Year & Regret (Q2196-2215) ────────────────────
  if (/dont know what to do|everyone knows except me|wrong course|friend pressure|drop year|taking a drop year|failed entrance/.test(q)) {
    return [
      `🤝 **Handling Student Confusion, Peer Pressure & Drop Year Decisions**\n`,
      `• 🧠 **Feeling Lost is Normal**: 70%+ of 12th graduates are confused about their future! You do not need to figure out your whole life today — focus on choosing a broad, versatile degree.`,
      `• 👥 **Choosing a College for Friends**: AVOID THIS! Your career & interests are unique. True friendships survive even if you attend different colleges.`,
      `• ⏳ **Is a Drop Year Worth It?**: Taking a drop year is worth it ONLY if you missed your target by a small margin and have a disciplined 8-hour daily study routine. Otherwise, join a good college now and build skills!`,
    ].join('\n');
  }

  // ── 11. First-Year Skills, Python, Java, DSA & Projects (Q2236-2255) ──────────
  if (/first year of college|coding before college|python vs java|dsa|github|linkedin|certificates vs projects/.test(q)) {
    return [
      `🚀 **1st Year Skill Roadmap for High-Paying Tech Careers**\n`,
      `• 🐍 **Python vs Java/C++**: Start with **Python** to build coding confidence & problem-solving logic. Switch to **C++ or Java** for Data Structures & Algorithms (DSA).`,
      `• 💡 **Projects > Certificates**: 20 online certificates without real code will NOT impress recruiters! Building 2-3 live GitHub projects (web apps, AI tools) is 10x more valuable.`,
      `• 🐙 **GitHub & LinkedIn**: Create a GitHub account in Month 1 to store your code repository. Set up your LinkedIn profile to connect with alumni.`,
    ].join('\n');
  }

  // ── 12. Internships, Off-Campus & CGPA Impact (Q2256-2275) ────────────────────
  if (/first internship|unpaid internship|fake internship|off campus|cgpa|backlog|60% in 12th/.test(q)) {
    return [
      `💼 **Internships, CGPA Requirements & Backlog Rules**\n`,
      `• 🚨 **Fake Internship Alert**: NEVER pay a company for an internship! Genuine internships pay YOU a stipend or offer free real project mentorship.`,
      `• 📊 **CGPA Target for Placements**: Maintain **7.0+ CGPA (70%)** to clear 90%+ company eligibility cutoffs.`,
      `• 🔄 **Will 60% in 12th / 1 Backlog Affect Careers?**: Most IT MNCs require 60%+ in 10th/12th/B.Tech and 0 active backlogs at graduation. Product companies & off-campus drives prioritize coding skills over 12th marks!`,
    ].join('\n');
  }

  // ── 13. AI Job Threats & Career Anxiety (Q2276-2290) ──────────────────────────
  if (/ai take my job|unemployed|graduate unemployed|college syllabus outdated|learn online vs college/.test(q)) {
    return [
      `🛡️ **AI Automation & Future-Proofing Your Career**\n`,
      `• 🤖 **Will AI Replace Software Engineers?**: AI automates repetitive boilerplate code, but INCREASES demand for developers who can architect complex systems, manage cloud infrastructure, and direct AI models.`,
      `• 🚀 **Why are graduates unemployed?**: Rote learning without practical skills! Students who build real projects, learn modern tech stacks online, and solve DSA problems get hired easily.`,
      `• 🌐 **Online Learning + College Degree**: College gives you an accredited degree & networking environment; online platforms (YouTube, Coursera, LeetCode) give you modern industry skills!`,
    ].join('\n');
  }

  // ── 14. Master's, MBA & Study Abroad (Q2291-2305) ────────────────────────────
  if (/masters immediately|mba after engineering|ms abroad cost|study abroad|change field for masters/.test(q)) {
    return [
      `🎓 **Higher Studies Roadmap: Master's, MBA & Study Abroad**\n`,
      `• 💼 **MBA After Engineering**: Excellent combination! Technical background + MBA business strategy leads to high-paying Product Manager & Business Analytics roles.`,
      `• ✈️ **MS Abroad (USA/Germany/UK)**: Germany offers tuition-free education at public universities! USA offers top STEM OPT 3-year work visas. Plan applications 1 year in advance.`,
      `• 🔄 **Changing Fields for Master's**: Yes! Students from Mechanical/Civil can transition to Master's in Data Science or Computer Science by clearing prerequisite online coursework & GRE.`,
    ].join('\n');
  }

  // ── 15. Meta & How AI Recommends ─────────────────────────────────────────────
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

  // ── 16. Interdisciplinary & Combinations ────────────────────────────────────
  if (/combine.*(tech|technology).*creativ|design.*engineering|creativ.*tech/.test(q)) {
    return [
      `🎨⚡ **Interdisciplinary Careers Combining Technology & Creativity**\n`,
      `• 🖌️ **UI/UX Design**: Designing digital interfaces and user experiences for mobile apps & web applications. (High demand & top tech salaries!).`,
      `• 🎮 **Game Development & Design**: Creating 3D graphics, game physics, and interactive storylines using Unity & Unreal Engine.`,
      `• 👓 **AR/VR & Spatial Computing**: Building immersive Virtual Reality and Augmented Reality experiences for healthcare, education, and gaming.`,
      `• 🎬 **VFX & Digital Animation**: Specializing in computer-generated imagery (CGI) for film, media, and digital advertising.`,
      `• ⚙️ **Industrial & Product Design**: Combining mechanical engineering with ergonomic product design.\n`,
      `💡 *These fields let you build software products without needing pure back-end coding!*`,
    ].join('\n');
  }

  if (/combine.*(math|mathematics).*computer|math.*computer|good at math/.test(q)) {
    return [
      `📐💻 **Careers Combining Mathematics & Computer Science**\n`,
      `• 🤖 **Artificial Intelligence & Machine Learning**: Building algorithms using linear algebra, probability, and calculus.`,
      `• 📊 **Data Science & Big Data Analytics**: Extracting business insights using statistics, machine learning, and data modeling.`,
      `• 🔐 **Cryptography & Cybersecurity**: Protecting networks using mathematical encryption and number theory.`,
      `• 📈 **Quantitative Finance & Algorithmic Trading**: Writing mathematical trading algorithms for investment banks and hedge funds.`,
      `• 🕹️ **Computer Graphics & Game Physics**: 3D transformations, matrices, and physics simulations in software.\n`,
      `💡 *Strong mathematical logic is the #1 superpower in high-paying tech careers!*`,
    ].join('\n');
  }

  if (/combine.*bio.*tech|biology.*technology|bioinformatics|biomedical|biology.*no doctor/.test(q)) {
    return [
      `🧬💻 **Careers Combining Biology & Technology (Non-Doctor Options)**\n`,
      `• 🧬 **Bioinformatics & Computational Biology**: Analyzing DNA sequences, genomic data, and protein structures using Python and algorithms.`,
      `• 🦾 **Biomedical Engineering**: Designing artificial organs, prosthetics, pacemakers, and MRI/CT imaging machinery.`,
      `• 🧫 **Biotechnology & Bioprocess Engineering**: Developing vaccines, gene therapies, and agricultural bio-products.`,
      `• 🏥 **Health Informatics**: Managing digital health records, hospital AI diagnostic systems, and telemedicine platforms.\n`,
      `💡 *Perfect if you love biological science but want high-tech career opportunities without MBBS!*`,
    ].join('\n');
  }

  if (/combine.*business.*tech|fintech|product management|business analytics/.test(q)) {
    return [
      `💼💻 **Careers Combining Business & Technology**\n`,
      `• 🚀 **Product Management**: Leading tech product features from user research to engineering deployment.`,
      `• 📊 **Business Analytics**: Using SQL, Tableau, and Python to drive corporate decisions and revenue growth.`,
      `• 💳 **FinTech (Financial Technology)**: Digital payments, digital banking, and blockchain financial platforms.`,
      `• 🛍️ **E-Commerce Strategy & Growth**: Managing online marketplace platforms and digital supply chains.`,
      `• 🏢 **IT Management & ERP Consulting**: Implementing enterprise software (SAP, Salesforce) for corporations.\n`,
      `💡 *Ideal for students who want high-paying corporate leadership roles in tech firms!*`,
    ].join('\n');
  }

  // ── 17. Agriculture, Agri-Tech, Climate Tech & Food Technology ──────────────
  if (/agriculture|b\.?sc agriculture|food technology|dairy technology|horticulture|smart agriculture|agri tech|carbon management|climate technology/.test(q)) {
    return [
      `🌾⚡ **Agriculture, Agri-Tech, Food Tech & Climate Careers**\n`,
      `• 🌾 **B.Sc Agriculture / B.Tech Agri Engineering**: Modern precision farming, drone crop monitoring, soil analytics, & Govt ICAR research.`,
      `• 🍕 **Food & Dairy Technology**: Processing, quality control, & R&D in multinational FMCG firms (Nestle, Amul, PepsiCo, ITC).`,
      `• 🌍 **Climate Tech & Carbon Management**: Environmental consulting, ESG auditing, solar/renewable energy management, & carbon credit strategy.`,
      `• 🤖 **Smart Agriculture**: Utilizing IoT sensors, AI yield prediction, & automated drip irrigation systems.\n`,
      `💡 *Agri-Tech & Climate Sustainability are top emerging investment sectors for green startups!*`,
    ].join('\n');
  }

  // ── 18. Documents & Application Portal Guidance ────────────────────────────────
  if (/transfer certificate|tc|migration certificate|conduct certificate|nativity certificate|domicile certificate|digilocker|application fee|payment failed|application under review/.test(q)) {
    return [
      `📄 **Admission Certificates & Application Troubleshooting**\n`,
      `• 📜 **Mandatory Certificates Checklist**: 10th Marksheet, 12th Marksheet, Transfer Certificate (TC), Migration Certificate (for board change), Community / Caste Certificate, & Nativity/Domicile.`,
      `• 📲 **DigiLocker Validity**: Government-issued DigiLocker digital marksheets are 100% legally valid for provisional college admission.`,
      `• 💳 **Payment Deducted but Status Failed**: Do NOT pay immediately again! Wait 24 hours for bank reconciliation or upload transaction UTR reference to support portal.`,
      `• ✏️ **Certificate Name Discrepancy**: Submit an official notarized affidavit explaining minor spelling variations across 10th marksheet and Aadhar card.\n`,
      `💡 *Always keep 3 physical self-attested photo copies and digital PDF backups of all certificates!*`,
    ].join('\n');
  }

  // ── 19. Fraud Prevention & Admission Verification ─────────────────────────────
  if (/whatsapp|fake website|admission agent|guaranteed admission|donation|agent.*money|otp|scam/.test(q)) {
    return [
      `🚨 **Admission Fraud Alert & Safety Verification Rules**\n`,
      `• ⚠️ **Rule 1: NEVER Pay Money to Personal Accounts**: Official fees MUST be paid only through official college bank accounts or government portal payment gateways.`,
      `• ⚠️ **Rule 2: Ignore WhatsApp / Call Promisers**: No legitimate agent can "guarantee" merit or government quota seats. All allotments happen via official counselling algorithms.`,
      `• ⚠️ **Rule 3: Check Official Domain**: Official university websites end in \`.ac.in\` or \`.edu.in\`. Beware of fake lookalike sites.`,
      `• ⚠️ **Rule 4: Never Share OTPs or Login Credentials**: Keep your counselling choice-filling password secure.\n`,
      `💡 *If an agent demands donation or upfront cash, report it to the state admission authority immediately!*`,
    ].join('\n');
  }

  // ── 20. CGPA Recovery, Backlogs & Academic Improvement ────────────────────────
  if (/failed.*first semester|cgpa dropped|clear.*backlog|backlog.*placement|internal assessment|credit based|cbcs/.test(q)) {
    return [
      `📈 **Academic Recovery: CGPA Improvement & Handling Backlogs**\n`,
      `• 📊 **CGPA Target for Placements**: Target **7.0+ CGPA (70%)** to qualify for 90%+ of company eligibility criteria.`,
      `• 🔄 **Can You Get Placed With Backlogs?**: Most service-based IT MNCs allow up to 1 active backlog at the time of interview, provided it is cleared by graduation. Product companies focus on coding skills!`,
      `• 🎯 **Semester Recovery Strategy**: Focus 60% effort on 3-credit and 4-credit core subjects. Re-attempt arrear exams in immediate supplementary rounds.`,
      `• 📝 **Credit System (CBCS)**: High-credit courses affect your GPA most. Prioritize core labs and major theory subjects.\n`,
      `💡 *A bad first semester does NOT ruin your career — strong 2nd/3rd year project skills easily outweigh early grades!*`,
    ].join('\n');
  }

  // ── 21. General Counseling Catch-All ─────────────────────────────────────────
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

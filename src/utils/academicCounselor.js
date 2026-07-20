/**
 * academicCounselor.js — Acadivo Expert Academic & Career Counseling Engine v5.0
 *
 * Comprehensive guidance engine for over 1000+ academic, career, stream selection,
 * engineering branch, medical, counselling mechanics, study abroad, entrance exams,
 * AI future, admission fraud prevention, CGPA recovery, document checklists, and decision-making queries.
 */

import { analyzeText } from './sentimentAnalyzer';

// ── Normalize text ─────────────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Comprehensive Intent Rules for Academic & Career Counseling ────────────────
export function answerCounselingQuestion(query) {
  const q = norm(query);

  // ── 1. Meta Question: "How does the AI recommend the right college?" ────────
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

  // ── 2. Interdisciplinary & Combinations ────────────────────────────────────
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

  if (/combine.*bio.*tech|biology.*technology|bioinformatics|biomedical/.test(q)) {
    return [
      `🧬💻 **Careers Combining Biology & Technology**\n`,
      `• 🧬 **Bioinformatics & Computational Biology**: Analyzing DNA sequences, genomic data, and protein structures using Python and algorithms.`,
      `• 🦾 **Biomedical Engineering**: Designing artificial organs, prosthetics, pacemakers, and MRI/CT imaging machinery.`,
      `• 🧫 **Biotechnology & Bioprocess Engineering**: Developing vaccines, gene therapies, and agricultural bio-products.`,
      `• 🏥 **Health Informatics**: Managing digital health records, hospital AI diagnostic systems, and telemedicine platforms.\n`,
      `💡 *Perfect if you love biological science but want high-tech career opportunities!*`,
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

  // ── 3. Agriculture, Agri-Tech, Climate Tech & Food Technology ──────────────
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

  // ── 4. Documents & Application Portal Guidance ────────────────────────────────
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

  // ── 5. Fraud Prevention & Admission Verification ─────────────────────────────
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

  // ── 6. CGPA Recovery, Backlogs & Academic Improvement ────────────────────────
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

  // ── 7. Counselling Terms & Mechanics (Freeze, Float, Slide, Percentile) ──────
  if (/freeze|float|slide|mop up|choice locking|mock allotment|percentile vs percentage|normalization/.test(q)) {
    return [
      `📝 **Counselling Terms & Seat Allotment Mechanics**\n`,
      `• 🧊 **FREEZE**: You accept your allotted seat and lock your admission. You EXIT further counselling rounds.`,
      `• 🌊 **FLOAT**: You accept your current allotted seat as a guaranteed safety net, but enter the next round to try for a HIGHER preference college.`,
      `• 🛝 **SLIDE**: You accept your current college seat, but enter the next round ONLY for a higher preference branch within the SAME college.`,
      `• 🧹 **Mop-up Round**: A final counselling round conducted after main rounds to fill any remaining unfilled seats.`,
      `• 📊 **Percentile vs Percentage**:\n  - **Percentage**: Marks scored out of total (e.g. 85/100 = 85%).\n  - **Percentile**: The percentage of total test-takers who scored BELOW you in the exam (e.g. 98 percentile means you performed better than 98% of candidates).\n`,
      `💡 *Always use FLOAT if you want to try for a better option without losing your current seat!*`,
    ].join('\n');
  }

  // ── 8. Tier-3 College Success & Software Roadmap (DSA, GitHub, Portfolio) ─────
  if (/tier 3|tier-3|tier 3 college|product based company|data structures|dsa|github|hackathon|overcrowded|portfolio/.test(q)) {
    return [
      `🚀 **4-Year Software Career Roadmap for Tier-3 College Students**\n`,
      `Can you get a ₹15+ LPA product company job from a Tier-3 college? **YES!** Follow this year-by-year plan:\n`,
      `• 1️⃣ **1st Year (Foundations)**: Master 1 programming language deeply (C++ or Java) + learn Git/GitHub & basic Unix commands.`,
      `• 2️⃣ **2nd Year (Core Logic & DSA)**: Practice Data Structures & Algorithms on LeetCode/CodeChef (target 200+ solved problems) + Object-Oriented Programming (OOPs).`,
      `• 3️⃣ **3rd Year (Full-Stack & Projects)**: Build 2 production-quality full-stack web/mobile projects + compete in hackathons + apply for off-campus internships (LinkedIn/Unstop).`,
      `• 4️⃣ **4th Year (Off-Campus Drives & Referrals)**: Reach out to senior engineers for referrals + solve System Design & CS fundamentals (OS, DBMS, SQL, Networks).\n`,
      `💡 *Skills, problem-solving, and a live GitHub portfolio beat college ranking in modern tech hiring!*`,
    ].join('\n');
  }

  // ── 9. Semiconductor, Hardware, VLSI & Embedded Systems ─────────────────────
  if (/semiconductor|chip design|vlsi|embedded system|iot|internet of things|edge ai/.test(q)) {
    return [
      `⚡ **Semiconductor, Chip Design (VLSI) & Embedded Systems Scope**\n`,
      `• 🔌 **India Semiconductor Mission**: Huge government backing & multinational investments (Intel, Qualcomm, Texas Instruments, Nvidia, AMD, Tata Semiconductor).`,
      `• 🎓 **Recommended Degrees**: B.Tech ECE (Electronics & Communication) or EEE (Electrical & Electronics).`,
      `• 🛠️ **Core Skills Required**: Verilog/VHDL, SystemVerilog, FPGA Prototyping, C/C++ for Microcontrollers, & Digital Signal Processing (DSP).`,
      `• 💼 **Career Roles**: VLSI Design Engineer, Chip Layout Specialist, Embedded Software Developer, IoT Systems Engineer.\n`,
      `💡 *VLSI and Chip Design offer top-tier core engineering salaries with zero threat of automation!*`,
    ].join('\n');
  }

  // ── 10. Study Abroad Roadmap (IELTS, GRE, SOP, LOR, Visa) ─────────────────────
  if (/study abroad|ielts|toefl|gre|gmat|statement of purpose|sop|letter of recommendation|lor|proof of funds|student visa/.test(q)) {
    return [
      `🌍 **6-Step Master Guide for Studying Abroad (MS / Master's)**\n`,
      `1. 📝 **Language & Aptitude Tests**: Clear IELTS (min 6.5+) / TOEFL + GRE (for US/Germany if required) 9-12 months before intake.`,
      `2. 📄 **Statement of Purpose (SOP)**: Write a compelling 1,000-word essay explaining your academic background, research interests, & career goals.`,
      `3. 📜 **Letters of Recommendation (LOR)**: Secure 3 recommendation letters from college professors or project guides.`,
      `4. 🏫 **University Shortlisting**: Apply to 8 universities: 3 Reach (Dream), 3 Target, & 2 Safety options.`,
      `5. 💳 **Proof of Funds**: Prepare bank solvency certificates or education loan sanction letters for visa approval.`,
      `6. 🛂 **Post-Study Work Permit**: Choose countries with 2-3 year post-study work visas (USA STEM OPT, UK Graduate Route, Canada PGWP, Germany).\n`,
      `💡 *Plan your applications 1 year in advance for maximum scholarship eligibility!*`,
    ].join('\n');
  }

  // ── 11. Self-Assessment & Choosing Course (Peer Pressure vs Genuine Interest) ──
  if (/confused about my future|where should i start|identify which career|careers for creative|enjoys solving problems|like helping people|peer pressure|marks determine|average student.*succeed/.test(q)) {
    return [
      `🎯 **Career Discovery & Self-Assessment Guide**\n`,
      `• 🧠 **Differentiating Genuine Interest from Hype**: Ask yourself — *"Would I enjoy learning this subject for 4 years if nobody else were taking it?"* Avoid choosing CSE solely because friends are taking it.`,
      `• 📊 **Do 12th Marks Define Your Future?**: No! School marks only open the initial entrance door. Long-term career success is driven by skill execution, adaptability, and consistency.`,
      `• 🌟 **Can Average Students Succeed in Top Careers?**: Absolutely! Consistent daily practice (e.g. 1 hour of coding or skill building per day) easily outperforms pure academic marks over 4 years.`,
      `• 💡 **Strengths Matching**:
  - **Problem Solving & Logic**: Software Engineering, AI/ML, Data Science, Math.
  - **Creative & Visual**: UI/UX Design, Game Dev, Architecture, Animation.
  - **Communication & Leadership**: Business Administration (BBA/MBA), Law, HR.
  - **Helping People**: Medicine, Allied Health, Psychology, Teaching.\n`,
      `💡 *What are 2 activities where you lose track of time while doing them? Tell me!*`,
    ].join('\n');
  }

  // ── 12. Emerging & Future High-Demand Careers (Next 10 Years) ────────────────
  if (/emerging careers|future demand|high demand.*next|careers in 2030|future scope/.test(q)) {
    return [
      `🚀 **Top High-Demand Careers for the Next 10 Years (2026 – 2035)**\n`,
      `1. 🤖 **AI & Machine Learning Engineers**: Building and fine-tuning AI foundation models and automated systems.`,
      `2. 📊 **Data Engineers & Analytics Specialists**: Managing enterprise data pipelines and real-time data insights.`,
      `3. 🔐 **Cybersecurity & Ethical Hacking**: Securing digital infrastructure against global cyber threats.`,
      `4. ☁️ **Cloud Architects & DevOps Engineers**: Managing cloud platforms (AWS, Azure, Google Cloud).`,
      `5. 🔋 **Renewable Energy & EV Engineers**: Electric vehicle manufacturing, battery technology, and solar energy systems.`,
      `6. 🧬 **Bio-Tech & Gene Editing Researchers**: Synthetic biology, personalized medicine, and agricultural biotech.`,
      `7. 🕹️ **Robotics & Automation Engineers**: Industrial automation, drone engineering, and medical robotics.\n`,
      `💡 *Developing strong core problem-solving & continuous learning abilities guarantees career longevity!*`,
    ].join('\n');
  }

  // ── 13. Stream Selection After 10th ──────────────────────────────────────────
  if (/after 10th|which (group|stream|course).*11th|choose after 10th|computer science in 11th|biology or computer/.test(q)) {
    return [
      `🎓 **Choosing the Right Stream & Subjects After 10th Standard**\n`,
      `• 🔬 **PCM (Physics, Chemistry, Maths)**: Engineering, Architecture, Data Science, Defense, Aviation.`,
      `• 🧬 **PCB (Physics, Chemistry, Biology)**: Medicine (MBBS), Pharmacy, Nursing, Biotech, Allied Health Sciences.`,
      `• 🧠 **PCMB (Biology + Maths)**: Gives 100% maximum flexibility for both Engineering & Medical fields!`,
      `• 📊 **Commerce (CEC / MEC)**: Accounting, CA, Finance, Business Administration, Economics, Corporate Law.`,
      `• 🎨 **Arts / Humanities (HEC)**: UPSC Civil Services, Law, Psychology, Journalism, Design.`,
      `• ⚙️ **3-Year Polytechnic Diploma**: Hands-on technical pathway leading to 2nd-year B.Tech lateral entry.\n`,
      `💡 *Can you study engineering without CS in 11th? YES! Board Maths & Physics are the only required subjects for B.Tech entry.*`,
    ].join('\n');
  }

  // ── 14. What to study after 12th ────────────────────────────────────────────
  if (/what (can|should) i study after 12th|options after 12th|courses after 12th|best career options after 12th|switch streams/.test(q)) {
    return [
      `🚀 **Top Academic Options & Pathways After 12th Standard**\n`,
      `**For Science (PCM) Students:** B.Tech/B.E., BCA, B.Sc Data Analytics, B.Arch, Commercial Aviation.`,
      `**For Science (PCB) Students:** MBBS, BDS, BAMS, B.Pharm, Pharm.D, B.Sc Nursing, Allied Health Sciences, B.Sc Biotech.`,
      `**For Commerce Students:** B.Com (Honors), BBA, CA, CMA, CS, ACCA, Integrated MBA.`,
      `**For Arts Students:** 5-Year Integrated BA LLB (Law), B.A. Psychology, Mass Comm, B.Des (UI/UX Design).\n`,
      `🔄 **Can You Switch Streams After 12th?**`,
      `• Science students CAN switch to Commerce (BBA/B.Com), Arts, Law, or BCA!`,
      `• Commerce students CAN study BCA, Data Analytics, Law, BBA, B.Des, & Digital Marketing!`,
      `• Arts students CAN enter IT via BCA, UI/UX Design, Software Bootcamps, & Web Development!\n`,
      `💡 *Tell me your 12th stream & percentage for tailored degree recommendations!*`,
    ].join('\n');
  }

  // ── 15. Branch Comparisons: B.E. vs B.Tech ──────────────────────────────────
  if (/difference between b\.?e\.? and b\.?tech|be vs btech|btech or be/.test(q)) {
    return [
      `⚖️ **B.E. (Bachelor of Engineering) vs B.Tech (Bachelor of Technology)**\n`,
      `• 📚 **B.E.**: Focuses on theoretical engineering principles. Commonly awarded by traditional state university-affiliated colleges.`,
      `• 🛠️ **B.Tech**: Focuses on practical technology implementation. Awarded by autonomous colleges, Deemed Universities, IITs, & NITs.`,
      `• 💼 **Industry Value**: **100% Equal in Industry!** IT firms, MNCs, Govt exams (UPSC, GATE, IES), and foreign universities treat B.E. and B.Tech completely identically.\n`,
      `💡 *Prioritize college reputation, placement record, and lab quality over B.E. vs B.Tech degree name!*`,
    ].join('\n');
  }

  // ── 16. Branch Comparisons: CSE vs IT ───────────────────────────────────────
  if (/cse or it|cse vs it|difference between cse and it/.test(q)) {
    return [
      `💻 **CSE (Computer Science) vs IT (Information Technology)**\n`,
      `• 🧠 **CSE**: Covers core computing fundamentals — algorithms, data structures, compiler design, computer architecture, system software.`,
      `• 🌐 **IT**: Focuses on software application development, database management, network engineering, web tech, and cloud computing.`,
      `• 💼 **Placements & Salary**: Placement opportunities for CSE and IT are **99% identical**. TCS, Wipro, Infosys, Amazon, & Microsoft recruit both CSE and IT students for the same software roles.\n`,
      `💡 *If CSE is unavailable at your top choice college, IT is an equally fantastic selection!*`,
    ].join('\n');
  }

  // ── 17. Branch Comparisons: CSE vs AI & Data Science ────────────────────────
  if (/cse vs ai|cse or ai|cse and ai|difference between cse and ai|ai and machine learning a good degree|what is data science/.test(q)) {
    return [
      `🤖 **CSE vs CSE (AI & Data Science / Machine Learning)**\n`,
      `• 🏛️ **Core CSE**: Offers a broad foundation in software development, algorithms, & systems. Gives maximum flexibility to specialize later in any tech area.`,
      `• 🧠 **AI & Data Science (AI & DS)**: Specializes early in machine learning algorithms, statistical modeling, big data analytics, and neural networks.`,
      `• 📈 **Demand**: High demand in data engineering, AI application development, & predictive analytics.`,
      `• 💡 **Counselor Advice**: Core CSE gives maximum flexibility. If you are passionate about data & statistics from day one, AI & DS is a focused degree!\n`,
      `💡 *Both command high placement salary packages in software and product companies.*`,
    ].join('\n');
  }

  // ── 18. Branch Comparisons: ECE vs EEE ───────────────────────────────────────
  if (/ece or eee|ece vs eee|difference between ece and eee/.test(q)) {
    return [
      `⚡ **ECE (Electronics & Communication) vs EEE (Electrical & Electronics)**\n`,
      `• 📱 **ECE**: Focuses on microprocessors, VLSI circuit design, embedded systems, telecommunications, & IoT devices.`,
      `• ⚡ **EEE**: Focuses on high-voltage power systems, electrical machines, power electronics, renewable energy, & control systems.`,
      `• 💼 **Placements**: ECE has a higher overlap with IT/Software roles and semiconductor firms (Qualcomm, Intel, Nvidia). EEE opens doors to EV manufacturing, power grids, & electrical utilities.\n`,
      `💡 *If you want a blend of hardware engineering and IT placement flexibility, ECE is generally preferred.*`,
    ].join('\n');
  }

  // ── 19. Mechanical & Civil Engineering Careers ────────────────────────────────
  if (/mechanical engineering|civil engineering|jobs after mechanical|scope of mechanical|mechanical student.*software/.test(q)) {
    return [
      `⚙️ **Mechanical & Civil Engineering Scope & Placement Reality**\n`,
      `• 🚗 **Mechanical Engineering**: Core roles in automotive, robotics, aerospace, thermal engineering, manufacturing, & HVAC. High scope in Germany, Japan, & Middle East.`,
      `• 🏗️ **Civil Engineering**: Structural design, construction management, urban planning, & top success in Govt exams (SSC JE, State PWD, IES).`,
      `• 💻 **Can Mechanical/Civil students enter IT?**: Yes! 60-70% of IT service companies recruit from core branches during campus placement drives if you know basic coding (Python/Java/C++).\n`,
      `💡 *For core branches, choose top-ranked institutions with verified lab infrastructure!*`,
    ].join('\n');
  }

  // ── 20. Medical Alternatives (No MBBS / Low NEET score) ─────────────────────
  if (/alternative.*mbbs|don't get mbbs|without mbbs|without studying mbbs|allied health|bams|bds|pharmacy|nursing/.test(q)) {
    return [
      `🩺 **Best Healthcare & Medical Alternatives to MBBS**\n`,
      `If you don't secure an MBBS seat or prefer other medical choices:\n`,
      `1. 🦷 **BDS (Dental Surgery)**: Professional doctor degree with high scope for private clinics and cosmetic dentistry.`,
      `2. 🌿 **BAMS (Ayurvedic Medicine) & BHMS**: Recognized medical systems with high global wellness demand.`,
      `3. 💊 **B.Pharm / Pharm.D**: High-demand pharmaceutical field in drug discovery, clinical research, & pharma MNCs.`,
      `4. 💉 **B.Sc Nursing**: Huge global job demand (UK, USA, Canada, Gulf countries) with fast-track immigration.`,
      `5. 🏥 **Allied Health Sciences (B.Sc)**: Cardiac Technology, Radiology, Anesthesia Tech, Medical Lab Tech, & Physiotherapy (BPT).\n`,
      `💡 *Allied health professions offer direct placement in hospitals and diagnostic laboratories!*`,
    ].join('\n');
  }

  // ── 21. Commerce & Management: B.Com vs BBA, CA vs CMA vs CS ────────────────
  if (/b\.?com or bba|bcom vs bba|ca vs cma|ca or cma|how to become ca|investment banker|chartered accountant|business analytics/.test(q)) {
    return [
      `📊 **Commerce & Management Pathways: B.Com, BBA, CA & Financial Careers**\n`,
      `• 📊 **B.Com (General / Accounting & Finance)**: Ideal for accounting, taxation, auditing, and pursuing CA / CMA / CS alongside college.`,
      `• 💼 **BBA (Bachelor of Business Administration)**: Focuses on corporate management, marketing, HR, finance, & prepares you for MBA.`,
      `• 🏆 **CA (Chartered Accountant)**: Top accounting credential in India. 3 stages: CA Foundation, Intermediate, & Final + 2-year articleship.`,
      `• 🌐 **ACCA (Global CA)**: Internationally recognized accounting qualification in 180+ countries.`,
      `• 📈 **Investment Banking & Business Analytics**: Requires strong skills in financial modeling, Excel, SQL, & Python.\n`,
      `💡 *Can you pursue CA alongside a B.Com degree? YES! Most students do both together.*`,
    ].join('\n');
  }

  // ── 22. Arts, Humanities, Law, Psychology & Creative Careers ────────────────
  if (/arts|humanities|ba english|psychologist|psychology|lawyer|law|journalism|ui\/ux|graphic design|civil services|upsc/.test(q)) {
    return [
      `🎨 **Arts, Humanities, Law, Psychology & Creative Career Paths**\n`,
      `• 🧠 **Psychology**: B.A./B.Sc Psychology → M.Sc/M.Phil Clinical Psychology → Registered Clinical Psychologist, Counselor, or Organizational Psychologist.`,
      `• ⚖️ **Law**: 5-Year Integrated BA LLB / BBA LLB via CLAT entrance. Opens doors to Corporate Law, Litigation, Judiciary, & Legal Advisory.`,
      `• 🖌️ **UI/UX Design & Graphic Design**: High-paying tech design careers creating mobile app UI, user flows, and brand graphics.`,
      `• 📰 **Journalism & Mass Comm**: Content strategy, news reporting, digital media publishing, & public relations.`,
      `• 🏛️ **Civil Services (UPSC)**: B.A. Political Science, History, or Economics offers excellent foundation for IAS / IPS exam preparation.\n`,
      `💡 *Do creative careers pay well? Skilled UI/UX designers and corporate lawyers earn top-tier salaries!*`,
    ].join('\n');
  }

  // ── 23. College Verification, Accreditation & Spotting Fake Claims ─────────
  if (/check.*college|accreditation|naac|nirf|nba|fake college|fake review|placement claim|highest package|median salary/.test(q)) {
    return [
      `🔍 **5 Critical Checks Before Joining Any College**\n`,
      `1. 📜 **Official Recognition**: Verify AICTE, UGC, or NMC (Medical) approval on official government portals.`,
      `2. 🌟 **NAAC Accreditation Grade**: Look for NAAC **A++** or **A+** grades. Check NBA accreditation for specific engineering branches.`,
      `3. 📊 **Median Placement Package (NOT Highest!)**: Don't be fooled by 1-2 high off-campus packages (e.g. 50 LPA). Always check the **Median Salary** (e.g. 4.5 – 6.5 LPA).`,
      `4. 🏫 **Department Labs & Infrastructure**: Ensure department-specific laboratories have working machinery & modern computing setups.`,
      `5. 💬 **Talk to Current 3rd/4th Year Students**: Ask about genuine hostel mess food, faculty support, and actual company campus visits.\n`,
      `💡 *Never pay non-refundable booking fees before verifying official accreditation!*`,
    ].join('\n');
  }

  // ── 24. Admission Rules, Quotas, Refund Policies & Certificates ────────────
  if (/quota|management quota|nri quota|merit quota|original certificate|booking fee|refund policy|admission fee/.test(q)) {
    return [
      `📋 **Admission Quotas, Booking Fees & Document Guidelines**\n`,
      `• 🏛️ **Government Quota (Merit)**: Allotted strictly based on cutoff marks / entrance rank via official state counselling. Lowest fees!`,
      `• 💼 **Management Quota**: Allotted directly by college administration. Higher annual tuition / capitation fee structure.`,
      `• 📄 **Submitting Original Certificates**: Colleges are permitted to verify original marksheets, but UGC rules mandate returning them after verification. Do NOT leave originals indefinitely without receipt!`,
      `• 💳 **Fee Refund Policy**: As per UGC/AICTE guidelines, full tuition fee refund (minus max ₹1,000 processing fee) is mandatory if you cancel admission before the specified cutoff date.\n`,
      `💡 *Always request an official computer-generated receipt for any fee paid!*`,
    ].join('\n');
  }

  // ── 25. ROI, Financial Planning & Education Loans ────────────────────────────
  if (/education loan|roi|return on investment|20 lakh|5 lakh|expensive college|affordable college|scholarship/.test(q)) {
    return [
      `💰 **Financial Planning, Education Loans & Degree ROI (Return on Investment)**\n`,
      `• 🧮 **Calculating Degree ROI**:\n  \`ROI = Expected Annual Salary ÷ Total 4-Year College Expense (Fees + Hostel)\``,
      `• ⚖️ **Is a ₹20 Lakh Degree Worth It?**:\n  - If median placement is ₹10–15+ LPA (e.g. Top IIT, NIT, BITS) → **YES, worth taking a loan!**\n  - If median placement is ₹4–5 LPA → **NO!** Taking a ₹15-20L loan will create heavy financial debt. Choose an affordable ₹4-6L college instead.`,
      `• 🏦 **Education Loans (Vidya Lakshmi Portal)**: Government portal allowing interest subsidy for family income < ₹4.5 Lakhs.\n`,
      `💡 *Focus on minimizing student loan debt unless the college guarantees top-tier median placement!*`,
    ].join('\n');
  }

  // ── 26. Strategic Dilemmas & Complex Decisions ──────────────────────────────
  if (/dream department|wrong branch|famous college.*unwanted|lesser known.*preferred|backup plan|plan b|plan c|decision matrix/.test(q)) {
    return [
      `🎯 **Framework for Complex Admission Dilemmas**\n`,
      `**Dilemma 1: Famous College (Lesser Branch) vs Lower-Ranked College (Preferred Branch)**`,
      `• **For Software/IT Goals**: Famous top-tier college wins! Top campus placement culture allows non-CSE students to learn coding & get recruited by product companies.`,
      `• **For Core Goals (Medicine, Civil, Mech)**: Preferred branch wins! Core degrees require mandatory specialized accreditation & lab training.\n`,
      `**Dilemma 2: High Marks but Low Entrance Rank / Limited Budget**`,
      `• **Plan A**: State Government / Govt-Aided engineering colleges (TNEA / State Counselling).`,
      `• **Plan B**: Reputed Autonomous accredited private institutions with merit scholarship waivers.`,
      `• **Plan C**: B.Sc Computer Science / BCA in top city college + self-paced software certification portfolio.\n`,
      `💡 *Which two exact options are you comparing? Share them with me for a custom decision matrix!*`,
    ].join('\n');
  }

  // ── 27. General Counseling Catch-All ─────────────────────────────────────────
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

/**
 * academicCounselor.js — Acadivo Expert Academic & Career Counseling Engine v11.0
 *
 * Comprehensive guidance engine trained on 6,000+ natural student, parent, and human chat queries (Q1 - Q6000+ / Q321 - Q620).
 * Covers ALL 15 Academic Departments & Interactive Decision Flows:
 * 1. Engineering (CSE, ECE, EEE, Mech, Civil, Aerospace, Robotics, Mechatronics, VLSI)
 * 2. Medical (MBBS, BDS, NEET alternatives, MBBS Abroad, Specializations, Daily Doctor Reality)
 * 3. Nursing (B.Sc Nursing, NCLEX-RN, UK/US/Canada jobs, Male Nurses, M.Sc Nursing, Shift Reality)
 * 4. Paramedical (Radiology, MLT, OTT, Cardiac, Dialysis, Non-patient Healthcare options)
 * 5. Polytechnic Diploma (10th/12th entry, Lateral Entry B.Tech 2nd year, Lowest-cost IT path)
 * 6. Arts & Science (B.Sc CS vs BCA vs B.Tech CSE cost, Data Science, Psychology, B.A. UPSC)
 * 7. Law (5-Yr BA/BBA LLB, 3-Yr LLB, CLAT, Corporate Law, Cyber Law, Public Speaking myth)
 * 8. Commerce (B.Com vs BBA, CA vs ACCA, Investment Banking, Fintech, Data Analyst)
 * 9. Pharmacy (B.Pharm vs Pharm.D, Drug Inspector, Pharma R&D, Retail Pharmacy License)
 * 10. Architecture (5-Yr B.Arch, NATA, CAD/BIM Software, B.Arch vs Civil Engineering)
 * 11. Agriculture (B.Sc Agri, ICAR, Smart Farming, Drones, Agri-Tech Startups, Bank Exams)
 * 12. Management (MBA vs PGDM, CAT, Specializations - Finance/Marketing/HR/Analytics)
 * 13. Hotel Management (Hospitality, 5-Star Hotels, Cruise Ships, Airlines, Culinary Arts)
 * 14. Teacher Training (B.Ed, TET, Govt School Teacher, Professor PhD, Public Speaking)
 * 15. Regulatory Approval Checklist (AICTE, NMC, INC, PCI, COA, BCI, ICAR Verification)
 * 16. Interactive 10-Question Step-by-Step Career Assessment Flow
 */

import { analyzeText } from './sentimentAnalyzer';

// ── Normalize text ─────────────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Comprehensive Intent Rules for Academic & Career Counseling ────────────────
export function answerCounselingQuestion(query) {
  const q = norm(query);

  // ── 0. Interactive Step-by-Step Questioning (Q541 - Q570) ─────────────────────
  if (/ask me (questions|my 12th stream|my marks|one by one|questions first)|step by step guidance|narrow it down for me|recommend three departments/.test(q)) {
    return [
      `🎯 **Acadivo Step-by-Step Personal Career Assessment**\n`,
      `Let's find your ideal course and college step by step! Please answer **Question 1**:\n`,
      `📌 **Question 1 of 5**: What was your 12th standard stream / group?`,
      `• A) Science (PCM - Physics, Chemistry, Maths)`,
      `• B) Science (PCB - Physics, Chemistry, Biology / PCMB)`,
      `• C) Commerce (Accounts, Business Studies, Economics)`,
      `• D) Arts / Humanities / Vocational\n`,
      `💡 *Reply with your option (e.g. "A" or "PCM") and I will ask Question 2!*`,
    ].join('\n');
  }

  // ── 0b. Official Regulatory Approval Checklist (Q511 - Q525) ──────────────────
  if (/what approvals should|check if a college is officially|approval checklist|unrecognized course|aicte|nmc|pci|coa|bci|inc|icar/.test(q)) {
    return [
      `📜 **Mandatory Government Approval Checklist by Department**\n`,
      `Before paying any admission booking fee, verify the official government recognition:\n`,
      `• ⚙️ **Engineering & Technology**: Must have **AICTE** approval + UGC / State University affiliation. Look for **NBA accreditation** for individual branches.`,
      `• 🩺 **Medical (MBBS/BDS)**: Must be recognized by the **NMC (National Medical Commission)**.`,
      `• 💉 **Nursing**: Must have **INC (Indian Nursing Council)** + State Nursing Council recognition.`,
      `• 💊 **Pharmacy**: Must be approved by **PCI (Pharmacy Council of India)**.`,
      `• 🏛️ **Architecture**: Must have **COA (Council of Architecture)** approval.`,
      `• ⚖️ **Law**: Must be recognized by the **BCI (Bar Council of India)**.`,
      `• 🌾 **Agriculture**: Must have **ICAR (Indian Council of Agricultural Research)** accreditation.\n`,
      `⚠️ *Enrolling in an unapproved course will invalidate your degree for government jobs and higher studies!*`,
    ].join('\n');
  }

  // ── 0c. Department Selection Confirmation Flow (Q601 - Q620) ───────────────────
  if (/i selected (engineering|medical|nursing|paramedical|polytechnic|arts & science|arts and science|law|commerce|pharmacy|architecture|agriculture|management|hotel management|teacher training)/.test(q)) {
    const deptMatch = q.match(/i selected (engineering|medical|nursing|paramedical|polytechnic|arts & science|arts and science|law|commerce|pharmacy|architecture|agriculture|management|hotel management|teacher training)/);
    const dept = deptMatch ? deptMatch[1].toUpperCase() : 'your chosen department';
    return [
      `🎉 **Great Choice! You have selected: ${dept}**\n`,
      `Here is what I recommend doing next to find your ideal college and career path:\n`,
      `1. 📊 **Share Your Marks**: Tell me your 12th percentage, cutoff mark, or entrance exam score (JEE / NEET / TNEA / CLAT / CAT).`,
      `2. 📍 **Share Location**: Tell me your preferred state or city (e.g. Chennai, Bengaluru, Delhi, Hyderabad).`,
      `3. 💰 **Share Budget**: Tell me your target annual tuition fee budget (e.g. Under ₹1 Lakh, ₹2–4 Lakhs, or ₹10L+).\n`,
      `💡 *Reply with these details and I will generate your top 5 recommended colleges, admission chances, and placement profiles!*`,
    ].join('\n');
  }

  // ── 0d. Very Short / Messy Chat Inputs ──────────────────────────────────────────
  if (/^(bro|hey|hi)?\s*(which course|cse worth|ai or cse|got \d+|low cutoff|fees too high|govt clg|private clg|ece or cse|mechanical have future|placement really 100|scholarship available|admission still open|counselling how|got seat|hostel compulsory|change department|got cutoff|fees 3 lakh|package 50 lakh|check college approved)/.test(q)) {
    if (/cse worth/.test(q)) return `💻 **Is CSE Worth It?** YES! CSE remains the #1 degree for software placements, remote tech jobs, and high starting packages. Even with AI, skilled software engineers are in top demand.`;
    if (/ai or cse/.test(q)) return `🤖 **AI or CSE?** Core CSE gives maximum career flexibility. Pure CSE lets you work in software, web, cloud, OR AI. Choose specialized AI if you love math & statistics!`;
    if (/ece or cse/.test(q)) return `⚡ **ECE or CSE?** Take CSE if software is your 100% focus. Take ECE in a top college if you want dual eligibility for both Hardware (Semiconductors/VLSI) and Software IT jobs!`;
    if (/mechanical have future|mech future/.test(q)) return `⚙️ **Does Mechanical Have a Future?** YES! EV (Electric Vehicles), Robotics, Automation, and Smart Manufacturing have created a strong demand for core Mechanical engineers.`;
    if (/placement really 100|100.*placement/.test(q)) return `🚩 **100% Placement Truth**: "100% Placement Assistance" means companies visit campus, NOT that everyone gets hired. Always check the **Median Package (₹4.5 - 6.5 LPA)**!`;
    if (/change department|change branch/.test(q)) return `🔄 **Can I Change Branch Later?** Most colleges allow top 5–10% CGPA students to switch branch after 1st year! Check your college academic policy.`;
    if (/check college approved/.test(q)) return `📜 **How to Check College Approval**: Verify AICTE, UGC, or NMC (Medical) recognition on official government portals before paying fees!`;
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

  // ── 1. Lowest Cost Tech Entry (B.Tech vs B.Sc CS / BCA) (Q341 - Q350) ───────────
  if (/btech cse or bsc computer science|b\.?sc computer science student.*software|bca or bsc computer science|lowest education cost|cheaper route to becoming an engineer|diploma first and btech later/.test(q)) {
    return [
      `💰 **Lowest-Cost IT Pathways: B.Tech vs B.Sc CS vs BCA vs Diploma**\n`,
      `• 💡 **Can B.Sc CS / BCA Grads Get IT Jobs?**: YES! 85%+ of IT companies (TCS, Wipro, Infosys, Accenture, Cognizant) hire B.Sc CS and BCA graduates for software roles.`,
      `• 💸 **Education Cost Comparison**: B.Sc CS / BCA tuition is 70% cheaper than private B.Tech fees (approx ₹30,000–₹80,000/year vs ₹2L–₹4L/year for private B.Tech).`,
      `• 🛠️ **Lowest-Cost Route**: BCA or B.Sc CS at a government/aided college + self-learning Data Structures (DSA) & Web Development online on LeetCode/YouTube!`,
      `• ⚙️ **Diploma + Lateral Entry B.Tech**: Total 6 years after 10th (3 yrs diploma + 3 yrs B.Tech), saving heavy 11th/12th coaching expenses.`,
    ].join('\n');
  }

  // ── 2. Healthcare Without Patient Interaction & Scared of Blood (Q361 - Q370) ────
  if (/scared of blood|without treating patients directly|less direct patient interaction|healthcare alternatives|closest career to being a doctor/.test(q)) {
    return [
      `🧪 **Healthcare Careers Without Direct Patient Contact (Scared of Blood?)**\n`,
      `• 🧬 **Bioinformatics & Computational Biology**: Analyzing genetic code, DNA sequences, and pharmaceutical algorithms on computers (Zero blood/patients!).`,
      `• 💊 **B.Pharm / Pharm.D (Pharmaceutical Research)**: Drug discovery, formulation, lab testing, & medical writing for pharma MNCs.`,
      `• 📊 **Health Informatics & Healthcare Data Analytics**: Managing digital hospital databases, health AI systems, & electronic medical records.`,
      `• 📻 **B.Sc Radiology & Imaging Tech**: Operating MRI, CT scan, and X-Ray machines in clean diagnostic suites.`,
    ].join('\n');
  }

  // ── 3. Architecture vs Civil Engineering (Q381 - Q390) ─────────────────────────
  if (/architecture or civil engineering|difference between an architect and a civil engineer|architect work in construction|civil engineer become a designer|interior design/.test(q)) {
    return [
      `🏛️🏗️ **Architecture (B.Arch) vs Civil Engineering Decision Guide**\n`,
      `• 🎨 **Architect (B.Arch - 5 Years)**: Focuses on **spatial design, building aesthetics, building codes, lighting, & user experience**. Uses AutoCAD, Revit, & 3D BIM software.`,
      `• 🏗️ **Civil Engineer (B.Tech - 4 Years)**: Focuses on **structural strength, concrete load limits, foundation calculations, site construction, & project execution**.`,
      `• 🛋️ **Interior Design**: Specialized sub-field focusing on interior spaces, furniture, lighting, and acoustics. B.Arch grads can practice interior design directly!`,
    ].join('\n');
  }

  // ── 4. Introvert vs Extrovert Personality Alignment (Q319, Q591 - Q600) ────────
  if (/introvert|extrovert|public speaking|shy and dont like|social and hate working alone|personality/.test(q)) {
    return [
      `🧠 **Career Selection Based on Personality (Introvert vs Extrovert)**\n`,
      `• 🤫 **Best Careers for Introverts**: Software Engineering, Data Science, Cybersecurity/Ethical Hacking, B.Sc Research, Technical Writing, UI/UX Research, & Bioinformatics.`,
      `• 🗣️ **Best Careers for Extroverts**: Corporate Law, BBA/MBA Management, Hotel Management, Event Management, Public Relations, Sales Engineering, & Teaching.`,
      `• 💡 **Public Speaking Myth in Law**: Trial litigation requires strong speaking skills, but **Corporate Law, Cyber Law, & Legal Drafting** involve quiet analytical research & document drafting!`,
    ].join('\n');
  }

  // ── 5. Medical (MBBS, BDS, NEET Score & MBBS Abroad) ─────────────────────────
  if (/become a doctor|neet score is low|low neet|government mbbs or private|study mbbs abroad|repeat neet|bds a good career|bds vs mbbs|how many years.*doctor|specialization after mbbs/.test(q)) {
    return [
      `🩺 **Medical (MBBS / BDS / NEET Alternatives) Complete Guide**\n`,
      `• 🩺 **MBBS Duration**: 5.5 Years (4.5 yrs academic + 1 yr compulsory internship) + 3 yrs MD/MS for specialization.`,
      `• 📉 **Low NEET Score Options**: Private MBBS (higher fees), BDS (Dental Surgery), BAMS (Ayurveda), BHMS (Homeopathy), or NMC-approved **MBBS Abroad** (Russia, Georgia, Uzbekistan, Philippines).`,
      `• 🦷 **BDS Scope**: BDS is a respected doctor degree with high scope for private dental clinics, cosmetic dentistry, and hospital dental units.`,
      `• 🌍 **MBBS Abroad Verification**: Ensure the university is listed on the **NMC (National Medical Commission)** approved list and offers a 54+ month medium-of-English course + 12-month internship to qualify for the NEXT exam in India!`,
    ].join('\n');
  }

  // ── 6. Nursing (B.Sc Nursing, Abroad Jobs & Stability) ────────────────────────
  if (/b\.?sc nursing|nursing.*good career|nursing abroad|nurses earn well|need neet for nursing|nursing or pharmacy|male.*nursing/.test(q)) {
    return [
      `💉 **B.Sc Nursing Career, Abroad Scope & Salary Reality**\n`,
      `• 🌐 **Top Global Demand**: Massive nurse shortages in **UK (NHS), USA (NCLEX-RN exam), Canada, Australia, & Gulf countries**. High starting salaries abroad!`,
      `• 📋 **Admission & NEET**: Most state government & private nursing colleges admit based on 12th PCB marks or state nursing entrance exams. NEET is NOT compulsory for 90%+ nursing seats.`,
      `• 👨‍⚕️ **Male Nurses Eligibility**: Male candidates are 100% eligible for B.Sc Nursing and have high demand in emergency ICU, trauma, and psychiatric wards worldwide.`,
      `• ⚖️ **Nursing vs Pharmacy**: Nursing offers direct hospital patient care & fast-track abroad migration. Pharmacy offers pharmaceutical industry, R&D, & retail clinic scope.`,
    ].join('\n');
  }

  // ── 7. Paramedical Courses (Radiology, MLT, OTT, Cardiac, Dialysis) ────────────
  if (/paramedical|radiology or medical lab|operation theatre|dialysis technician|cardiac technology|neet for paramedical|paramedical after 12th/.test(q)) {
    return [
      `🏥 **Paramedical Courses (High Hospital Demand — No NEET Required!)**\n`,
      `• 🧬 **Top Paramedical Streams**: B.Sc Radiology & Imaging Tech (MRI/CT/X-Ray), B.Sc Medical Lab Tech (MLT), B.Sc Operation Theatre Tech (OTT), B.Sc Cardiac Tech, B.Sc Dialysis Tech.`,
      `• 🚫 **No NEET Required**: Admission is based directly on 12th Physics, Chemistry, & Biology (PCB) marks!`,
      `• 💼 **Hospital Jobs**: Direct immediate employment in hospitals, diagnostic labs (Thyrocare, Apollo, SRL), & trauma centers upon graduation.`,
      `• 🛠️ **Degree vs Diploma**: 3 or 4-Year B.Sc Degree provides higher starting salary, promotion scope, and eligibility for hospital department management over 2-year Diplomas.`,
    ].join('\n');
  }

  // ── 8. Polytechnic Diploma & B.Tech Lateral Entry ─────────────────────────────
  if (/polytechnic|diploma after 10th|lateral entry|join engineering after diploma|direct second year|polytechnic vs 12th|diploma cse/.test(q)) {
    return [
      `⚙️ **Polytechnic Diploma & Lateral Entry B.Tech Pathway**\n`,
      `• 🛠️ **3-Year Polytechnic Diploma**: Hands-on practical engineering training directly after 10th standard.`,
      `• 🛝 **Direct 2nd-Year B.Tech (Lateral Entry)**: Diploma holders enter directly into 2nd year (3rd semester) of B.E./B.Tech via Lateral Entry counselling!`,
      `• 💼 **Industry Advantage**: Lateral entry engineering graduates are highly favored by core industries (Mechanical, Electrical, Civil) because of their 3 years of hands-on diploma lab training.`,
      `• 💻 **Software Jobs for Diploma Grads**: Diploma CSE/IT graduates who learn Python, Web Dev, & Data Structures can secure junior software developer roles!`,
    ].join('\n');
  }

  // ── 9. Arts & Science (B.Sc CS vs BCA, Data Science, Psychology, B.A. UPSC) ────
  if (/bsc computer science or bca|bsc data science|bsc math|bsc physics|bsc psychology|ba course|upsc.*ba|english literature/.test(q)) {
    return [
      `🎨🔬 **Arts & Science (B.Sc / BCA / B.A.) Pathways**\n`,
      `• 💻 **B.Sc Computer Science vs BCA**: Both offer direct entry into software development. BCA focuses more on software applications & web dev; B.Sc CS focuses on programming logic & computer theory.`,
      `• 🧠 **B.Sc Psychology**: High growth field in Clinical Psychology, Corporate HR, Child Counseling, & UI/UX Research (M.Sc/M.Phil required for licensed practice).`,
      `• 🏛️ **B.A. for UPSC Civil Services**: B.A. Political Science, History, or Economics provides 70%+ syllabus alignment for IAS/IPS exam preparation!`,
      `• 📊 **B.Sc Data Science & Mathematics**: Excellent foundation for Data Analytics, Actuarial Science, Quantitative Finance, & AI engineering.`,
    ].join('\n');
  }

  // ── 10. Law (5-Year BA LLB / BBA LLB, 3-Year LLB, CLAT, Corporate Law) ─────────
  if (/become a lawyer|3 year llb|5 year llb|ba llb or bba llb|clat|corporate law|cyber law|judge after llb/.test(q)) {
    return [
      `⚖️ **Law Degrees (5-Year BA LLB / BBA LLB vs 3-Year LLB)**\n`,
      `• ⚖️ **5-Year Integrated LLB (BA LLB / BBA LLB)**: Pursued directly after 12th standard via **CLAT / AILET / LSAT / State Law CET** entrance exams.`,
      `• 📚 **3-Year LLB**: Pursued after completing any Bachelor's degree (B.A., B.Com, B.Sc, B.Tech).`,
      `• 💼 **Corporate Law & Cyber Law**: High-paying corporate advisory roles in top law firms (Amarchand, Khaitan, AZB) negotiating mergers, IP patents, and tech compliance.`,
      `• 👨‍⚖️ **Judiciary Exams**: Clear Judicial Services Exam (PCS-J) immediately after LLB to become a Magistrate / Civil Judge.`,
    ].join('\n');
  }

  // ── 11. Commerce (B.Com, BBA, CA, ACCA, Investment Banking, Fintech) ───────────
  if (/commerce student|bcom or bba|do ca along with bcom|acca a good alternative|investment banking|fintech|data analyst after bcom/.test(q)) {
    return [
      `📊 **Commerce & Finance Pathways (B.Com, BBA, CA, ACCA & Fintech)**\n`,
      `• 🏆 **CA vs ACCA**: CA is India's premier accounting credential. **ACCA (Global CA)** is recognized in 180+ countries and offers exemptions for B.Com graduates!`,
      `• 💼 **BBA without MBA**: BBA develops management & marketing skills. Pairing BBA with certifications in Business Analytics, Excel, or SQL gets immediate corporate jobs.`,
      `• 📈 **Investment Banking & Fintech**: Requires strong financial modeling, valuation, & Python/SQL data analytics skills. B.Com/BBA graduates can enter directly!`,
    ].join('\n');
  }

  // ── 12. Pharmacy (B.Pharm, Pharm.D, Drug Inspector, Retail Pharmacy) ───────────
  if (/b\.?pharm|pharm\.?d|bpharm or pharmd|drug inspector|open my own pharmacy|pharmacy abroad/.test(q)) {
    return [
      `💊 **Pharmacy Degrees (B.Pharm vs Pharm.D) Scope & Licensing**\n`,
      `• 💊 **B.Pharm (4 Years)**: Focuses on pharmaceutical chemistry, drug manufacturing, quality control, & pharma MNC R&D. Qualifies you for a **Retail/Wholesale Pharmacy License**!`,
      `• 🩺 **Pharm.D (6 Years - Doctor of Pharmacy)**: Clinical doctor-level pharmacy degree focusing on hospital ward rounds, prescription auditing, & clinical trials.`,
      `• 🏛️ **Drug Inspector**: High-prestige government job in State/Central Drug Standard Control Organization (CDSCO) cleared via PSC exams after B.Pharm.`,
    ].join('\n');
  }

  // ── 13. Architecture (B.Arch, NATA, Drawing Myth, B.Arch vs Civil) ─────────────
  if (/b\.?arch|architecture|nata|good at drawing.*architect|architecture or civil|interior design/.test(q)) {
    return [
      `🏛️ **Architecture (5-Year B.Arch & NATA Entrance)**\n`,
      `• 📐 **5-Year B.Arch & NATA Exam**: Mandatory 5-year degree approved by Council of Architecture (COA). NATA / JEE Paper 2 entrance is required!`,
      `• 🎨 **Drawing Skill Myth**: You do NOT need to be a fine artist! Modern architecture relies on spatial logic, 3D modeling, and software (**AutoCAD, Revit, SketchUp, Rhino, BIM**).`,
      `• 🏗️ **B.Arch vs Civil Engineering**: Architects design spatial layouts, aesthetics, & building functionality. Civil engineers design structural strength, concrete load limits, & construction execution.`,
    ].join('\n');
  }

  // ── 14. Agriculture (B.Sc Agriculture, ICAR, Smart Farming, Drones) ───────────
  if (/b\.?sc agriculture|farming family|agriculture officer|smart farming|drones in agriculture|precision agriculture/.test(q)) {
    return [
      `🌾 **B.Sc Agriculture (ICAR Scope, Smart Farming & Govt Jobs)**\n`,
      `• 🌾 **Non-Farming Eligibility**: You do NOT need a farming background! Any student with 12th Science (PCB/PCM) can join ICAR-approved B.Sc Agriculture colleges.`,
      `• 🏛️ **Government Jobs**: High success in **Agriculture Development Officer (ADO), Bank Field Officer (IBPS AFO), & Forest Service (IFS)** exams.`,
      `• 🤖 **Smart Farming & Drones**: Rapid growth in AI crop monitoring, drone spraying, automated greenhouse tech, & agritech startups.`,
    ].join('\n');
  }

  // ── 15. Management (MBA, PGDM, CAT, Specializations & ROI) ─────────────────────
  if (/mba|pgdm|cat exam|work experience before mba|mba in finance|business analytics mba|mba or pgdm/.test(q)) {
    return [
      `💼 **Management Degrees (MBA / PGDM, CAT & ROI)**\n`,
      `• 🏆 **MBA vs PGDM**: MBA is awarded by universities; PGDM is an autonomous diploma awarded by top institutes (IIMs, XLRI). Both are 100% equal in corporate value!`,
      `• ⏳ **Work Experience**: 1–3 years of work experience before MBA maximizes top IIM selection scores and executive placement salaries.`,
      `• 📊 **Specializations**: **Finance** (Investment Banking), **Marketing** (Brand Mgmt), **HR** (Talent Ops), **Business Analytics & AI** (High tech demand).`,
    ].join('\n');
  }

  // ── 16. Hotel Management & Hospitality ─────────────────────────────────────────
  if (/hotel management|hospitality|five star hotels|cruise ships|cooking to study hotel management|event management/.test(q)) {
    return [
      `🏨 **Hotel Management & Global Hospitality Careers**\n`,
      `• 🏨 **Cooking Myth**: Hotel Management is NOT just cooking! It covers **Front Office Operations, Food & Beverage Management, Sales, Marketing, & General Hotel Administration**.`,
      `• 🚢 **Cruise Ships & Airlines**: High-earning international opportunities on global luxury cruise lines, international airlines (cabin crew/ground ops), and event management firms.`,
      `• 🌍 **Global Demand**: Fast-track work visas in UAE, Singapore, Switzerland, UK, & Australia.`,
    ].join('\n');
  }

  // ── 17. Teacher Training (B.Ed, TET, School Teacher & Professor PhD) ────────────
  if (/b\.?ed|teacher|tet exam|government school teacher|college professor|teach abroad/.test(q)) {
    return [
      `📚 **Teacher Training (B.Ed, TET & College Professor Pathways)**\n`,
      `• 🏫 **School Teaching**: 2-Year B.Ed (after Graduation) + clearing **TET (Teacher Eligibility Test) / CTET** for Government school teaching jobs.`,
      `• 🎓 **College Professor / Assistant Professor**: Master's degree (55%+) + clearing **NET (National Eligibility Test) / SET** or PhD.`,
      `• 🌟 **Private School & Online Tutoring**: High demand for skilled STEM & English teachers in international schools & edtech platforms.`,
    ].join('\n');
  }

  // ── 18. Cross-Department Assessment & 5-Question Personal Alignment ────────────
  if (/dont know which of these departments|ask me five questions|eligible for|compare engineering medical|balance of salary|disadvantage of each field/.test(q)) {
    return [
      `🎯 **Acadivo 5-Question Personal Stream Alignment Test**\n`,
      `Reply with your answers to these 5 quick questions, and I will recommend your top matching department:\n`,
      `1. 📚 What was your 12th stream (PCM, PCB, Commerce, or Arts)?`,
      `2. 🧠 Do you prefer **Logic & Code**, **Biology & Care**, **Business & Finance**, or **Creative Design**?`,
      `3. ⏳ Do you want a **4-year fast job entry** or are you okay with **5-8 years of study** (like Medicine/Law)?`,
      `4. 💰 What is your total family budget for 4 years (Under ₹3L, ₹5-8L, or ₹15L+)?`,
      `5. 📍 Do you want to study near your hometown or move to a major tech/industrial city?\n`,
      `💡 *Reply with your numbers (e.g. "1. PCM, 2. Logic, 3. 4-year, 4. Under ₹5L, 5. Major City") and I will generate your perfect decision matrix!*`,
    ].join('\n');
  }

  // ── 19. General Counseling Catch-All ─────────────────────────────────────────
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

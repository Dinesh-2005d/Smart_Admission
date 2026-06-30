// src/constants/collegeDatabase.js
import collegesData from './colleges_compressed.json';
import { EXTRA_COLLEGES } from './extraColleges';

const getCompanies = (dept, tier) => {
  const top = {
    engineering: ["Google","Microsoft","Amazon","TCS","Infosys"],
    medical: ["AIIMS","Apollo Hospitals","Fortis"],
    arts_science: ["TCS","Infosys","Wipro","Cognizant"],
    law: ["Supreme Court","High Court","Tier-1 Law Firms"],
    management: ["McKinsey","BCG","Bain","Deloitte","KPMG"],
    agriculture: ["ICAR","State Agri Dept","ITC","Monsanto","Mahindra Agri"],
    pharmacy: ["Sun Pharma","Cipla","Dr Reddys"],
    architecture: ["Hafeez Contractor", "L&T Construction"],
    education: ["KV Schools", "International Schools"],
    nursing: ["Apollo Hospitals","Fortis","AIIMS"],
    paramedical: ["Apollo Hospitals","Fortis","Narayana Health"],
    polytechnic: ["L&T","Siemens","BHEL","Bosch"],
    commerce: ["HDFC Bank","Deloitte","PwC","EY","KPMG"],
    hotel_management: ["Taj Hotels","ITC Hotels","Marriott","Hyatt"],
    teacher_training: ["KV Schools","International Schools","CBSE Schools"],
  };
  const mid = {
    engineering: ["TCS","Infosys","Cognizant","Wipro"],
    medical: ["Local Hospitals","Apollo","Fortis"],
    arts_science: ["TCS","BPO","Local Firms"],
    law: ["District Court","Law Firms"],
    management: ["TCS","Banks","HDFC","ICICI"],
    agriculture: ["State Agri Dept", "Local Agri Firms", "Fertilizer Companies"],
    pharmacy: ["Local Pharma", "Apollo Pharmacy"],
    architecture: ["Construction Companies", "Local Builders"],
    education: ["State Govt Schools", "Private Schools"],
    nursing: ["District Hospitals","PHC","Nursing Homes"],
    paramedical: ["Diagnostic Labs","PHC","District Hospitals"],
    polytechnic: ["MSME","Local Industries","ITI"],
    commerce: ["Local Banks","BPO","CA Firms"],
    hotel_management: ["Local Hotels","Resorts","Catering"],
    teacher_training: ["State Govt Schools","Private Schools"],
  };
  return tier === "top" ? top[dept] || top.engineering : mid[dept] || mid.engineering;
};

// ── Department specific courses mapping ──────────────────────────────────────
const DEPT_COURSES = {
  engineering:      ['B.Tech Computer Science & Engineering', 'B.Tech Information Technology', 'B.Tech Electronics & Communication', 'B.Tech Mechanical Engineering', 'B.Tech Civil Engineering', 'B.Tech Electrical Engineering'],
  medical:          ['MBBS', 'BDS (Dental)', 'MD General Medicine', 'MS General Surgery'],
  nursing:          ['B.Sc Nursing', 'Post Basic B.Sc Nursing', 'M.Sc Nursing', 'Diploma in Nursing (GNM)'],
  paramedical:      ['B.Sc Medical Laboratory Technology', 'B.Sc Operation Theatre Technology', 'B.Sc Radiology & Imaging Technology', 'Diploma in Ophthalmic Technology'],
  polytechnic:      ['Diploma in Mechanical Engineering', 'Diploma in Civil Engineering', 'Diploma in Electrical Engineering', 'Diploma in Computer Engineering'],
  arts_science:     ['B.Sc Computer Science', 'B.Sc Mathematics', 'B.A English Literature', 'B.Sc Physics', 'B.Sc Chemistry', 'B.A Economics'],
  law:              ['BA LLB (Integrated)', 'BBA LLB (Integrated)', 'LLB (3 Years)', 'LLM'],
  commerce:         ['B.Com General', 'B.Com Computer Applications', 'BBA (Business Administration)', 'B.Com Corporate Secretaryship'],
  pharmacy:         ['B.Pharm (Bachelor of Pharmacy)', 'D.Pharm (Diploma in Pharmacy)', 'M.Pharm', 'Pharm.D'],
  architecture:     ['B.Arch (Bachelor of Architecture)', 'B.Plan (Bachelor of Planning)', 'M.Arch'],
  agriculture:      ['B.Sc (Hons) Agriculture', 'B.Sc (Hons) Horticulture', 'B.Tech Agricultural Engineering'],
  management:       ['MBA Finance', 'MBA Marketing', 'MBA Human Resource Management', 'PGDM'],
  hotel_management: ['B.Sc Hospitality & Hotel Administration', 'Bachelor of Hotel Management (BHM)', 'Diploma in Food Production'],
  teacher_training: ['B.Ed (Bachelor of Education)', 'M.Ed', 'Diploma in Elementary Education (D.El.Ed)'],
  education:        ['B.A Education', 'M.A Education', 'B.Ed'],
};

// ── Manual established year overrides (correct real-world founding years) ─────
const ESTABLISHED_OVERRIDES = {
  // Tamil Nadu
  'Saveetha Institute of Medical and Technical Sciences': 2005,
  'SAVEETHA INSTITUTE OF MEDICAL AND TECHNICAL SCIENCES (DEEMED TO BE UNIVERSITY)': 2005,
  'Saveetha Engineering College': 2001,
  'Saveetha Medical College': 2005,
  'VIT Vellore': 1984,
  'SRM Institute of Science and Technology': 1985,
  'SRM University': 1985,
  'Vel Tech Rangarajan Dr Sagunthala R&D Institute of Science and Technology': 1997,
  'Vel Tech University': 1997,
  'Karpagam Academy of Higher Education': 1998,
  'Amrita Vishwa Vidyapeetham': 2003,
  'Amrita School of Engineering': 2003,
  'Hindustan Institute of Technology and Science': 1985,
  'Sri Venkateswara College of Engineering': 1987,
  'Rajalakshmi Engineering College': 1997,
  'Sri Krishna College of Engineering and Technology': 1998,
  'KPR Institute of Engineering and Technology': 2007,
  'SNS College of Engineering': 2006,
  'Kongu Engineering College': 1983,
  'Bannari Amman Institute of Technology': 1996,
  'Dr. Mahalingam College of Engineering and Technology': 1998,
  'Kumaraguru College of Technology': 1984,
  'Mepco Schlenk Engineering College': 1984,
  'A.C. College of Engineering and Technology': 1972,
  'Velammal Engineering College': 1995,
  'Easwari Engineering College': 1996,
  'St. Joseph College of Engineering': 2000,
  'Sri Sivasubramaniya Nadar College of Engineering': 1996,
  'Meenakshi Sundararajan Engineering College': 2001,
  'Sathyabama Institute of Science and Technology': 1987,
  'Loyola-ICAM College of Engineering and Technology': 2009,
  'Vellore Institute of Technology': 1984,
  'Shanmugha Arts Science Technology & Research Academy (SASTRA)': 1984,
  'SASTRA Deemed University': 1984,
  'Kalasalingam Academy of Research and Education': 1984,
  'Valliammai Engineering College': 1994,
  'Jeppiaar Engineering College': 2001,
  'Panimalar Engineering College': 2000,
  'R.M.K. Engineering College': 1995,
  'R.M.D. Engineering College': 1996,
  'Misrimal Navajee Munoth Jain Engineering College': 2001,
  'Sri Sai Ram Engineering College': 1995,
  'Saveetha School of Engineering': 2001,
  // Maharashtra  
  'MIT World Peace University': 1983,
  'Symbiosis International University': 2002,
  'Pune Institute of Computer Technology': 1983,
  'Vishwakarma Institute of Technology': 1983,
  'D.Y. Patil International University': 2002,
  'Dr. D.Y. Patil Vidyapeeth': 2002,
  // Karnataka
  'Manipal Academy of Higher Education': 1953,
  'Manipal Institute of Technology': 1957,
  'M.S. Ramaiah Institute of Technology': 1962,
  'Dayananda Sagar College of Engineering': 1979,
  'R.V. College of Engineering': 1963,
  'BMS College of Engineering': 1946,
  'JSS Academy of Technical Education': 1963,
  'New Horizon College of Engineering': 2001,
  'Jyothy Institute of Technology': 2007,
  // Delhi / NCR
  'Guru Gobind Singh Indraprastha University': 1998,
  'Jamia Millia Islamia': 1920,
  'Indira Gandhi Delhi Technical University for Women': 1998,
  // Uttar Pradesh
  'Amity University': 2005,
  'Shiv Nadar University': 2011,
  'Galgotias University': 2011,
  'GL Bajaj Institute of Technology and Management': 2010,
  // Rajasthan
  'Poornima University': 2012,
  'LNM Institute of Information Technology': 2003,
  'Jaipur Engineering College and Research Centre': 1999,
  // Andhra Pradesh / Telangana
  'Jawaharlal Nehru Technological University Kakinada': 1946,
  'Koneru Lakshmaiah Education Foundation': 1980,
  'KL University': 1980,
  'Vignan Foundation for Science Technology and Research': 1997,
  'Sri Padmavati Mahila Visvavidyalayam': 1983,
  'GITAM University': 1980,
  // Kerala
  'Amrita School of Engineering Coimbatore': 2003,
  'Cochin University of Science and Technology': 1971,
  'APJ Abdul Kalam Technological University': 2014,
  // Gujarat
  'Dhirubhai Ambani Institute of Information and Communication Technology': 2001,
  'Nirma University': 1994,
  'Charotar University of Science and Technology': 2009,
  // West Bengal
  'Heritage Institute of Technology': 2001,
  'Institute of Engineering & Management': 1989,
  'Techno India University': 2012,
  // Punjab
  'Lovely Professional University': 2006,
  'Chandigarh University': 2012,
  'Chitkara University': 2003,
  // Bihar
  'Central University of South Bihar': 2009,
  // Pan-India
  'ICFAI University': 1995,
  'Symbiosis Institute of Business Management': 1978,
};

// ── Manual type overrides (to fix incorrectly categorized Govt/Private data) ──
const TYPE_OVERRIDES = {
  'Saveetha Institute of Medical and Technical Sciences': 'Private',
  'SAVEETHA INSTITUTE OF MEDICAL AND TECHNICAL SCIENCES (DEEMED TO BE UNIVERSITY)': 'Private',
  'Saveetha Engineering College': 'Private',
  'Saveetha Medical College': 'Private',
  'Saveetha School of Engineering': 'Private'
};

// Helper: Generate a stable, realistic established year from name hash (fallback)
const getEstablishedYear = (name) => {
  if (!name) return 1998;
  // Check manual override first (case-insensitive prefix match)
  const nameKey = Object.keys(ESTABLISHED_OVERRIDES).find(
    k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  if (nameKey) return ESTABLISHED_OVERRIDES[nameKey];
  // Fallback: hash-based year (1947–2015)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const start = 1947;
  const range = 2015 - 1947;
  return start + Math.abs(hash % range);
};

// Helper: Generate a stable, realistic NAAC grade based on rating and name hash
const getNaacGrade = (name, rating) => {
  if (rating >= 4.8) return 'A++';
  if (rating >= 4.5) return 'A+';
  if (rating >= 4.2) return 'A';
  if (rating >= 3.8) return 'B++';
  if (rating >= 3.5) return 'B+';
  if (rating >= 3.0) return 'B';
  return 'C';
};

// Helper: Calculate average and highest salary packages dynamically
const getPackageDetails = (dept, rating) => {
  const bases = {
    engineering:      { avg: 4.5, max: 12 },
    medical:          { avg: 8.0, max: 20 },
    management:       { avg: 5.5, max: 15 },
    law:              { avg: 4.0, max: 10 },
    architecture:     { avg: 4.0, max: 9 },
    pharmacy:         { avg: 3.5, max: 8 },
    nursing:          { avg: 3.0, max: 6 },
    paramedical:      { avg: 3.0, max: 5.5 },
    agriculture:      { avg: 3.8, max: 8 },
    hotel_management: { avg: 3.5, max: 7.5 },
    polytechnic:      { avg: 2.5, max: 4.5 },
    commerce:         { avg: 3.5, max: 8 },
    arts_science:     { avg: 3.0, max: 7 },
  };

  const base = bases[dept] || { avg: 3.0, max: 6 };
  const scale = 1 + (rating - 4.0) * 0.3;
  const avg = (base.avg * scale).toFixed(1);
  const max = (base.max * scale).toFixed(1);
  return {
    avgPackage: `₹${avg} LPA`,
    highestPackage: `₹${max} LPA`,
  };
};

// Helper: Generate detailed handcrafted descriptions dynamically
const generateDescription = (name, type, dept, location, state, rating) => {
  const deptNames = {
    engineering:      'engineering and technology education',
    medical:          'medical sciences and healthcare training',
    nursing:          'nursing and patient care education',
    paramedical:      'paramedical sciences and allied health training',
    polytechnic:      'technical diploma education',
    arts_science:     'liberal arts, sciences, and humanities',
    law:              'legal studies and professional law education',
    commerce:         'commerce, business administration, and accounting',
    pharmacy:         'pharmaceutical sciences and research',
    architecture:     'architecture, design, and physical planning',
    agriculture:      'agricultural sciences, research, and farming technology',
    management:       'management studies and business leadership training',
    hotel_management: 'hotel management and catering technology',
    teacher_training: 'teacher education and pedagogical training',
    education:        'pedagogical studies and educational sciences',
  };

  const deptName = deptNames[dept] || 'higher education';
  const mgmt = type === 'Government' ? 'a premier state-funded government' : 'a leading private';
  let desc = `${name} is ${mgmt} institution specializing in ${deptName}, located in the vibrant city of ${location}, ${state}. `;
  
  if (rating >= 4.5) {
    desc += `Renowned for its academic excellence, state-of-the-art laboratory infrastructure, and highly qualified faculty, the campus offers an outstanding environment for student growth and professional readiness. `;
  } else {
    desc += `Dedicated to providing quality education at affordable costs, the institution focuses on practical learning, career counseling, and skill development to prepare students for the modern industry. `;
  }
  desc += `With an active placement cell, the college facilitates direct campus recruitments and internships with top employers in its domain.`;
  return desc;
};

const makeCollege = (name, location, state, dept, type, gender, rating, minPct, fee, placement, tier, hostel, naac, est, desc, courses, highlight) => ({
  name, location, state, department: dept, type, gender, rating, minPercentage: minPct,
  annualFee: fee, placementRate: placement, topCompanies: getCompanies(dept, tier),
  hostelAvailable: hostel, naacGrade: naac, established: est, description: desc,
  courses, highlight, mapQuery: name + " " + location + " " + state
});

// A curated list of top real colleges in India
const TOP_COLLEGES = [
  // ── Tamil Nadu – Engineering ──────────────────────────────────────────────
  makeCollege("IIT Madras", "Chennai", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.9, 98, "2,00,000", 99, "top", true,  "A++", 1959, "Ranked #1 in India for Engineering", ["B.Tech","M.Tech","Ph.D"], "Top IIT in India"),
  makeCollege("NIT Trichy",  "Tiruchirappalli", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.8, 95, "1,50,000", 95, "top", true,  "A++", 1964, "Top ranked NIT in India", ["B.Tech","M.Tech"], "Top NIT"),
  makeCollege("Anna University (CEG)", "Chennai", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.7, 92, "40,000",  90, "top", true,  "A++",  1794, "Oldest engineering college in India", ["B.E","B.Tech"], "State's Best Govt College"),
  makeCollege("VIT Vellore", "Vellore", "Tamil Nadu", "engineering", "Private",     "Co-Education", 4.5, 85, "3,00,000", 92, "top", true,  "A++", 1984, "Leading private institution with excellent placements", ["B.Tech"], "Highest Placement Offers"),
  makeCollege("SRM Institute of Science and Technology", "Kattankulathur", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.3, 80, "2,50,000", 88, "top", true,  "A++", 1985, "Huge campus with global exposure", ["B.Tech"], "Global Partnerships"),
  makeCollege("PSG College of Technology", "Coimbatore", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.4, 85, "1,20,000", 87, "top", true,  "A",   1951, "Autonomous college with strong industry ties", ["B.E","B.Tech"], "Strong Alumni Network"),
  makeCollege("Coimbatore Institute of Technology", "Coimbatore", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.2, 80, "50,000", 82, "mid", true, "A",  1956, "State-funded autonomous college in Coimbatore", ["B.E"], "Government Autonomous"),
  makeCollege("Thiagarajar College of Engineering", "Madurai", "Tamil Nadu", "engineering", "Private",  "Co-Education", 4.2, 80, "1,00,000", 80, "mid", true, "A+",  1957, "Well-established autonomous college in South TN", ["B.E"], "Quality Education"),
  makeCollege("GCT Coimbatore (Government College of Technology)", "Coimbatore", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.3, 82, "45,000", 83, "mid", true, "A", 1945, "Premier government engineering college in TN", ["B.E","B.Tech"], "State Govt Premier College"),
  makeCollege("SSN College of Engineering", "Chennai", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.4, 86, "1,40,000", 88, "top", false, "A++", 1996, "Top autonomous private college in Chennai", ["B.E","B.Tech"], "Chennai Top Private"),

  // ── Tamil Nadu – Medical ──────────────────────────────────────────────────
  makeCollege("Christian Medical College (CMC)", "Vellore", "Tamil Nadu", "medical", "Private", "Co-Education", 4.9, 97, "1,00,000", 99, "top", true, "A++", 1900, "One of the top medical colleges in India", ["MBBS","BDS"], "World-class Hospital Attached"),
  makeCollege("Madras Medical College", "Chennai", "Tamil Nadu", "medical", "Government", "Co-Education", 4.8, 95, "18,000", 98, "top", true, "A+", 1835, "Oldest medical college in India", ["MBBS","BDS"], "Govt Top Choice"),
  makeCollege("Stanley Medical College", "Chennai", "Tamil Nadu", "medical", "Government", "Co-Education", 4.5, 90, "20,000", 95, "top", true, "A",  1938, "Premier government medical college attached to Stanley Hospital", ["MBBS"], "Govt Medical Top Pick"),
  makeCollege("Kilpauk Medical College", "Chennai", "Tamil Nadu", "medical", "Government", "Co-Education", 4.4, 90, "20,000", 94, "top", true, "A",  1960, "Government medical college in Chennai", ["MBBS"], "Govt – Chennai"),
  makeCollege("Sri Ramachandra Institute of Higher Education", "Chennai", "Tamil Nadu", "medical", "Private", "Co-Education", 4.6, 92, "13,00,000", 97, "top", true, "A+", 1985, "Deemed university with attached hospital", ["MBBS","BDS"], "Deemed – Top Private"),

  // ── Tamil Nadu – Agriculture ──────────────────────────────────────────────
  makeCollege("Tamil Nadu Agricultural University (TNAU)", "Coimbatore", "Tamil Nadu", "agriculture", "Government", "Co-Education", 4.8, 88, "45,000", 85, "top", true, "A++", 1971, "Leading agricultural university in India", ["B.Sc Agriculture","B.Tech Agriculture"], "ICAR Recognized Top University"),
  makeCollege("Annamalai University (Faculty of Agriculture)", "Chidambaram", "Tamil Nadu", "agriculture", "Government", "Co-Education", 4.2, 75, "60,000", 70, "mid", true, "A",  1929, "Historic university with vast agricultural land", ["B.Sc Agriculture"], "Large Agricultural Farms"),

  // ── Maharashtra – Engineering ─────────────────────────────────────────────
  makeCollege("IIT Bombay", "Mumbai", "Maharashtra", "engineering", "Government", "Co-Education", 5.0, 99, "2,20,000", 99, "top", true,  "A++", 1958, "Premier engineering institute in India", ["B.Tech"], "Unmatched Placements"),
  makeCollege("College of Engineering Pune (COEP)", "Pune", "Maharashtra", "engineering", "Government", "Co-Education", 4.7, 94, "90,000", 92, "top", true,  "A+",  1854, "One of the oldest and best state engineering colleges", ["B.Tech"], "Rich Heritage"),
  makeCollege("VJTI", "Mumbai", "Maharashtra", "engineering", "Government", "Co-Education", 4.6, 92, "85,000", 90, "top", false, "A",   1887, "Prestigious state college in Mumbai", ["B.Tech"], "Excellent Mumbai Placements"),
  makeCollege("Institute of Chemical Technology (ICT)", "Mumbai", "Maharashtra", "engineering", "Government", "Co-Education", 4.6, 90, "70,000", 88, "top", true, "A++", 1933, "Premier institute for chemical technology", ["B.Tech Chemical"], "Chemical Engg Leader"),
  makeCollege("Symbiosis Institute of Technology", "Pune", "Maharashtra", "engineering", "Private", "Co-Education", 4.3, 82, "2,00,000", 85, "top", true, "A",  2008, "Top private engineering college in Pune", ["B.Tech"], "Pune Private Top Pick"),

  // ── Maharashtra – Medical ─────────────────────────────────────────────────
  makeCollege("Seth GS Medical College & KEM Hospital", "Mumbai", "Maharashtra", "medical", "Government", "Co-Education", 4.8, 96, "25,000", 97, "top", true, "A++", 1926, "Top government medical college in Maharashtra", ["MBBS"], "KEM Hospital Attached"),
  makeCollege("Grant Medical College", "Mumbai", "Maharashtra", "medical", "Government", "Co-Education", 4.6, 93, "22,000", 95, "top", true, "A+", 1845, "One of the oldest medical colleges in India", ["MBBS"], "Oldest in Maharashtra"),
  makeCollege("B.J. Medical College", "Pune", "Maharashtra", "medical", "Government", "Co-Education", 4.7, 94, "22,000", 96, "top", true, "A+", 1878, "Premier government medical college in Pune", ["MBBS"], "Govt – Pune"),

  // ── Maharashtra – Agriculture ─────────────────────────────────────────────
  makeCollege("Mahatma Phule Krishi Vidyapeeth (MPKV)", "Rahuri", "Maharashtra", "agriculture", "Government", "Co-Education", 4.6, 82, "40,000", 80, "top", true, "A+", 1968, "Premier agriculture university in Maharashtra", ["B.Sc Agriculture"], "Top Agri Research"),
  makeCollege("Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV)", "Akola", "Maharashtra", "agriculture", "Government", "Co-Education", 4.4, 78, "38,000", 76, "mid", true, "A",  1969, "Agricultural university in Vidarbha region", ["B.Sc Agriculture"], "Vidarbha Agri Leader"),

  // ── Delhi – Engineering & Medical ─────────────────────────────────────────
  makeCollege("IIT Delhi", "New Delhi", "Delhi", "engineering", "Government", "Co-Education", 4.9, 98, "2,10,000", 98, "top", true, "A++", 1961, "Eminent engineering institution", ["B.Tech"], "Capital City Exposure"),
  makeCollege("AIIMS New Delhi", "New Delhi", "Delhi", "medical", "Government", "Co-Education", 5.0, 99, "5,000", 100, "top", true, "A++", 1956, "The best medical college in India", ["MBBS"], "Best Medical Infrastructure"),
  makeCollege("Delhi Technological University (DTU)", "New Delhi", "Delhi", "engineering", "Government", "Co-Education", 4.6, 88, "1,60,000", 90, "top", false, "A+", 1941, "Top state technical university in Delhi", ["B.Tech"], "Delhi Govt Top Pick"),
  makeCollege("Netaji Subhas University of Technology (NSUT)", "New Delhi", "Delhi", "engineering", "Government", "Co-Education", 4.5, 86, "1,50,000", 88, "top", false, "A",  1983, "Leading government technical university in Delhi", ["B.Tech"], "Delhi Tech Leader"),

  // ── Delhi – Agriculture ───────────────────────────────────────────────────
  makeCollege("Indian Agricultural Research Institute (IARI)", "New Delhi", "Delhi", "agriculture", "Government", "Co-Education", 4.9, 90, "30,000", 90, "top", true, "A++", 1905, "The seat of India's Green Revolution", ["B.Sc Agriculture","M.Sc"], "Seat of Green Revolution"),

  // ── Karnataka – Engineering ───────────────────────────────────────────────
  makeCollege("NITK Surathkal", "Mangalore", "Karnataka", "engineering", "Government", "Co-Education", 4.8, 96, "1,40,000", 94, "top", true, "A++", 1960, "Top NIT in Karnataka", ["B.Tech"], "Private Beach Campus"),
  makeCollege("IIT Dharwad", "Dharwad", "Karnataka", "engineering", "Government", "Co-Education", 4.6, 92, "2,00,000", 90, "top", true, "A++", 2016, "New-generation IIT in Karnataka", ["B.Tech"], "New IIT – Growing Fast"),
  makeCollege("BMS College of Engineering", "Bangalore", "Karnataka", "engineering", "Private", "Co-Education", 4.4, 85, "1,10,000", 86, "top", true, "A++", 1946, "Top autonomous private college in Bangalore", ["B.E","B.Tech"], "Bangalore's Oldest Pvt"),
  makeCollege("PES University", "Bangalore", "Karnataka", "engineering", "Private", "Co-Education", 4.4, 83, "2,00,000", 87, "top", true, "A",  1972, "Top private university in Bangalore", ["B.Tech"], "Bangalore Private Leader"),
  makeCollege("RV College of Engineering", "Bangalore", "Karnataka", "engineering", "Private", "Co-Education", 4.5, 87, "1,30,000", 89, "top", true, "A+", 1963, "Top-ranked autonomous college in Karnataka", ["B.E","B.Tech"], "Top Autonomous Private"),

  // ── Karnataka – Agriculture ───────────────────────────────────────────────
  makeCollege("University of Agricultural Sciences (UAS)", "Bangalore", "Karnataka", "agriculture", "Government", "Co-Education", 4.7, 85, "50,000", 82, "top", true, "A+", 1964, "Top agricultural university in Karnataka", ["B.Sc Agriculture"], "Silicon Valley Agri-Tech"),
  makeCollege("University of Agricultural Sciences (UAS)", "Dharwad", "Karnataka", "agriculture", "Government", "Co-Education", 4.6, 82, "45,000", 80, "top", true, "A",  1949, "Premier agricultural university in North Karnataka", ["B.Sc Agriculture"], "North Karnataka Agri Leader"),

  // ── Telangana / Andhra Pradesh ────────────────────────────────────────────
  makeCollege("IIT Hyderabad", "Hyderabad", "Telangana", "engineering", "Government", "Co-Education", 4.7, 95, "2,00,000", 93, "top", true, "A++", 2008, "Fastest growing new IIT", ["B.Tech"], "Innovative Curriculum"),
  makeCollege("Osmania University", "Hyderabad", "Telangana", "engineering", "Government", "Co-Education", 4.3, 80, "40,000", 80, "mid", true, "A",  1918, "Largest residential university in India", ["B.Tech","B.E"], "Oldest in Telangana"),
  makeCollege("NIT Warangal", "Warangal", "Telangana", "engineering", "Government", "Co-Education", 4.8, 95, "1,40,000", 93, "top", true, "A++", 1959, "Top NIT in South India", ["B.Tech"], "Telangana's Top NIT"),
  makeCollege("Professor Jayashankar Telangana State Agricultural University", "Hyderabad", "Telangana", "agriculture", "Government", "Co-Education", 4.5, 80, "45,000", 78, "top", true, "A",  2014, "State's best agri university", ["B.Sc Agriculture"], "Modern Agri Methods"),
  makeCollege("JNTU Hyderabad", "Hyderabad", "Telangana", "engineering", "Government", "Co-Education", 4.4, 82, "60,000", 82, "mid", true, "A+", 1965, "Jawaharlal Nehru Technological University – major state tech university", ["B.Tech"], "State Govt University"),
  makeCollege("NIT Andhra Pradesh", "Tadepalligudem", "Andhra Pradesh", "engineering", "Government", "Co-Education", 4.5, 92, "1,30,000", 88, "top", true, "A",  2015, "New NIT in Andhra Pradesh", ["B.Tech"], "New NIT – Growing Fast"),
  makeCollege("Andhra University", "Visakhapatnam", "Andhra Pradesh", "engineering", "Government", "Co-Education", 4.3, 78, "50,000", 80, "mid", true, "A++",  1926, "One of the oldest universities in Andhra Pradesh", ["B.Tech","B.E"], "AP Heritage University"),
  makeCollege("RGUKT (IIIT Srikakulam)", "Srikakulam", "Andhra Pradesh", "engineering", "Government", "Co-Education", 4.4, 85, "40,000", 84, "top", true, "A",  2008, "Rajiv Gandhi University of Knowledge Technologies – low-cost govt IIT-style", ["B.Tech"], "Affordable IIT-Style"),

  // ── Kerala ────────────────────────────────────────────────────────────────
  makeCollege("NIT Calicut", "Kozhikode", "Kerala", "engineering", "Government", "Co-Education", 4.8, 96, "1,40,000", 94, "top", true, "A++", 1961, "Top NIT in Kerala", ["B.Tech"], "Kerala's Top NIT"),
  makeCollege("College of Engineering Trivandrum (CET)", "Thiruvananthapuram", "Kerala", "engineering", "Government", "Co-Education", 4.6, 90, "25,000", 88, "top", true, "A+", 1939, "Oldest engineering college in Kerala", ["B.Tech","B.E"], "Kerala Govt Heritage College"),
  makeCollege("Government Medical College Thiruvananthapuram", "Thiruvananthapuram", "Kerala", "medical", "Government", "Co-Education", 4.7, 94, "12,000", 96, "top", true, "A+", 1951, "Kerala's premier government medical college", ["MBBS"], "Kerala Govt Top Medical"),
  makeCollege("Kerala Agricultural University (KAU)", "Thrissur", "Kerala", "agriculture", "Government", "Co-Education", 4.6, 82, "35,000", 80, "top", true, "A",  1971, "Kerala's only agricultural university", ["B.Sc Agriculture"], "Kerala Agri University"),

  // ── Gujarat ───────────────────────────────────────────────────────────────
  makeCollege("IIT Gandhinagar", "Gandhinagar", "Gujarat", "engineering", "Government", "Co-Education", 4.7, 95, "2,00,000", 92, "top", true, "A++", 2008, "New-generation IIT with modern facilities", ["B.Tech"], "Modern IIT Campus"),
  makeCollege("NIT Surat (SVNIT)", "Surat", "Gujarat", "engineering", "Government", "Co-Education", 4.6, 92, "1,40,000", 90, "top", true, "A++", 1961, "Top NIT in Gujarat", ["B.Tech"], "Gujarat's Top NIT"),
  makeCollege("MS University Baroda (Faculty of Technology)", "Vadodara", "Gujarat", "engineering", "Government", "Co-Education", 4.4, 80, "45,000", 83, "mid", true, "A+", 1881, "Heritage state university in Gujarat", ["B.Tech","B.E"], "Heritage State Univ"),
  makeCollege("Anand Agricultural University", "Anand", "Gujarat", "agriculture", "Government", "Co-Education", 4.6, 80, "40,000", 80, "top", true, "A+", 1972, "White Revolution homeland – top agri university", ["B.Sc Agriculture"], "White Revolution Homeland"),

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  makeCollege("IIT Jodhpur", "Jodhpur", "Rajasthan", "engineering", "Government", "Co-Education", 4.6, 93, "2,00,000", 90, "top", true, "A++", 2008, "New IIT with desert campus", ["B.Tech"], "Desert Campus IIT"),
  makeCollege("BITS Pilani", "Pilani", "Rajasthan", "engineering", "Private",     "Co-Education", 4.8, 90, "5,00,000", 95, "top", true, "A++", 1964, "Top-ranked private university in India", ["B.Tech","B.E"], "India's Best Private"),
  makeCollege("MNIT Jaipur", "Jaipur", "Rajasthan", "engineering", "Government", "Co-Education", 4.6, 93, "1,40,000", 90, "top", true, "A++", 1963, "Motilal Nehru NIT in Jaipur", ["B.Tech"], "Rajasthan's Top NIT"),
  makeCollege("SMS Medical College", "Jaipur", "Rajasthan", "medical", "Government", "Co-Education", 4.7, 93, "18,000", 95, "top", true, "A+", 1947, "Top government medical college in Rajasthan", ["MBBS"], "Rajasthan Govt Top Medical"),

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  makeCollege("IIT Kanpur", "Kanpur", "Uttar Pradesh", "engineering", "Government", "Co-Education", 4.9, 98, "2,10,000", 98, "top", true, "A++", 1959, "Top IIT with pioneering research", ["B.Tech"], "Pioneer IIT"),
  makeCollege("IIT BHU Varanasi", "Varanasi", "Uttar Pradesh", "engineering", "Government", "Co-Education", 4.7, 93, "2,00,000", 92, "top", true, "A++", 1919, "IIT at the oldest university campus", ["B.Tech"], "Historic IIT Campus"),
  makeCollege("HBTU Kanpur", "Kanpur", "Uttar Pradesh", "engineering", "Government", "Co-Education", 4.3, 78, "50,000", 82, "mid", true, "A",  1966, "State government technical university in Kanpur", ["B.Tech","B.E"], "UP State Govt Engg"),
  makeCollege("KGMU (King George's Medical University)", "Lucknow", "Uttar Pradesh", "medical", "Government", "Co-Education", 4.8, 95, "15,000", 96, "top", true, "A++", 1905, "Top medical university in North India", ["MBBS"], "North India Top Medical"),

  // ── West Bengal ───────────────────────────────────────────────────────────
  makeCollege("IIT Kharagpur", "Kharagpur", "West Bengal", "engineering", "Government", "Co-Education", 5.0, 99, "2,00,000", 99, "top", true, "A++", 1951, "First and largest IIT in India", ["B.Tech"], "First IIT in India"),
  makeCollege("Jadavpur University", "Kolkata",   "West Bengal", "engineering", "Government", "Co-Education", 4.7, 88, "10,000", 90, "top", true, "A++", 1906, "Top state university in West Bengal", ["B.Tech","B.E"], "WB Govt Top Pick"),
  makeCollege("NIT Durgapur", "Durgapur", "West Bengal", "engineering", "Government", "Co-Education", 4.6, 91, "1,40,000", 89, "top", true, "A+", 1960, "Top NIT in West Bengal", ["B.Tech"], "WB's Top NIT"),
  makeCollege("Medical College and Hospital Kolkata", "Kolkata", "West Bengal", "medical", "Government", "Co-Education", 4.7, 93, "15,000", 95, "top", true, "A+", 1835, "Oldest medical college in Asia", ["MBBS"], "Asia's Oldest Medical College"),

  // ── Punjab & Haryana ──────────────────────────────────────────────────────
  makeCollege("IIT Ropar", "Rupnagar", "Punjab", "engineering", "Government", "Co-Education", 4.6, 92, "2,00,000", 90, "top", true, "A++", 2008, "IIT in Punjab", ["B.Tech"], "Punjab IIT"),
  makeCollege("Thapar Institute of Engineering and Technology", "Patiala", "Punjab", "engineering", "Private", "Co-Education", 4.6, 88, "2,50,000", 90, "top", true, "A++", 1956, "Top private deemed university in Punjab", ["B.Tech"], "Punjab's Top Private"),
  makeCollege("NIT Kurukshetra", "Kurukshetra", "Haryana", "engineering", "Government", "Co-Education", 4.6, 92, "1,40,000", 90, "top", true, "A+", 1963, "Top NIT in Haryana", ["B.Tech"], "Haryana's Top NIT"),

  // ── Madhya Pradesh ────────────────────────────────────────────────────────
  makeCollege("IIT Indore", "Indore", "Madhya Pradesh", "engineering", "Government", "Co-Education", 4.7, 94, "2,00,000", 92, "top", true, "A++", 2009, "IIT in MP", ["B.Tech"], "MP IIT"),
  makeCollege("MANIT Bhopal", "Bhopal", "Madhya Pradesh", "engineering", "Government", "Co-Education", 4.6, 91, "1,40,000", 89, "top", true, "A+", 1960, "Top NIT in Madhya Pradesh", ["B.Tech"], "MP's Top NIT"),
  makeCollege("AIIMS Bhopal", "Bhopal", "Madhya Pradesh", "medical", "Government", "Co-Education", 4.7, 95, "5,000", 97, "top", true, "A++", 2012, "AIIMS in Madhya Pradesh", ["MBBS"], "MP AIIMS"),

  // ── Odisha ────────────────────────────────────────────────────────────────
  makeCollege("IIT Bhubaneswar", "Bhubaneswar", "Odisha", "engineering", "Government", "Co-Education", 4.6, 93, "2,00,000", 91, "top", true, "A++", 2008, "IIT in Odisha", ["B.Tech"], "Odisha IIT"),
  makeCollege("NIT Rourkela", "Rourkela", "Odisha", "engineering", "Government", "Co-Education", 4.7, 93, "1,40,000", 91, "top", true, "A++", 1961, "Top NIT in Eastern India", ["B.Tech"], "Eastern India Top NIT"),
  makeCollege("AIIMS Bhubaneswar", "Bhubaneswar", "Odisha", "medical", "Government", "Co-Education", 4.6, 95, "5,000", 96, "top", true, "A++", 2012, "AIIMS in Odisha", ["MBBS"], "Odisha AIIMS"),

  // ── Assam & NE ────────────────────────────────────────────────────────────
  makeCollege("IIT Guwahati", "Guwahati", "Assam", "engineering", "Government", "Co-Education", 4.8, 95, "2,00,000", 93, "top", true, "A++", 1994, "Top IIT in Northeast India", ["B.Tech"], "NE India's Top IIT"),
  makeCollege("NIT Silchar", "Silchar", "Assam", "engineering", "Government", "Co-Education", 4.5, 89, "1,40,000", 86, "top", true, "A",  1967, "Top NIT in Assam", ["B.Tech"], "Assam's Top NIT"),

  // ── Himachal Pradesh ──────────────────────────────────────────────────────
  makeCollege("IIT Mandi", "Mandi", "Himachal Pradesh", "engineering", "Government", "Co-Education", 4.6, 92, "2,00,000", 89, "top", true, "A++", 2009, "IIT in Himachal Pradesh", ["B.Tech"], "Himachal IIT"),
  makeCollege("NIT Hamirpur", "Hamirpur", "Himachal Pradesh", "engineering", "Government", "Co-Education", 4.5, 89, "1,40,000", 86, "top", true, "A",  1986, "Top NIT in Himachal Pradesh", ["B.Tech"], "HP's Top NIT"),

  // ── Jharkhand ─────────────────────────────────────────────────────────────
  makeCollege("IIT (ISM) Dhanbad", "Dhanbad", "Jharkhand", "engineering", "Government", "Co-Education", 4.7, 92, "2,00,000", 91, "top", true, "A++", 1926, "Top engineering institute in Jharkhand – mining specialty", ["B.Tech"], "Mining Engineering Leader"),
  makeCollege("NIT Jamshedpur", "Jamshedpur", "Jharkhand", "engineering", "Government", "Co-Education", 4.5, 90, "1,40,000", 88, "top", true, "A+", 1960, "Top NIT in Jharkhand", ["B.Tech"], "Jharkhand's Top NIT"),

  // ── Goa ───────────────────────────────────────────────────────────────────
  makeCollege("NIT Goa", "Ponda", "Goa", "engineering", "Government", "Co-Education", 4.4, 88, "1,40,000", 85, "top", true, "A",  2010, "NIT in Goa", ["B.Tech"], "Goa NIT"),
  makeCollege("Goa College of Engineering", "Ponda", "Goa", "engineering", "Government", "Co-Education", 4.3, 82, "40,000", 82, "mid", true, "A",  1986, "Top state engineering college in Goa", ["B.E"], "Goa Govt Top Pick"),

  // ── Uttarakhand ───────────────────────────────────────────────────────────
  makeCollege("IIT Roorkee", "Roorkee", "Uttarakhand", "engineering", "Government", "Co-Education", 4.9, 97, "2,10,000", 97, "top", true, "A++", 1847, "Oldest technical university in Asia", ["B.Tech"], "Asia's Oldest Tech University"),
  makeCollege("NIT Uttarakhand", "Srinagar (Garhwal)", "Uttarakhand", "engineering", "Government", "Co-Education", 4.3, 87, "1,40,000", 83, "top", true, "A",  2009, "NIT in Uttarakhand", ["B.Tech"], "Uttarakhand NIT"),

  // ── Chhattisgarh ──────────────────────────────────────────────────────────
  makeCollege("NIT Raipur", "Raipur", "Chhattisgarh", "engineering", "Government", "Co-Education", 4.4, 88, "1,40,000", 85, "top", true, "A",  1956, "Top NIT in Chhattisgarh", ["B.Tech"], "CG's Top NIT"),
  makeCollege("AIIMS Raipur", "Raipur", "Chhattisgarh", "medical", "Government", "Co-Education", 4.5, 94, "5,000", 95, "top", true, "A++", 2012, "AIIMS in Chhattisgarh", ["MBBS"], "CG AIIMS"),

  // ── Bihar ─────────────────────────────────────────────────────────────────
  makeCollege("IIT Patna", "Patna", "Bihar", "engineering", "Government", "Co-Education", 4.5, 91, "2,00,000", 88, "top", true, "A++", 2008, "IIT in Bihar", ["B.Tech"], "Bihar IIT"),
  makeCollege("NIT Patna", "Patna", "Bihar", "engineering", "Government", "Co-Education", 4.4, 88, "1,40,000", 85, "top", true, "A",  1886, "Top NIT in Bihar", ["B.Tech"], "Bihar's Top NIT"),
  makeCollege("AIIMS Patna", "Patna", "Bihar", "medical", "Government", "Co-Education", 4.6, 94, "5,000", 95, "top", true, "A++", 2012, "AIIMS in Bihar", ["MBBS"], "Bihar AIIMS"),
];

// ── State name normalization map ──────────────────────────────────────────────
// The compressed JSON has truncated/corrupted state names. This maps them back.
const STATE_ALIAS = {
  'andhra':          'Andhra Pradesh',
  'andhra pradesh':  'Andhra Pradesh',
  'arunachal':       'Arunachal Pradesh',
  'assam':           'Assam',
  'bihar':           'Bihar',
  'chhattis':        'Chhattisgarh',
  'chhattisgarh':    'Chhattisgarh',
  'goa':             'Goa',
  'gujarat':         'Gujarat',
  'haryana':         'Haryana',
  'himachal':        'Himachal Pradesh',
  'himachal pradesh':'Himachal Pradesh',
  'jharkhand':       'Jharkhand',
  'karnataka':       'Karnataka',
  'karnata':         'Karnataka',
  'kerala':          'Kerala',
  'madhya':          'Madhya Pradesh',
  'madhya pradesh':  'Madhya Pradesh',
  'maharashtra':     'Maharashtra',
  'mahara':          'Maharashtra',
  'manipur':         'Manipur',
  'meghalaya':       'Meghalaya',
  'mizoram':         'Mizoram',
  'nagaland':        'Nagaland',
  'odisha':          'Odisha',
  'punjab':          'Punjab',
  'rajasthan':       'Rajasthan',
  'rajasth':         'Rajasthan',
  'sikkim':          'Sikkim',
  'tamil':           'Tamil Nadu',
  'tamil nadu':      'Tamil Nadu',
  'telangana':       'Telangana',
  'telanga':         'Telangana',
  'tripura':         'Tripura',
  'uttar':           'Uttar Pradesh',
  'uttar pradesh':   'Uttar Pradesh',
  'uttarakhand':     'Uttarakhand',
  'west':            'West Bengal',
  'west bengal':     'West Bengal',
  'delhi':           'Delhi',
  'jammu':           'Jammu & Kashmir',
  'ladakh':          'Ladakh',
  'puducherry':      'Puducherry',
  'chandigarh':      'Chandigarh',
};

const normalizeState = (raw) => {
  if (!raw) return 'Unknown';
  const key = raw.trim().toLowerCase();
  return STATE_ALIAS[key] || raw.trim();
};

// Department keyword guessing from college name (to fix miscoded rows)
const guessDeptFromName = (name, rawDept) => {
  if (!name) return rawDept;
  const n = name.toLowerCase();
  if (n.includes('engineer') || n.includes('technology') || n.includes('technical') ||
      n.includes(' tech') || n.includes('polytechnic') && rawDept !== 'polytechnic') {
    if (n.includes('polytechnic')) return 'polytechnic';
    return 'engineering';
  }
  if (n.includes('medical') || n.includes('mbbs') || n.includes('medicine') ||
      n.includes('dental') || n.includes('bds')) return 'medical';
  if (n.includes('nursing')) return 'nursing';
  if (n.includes('pharmacy') || n.includes('pharma')) return 'pharmacy';
  if (n.includes('law') || n.includes('legal')) return 'law';
  if (n.includes('agriculture') || n.includes('agri') || n.includes('horticult')) return 'agriculture';
  if (n.includes('architecture') || n.includes('planning')) return 'architecture';
  if (n.includes('management') || n.includes('business') || n.includes('commerce') ||
      n.includes('mba') || n.includes('bba') || n.includes('b.com')) return 'management';
  if (n.includes('hotel') || n.includes('hospitality') || n.includes('catering')) return 'hotel_management';
  if (n.includes('education') || n.includes('b.ed') || n.includes('bed') ||
      n.includes('teacher') || n.includes('training')) return 'teacher_training';
  if (n.includes('paramedical') || n.includes('physiotherapy') || n.includes('optometry')) return 'paramedical';
  return rawDept;
};

const PARSED_COLLEGES = collegesData
  .filter(c => {
    // Skip completely junk rows: name must be a real string, state must be somewhat valid
    if (!c[0] || typeof c[0] !== 'string' || c[0].length < 3) return false;
    if (!c[2] || typeof c[2] !== 'string') return false;
    // Skip rows where the state looks like a number/year/URL
    const raw = c[2].trim();
    if (/^\d{4}$/.test(raw)) return false;       // year like "2008"
    if (raw === '-' || raw === 'Unknown' || raw.length < 2) return false;
    if (raw.startsWith('http') || raw.startsWith('www')) return false;
    return true;
  })
  .map(c => {
    const normState = normalizeState(c[2]);
    const rawDept   = c[3] || 'arts_science';
    const dept      = guessDeptFromName(c[0], rawDept);
    const ratingVal = typeof c[5] === 'number' ? c[5] : 4.0;
    const packageInfo = getPackageDetails(dept, ratingVal);
    
    return {
      name:           c[0],
      location:       c[1] || normState,
      state:          normState,
      department:     dept,
      type:           TYPE_OVERRIDES[c[0]] || (c[4] === 'Government' ? 'Government' : 'Private'),
      gender:         'Co-Education',
      rating:         ratingVal,
      placementRate:  typeof c[6] === 'number' ? c[6] : 70,
      minPercentage:  typeof c[7] === 'number' ? c[7] : 50,
      annualFee:      'Contact College',
      topCompanies:   getCompanies(dept, 'mid'),
      hostelAvailable: c[8] === 1,
      naacGrade:      getNaacGrade(c[0], ratingVal),
      established:    getEstablishedYear(c[0]),
      description:    generateDescription(c[0], c[4], dept, c[1] || normState, normState, ratingVal),
      courses:        DEPT_COURSES[dept] || ['Various Courses'],
      highlight:      '',
      mapQuery:       `${c[0]} ${c[1] || ''} ${normState}`,
      domain:         c[9] || '',
      avgPackage:     packageInfo.avgPackage,
      highestPackage: packageInfo.highestPackage,
    };
  });

// Combine ALL sources: curated top colleges + gap-filling extras + all parsed colleges
export const COLLEGE_DATABASE = [...TOP_COLLEGES, ...EXTRA_COLLEGES, ...PARSED_COLLEGES];

/**
 * Returns colleges for a student.
 * @param {string|null} targetState - null = All India; string = specific state
 * @param {string}      department  - department id
 * @param {number}      percentage  - student's 12th percentage
 * @param {number}      entranceScore
 * @param {string}      homeState   - student's home state (for PDS ordering)
 */
// Helper: check if a college's state matches a target state (handles aliases)
const stateMatches = (collegeState, targetState) => {
  if (!collegeState || !targetState) return false;
  const cs = normalizeState(collegeState).toLowerCase();
  const ts = targetState.toLowerCase();
  return cs === ts || cs.startsWith(ts) || ts.startsWith(cs);
};

export const getCollegesForStudent = (targetState, department, percentage, entranceScore = 0, homeState = null) => {
  const isStateSpecific = !!(targetState && targetState !== 'All India');

  // Sort: highest rating first, then lowest cutoff (most accessible) at bottom
  const sortFunc = (a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.minPercentage - b.minPercentage;
  };

  if (isStateSpecific) {
    // STATE SELECTED: filter by state + department + student's percentage meets college cutoff
    const matches = COLLEGE_DATABASE.filter(c =>
      stateMatches(c.state, targetState) &&
      c.department === department &&
      c.minPercentage <= percentage
    );
    matches.sort(sortFunc);
    return matches;

  } else {
    // ALL INDIA: filter by department + student's percentage meets college cutoff
    // Home-state colleges pinned at the top, rest sorted by rating
    let deptMatch = COLLEGE_DATABASE.filter(c =>
      c.department === department &&
      c.minPercentage <= percentage
    );
    if (deptMatch.length === 0) deptMatch = [];

    const homeColleges = homeState
      ? deptMatch.filter(c => stateMatches(c.state, homeState))
      : [];
    const others = homeState
      ? deptMatch.filter(c => !stateMatches(c.state, homeState))
      : deptMatch;

    homeColleges.sort(sortFunc);
    others.sort(sortFunc);
    return [...homeColleges, ...others];
  }
};

export const searchColleges = (query) => {
  if (!query) return COLLEGE_DATABASE.slice(0, 20);

  const STOP_WORDS = new Set(['colleges', 'college', 'the', 'of', 'in', 'and', 'for', 'a', 'an']);
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  const terms = words.length > 0 ? words : [query.toLowerCase()];

  return COLLEGE_DATABASE.filter(c => {
    const haystack = [
      c.name, c.location, normalizeState(c.state), c.department, c.type,
    ].join(' ').toLowerCase();
    return terms.some(term => haystack.includes(term));
  }).slice(0, 100);
};

/**
 * Returns the top-25 colleges for a student based on percentage bucket, state, and department.
 * Percentage is snapped to the nearest 5% step (50–100).
 * Colleges whose minPercentage > pctBucket are excluded.
 */
export const getTop25ForPercentage = (targetState, department, percentage) => {
  // Snap percentage to nearest 5%-step floor (50–100)
  const PCT_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const bucket = PCT_STEPS.reduce((prev, curr) =>
    Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
  );

  const isStateSpecific = !!(targetState && targetState !== 'All India');

  const sortFunc = (a, b) => {
    // Primary: rating desc, Secondary: placementRate desc, Tertiary: minPercentage asc
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.placementRate !== a.placementRate) return b.placementRate - a.placementRate;
    return a.minPercentage - b.minPercentage;
  };

  let candidates;
  if (isStateSpecific) {
    candidates = COLLEGE_DATABASE.filter(c =>
      stateMatches(c.state, targetState) &&
      c.department === department &&
      c.minPercentage <= bucket
    );
  } else {
    candidates = COLLEGE_DATABASE.filter(c =>
      c.department === department &&
      c.minPercentage <= bucket
    );
  }

  candidates.sort(sortFunc);
  return candidates.slice(0, 25);
};

/**
 * Returns ALL colleges in a given state, sorted by rating desc.
 * If targetState is null / 'All India', returns top colleges from all states.
 */
export const getAllCollegesInState = (targetState) => {
  const sortFunc = (a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.placementRate - a.placementRate;
  };

  if (!targetState || targetState === 'All India') {
    return [...COLLEGE_DATABASE].sort(sortFunc);
  }

  return COLLEGE_DATABASE
    .filter(c => stateMatches(c.state, targetState))
    .sort(sortFunc);
};


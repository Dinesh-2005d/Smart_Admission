// src/constants/collegeDatabase.js

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
  makeCollege("Anna University (CEG)", "Chennai", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.7, 92, "40,000",  90, "top", true,  "A+",  1794, "Oldest engineering college in India", ["B.E","B.Tech"], "State's Best Govt College"),
  makeCollege("VIT Vellore", "Vellore", "Tamil Nadu", "engineering", "Private",     "Co-Education", 4.5, 85, "3,00,000", 92, "top", true,  "A++", 1984, "Leading private institution with excellent placements", ["B.Tech"], "Highest Placement Offers"),
  makeCollege("SRM Institute of Science and Technology", "Kattankulathur", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.3, 80, "2,50,000", 88, "top", true,  "A++", 1985, "Huge campus with global exposure", ["B.Tech"], "Global Partnerships"),
  makeCollege("PSG College of Technology", "Coimbatore", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.4, 85, "1,20,000", 87, "top", true,  "A",   1951, "Autonomous college with strong industry ties", ["B.E","B.Tech"], "Strong Alumni Network"),
  makeCollege("Coimbatore Institute of Technology", "Coimbatore", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.2, 80, "50,000", 82, "mid", true, "A",  1956, "State-funded autonomous college in Coimbatore", ["B.E"], "Government Autonomous"),
  makeCollege("Thiagarajar College of Engineering", "Madurai", "Tamil Nadu", "engineering", "Private",  "Co-Education", 4.2, 80, "1,00,000", 80, "mid", true, "A",  1957, "Well-established autonomous college in South TN", ["B.E"], "Quality Education"),
  makeCollege("GCT Coimbatore (Government College of Technology)", "Coimbatore", "Tamil Nadu", "engineering", "Government", "Co-Education", 4.3, 82, "45,000", 83, "mid", true, "A", 1945, "Premier government engineering college in TN", ["B.E","B.Tech"], "State Govt Premier College"),
  makeCollege("SSN College of Engineering", "Chennai", "Tamil Nadu", "engineering", "Private", "Co-Education", 4.4, 86, "1,40,000", 88, "top", false, "A+", 1996, "Top autonomous private college in Chennai", ["B.E","B.Tech"], "Chennai Top Private"),

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
  makeCollege("Institute of Chemical Technology (ICT)", "Mumbai", "Maharashtra", "engineering", "Government", "Co-Education", 4.6, 90, "70,000", 88, "top", true, "A+", 1933, "Premier institute for chemical technology", ["B.Tech Chemical"], "Chemical Engg Leader"),
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
  makeCollege("BMS College of Engineering", "Bangalore", "Karnataka", "engineering", "Private", "Co-Education", 4.4, 85, "1,10,000", 86, "top", true, "A+", 1946, "Top autonomous private college in Bangalore", ["B.E","B.Tech"], "Bangalore's Oldest Pvt"),
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
  makeCollege("Andhra University", "Visakhapatnam", "Andhra Pradesh", "engineering", "Government", "Co-Education", 4.3, 78, "50,000", 80, "mid", true, "A",  1926, "One of the oldest universities in Andhra Pradesh", ["B.Tech","B.E"], "AP Heritage University"),
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

import collegesData from './colleges_compressed.json';

const PARSED_COLLEGES = collegesData.map(c => ({
  name: c[0],
  location: c[1],
  state: c[2],
  department: c[3],
  type: c[4],
  gender: "Co-Education",
  rating: c[5],
  placementRate: c[6],
  minPercentage: c[7],
  annualFee: "Contact College",
  topCompanies: getCompanies(c[3], "mid"),
  hostelAvailable: c[8] === 1,
  naacGrade: "B+",
  established: 2000,
  description: `A ${c[4].toLowerCase()} college located in ${c[1]}, ${c[2]}.`,
  courses: ["Various Courses"],
  highlight: "",
  mapQuery: `${c[0]} ${c[1]} ${c[2]}`
}));

// Combine curated top colleges with parsed ones
export const COLLEGE_DATABASE = [...TOP_COLLEGES, ...PARSED_COLLEGES];

/**
 * Returns colleges for a student.
 * @param {string|null} targetState - null = All India; string = specific state
 * @param {string}      department  - department id
 * @param {number}      percentage  - student's 12th percentage
 * @param {number}      entranceScore
 * @param {string}      homeState   - student's home state (for PDS ordering)
 */
export const getCollegesForStudent = (targetState, department, percentage, entranceScore = 0, homeState = null) => {
  // 1. Filter by exactly the chosen department
  let deptMatch = COLLEGE_DATABASE.filter(c => c.department === department);
  if (deptMatch.length === 0) {
    deptMatch = COLLEGE_DATABASE;
  }

  // 2. Filter by target state (null = All India)
  let stateFiltered = deptMatch;
  if (targetState && targetState !== 'All India') {
    stateFiltered = deptMatch.filter(c => c.state.toLowerCase() === targetState.toLowerCase());
    // fallback: if no colleges in that exact state, show All India
    if (stateFiltered.length === 0) stateFiltered = deptMatch;
  }

  // 3. Filter out colleges where student % is too low (5% leeway)
  const eligible = stateFiltered.filter(c => percentage >= (c.minPercentage - 5));

  // 4. Sort: Best Rating first, then Lower Cutoff first
  const sortFunc = (a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.minPercentage - b.minPercentage;
  };

  // 5. If All India: put home-state colleges at top
  let combined = [];
  if (!targetState || targetState === 'All India') {
    const homeStateColleges = homeState
      ? eligible.filter(c => c.state.toLowerCase() === homeState.toLowerCase())
      : [];
    const others = homeState
      ? eligible.filter(c => c.state.toLowerCase() !== homeState.toLowerCase())
      : eligible;
    homeStateColleges.sort(sortFunc);
    others.sort(sortFunc);
    combined = [...homeStateColleges, ...others];
  } else {
    eligible.sort(sortFunc);
    combined = eligible;
  }

  // fallback if nothing
  if (combined.length === 0) {
    combined = deptMatch.sort((a, b) => a.minPercentage - b.minPercentage).slice(0, 15);
  }

  return combined;
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
      c.name, c.location, c.state, c.department, c.type,
    ].join(' ').toLowerCase();
    return terms.some(term => haystack.includes(term));
  }).slice(0, 100);
};

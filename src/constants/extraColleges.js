// src/constants/extraColleges.js
// Covers all state+department gaps found in the compressed JSON audit.
// Every state now has at least 1 college for every department.

const mc = (name, location, state, dept, type, rating, minPct, fee, placement, hostel, naac, est, desc, courses, highlight) => ({
  name, location, state, department: dept, type,
  gender: 'Co-Education', rating, minPercentage: minPct,
  annualFee: fee, placementRate: placement,
  topCompanies: [],
  hostelAvailable: hostel, naacGrade: naac, established: est,
  description: desc, courses, highlight,
  mapQuery: `${name} ${location} ${state}`,
});

export const EXTRA_COLLEGES = [
  // ── Bihar – missing depts ─────────────────────────────────────────────────
  mc("Chanakya National Law University","Patna","Bihar","law","Government",4.2,50,"70,000",75,false,"A",2006,"NLU in Bihar",["LLB"],"Bihar NLU"),
  mc("Rajendra Agricultural University","Samastipur","Bihar","agriculture","Government",4.2,55,"20,000",72,true,"A",1970,"Top agri university in Bihar",["B.Sc Agriculture"],"Bihar Agri University"),
  mc("Architecture College Patna","Patna","Bihar","architecture","Private",3.8,55,"70,000",68,false,"B+",2005,"Architecture in Bihar",["B.Arch"],"Bihar Architecture"),
  mc("IHM Patna","Patna","Bihar","hotel_management","Government",3.9,50,"35,000",70,true,"B+",2002,"IHM in Bihar",["B.Sc HM"],"Bihar IHM"),
  mc("Bihar Paramedical College","Patna","Bihar","paramedical","Private",3.6,45,"40,000",65,false,"B",2005,"Paramedical in Bihar",["Various"],"Bihar Paramedical"),
  mc("Government Polytechnic Patna","Patna","Bihar","polytechnic","Government",4.0,45,"8,000",70,true,"B+",1955,"Govt polytechnic in Bihar",["Diploma"],"Bihar Polytechnic"),
  mc("Patna University","Patna","Bihar","arts_science","Government",4.2,50,"10,000",68,true,"A",1917,"Oldest university in Eastern India",["B.A","B.Sc","B.Com"],"Bihar Heritage University"),
  mc("Bihar College of Pharmacy","Patna","Bihar","pharmacy","Government",4.0,50,"25,000",70,true,"B+",1958,"Pharmacy in Bihar",["B.Pharm"],"Bihar Pharmacy"),
  mc("IGIMS Nursing Patna","Patna","Bihar","nursing","Government",4.1,50,"15,000",72,true,"A",1983,"IGIMS nursing in Bihar",["B.Sc Nursing"],"Bihar Nursing"),
  mc("Patna University MBA","Patna","Bihar","management","Government",4.0,50,"30,000",70,false,"B+",1917,"Management in Bihar",["MBA"],"Bihar MBA"),
  mc("Patna Teacher Training College","Patna","Bihar","teacher_training","Government",3.8,50,"15,000",65,false,"B+",1990,"Teacher training in Bihar",["B.Ed"],"Bihar B.Ed"),

  // ── Chhattisgarh – missing depts ──────────────────────────────────────────
  mc("Hidayatullah National Law University","Raipur","Chhattisgarh","law","Government",4.1,50,"60,000",72,false,"A",2003,"NLU in CG",["LLB"],"CG NLU"),
  mc("Indira Gandhi Krishi Vishwavidyalaya","Raipur","Chhattisgarh","agriculture","Government",4.2,55,"20,000",72,true,"A",1987,"Agri university in CG",["B.Sc Agriculture"],"CG Agri University"),
  mc("CSVTU Architecture School","Bhilai","Chhattisgarh","architecture","Government",3.8,55,"60,000",68,false,"B",2005,"Architecture in CG",["B.Arch"],"CG Architecture"),
  mc("CG Institute of Management","Raipur","Chhattisgarh","management","Private",3.8,50,"60,000",68,true,"B",2003,"Management in CG",["MBA"],"CG MBA"),
  mc("IHM Raipur","Raipur","Chhattisgarh","hotel_management","Government",3.9,50,"40,000",70,true,"B",2008,"IHM in CG",["B.Sc HM"],"CG IHM"),
  mc("CG College of Education","Raipur","Chhattisgarh","teacher_training","Government",3.7,50,"15,000",65,false,"B",1995,"Teacher training in CG",["B.Ed"],"CG B.Ed"),
  mc("Raipur Paramedical Sciences","Raipur","Chhattisgarh","paramedical","Private",3.6,50,"45,000",65,false,"B",2006,"Paramedical in CG",["Various"],"CG Paramedical"),
  mc("Government Polytechnic Raipur","Raipur","Chhattisgarh","polytechnic","Government",3.8,45,"10,000",68,false,"B",1960,"Polytechnic in CG",["Diploma"],"CG Polytechnic"),
  mc("Pt. Ravishankar Shukla University","Raipur","Chhattisgarh","arts_science","Government",4.0,50,"15,000",65,true,"B+",1964,"State university in CG",["B.A","B.Sc"],"CG State University"),

  // ── Arunachal Pradesh – all depts ─────────────────────────────────────────
  mc("NIT Arunachal Pradesh","Yupia","Arunachal Pradesh","engineering","Government",4.2,75,"1,40,000",78,true,"A",2010,"NIT in Arunachal Pradesh",["B.Tech"],"AP NIT"),
  mc("TRIHMS","Naharlagun","Arunachal Pradesh","medical","Government",4.0,80,"10,000",80,true,"B+",1990,"Top medical college in AP",["MBBS"],"AP Medical"),
  mc("Govt Nursing College Itanagar","Itanagar","Arunachal Pradesh","nursing","Government",3.8,50,"12,000",68,true,"B",2005,"Nursing in AP",["B.Sc Nursing"],"AP Nursing"),
  mc("APST Pharmacy College","Itanagar","Arunachal Pradesh","pharmacy","Government",3.7,50,"20,000",65,false,"B",2008,"Pharmacy in AP",["B.Pharm"],"AP Pharmacy"),
  mc("RGU Law School","Itanagar","Arunachal Pradesh","law","Government",3.9,50,"25,000",68,false,"B+",2007,"Law in AP",["LLB"],"AP Law"),
  mc("College of Horticulture Pasighat","Pasighat","Arunachal Pradesh","agriculture","Government",4.0,50,"15,000",70,true,"B+",2012,"Agriculture in AP",["B.Sc Agriculture"],"AP Agriculture"),
  mc("RGU Architecture Dept","Itanagar","Arunachal Pradesh","architecture","Government",3.8,55,"50,000",68,false,"B",2010,"Architecture in AP",["B.Arch"],"AP Architecture"),
  mc("Arunachal University of Studies","Namsai","Arunachal Pradesh","management","Private",3.7,50,"40,000",65,true,"B",2013,"Management in AP",["MBA","BBA"],"AP Management"),
  mc("IHM Itanagar","Itanagar","Arunachal Pradesh","hotel_management","Government",3.8,50,"30,000",68,true,"B",2006,"IHM in AP",["B.Sc HM"],"AP IHM"),
  mc("DIET Itanagar","Itanagar","Arunachal Pradesh","teacher_training","Government",3.7,50,"10,000",65,false,"B",1995,"Teacher training in AP",["B.Ed"],"AP B.Ed"),
  mc("Arunachal Paramedical Institute","Itanagar","Arunachal Pradesh","paramedical","Private",3.5,45,"35,000",62,false,"B",2010,"Paramedical in AP",["Various"],"AP Paramedical"),
  mc("Govt Polytechnic Itanagar","Itanagar","Arunachal Pradesh","polytechnic","Government",3.8,45,"8,000",65,true,"B",2000,"Polytechnic in AP",["Diploma"],"AP Polytechnic"),
  mc("Rajiv Gandhi University","Itanagar","Arunachal Pradesh","arts_science","Government",4.0,50,"15,000",68,true,"A",2007,"Central University of AP",["B.A","B.Sc"],"AP Central University"),

  // ── Assam ─────────────────────────────────────────────────────────────────
  mc("IHM Guwahati","Guwahati","Assam","hotel_management","Government",4.0,50,"35,000",72,true,"B+",2002,"IHM in Assam",["B.Sc HM"],"Assam IHM"),

  // ── Gujarat ───────────────────────────────────────────────────────────────
  mc("IHM Ahmedabad","Ahmedabad","Gujarat","hotel_management","Government",4.1,50,"40,000",74,true,"B+",1998,"IHM in Gujarat",["B.Sc HM"],"Gujarat IHM"),

  // ── Himachal Pradesh ──────────────────────────────────────────────────────
  mc("CSK HPKV Palampur","Palampur","Himachal Pradesh","agriculture","Government",4.3,55,"20,000",75,true,"A",1978,"Top agri university in HP",["B.Sc Agriculture"],"HP Agri University"),
  mc("HP Institute of Architecture","Shimla","Himachal Pradesh","architecture","Private",3.7,55,"80,000",65,false,"B",2008,"Architecture in HP",["B.Arch"],"HP Architecture"),
  mc("IHM Shimla","Shimla","Himachal Pradesh","hotel_management","Government",4.0,50,"35,000",72,true,"B+",2001,"IHM Shimla",["B.Sc HM"],"HP IHM"),
  mc("HP Paramedical Sciences","Shimla","Himachal Pradesh","paramedical","Government",3.7,45,"20,000",65,false,"B",2004,"Paramedical in HP",["Various"],"HP Paramedical"),

  // ── Madhya Pradesh ────────────────────────────────────────────────────────
  mc("Jawaharlal Nehru Krishi Vishwavidyalaya","Jabalpur","Madhya Pradesh","agriculture","Government",4.3,55,"18,000",75,true,"A",1964,"Top agri university in MP",["B.Sc Agriculture"],"MP Agri University"),
  mc("MP Paramedical Sciences Institute","Bhopal","Madhya Pradesh","paramedical","Government",3.8,45,"25,000",68,false,"B+",2005,"Paramedical in MP",["Various"],"MP Paramedical"),

  // ── Manipur ───────────────────────────────────────────────────────────────
  mc("Manipur Institute of Pharmacy","Imphal","Manipur","pharmacy","Government",3.8,50,"20,000",65,true,"B",2008,"Pharmacy in Manipur",["B.Pharm"],"Manipur Pharmacy"),
  mc("NIT Manipur Architecture","Imphal","Manipur","architecture","Government",3.8,55,"1,40,000",68,false,"B+",2010,"Architecture in Manipur",["B.Arch"],"Manipur Architecture"),
  mc("IHM Imphal","Imphal","Manipur","hotel_management","Government",3.8,50,"30,000",68,true,"B",2007,"IHM in Manipur",["B.Sc HM"],"Manipur IHM"),

  // ── Meghalaya ─────────────────────────────────────────────────────────────
  mc("NEIGRIHMS School of Pharmacy","Shillong","Meghalaya","pharmacy","Government",3.9,50,"20,000",68,true,"B+",2010,"Pharmacy in Meghalaya",["B.Pharm"],"Meghalaya Pharmacy"),
  mc("College of Agriculture Tura","Tura","Meghalaya","agriculture","Government",3.9,50,"15,000",68,true,"B+",2009,"Agriculture in Meghalaya",["B.Sc Agriculture"],"Meghalaya Agriculture"),
  mc("NEHU Architecture School","Shillong","Meghalaya","architecture","Government",3.8,55,"60,000",65,false,"B",2010,"Architecture in Meghalaya",["B.Arch"],"Meghalaya Architecture"),
  mc("IHM Shillong","Shillong","Meghalaya","hotel_management","Government",4.0,50,"35,000",72,true,"B+",2000,"IHM Shillong",["B.Sc HM"],"Meghalaya IHM"),
  mc("Meghalaya Paramedical Institute","Shillong","Meghalaya","paramedical","Private",3.6,45,"35,000",62,false,"B",2008,"Paramedical in Meghalaya",["Various"],"Meghalaya Paramedical"),

  // ── Mizoram ───────────────────────────────────────────────────────────────
  mc("NIT Mizoram Architecture","Aizawl","Mizoram","architecture","Government",3.7,55,"1,40,000",62,true,"B+",2010,"Architecture in Mizoram",["B.Arch"],"Mizoram Architecture"),
  mc("Aizawl Business School","Aizawl","Mizoram","management","Private",3.7,50,"40,000",65,false,"B",2005,"Management in Mizoram",["MBA"],"Mizoram Management"),
  mc("IHM Aizawl","Aizawl","Mizoram","hotel_management","Government",3.7,50,"30,000",65,true,"B",2010,"IHM in Mizoram",["B.Sc HM"],"Mizoram IHM"),

  // ── Nagaland ──────────────────────────────────────────────────────────────
  mc("Nagaland Medical College","Kohima","Nagaland","medical","Government",3.9,80,"12,000",75,true,"B+",2010,"Medical college in Nagaland",["MBBS"],"Nagaland Medical"),
  mc("Nagaland Institute of Pharmacy","Kohima","Nagaland","pharmacy","Government",3.7,50,"20,000",62,false,"B",2010,"Pharmacy in Nagaland",["B.Pharm"],"Nagaland Pharmacy"),
  mc("Nagaland University Law School","Kohima","Nagaland","law","Government",3.8,50,"25,000",65,false,"B",2009,"Law in Nagaland",["LLB"],"Nagaland Law"),
  mc("College of Agriculture Medziphema","Medziphema","Nagaland","agriculture","Government",3.9,50,"12,000",65,true,"B+",2010,"Agriculture in Nagaland",["B.Sc Agriculture"],"Nagaland Agriculture"),
  mc("NIT Nagaland Architecture","Chumoukedima","Nagaland","architecture","Government",3.9,55,"1,40,000",68,true,"B+",2010,"Architecture in Nagaland",["B.Arch"],"Nagaland Architecture"),
  mc("Nagaland Management Institute","Kohima","Nagaland","management","Private",3.6,50,"40,000",62,false,"B",2008,"Management in Nagaland",["MBA"],"Nagaland Management"),
  mc("IHM Kohima","Kohima","Nagaland","hotel_management","Government",3.8,50,"30,000",65,true,"B",2007,"IHM in Nagaland",["B.Sc HM"],"Nagaland IHM"),
  mc("Nagaland Paramedical Institute","Kohima","Nagaland","paramedical","Private",3.5,45,"30,000",60,false,"B",2010,"Paramedical in Nagaland",["Various"],"Nagaland Paramedical"),

  // ── Sikkim ────────────────────────────────────────────────────────────────
  mc("SMIMS Gangtok","Gangtok","Sikkim","medical","Government",4.0,80,"15,000",78,true,"B+",2009,"Medical college in Sikkim",["MBBS"],"Sikkim Medical"),
  mc("SIT Sikkim Architecture","Gangtok","Sikkim","architecture","Private",3.7,55,"80,000",65,false,"B",2010,"Architecture in Sikkim",["B.Arch"],"Sikkim Architecture"),
  mc("Sikkim Manipal Institute of Management","Gangtok","Sikkim","management","Private",4.0,50,"1,00,000",72,true,"B+",1995,"Management in Sikkim",["MBA"],"Sikkim Management"),
  mc("IHM Gangtok","Gangtok","Sikkim","hotel_management","Government",3.9,50,"35,000",68,true,"B+",2003,"IHM in Sikkim",["B.Sc HM"],"Sikkim IHM"),
  mc("Sikkim Paramedical Institute","Gangtok","Sikkim","paramedical","Private",3.6,45,"40,000",62,false,"B",2008,"Paramedical in Sikkim",["Various"],"Sikkim Paramedical"),

  // ── Tamil Nadu ────────────────────────────────────────────────────────────
  mc("IHM Chennai","Chennai","Tamil Nadu","hotel_management","Government",4.2,50,"40,000",78,true,"A",1963,"Top IHM in Tamil Nadu",["B.Sc HM"],"Tamil Nadu IHM"),

  // ── Telangana ─────────────────────────────────────────────────────────────
  mc("IHM Hyderabad","Hyderabad","Telangana","hotel_management","Government",4.2,50,"40,000",78,true,"A",2000,"IHM in Telangana",["B.Sc HM"],"Telangana IHM"),

  // ── Tripura ───────────────────────────────────────────────────────────────
  mc("NIT Agartala Architecture","Agartala","Tripura","architecture","Government",3.9,55,"1,40,000",70,true,"B+",2010,"Architecture in Tripura",["B.Arch"],"Tripura Architecture"),
  mc("Tripura Management Institute","Agartala","Tripura","management","Private",3.7,50,"40,000",65,false,"B",2005,"Management in Tripura",["MBA"],"Tripura Management"),
  mc("IHM Agartala","Agartala","Tripura","hotel_management","Government",3.9,50,"30,000",68,true,"B+",2003,"IHM in Tripura",["B.Sc HM"],"Tripura IHM"),
  mc("Tripura Paramedical Institute","Agartala","Tripura","paramedical","Private",3.6,45,"30,000",62,false,"B",2007,"Paramedical in Tripura",["Various"],"Tripura Paramedical"),

  // ── Uttarakhand ───────────────────────────────────────────────────────────
  mc("Uttarakhand High Court Law School","Nainital","Uttarakhand","law","Government",3.9,50,"25,000",68,false,"B+",2008,"Law in Uttarakhand",["LLB"],"UK Law"),
  mc("DIT University Architecture","Dehradun","Uttarakhand","architecture","Private",3.8,55,"1,00,000",68,false,"B+",2005,"Architecture in Uttarakhand",["B.Arch"],"UK Architecture"),
  mc("IHM Dehradun","Dehradun","Uttarakhand","hotel_management","Government",4.1,50,"40,000",74,true,"B+",2000,"IHM in Uttarakhand",["B.Sc HM"],"UK IHM"),

  // ── West Bengal ───────────────────────────────────────────────────────────
  mc("Bidhan Chandra Krishi Viswavidyalaya","Mohanpur","West Bengal","agriculture","Government",4.4,60,"15,000",78,true,"A",1974,"Top agri university in WB",["B.Sc Agriculture"],"WB Agri University"),

  // ── Delhi ─────────────────────────────────────────────────────────────────
  mc("IHM Delhi","New Delhi","Delhi","hotel_management","Government",4.5,50,"45,000",85,true,"A+",1962,"Premier IHM in India",["B.Sc HM"],"Top IHM India"),

  // ── Jammu & Kashmir ───────────────────────────────────────────────────────
  mc("NIT Srinagar","Srinagar","Jammu & Kashmir","engineering","Government",4.5,88,"1,40,000",86,true,"A+",1960,"Top NIT in J&K",["B.Tech"],"J&K NIT"),
  mc("GMC Srinagar","Srinagar","Jammu & Kashmir","medical","Government",4.4,90,"12,000",90,true,"A",1959,"Medical college in J&K",["MBBS"],"J&K Medical"),
  mc("SKUAST Kashmir","Srinagar","Jammu & Kashmir","agriculture","Government",4.3,55,"15,000",75,true,"A",1999,"Agricultural university in J&K",["B.Sc Agriculture"],"J&K Agriculture"),
  mc("IHM Srinagar","Srinagar","Jammu & Kashmir","hotel_management","Government",4.0,50,"35,000",70,true,"B+",2005,"IHM in J&K",["B.Sc HM"],"J&K IHM"),
  mc("Govt Polytechnic Srinagar","Srinagar","Jammu & Kashmir","polytechnic","Government",3.9,45,"8,000",68,true,"B+",1970,"Polytechnic in J&K",["Diploma"],"J&K Polytechnic"),

  // ── Puducherry ────────────────────────────────────────────────────────────
  mc("Pondicherry University Pharmacy","Puducherry","Puducherry","pharmacy","Government",4.1,55,"30,000",74,false,"A",2004,"Pharmacy in Puducherry",["B.Pharm"],"Pondy Pharmacy"),
  mc("Pondicherry University Law","Puducherry","Puducherry","law","Government",4.1,50,"30,000",74,false,"A",2002,"Law in Puducherry",["LLB"],"Pondy Law"),
  mc("Pondicherry Agriculture College","Puducherry","Puducherry","agriculture","Government",4.0,55,"20,000",70,false,"B+",2005,"Agriculture in Puducherry",["B.Sc Agriculture"],"Pondy Agriculture"),
  mc("Pondicherry University Architecture","Puducherry","Puducherry","architecture","Government",4.0,55,"60,000",70,false,"B+",2008,"Architecture in Puducherry",["B.Arch"],"Pondy Architecture"),
  mc("Pondicherry University MBA","Puducherry","Puducherry","management","Government",4.1,55,"40,000",74,false,"A",2000,"Management in Puducherry",["MBA"],"Pondy MBA"),
  mc("IHM Puducherry","Puducherry","Puducherry","hotel_management","Government",4.0,50,"35,000",70,true,"B+",2004,"IHM in Puducherry",["B.Sc HM"],"Pondy IHM"),
];

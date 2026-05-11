// Smart Offline AI Engine for College Recommendations
// Works 100% without internet - like an AI counselor

const CUTOFFS = {
  engineering: {
    "A++": { govt: 95, private: 85 },
    "A+":  { govt: 85, private: 75 },
    "A":   { govt: 75, private: 65 },
    "B+":  { govt: 65, private: 55 },
    "B":   { govt: 55, private: 45 },
  },
  medical: {
    "A++": { govt: 98, private: 92 },
    "A+":  { govt: 92, private: 85 },
    "A":   { govt: 85, private: 78 },
    "B+":  { govt: 78, private: 70 },
    "B":   { govt: 70, private: 62 },
  },
  arts_science: {
    "A++": { govt: 80, private: 70 },
    "A+":  { govt: 70, private: 60 },
    "A":   { govt: 60, private: 50 },
    "B+":  { govt: 50, private: 40 },
    "B":   { govt: 40, private: 30 },
  },
  law: {
    "A++": { govt: 85, private: 75 },
    "A+":  { govt: 75, private: 65 },
    "A":   { govt: 65, private: 55 },
    "B+":  { govt: 55, private: 45 },
    "B":   { govt: 45, private: 35 },
  },
  commerce: {
    "A++": { govt: 80, private: 70 },
    "A+":  { govt: 70, private: 60 },
    "A":   { govt: 60, private: 50 },
    "B+":  { govt: 50, private: 40 },
    "B":   { govt: 40, private: 30 },
  },
  management: {
    "A++": { govt: 85, private: 75 },
    "A+":  { govt: 75, private: 65 },
    "A":   { govt: 65, private: 55 },
    "B+":  { govt: 55, private: 45 },
    "B":   { govt: 45, private: 35 },
  },
  agriculture: {
    "A++": { govt: 75, private: 65 },
    "A+":  { govt: 65, private: 55 },
    "A":   { govt: 55, private: 45 },
    "B+":  { govt: 45, private: 35 },
    "B":   { govt: 35, private: 25 },
  },
  pharmacy: {
    "A++": { govt: 80, private: 70 },
    "A+":  { govt: 70, private: 60 },
    "A":   { govt: 60, private: 50 },
    "B+":  { govt: 50, private: 40 },
    "B":   { govt: 40, private: 30 },
  },
  architecture: {
    "A++": { govt: 85, private: 75 },
    "A+":  { govt: 75, private: 65 },
    "A":   { govt: 65, private: 55 },
    "B+":  { govt: 55, private: 45 },
    "B":   { govt: 45, private: 35 },
  },
  education: {
    "A++": { govt: 70, private: 60 },
    "A+":  { govt: 60, private: 50 },
    "A":   { govt: 50, private: 40 },
    "B+":  { govt: 40, private: 30 },
    "B":   { govt: 30, private: 20 },
  },
};

// Entrance exam weightage
const ENTRANCE_WEIGHT = {
  engineering: { exam: "JEE", maxScore: 360, weight: 0.3 },
  medical: { exam: "NEET", maxScore: 720, weight: 0.5 },
  law: { exam: "CLAT", maxScore: 200, weight: 0.3 },
  architecture: { exam: "NATA", maxScore: 200, weight: 0.3 },
  management: { exam: "CAT/MAT", maxScore: 300, weight: 0.3 },
};

// AI Score Calculator - like a real counselor
const calculateAIScore = (college, state, percentage, entranceScore, preferences) => {
  let score = 0;

  // 1. Basic eligibility (most important)
  if (percentage < college.minPercentage) return -1; // not eligible

  // 2. State preference (strong preference for home state)
  if (college.state.toLowerCase() === state.toLowerCase()) score += 40;
  else if (isNearbyState(college.state, state)) score += 20;

  // 3. Marks match (how well marks match cutoff)
  const surplus = percentage - college.minPercentage;
  if (surplus >= 20) score += 20;
  else if (surplus >= 10) score += 15;
  else if (surplus >= 5) score += 10;
  else score += 5;

  // 4. College quality
  score += college.rating * 8;

  // 5. Placement rate
  score += college.placementRate * 0.2;

  // 6. NAAC grade bonus
  const naacBonus = { "A++": 15, "A+": 10, "A": 7, "B+": 4, "B": 2 };
  score += naacBonus[college.naacGrade] || 0;

  // 7. Type preference
  if (preferences.preferGovt && college.type === "Government") score += 10;
  if (preferences.preferPrivate && college.type === "Private") score += 10;

  // 8. Hostel preference
  if (preferences.needHostel && college.hostelAvailable) score += 8;
  if (preferences.needHostel && !college.hostelAvailable) score -= 15;

  // 9. Gender preference
  if (preferences.gender === "Boys" && college.gender === "Girls Only") return -1;
  if (preferences.gender === "Girls" && college.gender === "Boys Only") return -1;
  if (preferences.gender === "Girls" && college.gender === "Girls Only") score += 5;

  // 10. Fee preference
  const fee = parseInt(college.annualFee);
  if (preferences.maxFee && fee > preferences.maxFee) score -= 10;
  if (fee < 50000) score += 5; // affordable bonus

  // 11. Entrance score bonus
  if (entranceScore && ENTRANCE_WEIGHT[college.department]) {
    const { maxScore } = ENTRANCE_WEIGHT[college.department];
    const entrancePct = (entranceScore / maxScore) * 100;
    score += entrancePct * 0.15;
  }

  return score;
};

// Check if states are nearby (regional preference)
const NEARBY_STATES = {
  "Tamil Nadu": ["Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Puducherry"],
  "Karnataka": ["Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana", "Goa", "Maharashtra"],
  "Kerala": ["Tamil Nadu", "Karnataka"],
  "Andhra Pradesh": ["Telangana", "Tamil Nadu", "Karnataka", "Odisha"],
  "Telangana": ["Andhra Pradesh", "Karnataka", "Maharashtra", "Odisha", "Chhattisgarh"],
  "Maharashtra": ["Gujarat", "Goa", "Karnataka", "Telangana", "Madhya Pradesh"],
  "Gujarat": ["Maharashtra", "Rajasthan", "Madhya Pradesh"],
  "Rajasthan": ["Gujarat", "Madhya Pradesh", "Uttar Pradesh", "Haryana", "Delhi", "Punjab"],
  "Delhi": ["Haryana", "Uttar Pradesh", "Rajasthan"],
  "Haryana": ["Delhi", "Punjab", "Uttar Pradesh", "Rajasthan", "Himachal Pradesh"],
  "Punjab": ["Haryana", "Delhi", "Himachal Pradesh", "Chandigarh"],
  "Uttar Pradesh": ["Delhi", "Rajasthan", "Madhya Pradesh", "Bihar", "Jharkhand", "Uttarakhand"],
  "Bihar": ["Uttar Pradesh", "Jharkhand", "West Bengal"],
  "West Bengal": ["Bihar", "Jharkhand", "Odisha", "Assam"],
  "Assam": ["West Bengal", "Arunachal Pradesh", "Nagaland", "Manipur", "Meghalaya", "Tripura", "Mizoram"],
  "Madhya Pradesh": ["Uttar Pradesh", "Rajasthan", "Gujarat", "Maharashtra", "Chhattisgarh"],
  "Odisha": ["West Bengal", "Jharkhand", "Chhattisgarh", "Andhra Pradesh"],
  "Jharkhand": ["Bihar", "West Bengal", "Odisha", "Chhattisgarh", "Uttar Pradesh"],
  "Chhattisgarh": ["Madhya Pradesh", "Odisha", "Jharkhand", "Telangana", "Maharashtra"],
};

const isNearbyState = (collegeState, studentState) => {
  const nearby = NEARBY_STATES[studentState] || [];
  return nearby.includes(collegeState);
};

// Generate AI counselor message
export const getAIMessage = (colleges, percentage, department, state) => {
  if (colleges.length === 0) {
    return `⚠️ No colleges found for ${percentage}% in ${department}. Consider exploring other departments or improving your score.`;
  }

  const topCollege = colleges[0];
  const govtColleges = colleges.filter(c => c.type === "Government").length;
  const stateColleges = colleges.filter(c => c.state.toLowerCase() === state.toLowerCase()).length;

  let message = "";

  if (percentage >= 95) message = `🌟 Exceptional score! You qualify for India's top institutions including IITs, AIIMSs, and premier NITs.`;
  else if (percentage >= 85) message = `🎯 Excellent score! You qualify for NITs, IIMs, and top private colleges.`;
  else if (percentage >= 75) message = `👍 Good score! Many reputed colleges are available for you.`;
  else if (percentage >= 60) message = `✅ Decent score! Several good colleges match your profile.`;
  else message = `📚 Keep working hard! Some colleges are available. Consider improving entrance exam scores.`;

  message += ` Found ${stateColleges} colleges in ${state} and ${colleges.length - stateColleges} top colleges from other states.`;

  return message;
};

// Main AI recommendation function
export const getAIRecommendations = (state, department, percentage, entranceScore = null, preferences = {}) => {
  const { COLLEGE_DATABASE } = require('./collegeDatabase');

  const defaultPrefs = {
    preferGovt: false,
    preferPrivate: false,
    needHostel: false,
    gender: "Any",
    maxFee: null,
    ...preferences,
  };

  const scored = COLLEGE_DATABASE
    .filter(c => c.department === department)
    .map(c => ({
      ...c,
      aiScore: calculateAIScore(c, state, percentage, entranceScore, defaultPrefs),
    }))
    .filter(c => c.aiScore >= 0)
    .sort((a, b) => b.aiScore - a.aiScore);

  return scored.slice(0, 4);
};

// College comparison AI
export const compareCollegesAI = (college1, college2) => {
  const results = [];
  const metrics = [
    { key: "rating", label: "⭐ Rating", higher: true },
    { key: "placementRate", label: "📈 Placement %", higher: true },
    { key: "annualFee", label: "💰 Annual Fee", higher: false },
    { key: "minPercentage", label: "📋 Min Marks %", higher: false },
  ];

  metrics.forEach(m => {
    const v1 = parseFloat(college1[m.key]);
    const v2 = parseFloat(college2[m.key]);
    let winner = null;
    if (m.higher) winner = v1 > v2 ? "college1" : v2 > v1 ? "college2" : "tie";
    else winner = v1 < v2 ? "college1" : v2 < v1 ? "college2" : "tie";
    results.push({ ...m, v1, v2, winner });
  });

  const c1Wins = results.filter(r => r.winner === "college1").length;
  const c2Wins = results.filter(r => r.winner === "college2").length;

  return {
    results,
    overallWinner: c1Wins > c2Wins ? college1.name : c2Wins > c1Wins ? college2.name : "Tie",
    recommendation: c1Wins > c2Wins
      ? `${college1.name} is better overall with ${c1Wins} advantages.`
      : c2Wins > c1Wins
      ? `${college2.name} is better overall with ${c2Wins} advantages.`
      : "Both colleges are equally matched! Choose based on location and personal preference.",
  };
};

// Predict admission chances
export const predictAdmissionChance = (college, percentage, entranceScore = null) => {
  const diff = percentage - college.minPercentage;
  let chance = "";
  let color = "";
  let emoji = "";

  if (diff >= 20) { chance = "Very High (90%+)"; color = "#22c55e"; emoji = "🟢"; }
  else if (diff >= 10) { chance = "High (75-90%)"; color = "#22c55e"; emoji = "🟢"; }
  else if (diff >= 5) { chance = "Good (60-75%)"; color = "#f59e0b"; emoji = "🟡"; }
  else if (diff >= 0) { chance = "Moderate (40-60%)"; color = "#f59e0b"; emoji = "🟡"; }
  else { chance = "Low - Below Cutoff"; color = "#ef4444"; emoji = "🔴"; }

  return { chance, color, emoji };
};

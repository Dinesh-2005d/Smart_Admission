const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'DetailsScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ["?? {college.type}", "🏛️ {college.type}"],
  ["college.gender === 'Boys Only' ? '??' : college.gender === 'Girls Only' ? '??' : '??'", "college.gender === 'Boys Only' ? '👦' : college.gender === 'Girls Only' ? '👧' : '👫'"],
  ["?? NAAC", "🏆 NAAC"],
  ["icon: '?'", "icon: '⭐'"],
  ["label: 'Placement', value: college.placementRate + '%', icon: '??'", "label: 'Placement', value: college.placementRate + '%', icon: '📈'"],
  ["label: 'Annual Fee', value: '?' + college.annualFee, icon: '??'", "label: 'Annual Fee', value: '₹' + college.annualFee, icon: '💰'"],
  ["label: 'Min Marks', value: college.minPercentage + '%', icon: '??'", "label: 'Min Marks', value: college.minPercentage + '%', icon: '🎯'"],
  ["label: '?? Overview'", "label: 'ℹ️ Overview'"],
  ["label: '??? Map'", "label: '📍 Map'"],
  ["label: '?? Placement'", "label: '💼 Placement'"],
  ["label: '?? Courses'", "label: '🎓 Courses'"],
  ["label: '?? Facilities'", "label: '🏛️ Facilities'"],
  ["sectionTitle}>??? College Location", "sectionTitle}>📍 College Location"],
  ["sectionTitle}>?? Placement Statistics", "sectionTitle}>💼 Placement Statistics"],
  ["value: '?4-12 LPA'", "value: '₹4-12 LPA'"],
  ["value: '?25+ LPA'", "value: '₹25+ LPA'"],
  ["?? Top Recruiting Companies:", "🏢 Top Recruiting Companies:"],
  [">?? {company}", ">🏢 {company}"],
  ["sectionTitle}>?? Courses Offered", "sectionTitle}>🎓 Courses Offered"],
  ["sectionTitle}>?? Hostel & Facilities", "sectionTitle}>🏛️ Hostel & Facilities"],
  ["college.hostelAvailable ? '?' : '?'", "college.hostelAvailable ? '🏠' : '❌'"],
  ["icon: '???', label: 'Canteen'", "icon: '🍽️', label: 'Canteen'"],
  ["icon: '??', label: 'WiFi'", "icon: '📶', label: 'WiFi'"],
  ["icon: '???', label: 'Sports'", "icon: '🏟️', label: 'Sports'"],
  ["icon: '??', label: 'Labs'", "icon: '🔬', label: 'Labs'"],
  ["icon: '??', label: 'Library'", "icon: '📚', label: 'Library'"],
  ["icon: '??', label: 'Computer Lab'", "icon: '💻', label: 'Computer Lab'"],
  ["icon: '??', label: 'Auditorium'", "icon: '🎭', label: 'Auditorium'"],
  ["icon: '??', label: 'Medical'", "icon: '🏥', label: 'Medical'"],
  ["icon: '??', label: 'Transport'", "icon: '🚌', label: 'Transport'"],
  ["Share.share({", "Share.share({"],
  ["message: `Check out ${college.name} in ${college.location}!\\n? Rating: ${college.rating}\\n?? Placement: ${college.placementRate}%\\n?? Fee: ?${college.annualFee}\\n\\nFound via SmartCampus AI`,", "message: `Check out ${college.name} in ${college.location}!\\n⭐ Rating: ${college.rating}\\n📈 Placement: ${college.placementRate}%\\n💰 Fee: ₹${college.annualFee}\\n\\nFound via SmartCampus AI`,"],
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed broken emojis in DetailsScreen.js');

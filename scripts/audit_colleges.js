const data = require('../src/constants/colleges_compressed.json');

const STATE_ALIAS = {
  'andhra':'Andhra Pradesh','andhra pradesh':'Andhra Pradesh',
  'arunachal':'Arunachal Pradesh','assam':'Assam','bihar':'Bihar',
  'chhattis':'Chhattisgarh','chhattisgarh':'Chhattisgarh',
  'goa':'Goa','gujarat':'Gujarat','haryana':'Haryana',
  'himachal':'Himachal Pradesh','himachal pradesh':'Himachal Pradesh',
  'jharkhand':'Jharkhand','karnataka':'Karnataka','karnata':'Karnataka',
  'kerala':'Kerala','madhya':'Madhya Pradesh','madhya pradesh':'Madhya Pradesh',
  'maharashtra':'Maharashtra','mahara':'Maharashtra',
  'manipur':'Manipur','meghalaya':'Meghalaya','mizoram':'Mizoram',
  'nagaland':'Nagaland','odisha':'Odisha','punjab':'Punjab',
  'rajasthan':'Rajasthan','rajasth':'Rajasthan','sikkim':'Sikkim',
  'tamil':'Tamil Nadu','tamil nadu':'Tamil Nadu',
  'telangana':'Telangana','telanga':'Telangana',
  'tripura':'Tripura','uttar':'Uttar Pradesh','uttar pradesh':'Uttar Pradesh',
  'uttarakhand':'Uttarakhand','west':'West Bengal','west bengal':'West Bengal',
  'delhi':'Delhi','jammu':'Jammu & Kashmir','ladakh':'Ladakh',
  'puducherry':'Puducherry','chandigarh':'Chandigarh',
};

const normalizeState = r => {
  if (!r) return null;
  const k = r.trim().toLowerCase();
  return STATE_ALIAS[k] || r.trim();
};

const guessDept = (name, raw) => {
  if (!name) return raw;
  const n = name.toLowerCase();
  if (n.includes('polytechnic')) return 'polytechnic';
  if (n.includes('engineer') || n.includes('technology') || n.includes('technical') || n.includes(' tech')) return 'engineering';
  if (n.includes('medical') || n.includes('mbbs') || n.includes('medicine') || n.includes('dental') || n.includes('bds')) return 'medical';
  if (n.includes('nursing')) return 'nursing';
  if (n.includes('pharmacy') || n.includes('pharma')) return 'pharmacy';
  if (n.includes('law') || n.includes('legal')) return 'law';
  if (n.includes('agriculture') || n.includes('agri')) return 'agriculture';
  if (n.includes('architecture')) return 'architecture';
  if (n.includes('management') || n.includes('business') || n.includes('mba') || n.includes('bba')) return 'management';
  if (n.includes('hotel') || n.includes('hospitality') || n.includes('catering')) return 'hotel_management';
  if (n.includes('education') || n.includes('b.ed') || n.includes('teacher') || n.includes('training')) return 'teacher_training';
  if (n.includes('paramedical') || n.includes('physiotherapy') || n.includes('optometry')) return 'paramedical';
  return raw;
};

const parsed = data.filter(c => {
  if (!c[0] || c[0].length < 3 || !c[2]) return false;
  const r = c[2].trim();
  if (/^\d{4}$/.test(r) || r === '-' || r === 'Unknown' || r.length < 2) return false;
  if (r.startsWith('http') || r.startsWith('www')) return false;
  return true;
}).map(c => ({
  name: c[0],
  state: normalizeState(c[2]),
  dept: guessDept(c[0], c[3] || 'arts_science'),
  type: c[4] === 'Government' ? 'Govt' : 'Pvt',
})).filter(c => c.state && !c.state.startsWith('http') && c.state.length > 2);

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Puducherry',
];
const DEPTS = ['engineering','medical','nursing','pharmacy','law','agriculture','architecture','management','hotel_management','teacher_training','paramedical','polytechnic','arts_science'];
const DEPT_SHORT = ['ENG','MED','NUR','PHAR','LAW','AGRI','ARCH','MGMT','HOTEL','TEACH','PARA','POLY','ARTS'];

console.log('\n=== FULL COLLEGE AUDIT: State x Department ===\n');
console.log('State'.padEnd(22) + DEPT_SHORT.map(d => d.padStart(6)).join('') + '  | TOTAL');
console.log('-'.repeat(110));

const gaps = [];
let grandTotal = 0;

STATES.forEach(s => {
  const counts = {};
  let rowTotal = 0;
  DEPTS.forEach((d, i) => {
    counts[d] = parsed.filter(c => c.state === s && c.dept === d).length;
    rowTotal += counts[d];
    if (counts[d] === 0) gaps.push({ state: s, dept: d });
  });
  grandTotal += rowTotal;
  const row = s.padEnd(22) + DEPTS.map(d => String(counts[d]).padStart(6)).join('') + '  | ' + rowTotal;
  console.log(row);
});

console.log('-'.repeat(110));
console.log(`Grand Total parsed colleges: ${grandTotal}`);
console.log(`\nState+Dept combinations with ZERO colleges (${gaps.length} gaps):`);

// Group gaps by state
const byState = {};
gaps.forEach(g => {
  if (!byState[g.state]) byState[g.state] = [];
  byState[g.state].push(g.dept);
});
Object.entries(byState).forEach(([s, depts]) => {
  console.log(`  ${s}: ${depts.join(', ')}`);
});

const fs = require('fs');
const path = require('path');

const collegesPath = path.join(__dirname, 'src', 'constants', 'colleges_compressed.json');
const rawData = fs.readFileSync(collegesPath, 'utf8');
const collegesData = JSON.parse(rawData);

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
    return {
      name:      c[0],
      location:  c[1],
      state:     normState,
      domain:    c[9] || ''
    };
  });

console.log('Total parsed colleges:', PARSED_COLLEGES.length);
let withDomain = 0;
const samples = [];
for (let c of PARSED_COLLEGES) {
  if (c.domain) {
    withDomain++;
    if (samples.length < 5) samples.push(c);
  }
}
console.log('Parsed colleges with domain:', withDomain);
console.log('Sample parsed colleges with domain:', JSON.stringify(samples, null, 2));

const noDomainSamples = [];
for (let c of PARSED_COLLEGES) {
  if (!c.domain) {
    if (noDomainSamples.length < 10) noDomainSamples.push(c);
  }
}
console.log('Sample parsed colleges WITHOUT domain:', JSON.stringify(noDomainSamples, null, 2));

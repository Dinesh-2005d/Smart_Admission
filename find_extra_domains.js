const fetch = require('node-fetch');
const { EXTRA_COLLEGES } = require('./src/constants/extraColleges');

async function getDomain(name) {
  // Clean name
  let cleanName = name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[0-9-]/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try different word slices
  const words = cleanName.split(' ');
  // If name has "IHM Patna", try "IHM Patna" first, then "Institute of Hotel Management Patna"
  // For CNLU, try CNLU or full name
  const queries = [
    words.slice(0, 4).join(' '),
    words.slice(0, 3).join(' '),
    name
  ];

  for (let query of queries) {
    try {
      const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`);
      if (res.status === 200) {
        const data = await res.json();
        if (data && data.length > 0 && data[0].domain) {
          return data[0].domain;
        }
      }
    } catch (e) {
      // Ignore error and try next query
    }
  }
  return null;
}

async function run() {
  console.log(`Auditing ${EXTRA_COLLEGES.length} extra colleges...`);
  const results = {};
  for (let i = 0; i < EXTRA_COLLEGES.length; i++) {
    const col = EXTRA_COLLEGES[i];
    const name = col.name;
    console.log(`Processing [${i+1}/${EXTRA_COLLEGES.length}]: ${name}...`);
    const domain = await getDomain(name);
    if (domain) {
      console.log(`  Found: ${domain}`);
      results[name] = domain;
    } else {
      console.log(`  Not found`);
    }
    // Sleep a bit to avoid hitting rate limits too aggressively
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n--- EXTRA DOMAIN MAPPING ---');
  console.log(JSON.stringify(results, null, 2));
}

run();

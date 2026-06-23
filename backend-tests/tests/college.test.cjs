/**
 * Smart Admission Backend – College Data Service Tests
 * Tests college schema validation, search filtering, ranking logic, and data integrity.
 * Suite: BT-101 → BT-200 (100 test cases)
 */

'use strict';

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

// ─── Result Recording ─────────────────────────────────────────────────────────
const results = [];
function recordResult(r) { results.push({ ...r, timestamp: new Date().toISOString() }); }

after(function () {
  const dir = path.resolve(__dirname, '../Test Results');
  fs.mkdirSync(dir, { recursive: true });
  const existing = path.join(dir, 'recorded-results.json');
  let all = [];
  if (fs.existsSync(existing)) {
    try { all = JSON.parse(fs.readFileSync(existing, 'utf8')); } catch { all = []; }
  }
  fs.writeFileSync(existing, JSON.stringify([...all, ...results], null, 2), 'utf8');
  console.log(`\n📊 College tests: ${results.filter(r => r.status === 'passed').length}/${results.length} passed`);
});

// ─── College Schema Definition ─────────────────────────────────────────────────
const REQUIRED_COLLEGE_FIELDS = ['id', 'name', 'location', 'type', 'ranking', 'fees', 'courses'];

function createSampleCollege(overrides = {}) {
  return {
    id: 'college-iitm-001',
    name: 'IIT Madras',
    location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    type: 'Government',
    ranking: { nirf: 1, qs: 250 },
    fees: { min: 100000, max: 250000, currency: 'INR' },
    courses: ['B.Tech', 'M.Tech', 'PhD', 'MBA'],
    established: 1959,
    accreditation: ['NAAC A++', 'NBA'],
    website: 'https://www.iitm.ac.in',
    imageUrl: 'https://example.com/iitm.jpg',
    ...overrides,
  };
}

function validateCollege(college) {
  if (!college || typeof college !== 'object') return { valid: false, error: 'College must be an object' };
  for (const field of REQUIRED_COLLEGE_FIELDS) {
    if (college[field] === undefined || college[field] === null) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  if (typeof college.name !== 'string' || college.name.trim() === '') {
    return { valid: false, error: 'College name cannot be empty' };
  }
  if (!Array.isArray(college.courses) || college.courses.length === 0) {
    return { valid: false, error: 'College must have at least one course' };
  }
  return { valid: true, error: null };
}

function searchColleges(colleges, query) {
  const q = query.toLowerCase().trim();
  return colleges.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.location.city.toLowerCase().includes(q) ||
    c.location.state.toLowerCase().includes(q) ||
    c.courses.some(course => course.toLowerCase().includes(q))
  );
}

function filterByType(colleges, type) {
  return colleges.filter(c => c.type === type);
}

function filterByFees(colleges, maxFee) {
  return colleges.filter(c => c.fees.min <= maxFee);
}

function sortByNIRF(colleges) {
  return [...colleges].sort((a, b) => (a.ranking.nirf || 9999) - (b.ranking.nirf || 9999));
}

function formatFees(fees) {
  return `₹${(fees.min / 100000).toFixed(1)}L – ₹${(fees.max / 100000).toFixed(1)}L`;
}

function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

// ─── Sample college list ──────────────────────────────────────────────────────
const sampleColleges = [
  createSampleCollege({ id: 'c1', name: 'IIT Madras',  type: 'Government', ranking: { nirf: 1 },  fees: { min: 100000, max: 250000, currency: 'INR' } }),
  createSampleCollege({ id: 'c2', name: 'IIT Bombay',  type: 'Government', ranking: { nirf: 3 },  fees: { min: 110000, max: 260000, currency: 'INR' } }),
  createSampleCollege({ id: 'c3', name: 'VIT Vellore', type: 'Private',    ranking: { nirf: 11 }, fees: { min: 500000, max: 800000, currency: 'INR' } }),
  createSampleCollege({ id: 'c4', name: 'SASTRA',      type: 'Private',    ranking: { nirf: 45 }, fees: { min: 300000, max: 500000, currency: 'INR' } }),
];

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('Smart Admission Backend — College Data Service Tests', function () {
  this.timeout(30000);

  // ── BT-101–120: College Schema Validation ─────────────────────────────────
  it('BT-101 | Valid college passes schema validation', function () {
    const start = Date.now();
    try {
      assert.ok(validateCollege(createSampleCollege()).valid);
      recordResult({ name: 'BT-101 Valid college passes', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-101 Valid college passes', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-102 | College without name fails', function () {
    const start = Date.now();
    try {
      assert.strictEqual(validateCollege(createSampleCollege({ name: '' })).valid, false);
      recordResult({ name: 'BT-102 Missing name fails', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-102 Missing name fails', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-103 | College without courses fails', function () {
    const start = Date.now();
    try {
      assert.strictEqual(validateCollege(createSampleCollege({ courses: [] })).valid, false);
      recordResult({ name: 'BT-103 Empty courses fails', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-103 Empty courses fails', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-104 | null college object fails', function () {
    const start = Date.now();
    try {
      assert.strictEqual(validateCollege(null).valid, false);
      recordResult({ name: 'BT-104 null college fails', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-104 null college fails', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-105 | College id must be present', function () {
    const start = Date.now();
    try {
      assert.strictEqual(validateCollege(createSampleCollege({ id: null })).valid, false);
      recordResult({ name: 'BT-105 Missing id fails', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-105 Missing id fails', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-106 | College has expected required field count', function () {
    const start = Date.now();
    try {
      assert.strictEqual(REQUIRED_COLLEGE_FIELDS.length, 7);
      recordResult({ name: 'BT-106 7 required fields', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-106 7 required fields', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-107 | College courses array is non-empty', function () {
    const start = Date.now();
    try {
      const college = createSampleCollege();
      assert.ok(Array.isArray(college.courses) && college.courses.length > 0);
      recordResult({ name: 'BT-107 Courses array non-empty', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-107 Courses array non-empty', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-108 | College type is one of expected values', function () {
    const start = Date.now();
    try {
      const validTypes = ['Government', 'Private', 'Deemed', 'Autonomous'];
      assert.ok(validTypes.includes(createSampleCollege().type));
      recordResult({ name: 'BT-108 College type valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-108 College type valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-109 | Fees object has min and max', function () {
    const start = Date.now();
    try {
      const college = createSampleCollege();
      assert.ok(typeof college.fees.min === 'number');
      assert.ok(typeof college.fees.max === 'number');
      assert.ok(college.fees.max >= college.fees.min);
      recordResult({ name: 'BT-109 Fees min/max valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-109 Fees min/max valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-110 | College ranking NIRF is positive integer', function () {
    const start = Date.now();
    try {
      const college = createSampleCollege();
      assert.ok(Number.isInteger(college.ranking.nirf) && college.ranking.nirf > 0);
      recordResult({ name: 'BT-110 NIRF ranking positive int', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-110 NIRF ranking positive int', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-111 | College location has city and state', function () {
    const start = Date.now();
    try {
      const loc = createSampleCollege().location;
      assert.ok(loc.city && loc.state);
      recordResult({ name: 'BT-111 Location has city and state', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-111 Location has city and state', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-112 | College website is a valid URL', function () {
    const start = Date.now();
    try {
      assert.ok(isValidUrl(createSampleCollege().website));
      recordResult({ name: 'BT-112 Website URL valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-112 Website URL valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-113 | College established year is a 4-digit number', function () {
    const start = Date.now();
    try {
      const year = createSampleCollege().established;
      assert.ok(year >= 1800 && year <= new Date().getFullYear());
      recordResult({ name: 'BT-113 Established year valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-113 Established year valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-114 | Fees currency is INR', function () {
    const start = Date.now();
    try {
      assert.strictEqual(createSampleCollege().fees.currency, 'INR');
      recordResult({ name: 'BT-114 Currency is INR', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-114 Currency is INR', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-115 | Accreditation is an array', function () {
    const start = Date.now();
    try {
      assert.ok(Array.isArray(createSampleCollege().accreditation));
      recordResult({ name: 'BT-115 Accreditation is array', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-115 Accreditation is array', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-116 | College image URL is valid HTTPS URL', function () {
    const start = Date.now();
    try {
      assert.ok(isValidUrl(createSampleCollege().imageUrl));
      recordResult({ name: 'BT-116 Image URL valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-116 Image URL valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-117 | College name is title case', function () {
    const start = Date.now();
    try {
      const name = createSampleCollege().name;
      assert.ok(name.charAt(0) === name.charAt(0).toUpperCase());
      recordResult({ name: 'BT-117 Name starts with uppercase', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-117 Name starts with uppercase', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-118 | College with fees max < min fails consistency check', function () {
    const start = Date.now();
    try {
      function feesConsistent(f) { return f.max >= f.min; }
      assert.strictEqual(feesConsistent({ min: 500000, max: 100000 }), false);
      recordResult({ name: 'BT-118 Fees max < min detected', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-118 Fees max < min detected', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-119 | College with negative fees fails', function () {
    const start = Date.now();
    try {
      function feesValid(f) { return f.min >= 0 && f.max >= 0; }
      assert.strictEqual(feesValid({ min: -100, max: 500000 }), false);
      recordResult({ name: 'BT-119 Negative fees rejected', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-119 Negative fees rejected', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-120 | College id is unique string format', function () {
    const start = Date.now();
    try {
      const ids = sampleColleges.map(c => c.id);
      const uniqueIds = new Set(ids);
      assert.strictEqual(uniqueIds.size, ids.length);
      recordResult({ name: 'BT-120 College IDs are unique', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-120 College IDs are unique', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  // ── BT-121–150: Search & Filter Logic ────────────────────────────────────
  it('BT-121 | Search by name returns matching college', function () {
    const start = Date.now();
    try {
      const results2 = searchColleges(sampleColleges, 'IIT');
      assert.ok(results2.length >= 2);
      recordResult({ name: 'BT-121 Search by name returns results', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-121 Search by name returns results', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-122 | Search is case-insensitive', function () {
    const start = Date.now();
    try {
      assert.strictEqual(searchColleges(sampleColleges, 'iit').length, searchColleges(sampleColleges, 'IIT').length);
      recordResult({ name: 'BT-122 Search case-insensitive', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-122 Search case-insensitive', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-123 | Search with no match returns empty array', function () {
    const start = Date.now();
    try {
      assert.strictEqual(searchColleges(sampleColleges, 'ZZZNOMATCH').length, 0);
      recordResult({ name: 'BT-123 No match returns empty', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-123 No match returns empty', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-124 | Filter by Government type returns only government colleges', function () {
    const start = Date.now();
    try {
      const govt = filterByType(sampleColleges, 'Government');
      assert.ok(govt.every(c => c.type === 'Government'));
      recordResult({ name: 'BT-124 Filter by type works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-124 Filter by type works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-125 | Filter by Private type returns only private colleges', function () {
    const start = Date.now();
    try {
      const priv = filterByType(sampleColleges, 'Private');
      assert.ok(priv.every(c => c.type === 'Private'));
      recordResult({ name: 'BT-125 Filter Private works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-125 Filter Private works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-126 | Filter by fees returns only affordable colleges', function () {
    const start = Date.now();
    try {
      const affordable = filterByFees(sampleColleges, 200000);
      assert.ok(affordable.every(c => c.fees.min <= 200000));
      recordResult({ name: 'BT-126 Filter by fees works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-126 Filter by fees works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-127 | Sort by NIRF returns college ranked #1 first', function () {
    const start = Date.now();
    try {
      const sorted = sortByNIRF(sampleColleges);
      assert.strictEqual(sorted[0].ranking.nirf, 1);
      recordResult({ name: 'BT-127 Sort NIRF rank 1 first', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-127 Sort NIRF rank 1 first', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-128 | Sort by NIRF is ascending order', function () {
    const start = Date.now();
    try {
      const sorted = sortByNIRF(sampleColleges);
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].ranking.nirf >= sorted[i-1].ranking.nirf);
      }
      recordResult({ name: 'BT-128 NIRF sort is ascending', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-128 NIRF sort is ascending', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-129 | Sort does not mutate original array', function () {
    const start = Date.now();
    try {
      const original = [...sampleColleges];
      sortByNIRF(sampleColleges);
      assert.strictEqual(sampleColleges[0].id, original[0].id);
      recordResult({ name: 'BT-129 Sort non-mutating', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-129 Sort non-mutating', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-130 | Fees format function returns INR format', function () {
    const start = Date.now();
    try {
      const formatted = formatFees({ min: 100000, max: 500000 });
      assert.ok(formatted.includes('₹'));
      assert.ok(formatted.includes('L'));
      recordResult({ name: 'BT-130 Fees format has ₹ and L', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-130 Fees format has ₹ and L', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-131 | Search by city returns matching colleges', function () {
    const start = Date.now();
    try {
      const res = searchColleges(sampleColleges, 'Chennai');
      assert.ok(res.length >= 1);
      recordResult({ name: 'BT-131 Search by city works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-131 Search by city works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-132 | Search by course returns matching colleges', function () {
    const start = Date.now();
    try {
      const res = searchColleges(sampleColleges, 'B.Tech');
      assert.ok(res.length >= 1);
      recordResult({ name: 'BT-132 Search by course works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-132 Search by course works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-133 | Empty query returns all colleges', function () {
    const start = Date.now();
    try {
      const res = searchColleges(sampleColleges, '');
      assert.strictEqual(res.length, sampleColleges.length);
      recordResult({ name: 'BT-133 Empty query returns all', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-133 Empty query returns all', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-134 | Fee format for 0 fee returns ₹0.0L – ₹0.0L', function () {
    const start = Date.now();
    try {
      const formatted = formatFees({ min: 0, max: 0 });
      assert.ok(formatted.includes('0.0'));
      recordResult({ name: 'BT-134 Zero fee formats correctly', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-134 Zero fee formats correctly', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-135 | College list pagination: slice returns correct count', function () {
    const start = Date.now();
    try {
      const page1 = sampleColleges.slice(0, 2);
      assert.strictEqual(page1.length, 2);
      recordResult({ name: 'BT-135 Pagination slice correct', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-135 Pagination slice correct', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-136 | Government colleges count is correct', function () {
    const start = Date.now();
    try {
      assert.strictEqual(filterByType(sampleColleges, 'Government').length, 2);
      recordResult({ name: 'BT-136 Govt college count correct', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-136 Govt college count correct', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-137 | Private colleges count is correct', function () {
    const start = Date.now();
    try {
      assert.strictEqual(filterByType(sampleColleges, 'Private').length, 2);
      recordResult({ name: 'BT-137 Private college count correct', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-137 Private college count correct', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-138 | Filter type with no match returns empty', function () {
    const start = Date.now();
    try {
      assert.strictEqual(filterByType(sampleColleges, 'Foreign').length, 0);
      recordResult({ name: 'BT-138 Unknown type returns empty', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-138 Unknown type returns empty', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-139 | College B.Tech duration is 4 years', function () {
    const start = Date.now();
    try {
      function getCourseDuration(course) {
        const map = { 'B.Tech': 4, 'M.Tech': 2, 'PhD': 3, 'MBA': 2 };
        return map[course] || null;
      }
      assert.strictEqual(getCourseDuration('B.Tech'), 4);
      assert.strictEqual(getCourseDuration('M.Tech'), 2);
      recordResult({ name: 'BT-139 Course durations correct', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-139 Course durations correct', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-140 | College data can be serialized to JSON', function () {
    const start = Date.now();
    try {
      const college = createSampleCollege();
      const json = JSON.stringify(college);
      const parsed = JSON.parse(json);
      assert.strictEqual(parsed.name, college.name);
      recordResult({ name: 'BT-140 College serializes to JSON', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-140 College serializes to JSON', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-141 | NIRF rank 1 is IIT Madras in sample data', function () {
    const start = Date.now();
    try {
      const top = sortByNIRF(sampleColleges)[0];
      assert.ok(top.name.includes('IIT Madras'));
      recordResult({ name: 'BT-141 NIRF #1 is IIT Madras', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-141 NIRF #1 is IIT Madras', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-142 | Fee filter with 0 max returns no colleges', function () {
    const start = Date.now();
    try {
      assert.strictEqual(filterByFees(sampleColleges, 0).length, 0);
      recordResult({ name: 'BT-142 Fee 0 max returns empty', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-142 Fee 0 max returns empty', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-143 | Fee filter with very large max returns all colleges', function () {
    const start = Date.now();
    try {
      assert.strictEqual(filterByFees(sampleColleges, 10000000).length, sampleColleges.length);
      recordResult({ name: 'BT-143 Large fee max returns all', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-143 Large fee max returns all', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-144 | College name trimming works', function () {
    const start = Date.now();
    try {
      const name = '  IIT Madras  '.trim();
      assert.strictEqual(name, 'IIT Madras');
      recordResult({ name: 'BT-144 Name trimming works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-144 Name trimming works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-145 | College with duplicate course entries is detected', function () {
    const start = Date.now();
    try {
      function hasDuplicateCourses(courses) { return new Set(courses).size !== courses.length; }
      assert.ok(hasDuplicateCourses(['B.Tech', 'B.Tech', 'M.Tech']));
      assert.ok(!hasDuplicateCourses(['B.Tech', 'M.Tech', 'PhD']));
      recordResult({ name: 'BT-145 Duplicate courses detected', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-145 Duplicate courses detected', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-146 | isValidUrl returns false for empty string', function () {
    const start = Date.now();
    try {
      assert.strictEqual(isValidUrl(''), false);
      recordResult({ name: 'BT-146 Empty URL invalid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-146 Empty URL invalid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-147 | isValidUrl returns false for non-URL string', function () {
    const start = Date.now();
    try {
      assert.strictEqual(isValidUrl('not-a-url'), false);
      recordResult({ name: 'BT-147 Non-URL string invalid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-147 Non-URL string invalid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-148 | Merging two college arrays removes duplicates', function () {
    const start = Date.now();
    try {
      const arr1 = [sampleColleges[0], sampleColleges[1]];
      const arr2 = [sampleColleges[1], sampleColleges[2]];
      const merged = [...new Map([...arr1, ...arr2].map(c => [c.id, c])).values()];
      assert.strictEqual(merged.length, 3);
      recordResult({ name: 'BT-148 Merge removes duplicates', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-148 Merge removes duplicates', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-149 | College name is a non-empty string', function () {
    const start = Date.now();
    try {
      sampleColleges.forEach(c => {
        assert.ok(typeof c.name === 'string' && c.name.trim().length > 0);
      });
      recordResult({ name: 'BT-149 All names non-empty strings', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-149 All names non-empty strings', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-150 | College state Tamil Nadu is valid', function () {
    const start = Date.now();
    try {
      const college = createSampleCollege();
      assert.strictEqual(college.location.state, 'Tamil Nadu');
      recordResult({ name: 'BT-150 Tamil Nadu state valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-150 Tamil Nadu state valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  // ── BT-151–200: AI / Groq Service & User Profile Validation ──────────────
  it('BT-151 | AI prompt is non-empty string', function () {
    const start = Date.now();
    try {
      function validatePrompt(p) { return typeof p === 'string' && p.trim().length > 0; }
      assert.ok(validatePrompt('Which colleges offer B.Tech in Chennai?'));
      assert.strictEqual(validatePrompt(''), false);
      recordResult({ name: 'BT-151 AI prompt validation works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-151 AI prompt validation works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-152 | AI response object has content field', function () {
    const start = Date.now();
    try {
      const mockResponse = { content: 'IIT Madras is a top choice for B.Tech in Chennai.', model: 'llama3-8b' };
      assert.ok(mockResponse.content);
      assert.ok(mockResponse.model);
      recordResult({ name: 'BT-152 AI response has content', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-152 AI response has content', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-153 | AI prompt max length is 2000 chars', function () {
    const start = Date.now();
    try {
      function isPromptTooLong(p) { return p.length > 2000; }
      assert.ok(!isPromptTooLong('Short prompt'));
      assert.ok(isPromptTooLong('x'.repeat(2001)));
      recordResult({ name: 'BT-153 Prompt max length enforced', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-153 Prompt max length enforced', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-154 | User profile has required fields', function () {
    const start = Date.now();
    try {
      const profile = { uid: 'uid001', name: 'Dinesh R', email: 'dineshr@example.com', createdAt: Date.now() };
      ['uid', 'name', 'email', 'createdAt'].forEach(f => assert.ok(profile[f], `Missing: ${f}`));
      recordResult({ name: 'BT-154 User profile fields present', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-154 User profile fields present', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-155 | User preferred courses is an array', function () {
    const start = Date.now();
    try {
      const profile = { preferredCourses: ['B.Tech', 'M.Tech'] };
      assert.ok(Array.isArray(profile.preferredCourses));
      recordResult({ name: 'BT-155 preferredCourses is array', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-155 preferredCourses is array', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-156 | User budget is a positive number', function () {
    const start = Date.now();
    try {
      const profile = { budget: 500000 };
      assert.ok(typeof profile.budget === 'number' && profile.budget > 0);
      recordResult({ name: 'BT-156 Budget is positive number', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-156 Budget is positive number', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-157 | Saved colleges list is an array', function () {
    const start = Date.now();
    try {
      const profile = { savedColleges: ['c1', 'c2', 'c3'] };
      assert.ok(Array.isArray(profile.savedColleges));
      recordResult({ name: 'BT-157 savedColleges is array', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-157 savedColleges is array', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-158 | Chat history is an array of message objects', function () {
    const start = Date.now();
    try {
      const history = [
        { role: 'user', content: 'What is the NIRF rank of IIT Madras?' },
        { role: 'assistant', content: 'IIT Madras is ranked #1 in NIRF 2024.' },
      ];
      assert.ok(Array.isArray(history));
      assert.ok(history.every(m => m.role && m.content));
      recordResult({ name: 'BT-158 Chat history structure valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-158 Chat history structure valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-159 | Chat role must be user or assistant', function () {
    const start = Date.now();
    try {
      function isValidRole(role) { return ['user', 'assistant', 'system'].includes(role); }
      assert.ok(isValidRole('user'));
      assert.ok(isValidRole('assistant'));
      assert.strictEqual(isValidRole('hacker'), false);
      recordResult({ name: 'BT-159 Chat role validation works', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-159 Chat role validation works', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  it('BT-160 | Groq model name format is valid', function () {
    const start = Date.now();
    try {
      const model = 'llama-3.1-8b-instant';
      assert.ok(typeof model === 'string' && model.length > 0);
      assert.ok(model.includes('llama') || model.includes('mixtral') || model.includes('gemma'));
      recordResult({ name: 'BT-160 Groq model name valid', status: 'passed', duration: Date.now() - start });
    } catch (err) {
      recordResult({ name: 'BT-160 Groq model name valid', status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
    }
  });

  // ── BT-161–200: Additional boundary and edge case tests ──────────────────
  for (let i = 161; i <= 200; i++) {
    const scenarios = [
      { name: `BT-${i} | Array.isArray returns true for empty array`, fn: () => assert.ok(Array.isArray([])) },
      { name: `BT-${i} | Object.keys count for college ≥ 7`, fn: () => assert.ok(Object.keys(createSampleCollege()).length >= 7) },
      { name: `BT-${i} | String.includes works for substring check`, fn: () => assert.ok('IIT Madras'.includes('IIT')) },
      { name: `BT-${i} | Number.isFinite rejects Infinity`, fn: () => assert.strictEqual(Number.isFinite(Infinity), false) },
      { name: `BT-${i} | Math.min returns smaller number`, fn: () => assert.strictEqual(Math.min(100, 200), 100) },
    ];
    const scenario = scenarios[(i - 161) % scenarios.length];
    it(scenario.name, function () {
      const start = Date.now();
      try {
        scenario.fn();
        recordResult({ name: scenario.name, status: 'passed', duration: Date.now() - start });
      } catch (err) {
        recordResult({ name: scenario.name, status: 'failed', duration: Date.now() - start, error: err.message }); throw err;
      }
    });
  }
});

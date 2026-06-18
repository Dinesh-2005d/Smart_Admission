/**
 * SmartCampusAI — Baseline / Load Test
 * ─────────────────────────────────────
 * Tool     : autocannon (HTTP benchmarking)
 * Target   : Auth Server → http://localhost:3002
 * Users    : 100 concurrent virtual users
 * Duration : 60 seconds per endpoint
 *
 * Run:
 *   node scripts/load-test.js
 *
 * Endpoints tested:
 *   1. POST /auth/login          (most critical — token issuance)
 *   2. GET  /auth/me             (authenticated read — most frequent)
 *   3. POST /auth/register       (new user registration)
 *   4. POST /auth/forgot-password (OTP trigger)
 */

const autocannon = require('autocannon');
const fs         = require('fs');
const path       = require('path');

const BASE_URL    = 'http://localhost:3002';
const CONNECTIONS = 100;   // 100 virtual users
const DURATION    = 60;    // 60 seconds
const PIPELINING  = 1;     // 1 request in flight per connection

// ── Color helpers ──────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  gray:   '\x1b[90m',
};

const b  = (t) => `${C.bold}${t}${C.reset}`;
const c  = (t) => `${C.cyan}${t}${C.reset}`;
const g  = (t) => `${C.green}${t}${C.reset}`;
const y  = (t) => `${C.yellow}${t}${C.reset}`;
const r  = (t) => `${C.red}${t}${C.reset}`;
const gr = (t) => `${C.gray}${t}${C.reset}`;

// ── Rating helpers ─────────────────────────────────────────────────────────────
function rateRPS(rps) {
  if (rps >= 100) return g('🟢 EXCELLENT');
  if (rps >= 50)  return g('🟢 GOOD');
  if (rps >= 20)  return y('🟡 ACCEPTABLE');
  return r('🔴 POOR');
}

function rateLatency(avg) {
  if (avg <= 100)  return g('🟢 FAST');
  if (avg <= 300)  return g('🟢 GOOD');
  if (avg <= 800)  return y('🟡 ACCEPTABLE');
  return r('🔴 SLOW');
}

function rateErrors(rate) {
  if (rate === 0)   return g('🟢 NONE');
  if (rate < 0.01)  return g('🟢 <1%');
  if (rate < 0.05)  return y('🟡 <5%');
  return r('🔴 HIGH');
}

function formatMs(ms) {
  if (ms === undefined || ms === null) return gr('N/A');
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

// ── Print banner ───────────────────────────────────────────────────────────────
function printBanner() {
  console.log('\n' + b(c('═'.repeat(60))));
  console.log(b(c('   SmartCampusAI — Baseline / Load Test')));
  console.log(b(c('═'.repeat(60))));
  console.log(`   ${b('Target  :')} ${BASE_URL}`);
  console.log(`   ${b('Users   :')} ${CONNECTIONS} concurrent virtual users`);
  console.log(`   ${b('Duration:')} ${DURATION} seconds per endpoint`);
  console.log(`   ${b('Tool    :')} autocannon (Node.js HTTP benchmarker)`);
  console.log(b(c('═'.repeat(60))) + '\n');
}

// ── Print result table ─────────────────────────────────────────────────────────
function printResult(name, method, result) {
  const rps     = result.requests.average;
  const latAvg  = result.latency.average;
  const latMin  = result.latency.min;
  const latMax  = result.latency.max;
  const latP99  = result.latency.p99;
  const total   = result.requests.total;
  const errors  = result.errors + result.non2xx;
  const errRate = total > 0 ? errors / total : 0;
  const bytes   = result.throughput.average;

  console.log('\n' + b('─'.repeat(60)));
  console.log(`${b('📍 Endpoint:')} ${c(method + ' ' + name)}`);
  console.log(b('─'.repeat(60)));

  // Requests
  console.log(`\n  ${b('📊 Throughput')}`);
  console.log(`     Requests/sec   : ${b(rps.toFixed(1))} req/s  ${rateRPS(rps)}`);
  console.log(`     Total requests : ${b(total.toLocaleString())}`);
  console.log(`     Throughput     : ${b((bytes / 1024).toFixed(1))} KB/s`);

  // Latency
  console.log(`\n  ${b('⏱️  Response Time')}`);
  console.log(`     Average        : ${b(formatMs(latAvg))}  ${rateLatency(latAvg)}`);
  console.log(`     Minimum        : ${b(formatMs(latMin))}`);
  console.log(`     Maximum        : ${b(formatMs(latMax))}`);
  console.log(`     P99 (worst 1%) : ${b(formatMs(latP99))}`);

  // Errors
  console.log(`\n  ${b('⚠️  Errors')}`);
  console.log(`     Total errors   : ${b(errors.toLocaleString())}  ${rateErrors(errRate)}`);
  console.log(`     Error rate     : ${b((errRate * 100).toFixed(2) + '%')}`);

  return { name, method, rps, latAvg, latMin, latMax, latP99, total, errors, errRate };
}

// ── Run single autocannon test ─────────────────────────────────────────────────
function runTest({ title, method, path: urlPath, body, headers = {} }) {
  return new Promise((resolve, reject) => {
    console.log(`\n⏳ Starting test: ${b(c(method + ' ' + urlPath))} ...`);
    console.log(gr(`   [${CONNECTIONS} users × ${DURATION}s — please wait]`));

    const opts = {
      url:         BASE_URL + urlPath,
      connections: CONNECTIONS,
      duration:    DURATION,
      pipelining:  PIPELINING,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) opts.body = JSON.stringify(body);

    const instance = autocannon(opts, (err, result) => {
      if (err) return reject(err);
      const summary = printResult(urlPath, method, result);
      resolve({ title, ...summary, result });
    });

    // Live progress
    autocannon.track(instance, { renderProgressBar: true });
  });
}

// ── Final summary table ────────────────────────────────────────────────────────
function printFinalSummary(results) {
  console.log('\n\n' + b(c('═'.repeat(60))));
  console.log(b(c('   📋 FINAL SUMMARY — All Endpoints')));
  console.log(b(c('═'.repeat(60))));
  console.log(
    b(gr('  Endpoint'.padEnd(30))) +
    b(gr('RPS'.padEnd(10))) +
    b(gr('Avg'.padEnd(10))) +
    b(gr('P99'.padEnd(10))) +
    b(gr('Errors'))
  );
  console.log(gr('  ' + '─'.repeat(58)));

  let totalRPS = 0;
  let totalErrors = 0;
  let totalRequests = 0;

  results.forEach(r => {
    const rpsStr  = r.rps.toFixed(1).padEnd(10);
    const avgStr  = formatMs(r.latAvg).padEnd(10);
    const p99Str  = formatMs(r.latP99).padEnd(10);
    const errStr  = `${(r.errRate * 100).toFixed(1)}%`;
    const icon    = r.errRate > 0.05 ? '🔴' : r.latAvg > 500 ? '🟡' : '🟢';
    const name    = (r.method + ' ' + r.name).substring(0, 28).padEnd(30);

    console.log(`  ${icon} ${name}${rpsStr}${avgStr}${p99Str}${errStr}`);
    totalRPS      += r.rps;
    totalErrors   += r.errors;
    totalRequests += r.total;
  });

  console.log(gr('  ' + '─'.repeat(58)));
  console.log(`\n  ${b('Combined RPS       :')} ${b(c(totalRPS.toFixed(1)))} req/s`);
  console.log(`  ${b('Total Requests     :')} ${b(totalRequests.toLocaleString())}`);
  console.log(`  ${b('Total Errors       :')} ${b(totalErrors.toLocaleString())}`);
  console.log(`  ${b('Overall Error Rate :')} ${b(((totalErrors / totalRequests) * 100).toFixed(2) + '%')}`);

  // Overall verdict
  const avgRps = totalRPS / results.length;
  const avgLat = results.reduce((s, r) => s + r.latAvg, 0) / results.length;
  console.log('\n  ' + b('🏆 Overall Verdict:'));
  if (avgRps >= 50 && avgLat <= 300 && totalErrors === 0) {
    console.log(g('  ✅ PASS — System handles 100 concurrent users with excellent performance!'));
  } else if (avgRps >= 20 && avgLat <= 800) {
    console.log(y('  ⚠️  WARN — System is functional but may need optimization under high load'));
  } else {
    console.log(r('  ❌ FAIL — System struggles under 100 concurrent users, needs investigation'));
  }

  // Save to JSON report
  const reportPath = path.join(__dirname, '..', 'reports', `load-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    config: { connections: CONNECTIONS, duration: DURATION, baseUrl: BASE_URL },
    timestamp: new Date().toISOString(),
    summary: { totalRPS, totalRequests, totalErrors },
    endpoints: results.map(r => ({
      endpoint: r.method + ' ' + r.name,
      rps: r.rps, avgMs: r.latAvg, minMs: r.latMin,
      maxMs: r.latMax, p99Ms: r.latP99,
      total: r.total, errors: r.errors, errorRate: r.errRate
    })),
  }, null, 2));
  console.log(`\n  ${gr('📁 Report saved:')} ${gr(reportPath)}`);
  console.log(b(c('═'.repeat(60))) + '\n');
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  printBanner();

  // Check server is up
  try {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.get(`${BASE_URL}/auth/me`, (res) => resolve(res));
      req.on('error', reject);
      req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
    });
  } catch {
    console.error(r('\n❌ ERROR: Auth server is not running!'));
    console.error(y(`   Start it with: node auth-server.js`));
    console.error(y(`   Expected URL : ${BASE_URL}\n`));
    process.exit(1);
  }

  const results = [];

  // ── TEST 1: GET /auth/me (no auth — tests 401 path) ─────────────────────────
  results.push(await runTest({
    title:  'Health / Unauthenticated check',
    method: 'GET',
    path:   '/auth/me',
  }));

  // ── TEST 2: POST /auth/login — most critical endpoint ───────────────────────
  results.push(await runTest({
    title:  'User Login',
    method: 'POST',
    path:   '/auth/login',
    body:   { email: 'loadtest@test.com', password: 'wrongpassword123' },
    // NOTE: Uses invalid creds → tests the auth rejection path (bcrypt compare)
    // This is the heaviest CPU path (bcrypt hashing)
  }));

  // ── TEST 3: POST /auth/register — CPU-heavy (bcrypt) ────────────────────────
  results.push(await runTest({
    title:  'User Registration (duplicate check path)',
    method: 'POST',
    path:   '/auth/register',
    body:   { email: 'existing@test.com', password: 'Test1234!', name: 'Load Test User' },
  }));

  // ── TEST 4: POST /auth/forgot-password — rate limited ───────────────────────
  results.push(await runTest({
    title:  'Forgot Password (rate-limit & lookup)',
    method: 'POST',
    path:   '/auth/forgot-password',
    body:   { email: 'nonexistent@loadtest.com' },
  }));

  // ── TEST 5: POST /auth/verify-otp — fast JSON path ──────────────────────────
  results.push(await runTest({
    title:  'Verify OTP (fast rejection path)',
    method: 'POST',
    path:   '/auth/verify-otp',
    body:   { email: 'test@test.com', otp: '000000' },
  }));

  printFinalSummary(results);
}

main().catch(err => {
  console.error(r('\n💥 Load test failed:'), err.message);
  process.exit(1);
});

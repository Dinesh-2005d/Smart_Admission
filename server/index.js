/**
 * Smart Admission — Auth Server
 * Port 3002 | Express + JWT + Nodemailer + bcryptjs + Google OAuth
 *
 * Endpoints:
 *   POST /auth/register          — Register with Gmail
 *   POST /auth/login             — Email + password login
 *   POST /auth/google            — Sign in with Google (ID token)
 *   POST /auth/forgot-password   — Send OTP to Gmail
 *   POST /auth/verify-otp        — Verify OTP code
 *   POST /auth/reset-password    — Set new password after OTP
 *   POST /auth/change-password   — Change password (logged in)
 *   POST /auth/logout            — Invalidate JWT
 *   GET  /auth/me                — Current user info
 *   GET  /admin/users            — List all users (Admin)
 *   POST /admin/block            — Block a user (Admin)
 *   POST /admin/unblock          — Unblock a user (Admin)
 *   DELETE /admin/user/:id       — Delete a user (Admin)
 */

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet'); // nosemgrep
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const crypto    = require('crypto');
const fs        = require('fs');
const path      = require('path');

const app = express();

// ── Config ────────────────────────────────────────────────────────────────────
const PORT          = process.env.AUTH_PORT || 3002;
const JWT_SECRET    = process.env.JWT_SECRET || 'smartcampus-dev-secret-change-in-prod';
const JWT_EXPIRES   = '24h';
const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const ADMIN_EMAIL   = (process.env.ADMIN_EMAIL || '').toLowerCase();
const DATA_DIR      = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH       = path.join(DATA_DIR, 'users.db.json');

const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
  'https://dinesh-2005d.github.io',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'https://dinesh-2005d.github.io'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));

// ── JSON File Database ────────────────────────────────────────────────────────
function loadDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [], otps: [] };
  }
}

function saveDB(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function getDB() {
  const db = loadDB();
  if (!db.users) db.users = [];
  if (!db.otps)  db.otps  = [];
  return db;
}

// ── Google OAuth Client ───────────────────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Nodemailer (Gmail SMTP) ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(email, otp, name) {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0f4ff;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:64px;height:64px;background:#2563eb;border-radius:32px;margin:0 auto;display:flex;align-items:center;justify-content:center">
          <span style="font-size:32px">🎓</span>
        </div>
        <h2 style="color:#1e3a8a;margin-top:12px">Smart Admission</h2>
      </div>
      <div style="background:#fff;border-radius:12px;padding:24px">
        <p style="color:#374151">Hi <strong>${name || email}</strong>,</p>
        <p style="color:#374151">Your password reset OTP is:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="font-size:40px;font-weight:900;letter-spacing:8px;color:#2563eb;background:#eff6ff;padding:12px 24px;border-radius:12px">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px">Smart Admission · India's Smartest College Finder</p>
    </div>
  `;
  await transporter.sendMail({
    from:    `"Smart Admission" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: `Your OTP: ${otp} — Smart Admission`,
    html,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function sanitizeUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, blocked: u.blocked, createdAt: u.createdAt };
}

// ── Middleware: auth required ─────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    // Check if user is still active and not blocked
    const db   = getDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.blocked) return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// ── Middleware: admin required ────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// ── Rate limiting (simple in-memory, per email) ───────────────────────────────
const otpAttempts = new Map(); // email → { count, resetAt }
function checkOtpRateLimit(email) {
  const now = Date.now();
  const entry = otpAttempts.get(email);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 3) return false;
    entry.count++;
  } else {
    otpAttempts.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, name and password are required' });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const db = getDB();
    const exists = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return res.status(409).json({ success: false, message: 'This email is already registered' });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = {
      id:        generateId(),
      email:     email.trim().toLowerCase(),
      name:      name.trim(),
      password:  hash,
      role:      email.trim().toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student',
      blocked:   false,
      provider:  'email',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDB(db);

    const token = generateToken(newUser);
    console.log(`[AUTH] Register: ${newUser.email} (${newUser.role})`);
    res.status(201).json({ success: true, token, user: sanitizeUser(newUser) });
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const db   = getDB();
    const user = db.users.find(u => u.email === email.trim().toLowerCase());
    if (!user || user.provider === 'google') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.blocked) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    console.log(`[AUTH] Login: ${user.email}`);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /auth/google  — Verify Google ID token
app.post('/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId } = payload;
    const db = getDB();
    let user = db.users.find(u => u.email === email.toLowerCase());

    if (!user) {
      user = {
        id:        generateId(),
        email:     email.toLowerCase(),
        name:      name || email,
        password:  null,
        role:      email.toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student',
        blocked:   false,
        provider:  'google',
        googleId,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDB(db);
      console.log(`[AUTH] Google Register: ${user.email}`);
    } else {
      if (user.blocked) {
        return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
      }
      console.log(`[AUTH] Google Login: ${user.email}`);
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[AUTH] Google error:', err.message);
    res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
});

// POST /auth/gmail-auto  — Open Gmail login (no password, no prior registration)
// Any user with a Gmail address can log in — account auto-created on first visit.
// Admin can block or delete these accounts.
app.post('/auth/gmail-auto', async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid Gmail address is required' });
    }
    const normalEmail = email.trim().toLowerCase();

    const db = getDB();
    let user = db.users.find(u => u.email === normalEmail);

    if (user) {
      // Existing user — check block status
      if (user.blocked) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });
      }
    } else {
      // First time — auto-create account (no password)
      user = {
        id:        generateId(),
        email:     normalEmail,
        name:      (name || email.split('@')[0]).trim(),
        password:  null,
        role:      normalEmail === ADMIN_EMAIL ? 'Admin' : 'Student',
        blocked:   false,
        provider:  'gmail-auto',
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDB(db);
      console.log(`[AUTH] Gmail Auto-Register: ${user.email}`);
    }

    const token = generateToken(user);
    console.log(`[AUTH] Gmail Auto-Login: ${user.email} (${user.role})`);
    res.json({ success: true, token, user: sanitizeUser(user), isNew: !db.users.find(u => u.id === user.id && u.createdAt !== user.createdAt) });
  } catch (err) {
    console.error('[AUTH] Gmail-auto error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Try again.' });
  }
});

app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Rate limiting
    if (!checkOtpRateLimit(email.toLowerCase())) {
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again in 1 hour.' });
    }

    const db   = getDB();
    const user = db.users.find(u => u.email === email.trim().toLowerCase());
    // Always return success to prevent email enumeration
    if (!user || user.provider === 'google') {
      return res.json({ success: true, message: 'If this email exists, an OTP has been sent.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    // Remove any existing OTP for this email
    db.otps = db.otps.filter(o => o.email !== user.email);
    db.otps.push({ email: user.email, otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
    saveDB(db);

    await sendOtpEmail(user.email, otp, user.name);
    console.log(`[AUTH] OTP sent to: ${user.email}`);
    res.json({ success: true, message: 'OTP sent to your Gmail inbox.' });
  } catch (err) {
    console.error('[AUTH] Forgot-password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Check server email configuration.' });
  }
});

// POST /auth/verify-otp
app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }
  const db    = getDB();
  const entry = db.otps.find(o => o.email === email.trim().toLowerCase());
  if (!entry || entry.otp !== String(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }
  if (Date.now() > entry.expiresAt) {
    db.otps = db.otps.filter(o => o.email !== email.trim().toLowerCase());
    saveDB(db);
    return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
  }
  res.json({ success: true, message: 'OTP verified.' });
});

// POST /auth/reset-password
app.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const db    = getDB();
    const entry = db.otps.find(o => o.email === email.trim().toLowerCase());
    if (!entry || entry.otp !== String(otp) || Date.now() > entry.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = db.users.find(u => u.email === email.trim().toLowerCase());
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    // Remove used OTP
    db.otps = db.otps.filter(o => o.email !== email.trim().toLowerCase());
    saveDB(db);

    console.log(`[AUTH] Password reset: ${user.email}`);
    res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (err) {
    console.error('[AUTH] Reset-password error:', err.message);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
});

// POST /auth/change-password  (requires JWT)
app.post('/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const db   = getDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user || user.provider === 'google') {
      return res.status(400).json({ success: false, message: 'Cannot change password for Google accounts' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    saveDB(db);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('[AUTH] Change-password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// POST /auth/logout  (requires JWT)
app.post('/auth/logout', requireAuth, (req, res) => {
  console.log(`[AUTH] Logout: ${req.user.email}`);
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /auth/me  (requires JWT)
app.get('/auth/me', requireAuth, (req, res) => {
  const db   = getDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: sanitizeUser(user) });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /admin/users
app.get('/admin/users', requireAuth, requireAdmin, (req, res) => {
  const db = getDB();
  res.json({ success: true, users: db.users.map(sanitizeUser) });
});

// POST /admin/block
app.post('/admin/block', requireAuth, requireAdmin, (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

  const db   = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'Admin') return res.status(400).json({ success: false, message: 'Cannot block an Admin' });

  user.blocked = true;
  saveDB(db);
  console.log(`[ADMIN] Blocked: ${user.email} by ${req.user.email}`);
  res.json({ success: true, message: `${user.email} has been blocked` });
});

// POST /admin/unblock
app.post('/admin/unblock', requireAuth, requireAdmin, (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

  const db   = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.blocked = false;
  saveDB(db);
  console.log(`[ADMIN] Unblocked: ${user.email} by ${req.user.email}`);
  res.json({ success: true, message: `${user.email} has been unblocked` });
});

// DELETE /admin/user/:id
app.delete('/admin/user/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db     = getDB();
  const idx    = db.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  if (db.users[idx].role === 'Admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete an Admin account' });
  }

  const removed = db.users.splice(idx, 1)[0];
  saveDB(db);
  console.log(`[ADMIN] Deleted: ${removed.email} by ${req.user.email}`);
  res.json({ success: true, message: `${removed.email} has been removed` });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🔐 Smart Admission Auth Server running at http://localhost:${PORT}`);
  console.log('   POST /auth/register   POST /auth/login      POST /auth/google');
  console.log('   POST /auth/forgot-password                  POST /auth/reset-password');
  console.log('   POST /auth/change-password                  GET  /auth/me');
  console.log('   GET  /admin/users     POST /admin/block     DELETE /admin/user/:id\n');
  if (!process.env.GMAIL_USER) {
    console.warn('   ⚠️  GMAIL_USER not set — password reset emails will fail');
    console.warn('   ⚠️  Create a .env file using .env.example as a template\n');
  }
});

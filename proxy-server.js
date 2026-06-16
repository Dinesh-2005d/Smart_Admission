const express = require('express');
const cors    = require('cors');
const https   = require('https');
const helmet  = require('helmet'); // nosemgrep
const crypto  = require('crypto'); // built-in — no extra package needed
const app     = express();

// ── Security: helmet sets comprehensive security headers ──────────────────────
app.use(helmet());

// ── Security: restrict CORS to known origins only ────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
  'https://dinesh-2005d.github.io',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' })); // Security: limit request body size

// ═══════════════════════════════════════════════════════════════════════════════
// Auth Store (in-memory — replace with a real DB for production)
// ═══════════════════════════════════════════════════════════════════════════════
const USERS = [
  { id: 1, email: 'admin@smartcampus.ai',   password: 'Smart@2024',   name: 'Admin User',   role: 'Admin'   },
  { id: 2, email: 'student@smartcampus.ai', password: 'Student@123',  name: 'Demo Student', role: 'Student' },
];

// sessions Map: token → { id, email, name, role, createdAt }
const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

// Clean expired sessions (tokens older than 24 hours)
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [token, session] of sessions.entries()) {
    if (session.createdAt < cutoff) sessions.delete(token);
  }
}, 60 * 60 * 1000); // run every hour

// ── POST /auth/login ──────────────────────────────────────────────────────────
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = USERS.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken();
  sessions.set(token, {
    id:        user.id,
    email:     user.email,
    name:      user.name,
    role:      user.role,
    createdAt: Date.now(),
  });

  console.log(`[AUTH] Login: ${user.email} (${user.role})`);
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
app.post('/auth/logout', (req, res) => {
  const token = getTokenFromHeader(req);
  if (token && sessions.has(token)) {
    const user = sessions.get(token);
    sessions.delete(token);
    console.log(`[AUTH] Logout: ${user.email}`);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
app.get('/auth/me', (req, res) => {
  const token = getTokenFromHeader(req);
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
  const { id, email, name, role } = sessions.get(token);
  res.json({ success: true, user: { id, email, name, role } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI Chat Proxy (Groq / Claude endpoint)
// ═══════════════════════════════════════════════════════════════════════════════

// Security: input validation helper
function validateMessages(messages) {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0 || messages.length > 50) return false;
  for (const msg of messages) {
    if (typeof msg !== 'object' || !msg) return false;
    if (!['user', 'assistant', 'system'].includes(msg.role)) return false;
    if (typeof msg.content !== 'string') return false;
    if (msg.content.length > 8000) return false;
  }
  return true;
}

app.post('/claude', (req, res) => {
  const { messages } = req.body || {};

  // Security: validate input before forwarding to external API
  if (!validateMessages(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages must be a non-empty array with valid roles and string content' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: messages,
    max_tokens: 2000,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`, // nosemgrep: generic.secrets.security.detected-authorization-bearer-token
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.choices || !parsed.choices[0] || !parsed.choices[0].message) {
          return res.status(502).json({ error: 'Unexpected response from AI service' });
        }
        const text = parsed.choices[0].message.content;
        res.json({ content: [{ text }] });
      } catch (e) {
        // Security: do not echo raw upstream response to client
        res.status(502).json({ error: 'Failed to parse AI service response' });
      }
    });
  });

  apiReq.on('error', () => {
    // Security: do not expose internal error details
    res.status(503).json({ error: 'AI service unavailable' });
  });

  // Security: enforce request timeout
  apiReq.setTimeout(30000, () => {
    apiReq.destroy();
    res.status(504).json({ error: 'Request timed out' });
  });

  apiReq.write(body);
  apiReq.end();
});

// ── Security: reject unknown routes ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(3001, '127.0.0.1', () => {
  console.log('Proxy ready at http://localhost:3001');
  console.log('Auth endpoints: POST /auth/login | POST /auth/logout | GET /auth/me');
});

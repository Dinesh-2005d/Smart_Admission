import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Backend URL ──────────────────────────────────────────────────────────────
// Points to our Express proxy server running on localhost
const API_BASE = 'http://localhost:3001';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [checking, setChecking] = useState(false); // session restore in progress

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return { success: false };
      }
    } catch (err) {
      // Backend not reachable — fall back to demo credentials
      return loginDemo(email, password);
    }
  };

  // ── Demo fallback (when backend is offline) ───────────────────────────────
  const DEMO_USERS = [
    { id: 1, email: 'admin@smartcampus.ai',   password: 'Smart@2024',  name: 'Admin User',   role: 'Admin'   },
    { id: 2, email: 'student@smartcampus.ai', password: 'Student@123', name: 'Demo Student', role: 'Student' },
  ];

  const loginDemo = async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ id: found.id, email: found.email, name: found.name, role: found.role });
      setToken('demo-token');
      setLoading(false);
      return { success: true };
    }
    setError('Invalid email or password.\nTry: admin@smartcampus.ai / Smart@2024');
    setLoading(false);
    return { success: false };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (token && token !== 'demo-token') {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_) {
        // silent — network error on logout is OK
      }
    }
    setUser(null);
    setToken(null);
    setError(null);
  };

  // ── Verify session (called on app resume) ─────────────────────────────────
  const verifySession = async (currentToken) => {
    if (!currentToken || currentToken === 'demo-token') return;
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        setUser(null);
        setToken(null);
      }
    } catch (_) {
      // backend offline — keep current user state
    } finally {
      setChecking(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, checking, login, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

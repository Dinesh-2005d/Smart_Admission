import React, { createContext, useContext, useState } from 'react';
import Constants from 'expo-constants';

// ─── Backend Auth Server URL ──────────────────────────────────────────────────
// LOCAL DEV : http://localhost:3002
// PRODUCTION: Set authServerUrl in app.json → expo.extra.authServerUrl
//             OR replace the fallback URL below with your Railway/Render URL
const AUTH_BASE =
  Constants.expoConfig?.extra?.authServerUrl ||
  'http://localhost:3002';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Helper ────────────────────────────────────────────────────────────────
  const authFetch = async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res  = await fetch(`${AUTH_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (email, password, name) => {
    setLoading(true); setError(null);
    try {
      const { ok, data } = await authFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      }
      setError(data.message || 'Registration failed');
      setLoading(false);
      return { success: false, message: data.message };
    } catch {
      setError('Cannot connect to server. Check your connection.');
      setLoading(false);
      return { success: false };
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const { ok, data } = await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      }
      setError(data.message || 'Invalid email or password');
      setLoading(false);
      return { success: false, message: data.message };
    } catch {
      setError('Cannot connect to server. Make sure auth-server.js is running.');
      setLoading(false);
      return { success: false };
    }
  };

  // ── Gmail Auto Login (no password — open access) ─────────────────────────
  const gmailAutoLogin = async (email, name) => {
    setLoading(true); setError(null);
    try {
      const { ok, data } = await authFetch('/auth/gmail-auto', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), name: name || '' }),
      });
      if (ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true, isNew: data.isNew };
      }
      setError(data.message || 'Login failed. Please try again.');
      setLoading(false);
      return { success: false, message: data.message };
    } catch {
      setError('Cannot connect to server. Make sure auth-server.js is running.');
      setLoading(false);
      return { success: false };
    }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const googleLogin = async (idToken) => {
    setLoading(true); setError(null);
    try {
      const { ok, data } = await authFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      if (ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      }
      setError(data.message || 'Google sign-in failed');
      setLoading(false);
      return { success: false, message: data.message };
    } catch {
      setError('Cannot connect to server.');
      setLoading(false);
      return { success: false };
    }
  };

  // ── Forgot Password — send OTP ────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const { ok, data } = await authFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      return { success: ok, message: data.message };
    } catch {
      return { success: false, message: 'Server error. Try again.' };
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = async (email, otp) => {
    try {
      const { ok, data } = await authFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      return { success: ok, message: data.message };
    } catch {
      return { success: false, message: 'Server error. Try again.' };
    }
  };

  // ── Reset Password ────────────────────────────────────────────────────────
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const { ok, data } = await authFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp, newPassword }),
      });
      return { success: ok, message: data.message };
    } catch {
      return { success: false, message: 'Server error. Try again.' };
    }
  };

  // ── Change Password (logged in) ───────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { ok, data } = await authFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return { success: ok, message: data.message };
    } catch {
      return { success: false, message: 'Server error. Try again.' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authFetch('/auth/logout', { method: 'POST' });
    } catch { /* silent */ }
    setUser(null);
    setToken(null);
    setError(null);
  };

  // ── Admin: get all users ──────────────────────────────────────────────────
  const adminGetUsers = async () => {
    const { ok, data } = await authFetch('/admin/users');
    return ok ? data.users : [];
  };

  // ── Admin: block user ─────────────────────────────────────────────────────
  const adminBlockUser = async (userId) => {
    const { ok, data } = await authFetch('/admin/block', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return { success: ok, message: data.message };
  };

  // ── Admin: unblock user ───────────────────────────────────────────────────
  const adminUnblockUser = async (userId) => {
    const { ok, data } = await authFetch('/admin/unblock', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return { success: ok, message: data.message };
  };

  // ── Admin: delete user ────────────────────────────────────────────────────
  const adminDeleteUser = async (userId) => {
    const { ok, data } = await authFetch(`/admin/user/${userId}`, { method: 'DELETE' });
    return { success: ok, message: data.message };
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      register, login, gmailAutoLogin, googleLogin,
      forgotPassword, verifyOtp, resetPassword, changePassword,
      logout,
      adminGetUsers, adminBlockUser, adminUnblockUser, adminDeleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

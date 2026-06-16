import React, { createContext, useContext, useState } from 'react';

// ─── Demo Accounts ────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { email: 'admin@smartcampus.ai', password: 'Smart@2024', name: 'Admin User', role: 'Admin' },
  { email: 'student@smartcampus.ai', password: 'Student@123', name: 'Demo Student', role: 'Student' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      setUser({ email: found.email, name: found.name, role: found.role });
      setLoading(false);
      return { success: true };
    } else {
      setError('Invalid email or password. Try admin@smartcampus.ai / Smart@2024');
      setLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

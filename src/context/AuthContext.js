import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocs,
  collection, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ─── Admin email (always gets Admin role) ─────────────────────────────────────
const ADMIN_EMAIL = 'dineshr2209.sse@saveetha.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Listen for Firebase auth state changes ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load profile from Firestore
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const profile = snap.data();
            if (profile.blocked) {
              // Blocked user — sign them out immediately
              await signOut(auth);
              setUser(null);
              setError('Account suspended. Contact admin.');
            } else {
              // ── Always enforce Admin role for the admin email ──────────────
              const isAdminEmail =
                (firebaseUser.email || '').trim().toLowerCase() === ADMIN_EMAIL;
              const finalProfile = isAdminEmail
                ? { ...profile, role: 'Admin' }
                : profile;
              // If role in Firestore is wrong, silently fix it
              if (isAdminEmail && profile.role !== 'Admin') {
                updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'Admin' }).catch(() => {});
              }
              setUser({ uid: firebaseUser.uid, ...finalProfile });
            }
          } else {
            // Firestore doc missing — create a minimal one so the admin can log in
            const isAdminEmail =
              (firebaseUser.email || '').trim().toLowerCase() === ADMIN_EMAIL;
            const fallbackProfile = {
              uid:      firebaseUser.uid,
              name:     firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email:    firebaseUser.email.trim().toLowerCase(),
              role:     isAdminEmail ? 'Admin' : 'Student',
              blocked:  false,
              provider: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), fallbackProfile);
            setUser(fallbackProfile);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (email, password, name) => {
    setLoading(true); setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const role = email.trim().toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student';
      const profile = {
        uid:       cred.user.uid,
        name:      name || email.split('@')[0],
        email:     email.trim().toLowerCase(),
        role,
        blocked:   false,
        provider:  'email',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setUser(profile);
      setLoading(false);
      return { success: true };
    } catch (e) {
      const msg = firebaseError(e.code);
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Check blocked status in Firestore
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists() && snap.data().blocked) {
        await signOut(auth);
        setLoading(false);
        setError('Account suspended. Contact admin.');
        return { success: false, message: 'Account suspended. Contact admin.' };
      }
      // ── Enforce Admin role for the admin email ─────────────────────────────
      // onAuthStateChanged will handle setting user with correct role.
      // But if Firestore has wrong role, fix it immediately.
      if (snap.exists()) {
        const profile = snap.data();
        const isAdminEmail = email.trim().toLowerCase() === ADMIN_EMAIL;
        if (isAdminEmail && profile.role !== 'Admin') {
          await updateDoc(doc(db, 'users', cred.user.uid), { role: 'Admin' });
        }
      }
      setLoading(false);
      return { success: true };
    } catch (e) {
      const msg = firebaseError(e.code);
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setError(null);
  };

  // ── Forgot Password (Firebase reset email) ────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const actionCodeSettings = {
        // After the user clicks the reset link, redirect them back to the app.
        // Must be added to Firebase Console → Authentication → Authorized domains.
        url: 'https://dinesh-2005d.github.io/Smart_Admission/',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox (and Spam/Junk folder) for an email from noreply@smartadmission.firebaseapp.com',
      };
    } catch (e) {
      const msg = firebaseError(e.code);
      return { success: false, message: msg };
    }
  };

  // ── Admin: get all users ──────────────────────────────────────────────────
  const adminGetUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  };

  // ── Admin: block user ─────────────────────────────────────────────────────
  const adminBlockUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { blocked: true });
      return { success: true, message: 'User blocked successfully' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // ── Admin: unblock user ───────────────────────────────────────────────────
  const adminUnblockUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { blocked: false });
      return { success: true, message: 'User unblocked successfully' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // ── Admin: delete user ────────────────────────────────────────────────────
  const adminDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true, message: 'User removed successfully' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      forgotPassword,
      adminGetUsers,
      adminBlockUser,
      adminUnblockUser,
      adminDeleteUser,
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

// ── Firebase error → friendly message ─────────────────────────────────────────
function firebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':    return 'This email is already registered.';
    case 'auth/invalid-email':           return 'Invalid email address.';
    case 'auth/weak-password':           return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':          return 'No account found with this email.';
    case 'auth/wrong-password':          return 'Incorrect password.';
    case 'auth/invalid-credential':      return 'Invalid email or password.';
    case 'auth/too-many-requests':       return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':  return 'Network error. Check your connection.';
    default:                             return 'Something went wrong. Try again.';
  }
}

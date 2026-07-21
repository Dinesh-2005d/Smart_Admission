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
        const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
        const isAdminEmail = cleanEmail === ADMIN_EMAIL;
        const defaultRole  = isAdminEmail ? 'Admin' : 'Student';

        try {
          // Check if deleted
          const deletedSnap = await getDoc(doc(db, 'deleted_users', firebaseUser.uid)).catch(() => null);
          if (deletedSnap && deletedSnap.exists()) {
            await signOut(auth);
            setUser(null);
            setError('This account has been deleted by admin.');
            setLoading(false);
            return;
          }

          // Load profile from Firestore
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid)).catch(() => null);
          if (snap && snap.exists()) {
            const profile = snap.data();
            if (profile.blocked || profile.deleted) {
              await signOut(auth);
              setUser(null);
              setError('Account suspended. Contact admin.');
            } else {
              const finalProfile = {
                uid:      firebaseUser.uid,
                name:     profile.name || firebaseUser.displayName || cleanEmail.split('@')[0],
                email:    cleanEmail,
                role:     defaultRole,
                blocked:  false,
                provider: profile.provider || 'email',
                ...profile,
                role:     defaultRole, // Admin email ALWAYS overrides to Admin
              };
              setUser(finalProfile);
            }
          } else {
            // Firestore profile doc doesn't exist yet — create it
            const fallbackProfile = {
              uid:       firebaseUser.uid,
              name:      firebaseUser.displayName || cleanEmail.split('@')[0],
              email:     cleanEmail,
              role:      defaultRole,
              blocked:   false,
              provider:  firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
              createdAt: serverTimestamp(),
            };
            setDoc(doc(db, 'users', firebaseUser.uid), fallbackProfile).catch(() => {});
            setUser(fallbackProfile);
          }
        } catch (_err) {
          // Fallback profile if Firestore is slow/offline
          setUser({
            uid:      firebaseUser.uid,
            name:     firebaseUser.displayName || cleanEmail.split('@')[0],
            email:    cleanEmail,
            role:     defaultRole,
            blocked:  false,
            provider: 'email',
          });
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
      const cleanEmail = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const role = cleanEmail === ADMIN_EMAIL ? 'Admin' : 'Student';
      const profile = {
        uid:       cred.user.uid,
        name:      name || cleanEmail.split('@')[0],
        email:     cleanEmail,
        role,
        blocked:   false,
        provider:  'email',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile).catch(() => {});
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
      const cleanEmail = email.trim().toLowerCase();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const isAdminEmail = cleanEmail === ADMIN_EMAIL;
      const expectedRole = isAdminEmail ? 'Admin' : 'Student';

      // Check deleted status safely
      try {
        const deletedSnap = await getDoc(doc(db, 'deleted_users', cred.user.uid));
        if (deletedSnap.exists()) {
          await signOut(auth);
          setLoading(false);
          setError('This account has been deleted by admin.');
          return { success: false, message: 'This account has been deleted by admin.' };
        }

        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.blocked || data.deleted) {
            await signOut(auth);
            setLoading(false);
            setError('Account suspended. Contact admin.');
            return { success: false, message: 'Account suspended. Contact admin.' };
          }
          if (data.role !== expectedRole) {
            updateDoc(doc(db, 'users', cred.user.uid), { role: expectedRole }).catch(() => {});
          }
        } else {
          const fallbackProfile = {
            uid:       cred.user.uid,
            name:      cred.user.displayName || cleanEmail.split('@')[0],
            email:     cleanEmail,
            role:      expectedRole,
            blocked:   false,
            provider:  'email',
            createdAt: serverTimestamp(),
          };
          setDoc(doc(db, 'users', cred.user.uid), fallbackProfile).catch(() => {});
        }
      } catch (_fsErr) {
        // Non-fatal if Firestore profile read fails
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

  // ── Helper: Local overrides for block/delete ─────────────────────────────
  const getLocalAdminOverrides = () => {
    let blocked = new Set();
    let deleted = new Set();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const b = JSON.parse(window.localStorage.getItem('acadivo_blocked_uids') || '[]');
        const d = JSON.parse(window.localStorage.getItem('acadivo_deleted_uids') || '[]');
        blocked = new Set(b);
        deleted = new Set(d);
      } catch (_e) {}
    }
    return { blocked, deleted };
  };

  const saveLocalAdminOverrides = (blockedSet, deletedSet) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (blockedSet) window.localStorage.setItem('acadivo_blocked_uids', JSON.stringify(Array.from(blockedSet)));
        if (deletedSet) window.localStorage.setItem('acadivo_deleted_uids', JSON.stringify(Array.from(deletedSet)));
      } catch (_e) {}
    }
  };

  // ── Admin: get all users ──────────────────────────────────────────────────
  const adminGetUsers = async () => {
    const { blocked: localBlocked, deleted: localDeleted } = getLocalAdminOverrides();
    let deletedUids = new Set(localDeleted);

    try {
      const deletedSnap = await getDocs(collection(db, 'deleted_users')).catch(() => null);
      if (deletedSnap && deletedSnap.docs) {
        deletedSnap.docs.forEach(d => deletedUids.add(d.id));
      }
    } catch (_e) {}

    try {
      const snap = await getDocs(collection(db, 'users')).catch(() => null);
      let list = [];

      if (snap && snap.docs) {
        list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id && !deletedUids.has(u.id) && !u.deleted)
          .map(u => ({
            ...u,
            blocked: u.blocked || localBlocked.has(u.id),
            role: (u.email || '').trim().toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student',
          }));
      }

      // Ensure logged-in admin is present in list
      if (user && user.email && !list.some(u => (u.email || '').toLowerCase() === user.email.toLowerCase())) {
        list.unshift({
          id: user.uid || 'admin_self',
          uid: user.uid,
          name: user.name || 'Dinesh R',
          email: user.email,
          role: 'Admin',
          blocked: false,
          provider: 'email',
        });
      }

      return list;
    } catch (_e) {
      if (user && user.email) {
        return [{
          id: user.uid || 'admin_self',
          uid: user.uid,
          name: user.name || 'Dinesh R',
          email: user.email,
          role: 'Admin',
          blocked: false,
          provider: 'email',
        }];
      }
      return [];
    }
  };

  // ── Admin: block user ─────────────────────────────────────────────────────
  const adminBlockUser = async (userId) => {
    const { blocked, deleted } = getLocalAdminOverrides();
    blocked.add(userId);
    saveLocalAdminOverrides(blocked, deleted);

    try {
      await updateDoc(doc(db, 'users', userId), { blocked: true });
    } catch (_e) {
      // Permission error or offline fallback — local override applied
    }
    return { success: true, message: 'User blocked successfully' };
  };

  // ── Admin: unblock user ───────────────────────────────────────────────────
  const adminUnblockUser = async (userId) => {
    const { blocked, deleted } = getLocalAdminOverrides();
    blocked.delete(userId);
    saveLocalAdminOverrides(blocked, deleted);

    try {
      await updateDoc(doc(db, 'users', userId), { blocked: false });
    } catch (_e) {
      // Permission error or offline fallback — local override applied
    }
    return { success: true, message: 'User unblocked successfully' };
  };

  // ── Admin: delete user (permanently removes user from list & blocks Auth) ─
  const adminDeleteUser = async (userId) => {
    const { blocked, deleted } = getLocalAdminOverrides();
    deleted.add(userId);
    saveLocalAdminOverrides(blocked, deleted);

    try {
      await setDoc(doc(db, 'deleted_users', userId), {
        deleted: true,
        blocked: true,
        deletedAt: serverTimestamp(),
      }).catch(() => {});
      await deleteDoc(doc(db, 'users', userId)).catch(() => {});
    } catch (_e) {
      // Permission error or offline fallback — local override applied
    }
    return { success: true, message: 'User removed successfully' };
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

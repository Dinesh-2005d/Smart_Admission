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

  // ── Helper: Local & Persistent Overrides ─────────────────────────────────
  const getLocalAdminOverrides = () => {
    let blocked = new Set();
    let deleted = new Set();
    let deletedEmails = new Set();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const b = JSON.parse(window.localStorage.getItem('acadivo_blocked_uids') || '[]');
        const d = JSON.parse(window.localStorage.getItem('acadivo_deleted_uids') || '[]');
        const e = JSON.parse(window.localStorage.getItem('acadivo_deleted_emails') || '[]');
        blocked = new Set(b);
        deleted = new Set(d);
        deletedEmails = new Set(e.map(x => (x || '').toLowerCase()));
      } catch (_e) {}
    }
    return { blocked, deleted, deletedEmails };
  };

  const saveLocalAdminOverrides = (blockedSet, deletedSet, deletedEmailsSet) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (blockedSet) window.localStorage.setItem('acadivo_blocked_uids', JSON.stringify(Array.from(blockedSet)));
        if (deletedSet) window.localStorage.setItem('acadivo_deleted_uids', JSON.stringify(Array.from(deletedSet)));
        if (deletedEmailsSet) window.localStorage.setItem('acadivo_deleted_emails', JSON.stringify(Array.from(deletedEmailsSet)));
      } catch (_e) {}
    }
  };

  // ── Listen for Firebase auth state changes ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
        const isAdminEmail = cleanEmail === ADMIN_EMAIL;
        const defaultRole  = isAdminEmail ? 'Admin' : 'Student';
        const { blocked: localBlocked, deleted: localDeleted, deletedEmails: localDeletedEmails } = getLocalAdminOverrides();

        // Immediate rejection if email or UID was deleted by admin
        if (localDeleted.has(firebaseUser.uid) || localDeletedEmails.has(cleanEmail) || localBlocked.has(firebaseUser.uid)) {
          await signOut(auth);
          setUser(null);
          setError('This account has been deleted or blocked by admin.');
          setLoading(false);
          return;
        }

        try {
          // Check Firestore deleted_users & deleted_emails
          const deletedSnap = await getDoc(doc(db, 'deleted_users', firebaseUser.uid)).catch(() => null);
          const deletedEmailSnap = await getDoc(doc(db, 'deleted_emails', cleanEmail)).catch(() => null);

          if ((deletedSnap && deletedSnap.exists()) || (deletedEmailSnap && deletedEmailSnap.exists())) {
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
                blocked:  false,
                provider: profile.provider || 'email',
                ...profile,
                role:     defaultRole, // Admin email ALWAYS overrides to Admin
              };
              setUser(finalProfile);
            }
          } else {
            // Firestore profile doc doesn't exist yet — create it as active user
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
      const { deletedEmails, deleted } = getLocalAdminOverrides();
      if (deletedEmails.has(cleanEmail)) {
        setLoading(false);
        setError('This email address has been deleted by admin.');
        return { success: false, message: 'This email address has been deleted by admin.' };
      }

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
      const { blocked: localBlocked, deleted: localDeleted, deletedEmails: localDeletedEmails } = getLocalAdminOverrides();

      if (localDeletedEmails.has(cleanEmail)) {
        await signOut(auth).catch(() => {});
        setLoading(false);
        setError('This account has been deleted by admin.');
        return { success: false, message: 'This account has been deleted by admin.' };
      }

      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const isAdminEmail = cleanEmail === ADMIN_EMAIL;
      const expectedRole = isAdminEmail ? 'Admin' : 'Student';

      if (localDeleted.has(cred.user.uid) || localBlocked.has(cred.user.uid)) {
        await signOut(auth);
        setLoading(false);
        setError('Account suspended. Contact admin.');
        return { success: false, message: 'Account suspended. Contact admin.' };
      }

      // Check deleted & blocked status in Firestore
      try {
        const deletedSnap = await getDoc(doc(db, 'deleted_users', cred.user.uid)).catch(() => null);
        const deletedEmailSnap = await getDoc(doc(db, 'deleted_emails', cleanEmail)).catch(() => null);

        if ((deletedSnap && deletedSnap.exists()) || (deletedEmailSnap && deletedEmailSnap.exists())) {
          await signOut(auth);
          setLoading(false);
          setError('This account has been deleted by admin.');
          return { success: false, message: 'This account has been deleted by admin.' };
        }

        const snap = await getDoc(doc(db, 'users', cred.user.uid)).catch(() => null);
        if (snap && snap.exists()) {
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
        }
      } catch (_fsErr) {}

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

  // ── Forgot Password ───────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const actionCodeSettings = {
        url: 'https://dinesh-2005d.github.io/Smart_Admission/',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox for an email from noreply@smartadmission.firebaseapp.com',
      };
    } catch (e) {
      const msg = firebaseError(e.code);
      return { success: false, message: msg };
    }
  };

  // ── Admin: get all users ──────────────────────────────────────────────────
  const adminGetUsers = async () => {
    const { blocked: localBlocked, deleted: localDeleted, deletedEmails: localDeletedEmails } = getLocalAdminOverrides();
    let deletedUids = new Set(localDeleted);
    let deletedEmails = new Set(localDeletedEmails);

    try {
      const deletedSnap = await getDocs(collection(db, 'deleted_users')).catch(() => null);
      if (deletedSnap && deletedSnap.docs) {
        deletedSnap.docs.forEach(d => deletedUids.add(d.id));
      }
      const deletedEmailsSnap = await getDocs(collection(db, 'deleted_emails')).catch(() => null);
      if (deletedEmailsSnap && deletedEmailsSnap.docs) {
        deletedEmailsSnap.docs.forEach(d => deletedEmails.add(d.id.toLowerCase()));
      }
    } catch (_e) {}

    try {
      const snap = await getDocs(collection(db, 'users')).catch(() => null);
      let list = [];

      if (snap && snap.docs) {
        list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => {
            const email = (u.email || '').toLowerCase();
            return u.id && !deletedUids.has(u.id) && !deletedEmails.has(email) && !u.deleted;
          })
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
  const adminBlockUser = async (userObj) => {
    const userId = typeof userObj === 'object' ? userObj.id || userObj.uid : userObj;
    const { blocked, deleted, deletedEmails } = getLocalAdminOverrides();
    blocked.add(userId);
    saveLocalAdminOverrides(blocked, deleted, deletedEmails);

    try {
      await updateDoc(doc(db, 'users', userId), { blocked: true });
    } catch (_e) {}
    return { success: true, message: 'User blocked successfully' };
  };

  // ── Admin: unblock user ───────────────────────────────────────────────────
  const adminUnblockUser = async (userObj) => {
    const userId = typeof userObj === 'object' ? userObj.id || userObj.uid : userObj;
    const { blocked, deleted, deletedEmails } = getLocalAdminOverrides();
    blocked.delete(userId);
    saveLocalAdminOverrides(blocked, deleted, deletedEmails);

    try {
      await updateDoc(doc(db, 'users', userId), { blocked: false });
    } catch (_e) {}
    return { success: true, message: 'User unblocked successfully' };
  };

  // ── Admin: delete user ────────────────────────────────────────────────────
  const adminDeleteUser = async (userObj) => {
    const userId = typeof userObj === 'object' ? userObj.id || userObj.uid : userObj;
    const email = typeof userObj === 'object' ? (userObj.email || '').toLowerCase() : '';

    const { blocked, deleted, deletedEmails } = getLocalAdminOverrides();
    deleted.add(userId);
    if (email) deletedEmails.add(email);
    saveLocalAdminOverrides(blocked, deleted, deletedEmails);

    try {
      // Mark as permanently blocked/deleted in users collection (prevents missing doc reset)
      await updateDoc(doc(db, 'users', userId), { blocked: true, deleted: true, status: 'blocked' }).catch(() => {});

      // Record in deleted_users and deleted_emails
      await setDoc(doc(db, 'deleted_users', userId), { deleted: true, blocked: true, email, deletedAt: serverTimestamp() }).catch(() => {});
      if (email) {
        await setDoc(doc(db, 'deleted_emails', email), { deleted: true, blocked: true, uid: userId, deletedAt: serverTimestamp() }).catch(() => {});
      }
    } catch (_e) {}

    return { success: true, message: 'User permanently deleted and blocked' };
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

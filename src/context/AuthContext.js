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

// ── Known Firebase Auth users list for automatic initial synchronization ────
const INITIAL_FIREBASE_USERS = [
  { uid: '8sB5yRkGoJMJie6FEkvRJ3yl9', email: 'dineshr2209.sse@saveetha.com', name: 'Dinesh R', role: 'Admin' },
  { uid: 'MvSNo8zTdmgzPToo4Lh6egK2', email: 'dineshramesh2899@gmail.com', name: 'Jagan', role: 'Student' },
  { uid: 'Rv9FE0vQmpaqT2BbfX10BzJk2', email: 'deepandee132@gmail.com', name: 'Deepan', role: 'Student' },
  { uid: 'jG6A9QuHYIaIScSx56jG65jwel2', email: 'text123@gmail.com', name: 'abc', role: 'Student' },
  { uid: 'KNmfC1zDfsar7owNC87Uletik2', email: 'test@example.com', name: 'Test User', role: 'Student' },
  { uid: 'RuElYqYQ3Qh1zoegvuH8lisssr2', email: 'kishorecht149@gmail.com', name: 'Kishore', role: 'Student' },
  { uid: 'zYLXOemOy7WWvGwVQyKD', email: 'testuser_unique_123@example.com', name: 'Test User 123', role: 'Student' },
  { uid: 'BdNZQ7K9cpVvN9AcRqfog1E3', email: 'admin@example.com', name: 'Admin Example', role: 'Student' },
  { uid: 'kALtztbcfNe60yXuelmeCrVgi2', email: 'shdgg36@gmail.com', name: 'Shdgg User', role: 'Student' },
];

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Listen for Firebase auth state changes ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user was deleted
        try {
          const deletedSnap = await getDoc(doc(db, 'deleted_users', firebaseUser.uid));
          if (deletedSnap.exists()) {
            await signOut(auth);
            setUser(null);
            setError('This account has been deleted by admin.');
            setLoading(false);
            return;
          }

          // Load profile from Firestore
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const profile = snap.data();
            if (profile.blocked || profile.deleted) {
              // Blocked user — sign them out immediately
              await signOut(auth);
              setUser(null);
              setError('Account suspended. Contact admin.');
            } else {
              // ── STRICT: Only dineshr2209.sse@saveetha.com can be Admin ──────
              const isAdminEmail =
                (firebaseUser.email || '').trim().toLowerCase() === ADMIN_EMAIL;
              const finalRole = isAdminEmail ? 'Admin' : 'Student';
              const finalProfile = { ...profile, role: finalRole };

              if (profile.role !== finalRole) {
                updateDoc(doc(db, 'users', firebaseUser.uid), { role: finalRole }).catch(() => {});
              }
              setUser({ uid: firebaseUser.uid, ...finalProfile });
            }
          } else {
            // Firestore doc missing — create a minimal one
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
      // STRICT: Only dineshr2209.sse@saveetha.com is Admin
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
      // Check deleted status
      const deletedSnap = await getDoc(doc(db, 'deleted_users', cred.user.uid));
      if (deletedSnap.exists()) {
        await signOut(auth);
        setLoading(false);
        setError('This account has been deleted by admin.');
        return { success: false, message: 'This account has been deleted by admin.' };
      }

      // Check blocked status in Firestore
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists() && (snap.data().blocked || snap.data().deleted)) {
        await signOut(auth);
        setLoading(false);
        setError('Account suspended. Contact admin.');
        return { success: false, message: 'Account suspended. Contact admin.' };
      }
      // ── STRICT: Enforce Admin role ONLY for dineshr2209.sse@saveetha.com ───
      if (snap.exists()) {
        const profile = snap.data();
        const isAdminEmail = email.trim().toLowerCase() === ADMIN_EMAIL;
        const expectedRole = isAdminEmail ? 'Admin' : 'Student';
        if (profile.role !== expectedRole) {
          await updateDoc(doc(db, 'users', cred.user.uid), { role: expectedRole });
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

  // ── Admin: get all users (syncs Firebase Auth & Firestore) ───────────────
  const adminGetUsers = async () => {
    try {
      // 1. Fetch deleted users list to filter out
      const deletedSnap = await getDocs(collection(db, 'deleted_users'));
      const deletedUids = new Set(deletedSnap.docs.map(d => d.id));

      // 2. Fetch existing Firestore user docs
      const snap = await getDocs(collection(db, 'users'));
      const existingMap = {};
      snap.docs.forEach(d => {
        existingMap[d.id] = { id: d.id, ...d.data() };
      });

      // 3. Ensure all initial Firebase Auth accounts exist in Firestore if not deleted
      for (const initUser of INITIAL_FIREBASE_USERS) {
        if (!deletedUids.has(initUser.uid) && !existingMap[initUser.uid]) {
          const profile = {
            uid: initUser.uid,
            name: initUser.name,
            email: initUser.email,
            role: initUser.email.toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student',
            blocked: false,
            provider: 'email',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', initUser.uid), profile).catch(() => {});
          existingMap[initUser.uid] = { id: initUser.uid, ...profile };
        }
      }

      // 4. Return formatted users list, strictly enforcing single admin (dineshr2209.sse@saveetha.com)
      const list = Object.values(existingMap)
        .filter(u => !deletedUids.has(u.id) && !u.deleted)
        .map(u => ({
          ...u,
          role: (u.email || '').trim().toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Student',
        }));

      return list;
    } catch (_e) {
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

  // ── Admin: delete user (permanently removes from Firestore & blocks Auth) ─
  const adminDeleteUser = async (userId) => {
    try {
      // 1. Mark in deleted_users collection so authentication is permanently blocked
      await setDoc(doc(db, 'deleted_users', userId), {
        deleted: true,
        blocked: true,
        deletedAt: serverTimestamp(),
      });

      // 2. Remove document from users collection
      await deleteDoc(doc(db, 'users', userId));
      return { success: true, message: 'User removed successfully from Firebase' };
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';

// ── Fallback localStorage key for guest/unauthenticated users ────────────────
const GUEST_KEY = 'acadivo_saved_colleges_guest';

const GuestStorage = {
  get: () => {
    if (Platform.OS === 'web') {
      try {
        const raw = window.localStorage.getItem(GUEST_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    }
    return [];
  },
  set: (colleges) => {
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(GUEST_KEY, JSON.stringify(colleges)); } catch { /* ignore */ }
    }
  },
  clear: () => {
    if (Platform.OS === 'web') {
      try { window.localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    }
  },
};

const SavedCollegesContext = createContext(null);

export function SavedCollegesProvider({ children }) {
  const [savedColleges, setSavedColleges] = useState([]);
  const [currentUid, setCurrentUid] = useState(null);

  // ── Helper: get user's Firestore doc ref ──────────────────────────────────
  const userDocRef = (uid) => doc(db, 'users', uid);

  // ── Load saved colleges whenever auth changes ─────────────────────────────
  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up any previous snapshot listener
      if (unsubSnapshot) { unsubSnapshot(); unsubSnapshot = null; }

      if (firebaseUser) {
        setCurrentUid(firebaseUser.uid);
        // Real-time listener on user's Firestore doc
        unsubSnapshot = onSnapshot(
          userDocRef(firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setSavedColleges(data.savedColleges || []);
            } else {
              // First time: initialise doc with empty list
              setDoc(userDocRef(firebaseUser.uid), { savedColleges: [] }, { merge: true })
                .catch(() => {});
              setSavedColleges([]);
            }
          },
          () => {
            // Firestore read error — fall back to empty
            setSavedColleges([]);
          }
        );
      } else {
        // Not logged in — load from guest localStorage
        setCurrentUid(null);
        setSavedColleges(GuestStorage.get());
      }
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  // ── issaved ────────────────────────────────────────────────────────────────
  const issaved = useCallback(
    (college) => savedColleges.some((c) => c.name === college.name),
    [savedColleges]
  );

  // ── toggleSave ─────────────────────────────────────────────────────────────
  const toggleSave = useCallback(async (college) => {
    if (currentUid) {
      // Logged-in: update Firestore
      const ref = userDocRef(currentUid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? (snap.data().savedColleges || []) : [];
      const alreadySaved = existing.some((c) => c.name === college.name);

      if (alreadySaved) {
        // Remove — Firestore arrayRemove matches by exact object; use filter instead
        const updated = existing.filter((c) => c.name !== college.name);
        await updateDoc(ref, { savedColleges: updated });
      } else {
        // Add — use arrayUnion-style update
        const updated = [...existing, college];
        await updateDoc(ref, { savedColleges: updated });
      }
    } else {
      // Guest: update localStorage
      const current = GuestStorage.get();
      const alreadySaved = current.some((c) => c.name === college.name);
      const updated = alreadySaved
        ? current.filter((c) => c.name !== college.name)
        : [...current, college];
      GuestStorage.set(updated);
      setSavedColleges(updated);
    }
  }, [currentUid]);

  // ── clearAll ───────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    if (currentUid) {
      // Clear Firestore list for this user
      try {
        await updateDoc(userDocRef(currentUid), { savedColleges: [] });
        // onSnapshot will update state automatically
      } catch (e) {
        // If doc doesn't exist yet, create it
        await setDoc(userDocRef(currentUid), { savedColleges: [] }, { merge: true });
      }
    } else {
      // Guest: clear localStorage
      GuestStorage.clear();
      setSavedColleges([]);
    }
  }, [currentUid]);

  return (
    <SavedCollegesContext.Provider value={{ savedColleges, issaved, toggleSave, clearAll }}>
      {children}
    </SavedCollegesContext.Provider>
  );
}

export function useSavedColleges() {
  const ctx = useContext(SavedCollegesContext);
  if (!ctx) throw new Error('useSavedColleges must be used inside SavedCollegesProvider');
  return ctx;
}

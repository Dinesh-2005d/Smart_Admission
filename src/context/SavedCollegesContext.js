import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'smart_admission_saved_colleges';

// ── Cross-platform storage shim ─────────────────────────────────────────────
// Web  → localStorage  (works on GitHub Pages)
// Native → simple in-memory (AsyncStorage not installed; add the package later for persistence)
const Storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    return null; // native: start fresh (upgrade to AsyncStorage when package is added)
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
    }
  },
};

const SavedCollegesContext = createContext(null);

export function SavedCollegesProvider({ children }) {
  const [savedColleges, setSavedColleges] = useState([]);

  // Load on mount
  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSavedColleges(JSON.parse(raw)); } catch { /* ignore */ }
      }
    });
  }, []);

  // Persist on every change
  useEffect(() => {
    Storage.setItem(STORAGE_KEY, JSON.stringify(savedColleges));
  }, [savedColleges]);

  const issaved = useCallback(
    (college) => savedColleges.some((c) => c.name === college.name),
    [savedColleges]
  );

  const toggleSave = useCallback((college) => {
    setSavedColleges((prev) =>
      prev.some((c) => c.name === college.name)
        ? prev.filter((c) => c.name !== college.name)
        : [...prev, college]
    );
  }, []);

  const clearAll = useCallback(() => setSavedColleges([]), []);

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


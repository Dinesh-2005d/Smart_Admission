/**
 * SearchHistoryContext.js
 * Dual-Sync (LocalStorage + Firestore) AI Search History Engine
 * Keyed strictly by Gmail account / user ID — 100% resilient across Web and Mobile.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query as firestoreQuery, orderBy, limit, writeBatch, serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const SearchHistoryContext = createContext(null);

const getLocalKey = (user) => {
  const identifier = (user?.email || user?.uid || 'guest').trim().toLowerCase();
  return `acadivo_search_history_${identifier}`;
};

const saveToLocalStorage = (user, items) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = getLocalKey(user);
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch (_e) {}
  }
};

const loadFromLocalStorage = (user) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = getLocalKey(user);
      const data = window.localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (_e) {}
  }
  return [];
};

export function SearchHistoryProvider({ children }) {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  const queriesRef = useCallback(() => {
    const key = (user?.email ? user.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') : null) || user?.uid;
    if (!key) return null;
    return collection(db, 'users', key, 'searchHistory');
  }, [user?.uid, user?.email]);

  const loadHistory = useCallback(async () => {
    if (!user?.uid && !user?.email) {
      setHistory([]);
      return;
    }
    setLoading(true);
    setError(null);

    const localItems = loadFromLocalStorage(user);
    if (localItems && localItems.length > 0) {
      setHistory(localItems);
    }

    try {
      const ref = queriesRef();
      if (ref) {
        const q = firestoreQuery(ref, orderBy('timestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs && docs.length > 0) {
          setHistory(docs);
          saveToLocalStorage(user, docs);
        }
      }
    } catch (e) {
      console.warn('Firestore loadHistory warning:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user, queriesRef]);

  // Real-time Firestore Push Listener for live Search History sync across Web & Mobile
  useEffect(() => {
    if (!user?.uid && !user?.email) {
      setHistory([]);
      return;
    }

    const localItems = loadFromLocalStorage(user);
    if (localItems && localItems.length > 0) {
      setHistory(localItems);
    }

    try {
      const ref = queriesRef();
      if (ref) {
        const q = firestoreQuery(ref, orderBy('timestamp', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snap) => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (docs && docs.length > 0) {
            setHistory(docs);
            saveToLocalStorage(user, docs);
          }
        }, (err) => {
          console.warn('Firestore onSnapshot searchHistory info:', err.message);
        });

        return () => unsubscribe();
      }
    } catch (e) {
      console.warn('Firestore searchHistory onSnapshot init error:', e.message);
    }
  }, [user?.uid, user?.email, queriesRef]);

  const addSearch = useCallback(async (queryStr, crawlResults, sentimentResult) => {
    if (!user?.uid && !user?.email) return null;
    setError(null);

    const safeCrawl = (crawlResults || []).slice(0, 5).map(r => ({
      title:   r.title   || '',
      snippet: r.snippet || '',
      url:     r.url     || '',
      source:  r.source  || '',
    }));

    const docData = {
      query:                queryStr.trim(),
      userEmail:            user?.email || '',
      timestamp:            new Date().toISOString(),
      sentimentLabel:       sentimentResult?.label        || 'Neutral',
      sentimentScore:       sentimentResult?.score        || 0,
      sentimentNormalized:  sentimentResult?.normalizedScore || 0,
      sentimentKeywords:    (sentimentResult?.keywords    || []).slice(0, 10),
      positiveWords:        (sentimentResult?.positive    || []).slice(0, 6),
      negativeWords:        (sentimentResult?.negative    || []).slice(0, 6),
      crawlResults:         safeCrawl,
      combinedText:         (sentimentResult?.wordCount ? queryStr : '').slice(0, 100),
      wordCount:            sentimentResult?.wordCount    || 0,
      confidence:           sentimentResult?.confidence   || 0,
    };

    const searchId = `search_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const localEntry = { id: searchId, ...docData };

    setHistory(prev => {
      const updated = [localEntry, ...prev.filter(h => h.id !== searchId)];
      saveToLocalStorage(user, updated);
      return updated;
    });

    try {
      const ref = queriesRef();
      if (ref) {
        const docRef = await addDoc(ref, {
          ...docData,
          timestamp: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('Firestore addSearch background warning:', e.message);
    }
    return searchId;
  }, [user, queriesRef]);

  const deleteSearch = useCallback(async (id) => {
    if (!user?.uid && !user?.email) return;
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      saveToLocalStorage(user, updated);
      return updated;
    });
    try {
      const key = user?.uid || (user?.email ? user.email.replace(/[@.]/g, '_') : null);
      if (key) {
        await deleteDoc(doc(db, 'users', key, 'searchHistory', id));
      }
    } catch (e) {
      console.warn('Firestore deleteSearch warning:', e.message);
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user?.uid && !user?.email) return;
    setLoading(true);
    setHistory([]);
    saveToLocalStorage(user, []);
    try {
      const ref = queriesRef();
      if (ref) {
        const snap = await getDocs(ref);
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Firestore clearHistory warning:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user, queriesRef]);

  return (
    <SearchHistoryContext.Provider value={{
      history,
      loading,
      error,
      addSearch,
      loadHistory,
      deleteSearch,
      clearHistory,
    }}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const ctx = useContext(SearchHistoryContext);
  if (!ctx) throw new Error('useSearchHistory must be used inside SearchHistoryProvider');
  return ctx;
}

/**
 * SearchHistoryContext.js
 * Firestore-backed context for storing and retrieving AI search history.
 *
 * Firestore structure:
 *   searchHistory (collection)
 *     └── {userId} (document)
 *           └── queries (subcollection)
 *                 └── {queryId} (document)
 *                       ├── query: string
 *                       ├── timestamp: Timestamp
 *                       ├── sentimentLabel: string
 *                       ├── sentimentScore: number
 *                       ├── sentimentNormalized: number
 *                       ├── sentimentKeywords: Array
 *                       ├── positiveWords: Array
 *                       ├── negativeWords: Array
 *                       ├── crawlResults: Array (max 5 items stored)
 *                       └── combinedText: string (first 2000 chars)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query as firestoreQuery, orderBy, limit, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const SearchHistoryContext = createContext(null);

export function SearchHistoryProvider({ children }) {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  /** Returns the Firestore subcollection ref for this user's queries */
  const queriesRef = useCallback(() => {
    if (!user?.uid) return null;
    return collection(db, 'searchHistory', user.email || user.uid, 'queries');
  }, [user?.uid, user?.email]);

  /**
   * Save a new search to Firestore and prepend to local state.
   */
  const addSearch = useCallback(async (query, crawlResults, sentimentResult) => {
    if (!user?.uid) return null;
    setError(null);
    try {
      const ref = queriesRef();
      if (!ref) return null;

      // Store only the first 5 crawl results & cap text at 2000 chars
      const safeCrawl = (crawlResults || []).slice(0, 5).map(r => ({
        title:   r.title   || '',
        snippet: r.snippet || '',
        url:     r.url     || '',
        source:  r.source  || '',
      }));

      const docData = {
        query:                query.trim(),
        timestamp:            serverTimestamp(),
        sentimentLabel:       sentimentResult?.label        || 'Neutral',
        sentimentScore:       sentimentResult?.score        || 0,
        sentimentNormalized:  sentimentResult?.normalizedScore || 0,
        sentimentKeywords:    (sentimentResult?.keywords    || []).slice(0, 10),
        positiveWords:        (sentimentResult?.positive    || []).slice(0, 6),
        negativeWords:        (sentimentResult?.negative    || []).slice(0, 6),
        crawlResults:         safeCrawl,
        combinedText:         (sentimentResult?.wordCount ? query : '').slice(0, 100),
        wordCount:            sentimentResult?.wordCount    || 0,
        confidence:           sentimentResult?.confidence   || 0,
      };

      const docRef = await addDoc(ref, docData);

      // Prepend to local state (with resolved timestamp)
      const localEntry = {
        id: docRef.id,
        ...docData,
        timestamp: { toDate: () => new Date() },
      };
      setHistory(prev => [localEntry, ...prev]);
      return docRef.id;
    } catch (e) {
      setError('Failed to save search: ' + e.message);
      return null;
    }
  }, [user?.uid, queriesRef]);

  /**
   * Load the last 50 searches from Firestore.
   */
  const loadHistory = useCallback(async () => {
    if (!user?.uid) { setHistory([]); return; }
    setLoading(true); setError(null);
    try {
      const ref = queriesRef();
      if (!ref) { setHistory([]); setLoading(false); return; }

      const q   = firestoreQuery(ref, orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs);
    } catch (e) {
      setError('Failed to load history: ' + e.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, queriesRef]);

  /**
   * Delete a single search record from Firestore.
   */
  const deleteSearch = useCallback(async (id) => {
    if (!user?.uid) return;
    setError(null);
    try {
      await deleteDoc(doc(db, 'searchHistory', user.email || user.uid, 'queries', id));
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      setError('Failed to delete: ' + e.message);
    }
  }, [user?.uid, user?.email]);

  /**
   * Clear ALL search history for the current user.
   */
  const clearHistory = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true); setError(null);
    try {
      const ref  = queriesRef();
      if (!ref) return;
      const snap = await getDocs(ref);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setHistory([]);
    } catch (e) {
      setError('Failed to clear history: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, queriesRef]);

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

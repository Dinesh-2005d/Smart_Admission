/**
 * ChatHistoryContext.js
 * Dual-Sync (Firestore + LocalStorage) AI Chat Session History
 * Keyed strictly by Gmail account / user ID — 100% resilient across Web and Mobile.
 */

import React, {
  createContext, useContext, useState, useCallback, useRef, useEffect,
} from 'react';
import {
  collection, setDoc, getDocs, updateDoc, deleteDoc,
  doc, query as firestoreQuery, orderBy, limit,
  serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const ChatHistoryContext = createContext(null);

const MAX_MESSAGES_PER_SESSION = 60;
const MAX_SESSIONS = 30;

// ── LocalStorage Helpers (Keyed by Gmail / UID) ──────────────────────────────
const getLocalKey = (user) => {
  const identifier = (user?.email || user?.uid || 'guest').trim().toLowerCase();
  return `acadivo_chat_sessions_${identifier}`;
};

const saveToLocalStorage = (user, sessionsList) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = getLocalKey(user);
      window.localStorage.setItem(key, JSON.stringify(sessionsList));
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

export function ChatHistoryProvider({ children }) {
  const { user } = useAuth();

  const [sessions,       setSessions]       = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages,        setMessages]        = useState([]);

  const activeIdRef = useRef(null);
  activeIdRef.current = activeSessionId;

  // ── Firestore collection ref helpers ─────────────────────────────────────────
  const sessionsRef = useCallback(() => {
    if (!user?.uid) return null;
    return collection(db, 'chatHistory', user.uid, 'sessions');
  }, [user?.uid]);

  const sessionDocRef = useCallback((sid) => {
    if (!user?.uid || !sid) return null;
    return doc(db, 'chatHistory', user.uid, 'sessions', sid);
  }, [user?.uid]);

  // ── Load sessions list (LocalStorage + Firestore dual sync) ──────────────────
  const loadSessions = useCallback(async () => {
    if (!user?.uid && !user?.email) {
      setSessions([]);
      setSessionsLoaded(true);
      return;
    }
    setLoading(true);
    setError(null);

    // 1. Instant local load
    const localList = loadFromLocalStorage(user);
    if (localList && localList.length > 0) {
      setSessions(localList);
      setSessionsLoaded(true);
    }

    // 2. Background Firestore sync
    try {
      const ref = sessionsRef();
      if (ref) {
        const q = firestoreQuery(ref, orderBy('updatedAt', 'desc'), limit(MAX_SESSIONS));
        const snap = await getDocs(q);
        const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (remoteList && remoteList.length > 0) {
          setSessions(remoteList);
          saveToLocalStorage(user, remoteList);
        }
      }
      setSessionsLoaded(true);
    } catch (e) {
      console.warn('Firestore loadSessions warning:', e.message);
      // Fallback: localList is already loaded — DO NOT trigger red permission error to user!
    } finally {
      setLoading(false);
    }
  }, [user, sessionsRef]);

  // Auto load on mount or user change
  useEffect(() => {
    loadSessions();
  }, [user?.uid, user?.email]);

  // ── Create new session ────────────────────────────────────────────────────────
  const createSession = useCallback(async (firstMessage = '') => {
    if (!user?.uid && !user?.email) return null;
    setError(null);

    const sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const title = firstMessage
      ? (firstMessage.length > 50 ? firstMessage.slice(0, 47) + '…' : firstMessage)
      : 'New Chat';

    const newSession = {
      id: sid,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setSessions(prev => {
      const updated = [newSession, ...prev.filter(s => s.id !== sid)];
      saveToLocalStorage(user, updated);
      return updated;
    });
    setActiveSessionId(sid);
    setMessages([]);

    try {
      const ref = sessionDocRef(sid);
      if (ref) {
        await setDoc(ref, {
          title,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          messages: [],
        });
      }
    } catch (e) {
      console.warn('Firestore createSession background warning:', e.message);
    }
    return sid;
  }, [user, sessionDocRef]);

  // ── Load a session's messages ──────────────────────────────────────────────
  const loadSession = useCallback(async (sessionId) => {
    if ((!user?.uid && !user?.email) || !sessionId) return;
    setLoading(true);
    setError(null);

    // 1. Check local session first
    const localList = loadFromLocalStorage(user);
    const localSess = localList.find(s => s.id === sessionId);
    if (localSess && localSess.messages) {
      setActiveSessionId(sessionId);
      setMessages(localSess.messages);
    }

    // 2. Sync with Firestore
    try {
      const ref = sessionDocRef(sessionId);
      if (ref) {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setActiveSessionId(sessionId);
          setMessages(data.messages || []);
        }
      }
    } catch (e) {
      console.warn('Firestore loadSession background warning:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user, sessionDocRef]);

  // ── Add a message to the active session ───────────────────────────────────
  const addMessage = useCallback(async (sessionId, message) => {
    if ((!user?.uid && !user?.email) || !sessionId) return;

    // 1. Active view update
    setMessages(prev => [...prev, message]);

    // 2. Local sessions state update & save to LocalStorage
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const existingMsgs = s.messages || [];
          const updatedMsgs = [...existingMsgs, message].slice(-MAX_MESSAGES_PER_SESSION);
          const isFirstUserMsg = message.role === 'user' && existingMsgs.filter(m => m.role === 'user').length === 0;
          const titleUpdate = isFirstUserMsg
            ? { title: message.text.length > 50 ? message.text.slice(0, 47) + '…' : message.text }
            : {};
          return {
            ...s,
            messages: updatedMsgs,
            updatedAt: new Date().toISOString(),
            ...titleUpdate,
          };
        }
        return s;
      });
      saveToLocalStorage(user, updated);
      return updated;
    });

    // 3. Background Firestore update
    try {
      const ref = sessionDocRef(sessionId);
      if (ref) {
        const snap = await getDoc(ref);
        const existing = snap.exists() ? (snap.data().messages || []) : [];
        const updatedMsgs = [...existing, message].slice(-MAX_MESSAGES_PER_SESSION);
        const isFirstUserMsg = message.role === 'user' && existing.filter(m => m.role === 'user').length === 0;
        const titleUpdate = isFirstUserMsg
          ? { title: message.text.length > 50 ? message.text.slice(0, 47) + '…' : message.text }
          : {};
        await setDoc(ref, {
          messages: updatedMsgs,
          updatedAt: serverTimestamp(),
          ...titleUpdate,
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore addMessage background warning:', e.message);
    }
  }, [user, sessionDocRef]);

  // ── Delete a session ───────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId) => {
    if ((!user?.uid && !user?.email) || !sessionId) return;
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveToLocalStorage(user, updated);
      return updated;
    });
    if (activeIdRef.current === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
    try {
      const ref = sessionDocRef(sessionId);
      if (ref) await deleteDoc(ref);
    } catch (e) {
      console.warn('Firestore deleteSession warning:', e.message);
    }
  }, [user, sessionDocRef]);

  // ── Clear active session ───────────────────────────────────────────────────
  const clearActive = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  // ── AI Personalization Context ──────────────────────────────────────────────
  const getPersonalizationContext = useCallback(async (searchHistoryItems = []) => {
    if (!user?.uid && !user?.email) return '';
    try {
      const localList = loadFromLocalStorage(user);
      const recentTitles = localList.slice(0, 5).map(s => s.title).filter(Boolean);

      const parts = [];
      if (recentTitles.length > 0) {
        parts.push(`Recent AI chat topics: ${recentTitles.join('; ')}`);
      }
      if (searchHistoryItems.length > 0) {
        const queries = searchHistoryItems.slice(0, 8).map(h => h.query).join('; ');
        parts.push(`Recent searches: ${queries}`);
      }
      return parts.join('\n');
    } catch {
      return '';
    }
  }, [user]);

  return (
    <ChatHistoryContext.Provider value={{
      sessions,
      sessionsLoaded,
      loading,
      error,
      activeSessionId,
      messages,
      loadSessions,
      createSession,
      loadSession,
      addMessage,
      deleteSession,
      clearActive,
      getPersonalizationContext,
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error('useChatHistory must be inside ChatHistoryProvider');
  return ctx;
}

/**
 * ChatHistoryContext.js
 * Firestore-backed AI chat session history — persists across devices.
 *
 * Firestore structure:
 *   chatHistory/{uid}/sessions/{sessionId}
 *     ├── title        : string   (auto-set from first user message)
 *     ├── createdAt    : Timestamp
 *     ├── updatedAt    : Timestamp
 *     └── messages     : Array<Message>   (capped at 60 messages)
 *
 * Message shape:
 *   { id, role:'user'|'assistant', text, time, type, isRealAI }
 */

import React, {
  createContext, useContext, useState, useCallback, useRef,
} from 'react';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query as firestoreQuery, orderBy, limit,
  serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const ChatHistoryContext = createContext(null);

// Max messages stored per session in Firestore (keeps doc size small)
const MAX_MESSAGES_PER_SESSION = 60;
// Max sessions to load in history list
const MAX_SESSIONS = 30;

export function ChatHistoryProvider({ children }) {
  const { user } = useAuth();

  // sessions list (metadata only)
  const [sessions,       setSessions]       = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  // active session state
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages,        setMessages]        = useState([]);

  // Keep a ref to the active session ID so callbacks always see current value
  const activeIdRef = useRef(null);
  activeIdRef.current = activeSessionId;

  // ── Firestore collection ref helpers ─────────────────────────────────────────
  const sessionsRef = useCallback(() => {
    if (!user?.uid) return null;
    return collection(db, 'chatHistory', user.email || user.uid, 'sessions');
  }, [user?.uid, user?.email]);

  const sessionDocRef = useCallback((sid) => {
    if (!user?.uid || !sid) return null;
    return doc(db, 'chatHistory', user.email || user.uid, 'sessions', sid);
  }, [user?.uid, user?.email]);

  // ── Load sessions list ────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    if (!user?.uid) { setSessions([]); return; }
    setLoading(true); setError(null);
    try {
      const ref  = sessionsRef();
      if (!ref) return;
      const q    = firestoreQuery(ref, orderBy('updatedAt', 'desc'), limit(MAX_SESSIONS));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSessions(list);
      setSessionsLoaded(true);
    } catch (e) {
      setError('Failed to load chat history: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, sessionsRef]);

  // ── Create new session ────────────────────────────────────────────────────────
  const createSession = useCallback(async (firstMessage = '') => {
    if (!user?.uid) return null;
    setError(null);
    try {
      const ref   = sessionsRef();
      if (!ref) return null;
      const title = firstMessage
        ? (firstMessage.length > 50 ? firstMessage.slice(0, 47) + '…' : firstMessage)
        : 'New Chat';
      const docData = {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages:  [],
      };
      const docRef = await addDoc(ref, docData);
      const newSession = {
        id:        docRef.id,
        title,
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        messages:  [],
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(docRef.id);
      setMessages([]);
      return docRef.id;
    } catch (e) {
      setError('Failed to create session: ' + e.message);
      return null;
    }
  }, [user?.uid, sessionsRef]);

  // ── Load a session's messages ──────────────────────────────────────────────
  const loadSession = useCallback(async (sessionId) => {
    if (!user?.uid || !sessionId) return;
    setLoading(true); setError(null);
    try {
      const ref  = sessionDocRef(sessionId);
      if (!ref) return;
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      setActiveSessionId(sessionId);
      setMessages(data.messages || []);
    } catch (e) {
      setError('Failed to load session: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, sessionDocRef]);

  // ── Add a message to the active session ───────────────────────────────────
  const addMessage = useCallback(async (sessionId, message) => {
    if (!user?.uid || !sessionId) return;
    const ref = sessionDocRef(sessionId);
    if (!ref) return;

    // Optimistic update
    setMessages(prev => {
      const next = [...prev, message];
      return next;
    });

    try {
      // Read current messages, append, trim to cap
      const snap     = await getDoc(ref);
      const existing = snap.exists() ? (snap.data().messages || []) : [];
      const updated  = [...existing, message].slice(-MAX_MESSAGES_PER_SESSION);

      // Auto-update title from first user message
      const isFirstUserMessage =
        message.role === 'user' && existing.filter(m => m.role === 'user').length === 0;
      const titleUpdate = isFirstUserMessage
        ? { title: message.text.length > 50 ? message.text.slice(0, 47) + '…' : message.text }
        : {};

      await updateDoc(ref, {
        messages:  updated,
        updatedAt: serverTimestamp(),
        ...titleUpdate,
      });

      // Update local session list metadata and messages array
      setSessions(prev => prev.map(s => s.id === sessionId
        ? { ...s, messages: updated, updatedAt: { toDate: () => new Date() }, ...titleUpdate }
        : s
      ));
    } catch (e) {
      // Silent — message already in local state
      console.warn('ChatHistory: addMessage failed:', e.message);
    }
  }, [user?.uid, sessionDocRef]);

  // ── Delete a session ───────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId) => {
    if (!user?.uid || !sessionId) return;
    try {
      const ref = sessionDocRef(sessionId);
      if (ref) await deleteDoc(ref);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeIdRef.current === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (e) {
      setError('Failed to delete session: ' + e.message);
    }
  }, [user?.uid, sessionDocRef]);

  // ── Clear active session (start fresh without saving) ─────────────────────
  const clearActive = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  // ── Build personalization context for the AI ───────────────────────────────
  /**
   * Returns a string summarising the user's interests based on:
   *  - Recent chat session titles
   *  - Frequently asked topics
   */
  const getPersonalizationContext = useCallback(async (searchHistoryItems = []) => {
    if (!user?.uid) return '';
    try {
      const ref = sessionsRef();
      if (!ref) return '';
      const q    = firestoreQuery(ref, orderBy('updatedAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      const recentTitles = snap.docs.map(d => d.data().title || '').filter(Boolean);

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
  }, [user?.uid, sessionsRef]);

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

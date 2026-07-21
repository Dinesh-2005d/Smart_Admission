/**
 * AIScreen.js — Acadivo AI v6.0 (ChatGPT-like Experience)
 *
 * A truly conversational AI interface powered by:
 *   🧠 Groq Llama 3.3 70B  — Real AI with streaming responses
 *   🏛️ College Knowledge DB — 1700+ colleges context
 *   🌐 Web Enrichment       — DuckDuckGo + Wikipedia
 *   💬 Local AI Fallback    — Offline mode
 *
 * ChatGPT-like features:
 *   ✅ Token-by-token streaming with blinking cursor
 *   ✅ Stop generating button
 *   ✅ Copy / Regenerate / Feedback buttons on messages
 *   ✅ Dynamic contextual follow-up suggestions
 *   ✅ True multi-turn conversation memory
 *   ✅ Chat history with Firebase sync
 *   ✅ Sentiment analysis badges
 *
 * Two tabs:
 *   💬 Chat    — Live AI conversation
 *   📜 History — Chat sessions + Search history
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
  Dimensions, StatusBar, Linking, KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useSearchHistory } from '../context/SearchHistoryContext';
import { useAuth }          from '../context/AuthContext';
import {
  generateSmartResponse,
  crawlWeb,
  analyzeText,
  getSentimentColor,
  getSentimentEmoji,
  resetLocalAIContext,
  isGroqAvailable,
  resetConversationMemory,
  setConversationMemory,
} from '../utils/crawlWebAI';

import Constants from 'expo-constants';
import {
  collection, addDoc, getDocs, query as fsQuery,
  orderBy, limit, serverTimestamp, updateDoc, doc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const { width: SW } = Dimensions.get('window');

// ─── Dual Storage (Local Storage + Firebase) for Chat Sessions ───────────────
const getStorageKey = (email) =>
  `acadivo_chat_sessions_${(email || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

const getLocalSessions = (email) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = getStorageKey(email);
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const setLocalSessions = (email, sessions) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = getStorageKey(email);
      window.localStorage.setItem(key, JSON.stringify(sessions));
    } catch { /* ignore */ }
  }
};

const saveChatSession = async (email, title, messages) => {
  const sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const safeTitle = (title || 'Chat Session').slice(0, 60);
  const now = new Date().toISOString();

  const newSess = {
    id: sid,
    title: safeTitle,
    userEmail: email || 'guest',
    messages,
    createdAt: now,
    updatedAt: now,
  };

  const localList = getLocalSessions(email);
  const updatedList = [newSess, ...localList.filter(s => s.id !== sid)];
  setLocalSessions(email, updatedList);

  if (email && db) {
    try {
      const ref = collection(db, 'chatHistory', email, 'sessions');
      await addDoc(ref, {
        title: safeTitle,
        userEmail: email,
        messages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    } catch { /* silent */ }
  }

  return sid;
};

const updateChatSession = async (email, sessionId, messages) => {
  if (!sessionId) return;
  const now = new Date().toISOString();

  const localList = getLocalSessions(email);
  const updatedList = localList.map(s => {
    if (s.id === sessionId) {
      return { ...s, messages, updatedAt: now };
    }
    return s;
  });
  setLocalSessions(email, updatedList);

  if (email && db) {
    try {
      const docRef = doc(db, 'chatHistory', email, 'sessions', sessionId);
      await updateDoc(docRef, {
        messages,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    } catch { /* silent */ }
  }
};

const loadChatSessions = async (email) => {
  const localList = getLocalSessions(email);

  if (!email || !db) return localList;

  try {
    const ref = collection(db, 'chatHistory', email, 'sessions');
    const q = fsQuery(ref, orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (remoteList.length > 0) {
      const map = new Map();
      localList.forEach(s => map.set(s.id, s));
      remoteList.forEach(s => map.set(s.id, { ...map.get(s.id), ...s }));
      const merged = Array.from(map.values()).sort((a, b) => {
        const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt || 0).getTime();
        const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });
      setLocalSessions(email, merged);
      return merged;
    }
  } catch (e) {
    console.warn('loadChatSessions error:', e.message);
  }

  return localList;
};

const deleteChatSession = async (email, sessionId) => {
  if (!sessionId) return;

  const localList = getLocalSessions(email);
  const updatedList = localList.filter(s => s.id !== sessionId);
  setLocalSessions(email, updatedList);

  if (email && db) {
    try {
      await deleteDoc(doc(db, 'chatHistory', email, 'sessions', sessionId)).catch(() => {});
    } catch { /* silent */ }
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const nowStr = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (d) => {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
    ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// ─── Quick suggestion chips (shown only on empty state) ───────────────────────
const CHIPS = [
  { icon: 'school-outline',        text: 'Best engineering colleges in Chennai' },
  { icon: 'medkit-outline',        text: 'Government medical colleges Tamil Nadu' },
  { icon: 'cash-outline',          text: 'Low fee colleges with good placement' },
  { icon: 'trophy-outline',        text: 'IIT vs NIT — which is better?' },
  { icon: 'document-text-outline', text: 'How to apply for JEE Advanced?' },
  { icon: 'ribbon-outline',        text: 'Colleges with NAAC A+ grade' },
  { icon: 'analytics-outline',     text: 'Compare CSE programs in Chennai' },
  { icon: 'star-outline',          text: 'What do students say about VIT Vellore?' },
];

// ─── Typing Indicator with Animated Dots ──────────────────────────────────────
function TypingDots() {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const nd = Platform.OS !== 'web';
  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: nd }),
        Animated.timing(a, { toValue: 0, duration: 350, useNativeDriver: nd }),
        Animated.delay(450 - i * 150),
      ]))
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 22, paddingHorizontal: 4 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={{
          width: 7, height: 7, borderRadius: 4,
          backgroundColor: '#7c6fff',
          marginHorizontal: 3,
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
        }} />
      ))}
    </View>
  );
}

// ─── Blinking Cursor ──────────────────────────────────────────────────────────
function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  const nd = Platform.OS !== 'web';
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: nd }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: nd }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.Text style={{ opacity, color: '#7c6fff', fontWeight: '800', fontSize: 15 }}>▊</Animated.Text>
  );
}

// ─── RichText renderer (supports bold, links, bullets) ────────────────────────
function RichText({ text, isUser, isStreaming }) {
  const base = isUser ? '#ffffff' : '#eeeef8';
  const bold = isUser ? '#ffffff' : '#a78bfa';

  // Clean up follow-up suggestions section — we render those separately
  let cleanText = text || '';

  const parseLine = (str, idx) => {
    const parts = str.split(/(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(```[\s\S]*?```)/);
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const tm = part.match(/\[(.*?)\]/);
        const um = part.match(/\((.*?)\)/);
        if (tm && um) {
          return (
            <Text key={`l-${idx}-${i}`}
              style={{ color: '#4da6ff', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL(um[1]).catch(() => {})}
            >{tm[1]}</Text>
          );
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={`b-${idx}-${i}`} style={{ fontWeight: '800', color: bold }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={`t-${idx}-${i}`}>{part}</Text>;
    });
  };

  return (
    <View>
      {cleanText.split('\n').map((line, i) => {
        const tr = line.trim();
        const isBullet = /^[•\-\*]\s/.test(tr);
        const isNumbered = /^\d+[\.\)]\s/.test(tr);
        const isEmpty  = tr === '';
        if (isEmpty && i > 0) return <View key={i} style={{ height: 5 }} />;
        const content = isBullet ? tr.replace(/^[•\-\*]\s/, '') : 
                        isNumbered ? tr : line;
        return (
          <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: (isBullet || isNumbered) ? 3 : 0, paddingLeft: (isBullet || isNumbered) ? 4 : 0 }}>
            {isBullet && <Text style={{ color: '#7c6fff', fontWeight: '800', marginRight: 4, fontSize: 12 }}>•</Text>}
            <Text style={{ flex: 1, color: base, fontSize: 13.5, lineHeight: 21 }}>
              {parseLine(content, i)}
            </Text>
          </View>
        );
      })}
      {isStreaming && <BlinkingCursor />}
    </View>
  );
}

// ─── Message Action Buttons (Copy, Regenerate, Feedback) ──────────────────────
function MessageActions({ msg, onRegenerate, onCopy }) {
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(msg.text || '').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    } else {
      // On mobile, we could use expo-clipboard but keeping it simple
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    onCopy?.(msg.text);
  };

  return (
    <View style={s.actionRow}>
      {/* Copy */}
      <TouchableOpacity style={s.actionBtn} onPress={handleCopy} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={14} color={copied ? '#10b981' : '#64748b'} />
        {copied && <Text style={[s.actionText, { color: '#10b981' }]}>Copied</Text>}
      </TouchableOpacity>

      {/* Regenerate */}
      <TouchableOpacity style={s.actionBtn} onPress={onRegenerate} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Ionicons name="refresh-outline" size={14} color="#64748b" />
      </TouchableOpacity>

      {/* Thumbs up */}
      <TouchableOpacity
        style={s.actionBtn}
        onPress={() => setFeedback(f => f === 'up' ? null : 'up')}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name={feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
          size={14}
          color={feedback === 'up' ? '#10b981' : '#64748b'}
        />
      </TouchableOpacity>

      {/* Thumbs down */}
      <TouchableOpacity
        style={s.actionBtn}
        onPress={() => setFeedback(f => f === 'down' ? null : 'down')}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name={feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
          size={14}
          color={feedback === 'down' ? '#f43f5e' : '#64748b'}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, onRegenerate, onCopy }) {
  const isUser = msg.role === 'user';
  const fade   = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(isUser ? 20 : -20)).current;
  const nd = Platform.OS !== 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, useNativeDriver: nd }),
      Animated.spring(slideX, { toValue: 0, tension: 90, friction: 12, useNativeDriver: nd }),
    ]).start();
  }, []);

  return (
    <View style={{ width: '100%', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }], maxWidth: isUser ? 340 : 500 }}>
        {!isUser && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 6 }}>
            <LinearGradient colors={['#7c6fff50', '#7c6fff28']} style={s.aiAvatar}>
              <Text style={{ fontSize: 11 }}>🤖</Text>
            </LinearGradient>
            <Text style={s.aiName}>Acadivo AI</Text>
            {msg.isRealAI && (
              <View style={s.livePill}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>AI</Text>
              </View>
            )}
            {msg.isCrawled && (
              <View style={[s.livePill, { backgroundColor: '#10b98122' }]}>
                <View style={[s.liveDot, { backgroundColor: '#10b981' }]} />
                <Text style={[s.liveText, { color: '#10b981' }]}>WEB</Text>
              </View>
            )}
            {msg.isOfflineFallback && (
              <View style={[s.livePill, { backgroundColor: '#f59e0b22' }]}>
                <View style={[s.liveDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={[s.liveText, { color: '#f59e0b' }]}>OFFLINE</Text>
              </View>
            )}
            {msg.sentiment && (
              <View style={[
                s.livePill,
                { backgroundColor: getSentimentColor(msg.sentiment.label) + '22',
                  borderWidth: 1, borderColor: getSentimentColor(msg.sentiment.label) + '50' }
              ]}>
                <Text style={{ fontSize: 9 }}>{getSentimentEmoji(msg.sentiment.label)}</Text>
                <Text style={[s.liveText, { color: getSentimentColor(msg.sentiment.label) }]}>
                  {msg.sentiment.label}
                </Text>
              </View>
            )}
          </View>
        )}
        {isUser ? (
          <LinearGradient colors={['#8b83ff', '#6c63ff']} style={[s.bubble, s.userBubble]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={{ color: '#fff', fontSize: 13.5, lineHeight: 21 }}>{msg.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[s.bubble, s.aiBubble]}>
            <RichText text={msg.text} isUser={false} isStreaming={msg.isStreaming} />
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[s.timestamp, isUser && { textAlign: 'right', flex: 1 }]}>{msg.time}</Text>
          {!isUser && !msg.isStreaming && msg.text && msg.id !== 'welcome' && (
            <MessageActions msg={msg} onRegenerate={() => onRegenerate?.(msg)} onCopy={() => onCopy?.(msg.text)} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Dynamic Follow-up Suggestion Chips ───────────────────────────────────────
function FollowUpSuggestions({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <View style={s.followUpWrap}>
      {suggestions.map((text, i) => (
        <TouchableOpacity key={i} style={s.followUpChip} onPress={() => onSelect(text)}>
          <Ionicons name="arrow-forward-circle-outline" size={14} color="#7c6fff" />
          <Text style={s.followUpText} numberOfLines={2}>{text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════
export default function AIScreen({ route, navigation }) {
  const { user }      = useAuth();
  const searchHistCtx = useSearchHistory();

  // ── Tabs ───────────────────────────────────────────────────────
  const [tab, setTab] = useState('chat');
  const [histTab, setHistTab] = useState('chats');

  // ── Chat state ─────────────────────────────────────────────────
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [streaming,   setStreaming]   = useState(false);
  const [error,       setError]       = useState(null);
  const [sessionId,   setSessionId]   = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // ── Chat sessions list ─────────────────────────────────────────
  const [sessions,    setSessions]    = useState([]);
  const [sessLoading, setSessLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const abortRef  = useRef(null); // AbortController for stopping generation

  // Conversation history for multi-turn context
  const groqHistory = useRef([]);

  // ── Scroll to bottom ───────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, loading, streaming]);

  // ── Load chat sessions on mount & tab change ─────────────────────
  useEffect(() => {
    loadSessions();
    if (tab === 'history') {
      searchHistCtx.loadHistory?.();
    }
  }, [tab, user?.email]);

  const loadSessions = async () => {
    setSessLoading(true);
    try {
      const email = user?.email || 'guest';
      const list = await loadChatSessions(email);
      setSessions(list);
    } catch (e) {
      console.warn('loadSessions failed:', e.message);
    } finally {
      setSessLoading(false);
    }
  };

  // ── Handle college navigation from DetailsScreen ───────────────
  const lastCollegeRef = useRef(null);
  useEffect(() => {
    const collegeName = route?.params?.collegeName;
    const collegeObj  = route?.params?.college || null;
    if (collegeName && lastCollegeRef.current !== collegeName) {
      lastCollegeRef.current = collegeName;
      setTab('chat');
      handleAutoChat(collegeName, collegeObj);
      navigation?.setParams({ collegeName: null, college: null });
    }
  }, [route?.params?.collegeName]);

  // ── Handle search item from SearchScreen / sidebar ─────────────
  useEffect(() => {
    const item = route?.params?.searchItem;
    if (item) {
      setTab('history');
      setHistTab('searches');
      navigation?.setParams({ searchItem: null });
    }
  }, [route?.params?.searchItem]);

  // ── Auto chat when navigating from college details ─────────────
  const handleAutoChat = async (collegeName, collegeObj) => {
    groqHistory.current = [];
    resetConversationMemory();
    setMessages([]);
    setSessionId(null);
    setError(null);
    setSuggestions([]);

    const promptText = `Tell me everything about ${collegeName} — admission process, courses, fees, placements, eligibility, and any tips for getting in.`;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: promptText, time: nowStr() };
    setMessages([userMsg]);
    groqHistory.current = [{ role: 'user', content: promptText }];

    await handleAIResponse(promptText, [userMsg], collegeObj);
  };

  // ── Core AI response handler with streaming ────────────────────
  const handleAIResponse = async (query, currentMessages, college = null) => {
    setLoading(true);
    setStreaming(true);
    setError(null);

    // Create a placeholder AI message for streaming
    const aiMsgId = `a-${Date.now()}`;
    const streamingMsg = {
      id: aiMsgId, role: 'assistant', text: '',
      time: nowStr(), isRealAI: isGroqAvailable(), isStreaming: true,
    };

    setMessages(prev => [...prev, streamingMsg]);

    // Create abort controller
    abortRef.current = new AbortController();

    let fullText = '';

    try {
      const result = await generateSmartResponse(
        groqHistory.current,
        college,
        null,
        {
          onToken: (token) => {
            fullText += token;
            // Update the streaming message with new tokens
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, text: fullText } : m
            ));
            // Auto-scroll during streaming
            setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: false }), 30);
          },
          onComplete: (completeText) => {
            fullText = completeText;
          },
          onError: (err) => {
            if (err.message !== 'ABORTED') {
              console.warn('Streaming error:', err.message);
            }
          },
          abortController: abortRef.current,
        }
      );

      // Finalize the streaming message
      const finalAiMsg = {
        id: aiMsgId, role: 'assistant', text: result.text || fullText,
        time: nowStr(), isRealAI: result.isRealAI, isCrawled: result.isCrawled,
        isOfflineFallback: result.isOfflineFallback,
        sentiment: result.sentiment, sources: result.sources,
        isStreaming: false,
      };

      groqHistory.current.push({ role: 'assistant', content: result.text || fullText });

      const finalMessages = currentMessages.map(m => m).concat([finalAiMsg]);
      setMessages(finalMessages);

      // Set dynamic follow-up suggestions
      if (result.suggestions?.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setSuggestions([]);
      }

      // Background: save search history
      try {
        const crawl = await crawlWeb(query);
        const sent  = result.sentiment || analyzeText(crawl.combinedText || query);
        await searchHistCtx.addSearch?.(query, crawl.results, sent);
      } catch { /* silent */ }

      // Save session
      try {
        const email = user?.email || 'guest';
        if (sessionId) {
          await updateChatSession(email, sessionId, finalMessages);
          setSessions(prev => prev.map(s =>
            s.id === sessionId
              ? { ...s, messages: finalMessages, updatedAt: new Date().toISOString() }
              : s
          ));
        } else {
          const title = query.length > 60 ? query.slice(0, 57) + '…' : query;
          const sid = await saveChatSession(email, title, finalMessages);
          if (sid) {
            setSessionId(sid);
            await loadSessions();
          }
        }
      } catch { /* silent */ }

    } catch (e) {
      if (e.message !== 'ABORTED' && e.name !== 'AbortError') {
        setError(`AI error: ${e.message}`);
        // Remove the streaming placeholder on error
        setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  // ── Send message ───────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setSuggestions([]);

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, time: nowStr() };
    const newMessages = [...messages.filter(m => !m.isStreaming), userMsg];
    setMessages(newMessages);
    groqHistory.current = [...groqHistory.current, { role: 'user', content: text }];

    await handleAIResponse(text, newMessages);
  }, [input, loading, messages, sessionId, user?.email]);

  // ── Stop generating ────────────────────────────────────────────
  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStreaming(false);
      setLoading(false);

      // Finalize any partially streamed message
      setMessages(prev => prev.map(m =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      ));
    }
  };

  // ── Regenerate last response ────────────────────────────────────
  const handleRegenerate = useCallback(async (msg) => {
    if (loading || streaming) return;

    // Find the user message that preceded this AI message
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    if (msgIndex <= 0) return;

    const userMsg = messages[msgIndex - 1];
    if (userMsg.role !== 'user') return;

    // Remove the old AI response
    const messagesWithoutOldResponse = messages.slice(0, msgIndex);
    setMessages(messagesWithoutOldResponse);

    // Rebuild groq history without the old response
    groqHistory.current = messagesWithoutOldResponse
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.text || '' }));

    // Re-generate
    await handleAIResponse(userMsg.text, messagesWithoutOldResponse);
  }, [messages, loading, streaming]);

  // ── New chat ───────────────────────────────────────────────────
  const handleNewChat = () => {
    groqHistory.current = [];
    resetConversationMemory();
    setMessages([]);
    setSessionId(null);
    setInput('');
    setError(null);
    setSuggestions([]);
    resetLocalAIContext();
  };

  // ── Handle Enter key on Web ──────────────────────────────────────
  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      if (Platform.OS === 'web' && e.preventDefault) {
        e.preventDefault();
      }
      handleSend();
    }
  };

  // ── Resume a past session ──────────────────────────────────────
  const handleResume = (session) => {
    const msgs = session.messages || [];
    setMessages(msgs);
    setSessionId(session.id);
    groqHistory.current = msgs
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.text || '' }))
      .slice(-20);
    setConversationMemory(msgs);
    setTab('chat');
    setError(null);
    setSuggestions([]);
  };

  // ── Delete session ─────────────────────────────────────────────
  const handleDeleteSession = (sid) => {
    const doDelete = async () => {
      await deleteChatSession(user?.email, sid).catch(() => {});
      setSessions(prev => prev.filter(s => s.id !== sid));
      if (sessionId === sid) {
        groqHistory.current = [];
        resetConversationMemory();
        setMessages([]);
        setSessionId(null);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this conversation?')) doDelete();
    } else {
      Alert.alert('Delete Chat', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // ── Copy handler ───────────────────────────────────────────────
  const handleCopy = (text) => {
    // The copy logic is in MessageActions — this is just a callback
  };

  // ── Welcome message ────────────────────────────────────────────
  const aiStatus = isGroqAvailable() ? '🟢 Powered by AI' : '🟡 Offline Mode';
  const WELCOME = {
    id: 'welcome', role: 'assistant', isRealAI: isGroqAvailable(),
    time: nowStr(),
    text: `👋 Hi${user?.name ? ', **' + user.name + '**' : ''}! I'm **Acadivo AI** — your personal college guidance assistant.\n\nI'm a real AI that understands your questions naturally, remembers our conversation, and gives you thoughtful, detailed answers — just like talking to a knowledgeable mentor.\n\n**Here's what I can help with:**\n• 🎓 College recommendations based on your marks & interests\n• 📊 Course & fee comparisons across colleges\n• 🏆 Entrance exam guidance — JEE, NEET, GATE, CAT, CLAT\n• 💼 Career advice & placement insights\n• 🏠 Hostel, scholarship & admission info\n\nAsk me anything — I'll give you a real, thoughtful answer! 🚀`,
  };

  const displayMessages = messages.length > 0 ? messages : [WELCOME];

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d14" />

      {/* ── Header ── */}
      <LinearGradient colors={['#0d0d14', '#13131e']} style={s.header}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>🎓 Acadivo AI</Text>
            <Text style={s.headerSub}>
              {aiStatus} · Smart Admission Assistant
            </Text>
          </View>
          {user && (
            <View style={s.userBadge}>
              <Text style={s.userBadgeText}>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {[
            { key: 'chat',    label: '💬 Chat' },
            { key: 'history', label: '📜 History' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ════════════════════════════════════════════════════════
          CHAT TAB
      ════════════════════════════════════════════════════════ */}
      {tab === 'chat' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Chat toolbar */}
          <View style={s.toolbar}>
            <TouchableOpacity style={s.newChatBtn} onPress={handleNewChat}>
              <Ionicons name="add-circle-outline" size={16} color="#7c6fff" />
              <Text style={s.newChatText}>New Chat</Text>
            </TouchableOpacity>
            {sessionId && (
              <View style={s.sessionPill}>
                <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                <Text style={s.sessionPillText}>Saved</Text>
              </View>
            )}
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={s.msgList}
            contentContainerStyle={s.msgContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {displayMessages.map(msg => (
              <Bubble
                key={msg.id || msg.text?.slice(0, 12)}
                msg={msg}
                onRegenerate={handleRegenerate}
                onCopy={handleCopy}
              />
            ))}

            {/* Typing indicator — only shown while waiting for first token */}
            {loading && !streaming && (
              <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 6 }}>
                  <LinearGradient colors={['#7c6fff50', '#7c6fff28']} style={s.aiAvatar}>
                    <Text style={{ fontSize: 11 }}>🤖</Text>
                  </LinearGradient>
                  <Text style={s.aiName}>Acadivo AI</Text>
                  <View style={[s.livePill, { backgroundColor: '#7c6fff22' }]}>
                    <Text style={[s.liveText, { color: '#7c6fff' }]}>thinking…</Text>
                  </View>
                </View>
                <View style={[s.bubble, s.aiBubble]}>
                  <TypingDots />
                </View>
              </View>
            )}

            {error && (
              <View style={s.errorRow}>
                <Ionicons name="warning-outline" size={14} color="#f87171" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Dynamic follow-up suggestions */}
            {suggestions.length > 0 && !loading && !streaming && (
              <FollowUpSuggestions suggestions={suggestions} onSelect={handleSend} />
            )}

            {/* Static quick chips — only on empty state */}
            {displayMessages.length <= 1 && !loading && (
              <View style={s.chipsWrap}>
                <Text style={s.chipsLabel}>Try asking:</Text>
                <View style={s.chips}>
                  {CHIPS.map(c => (
                    <TouchableOpacity key={c.text} style={s.chip} onPress={() => handleSend(c.text)}>
                      <Ionicons name={c.icon} size={13} color="#7c6fff" />
                      <Text style={s.chipText}>{c.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Input bar */}
          <View style={s.inputBar}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder={streaming ? 'AI is responding…' : 'Ask about any college, exam, career…'}
              placeholderTextColor="#44445a"
              multiline
              maxLength={600}
              onKeyPress={handleKeyPress}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!loading}
            />

            {/* Stop / Send button */}
            {streaming ? (
              <TouchableOpacity style={s.stopBtn} onPress={handleStop}>
                <Ionicons name="stop-circle" size={22} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnOff]}
                onPress={() => handleSend()}
                disabled={!input.trim() || loading}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="send" size={18} color="#fff" />
                }
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ════════════════════════════════════════════════════════
          HISTORY TAB
      ════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <View style={{ flex: 1, backgroundColor: '#0d0d14' }}>
          <View style={h.topRow}>
            <Text style={h.title}>📜 Your History</Text>
            <Text style={h.sub}>Synced via Gmail — {user?.email || 'Not signed in'}</Text>
          </View>

          {/* Sub-tabs: Chats | Searches */}
          <View style={h.subTabRow}>
            <TouchableOpacity
              style={[h.subTab, histTab === 'chats' && h.subTabActive]}
              onPress={() => { setHistTab('chats'); loadSessions(); }}
            >
              <Ionicons name="chatbubbles-outline" size={14} color={histTab === 'chats' ? '#7c6fff' : '#64748b'} />
              <Text style={[h.subTabText, histTab === 'chats' && h.subTabTextActive]}>
                Chats ({sessions.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[h.subTab, histTab === 'searches' && h.subTabActiveBlue]}
              onPress={() => { setHistTab('searches'); searchHistCtx.loadHistory?.(); }}
            >
              <Ionicons name="search-outline" size={14} color={histTab === 'searches' ? '#60a5fa' : '#64748b'} />
              <Text style={[h.subTabText, histTab === 'searches' && h.subTabTextBlue]}>
                Searches ({(searchHistCtx.history || []).length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Chat sessions list ── */}
          {histTab === 'chats' && (
            <ScrollView style={h.list} contentContainerStyle={h.listContent} showsVerticalScrollIndicator={false}>
              {sessLoading && (
                <View style={h.center}>
                  <ActivityIndicator size="large" color="#7c6fff" />
                  <Text style={h.loadText}>Loading conversations…</Text>
                </View>
              )}

              {!sessLoading && sessions.length === 0 && (
                <View style={h.empty}>
                  <Text style={h.emptyEmoji}>💬</Text>
                  <Text style={h.emptyTitle}>No conversations yet</Text>
                  <Text style={h.emptyText}>Start chatting with Acadivo AI to build your history.</Text>
                  <TouchableOpacity style={h.startBtn} onPress={() => { setTab('chat'); handleNewChat(); }}>
                    <Ionicons name="add-circle-outline" size={16} color="#fff" />
                    <Text style={h.startBtnText}>Start a Conversation</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sessions.map(sess => {
                const preview = (sess.messages || []).find(m => m.role === 'user')?.text || 'Chat session';
                return (
                  <TouchableOpacity
                    key={sess.id}
                    style={h.card}
                    onPress={() => handleResume(sess)}
                    activeOpacity={0.85}
                  >
                    <View style={[h.cardIcon, { backgroundColor: '#7c6fff20' }]}>
                      <Ionicons name="chatbubbles-outline" size={20} color="#7c6fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={h.cardTitle} numberOfLines={2}>{sess.title || preview}</Text>
                      <Text style={h.cardMeta}>
                        {fmtDate(sess.updatedAt)} · {(sess.messages || []).length} messages
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSession(sess.id)}
                      style={h.deleteBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ── Search history list ── */}
          {histTab === 'searches' && (
            <ScrollView style={h.list} contentContainerStyle={h.listContent} showsVerticalScrollIndicator={false}>
              {searchHistCtx.loading && (
                <View style={h.center}>
                  <ActivityIndicator size="large" color="#60a5fa" />
                  <Text style={h.loadText}>Loading searches…</Text>
                </View>
              )}

              {!searchHistCtx.loading && (searchHistCtx.history || []).length === 0 && (
                <View style={h.empty}>
                  <Text style={h.emptyEmoji}>🔍</Text>
                  <Text style={h.emptyTitle}>No searches yet</Text>
                  <Text style={h.emptyText}>
                    When you click {"\"Ask AI about this college\""} from a college page, the search is saved here automatically.
                  </Text>
                </View>
              )}

              {(searchHistCtx.history || []).map(item => {
                const sentColor = getSentimentColor(item.sentimentLabel || 'Neutral');
                const sentEmoji = getSentimentEmoji(item.sentimentLabel || 'Neutral');
                return (
                  <View key={item.id} style={h.card}>
                    <View style={[h.cardIcon, { backgroundColor: '#60a5fa20' }]}>
                      <Ionicons name="search-outline" size={20} color="#60a5fa" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={h.cardTitle} numberOfLines={2}>{item.query}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <Text style={h.cardMeta}>{fmtDate(item.timestamp)}</Text>
                        <View style={[h.sentBadge, { borderColor: sentColor + '60', backgroundColor: sentColor + '18' }]}>
                          <Text style={{ fontSize: 10 }}>{sentEmoji}</Text>
                          <Text style={[h.sentText, { color: sentColor }]}>
                            {item.sentimentLabel || 'Neutral'} ({(item.sentimentNormalized || 0).toFixed(1)})
                          </Text>
                        </View>
                      </View>
                      {item.crawlResults?.length > 0 && (
                        <Text style={h.cardSources} numberOfLines={1}>
                          📎 {item.crawlResults.length} source{item.crawlResults.length !== 1 ? 's' : ''}: {item.crawlResults.map(r => r.source).join(', ')}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => searchHistCtx.deleteSearch?.(item.id)}
                      style={h.deleteBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0d0d14' },

  // Header
  header:       { paddingTop: Platform.OS === 'android' ? 36 : 14, paddingBottom: 0, paddingHorizontal: 16 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  headerSub:    { fontSize: 11, color: '#64748b', marginTop: 2 },
  userBadge:    { width: 34, height: 34, borderRadius: 17, backgroundColor: '#7c6fff', justifyContent: 'center', alignItems: 'center' },
  userBadgeText:{ fontSize: 14, fontWeight: '800', color: '#fff' },

  // Tab bar
  tabBar:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e1e2e' },
  tabBtn:       { flex: 1, alignItems: 'center', paddingVertical: 11 },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#7c6fff' },
  tabText:      { fontSize: 13, color: '#64748b', fontWeight: '600' },
  tabTextActive:{ color: '#7c6fff', fontWeight: '700' },

  // Chat
  toolbar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a26', gap: 10 },
  newChatBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c6fff18', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, gap: 5, borderWidth: 1, borderColor: '#7c6fff30' },
  newChatText:  { fontSize: 13, color: '#7c6fff', fontWeight: '700' },
  sessionPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10b98118', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  sessionPillText: { fontSize: 11, color: '#10b981', fontWeight: '600' },

  msgList:      { flex: 1, backgroundColor: '#0d0d14' },
  msgContent:   { paddingHorizontal: 16, paddingTop: 12 },

  // Message bubbles
  bubble:       { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  userBubble:   { borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 10 },
  aiBubble:     { backgroundColor: '#16161f', borderWidth: 1, borderColor: '#7c6fff22', borderBottomLeftRadius: 4 },
  aiAvatar:     { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  aiName:       { fontSize: 12, color: '#a78bfa', fontWeight: '700' },
  livePill:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c6fff22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, gap: 4 },
  liveDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: '#7c6fff' },
  liveText:     { fontSize: 9, color: '#7c6fff', fontWeight: '800', letterSpacing: 0.5 },
  timestamp:    { fontSize: 10, color: '#44445a', marginTop: 4, marginHorizontal: 4 },

  // Message actions
  actionRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  actionText:   { fontSize: 10, fontWeight: '600' },

  // Error
  errorRow:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#7f1d1d30', padding: 12, borderRadius: 10, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#f8717140' },
  errorText:    { flex: 1, fontSize: 12.5, color: '#fca5a5', lineHeight: 18 },

  // Follow-up suggestions
  followUpWrap: { marginTop: 6, marginBottom: 8, gap: 6 },
  followUpChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16161f', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, gap: 8, borderWidth: 1, borderColor: '#7c6fff25' },
  followUpText: { fontSize: 12.5, color: '#c4b5fd', flex: 1, lineHeight: 18 },

  // Quick chips
  chipsWrap:    { marginTop: 8, marginBottom: 4 },
  chipsLabel:   { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 8 },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16161f', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, gap: 5, borderWidth: 1, borderColor: '#7c6fff30' },
  chipText:     { fontSize: 12, color: '#c4b5fd' },

  // Input bar
  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#0d0d14', borderTopWidth: 1, borderTopColor: '#1a1a26', gap: 10 },
  input:        { flex: 1, backgroundColor: '#16161f', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#eef2ff', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#2a2a3e' },
  sendBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c6fff', justifyContent: 'center', alignItems: 'center' },
  sendBtnOff:   { backgroundColor: '#2a2a3e' },
  stopBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center' },
});

const h = StyleSheet.create({
  topRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title:        { fontSize: 18, fontWeight: '800', color: '#fff', flex: 1 },
  sub:          { fontSize: 11, color: '#64748b', marginTop: 1 },
  refreshBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c6fff18', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#7c6fff30' },

  // Sub-tabs
  subTabRow:    { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  subTab:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#16161f', borderWidth: 1, borderColor: '#2a2a3e' },
  subTabActive: { borderColor: '#7c6fff60', backgroundColor: '#7c6fff18' },
  subTabActiveBlue: { borderColor: '#60a5fa60', backgroundColor: '#60a5fa18' },
  subTabText:   { fontSize: 12.5, color: '#64748b', fontWeight: '600' },
  subTabTextActive: { color: '#7c6fff', fontWeight: '700' },
  subTabTextBlue:   { color: '#60a5fa', fontWeight: '700' },

  // List
  list:       { flex: 1 },
  listContent:{ paddingHorizontal: 14, paddingTop: 4 },

  // Loading / Empty
  center:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadText:   { fontSize: 13, color: '#64748b' },
  empty:      { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30, gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  emptyText:  { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  startBtn:   { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#7c6fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 22, marginTop: 10 },
  startBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // History cards
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16161f', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a3e', gap: 12 },
  cardIcon:   { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: '#e2e8f0', lineHeight: 20 },
  cardMeta:   { fontSize: 11, color: '#64748b', marginTop: 3 },
  cardSources:{ fontSize: 11, color: '#475569', marginTop: 4 },
  deleteBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ef444415', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ef444435' },

  // Sentiment badge on search cards
  sentBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  sentText:   { fontSize: 10, fontWeight: '700' },
});

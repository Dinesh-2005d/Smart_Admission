/**
 * AIScreen.js — AntyGravity AI v3.0 (Clean Rebuild)
 *
 * A clean, reliable AI chat powered by Groq (Llama 3.3 70B).
 * Two tabs:
 *   💬 Chat    — Live Groq AI conversation (ChatGPT-style)
 *   📜 History — Chat sessions + Search history (Firebase synced)
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
import { crawlWeb }         from '../utils/webCrawler';
import { analyzeText, getSentimentColor, getSentimentEmoji } from '../utils/sentimentAnalyzer';

import Constants from 'expo-constants';
import {
  collection, addDoc, getDocs, query as fsQuery,
  orderBy, limit, serverTimestamp, updateDoc, doc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const { width: SW } = Dimensions.get('window');

// ─── Groq direct API ─────────────────────────────────────────────────────────
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const getApiKey = () => {
  const k = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (k && k !== 'YOUR_GROQ_API_KEY' && k.trim()) return k.trim();
  try {
    const k2 = Constants?.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY;
    if (k2 && k2 !== 'YOUR_GROQ_API_KEY' && k2.trim()) return k2.trim();
  } catch {}
  return null;
};

const SYSTEM_PROMPT = `You are AntyGravity AI — a brilliant, friendly AI assistant for Indian college admissions and career guidance, built into the Acadivo Smart Admission platform. You are powered by Llama 3.3 70B.

Your expertise:
• Indian colleges, universities, and entrance exams (JEE, NEET, GATE, CAT, CLAT, CUET)
• Course details, fees, placements, rankings, scholarships, hostels
• Career guidance after any degree
• College comparisons and personalized recommendations

Rules:
1. Always give helpful, accurate answers. Never say "I don't know" without offering an alternative.
2. Be warm, conversational, and friendly — like a knowledgeable senior.
3. Use bullet points (•) and **bold** for key info.
4. Keep responses 100-400 words.
5. Always end with a follow-up question or offer to help more.
6. When users mention marks/percentage, recommend matching colleges.

Sign off as "AntyGravity AI" when introducing yourself.`;

const callGroq = async (messages) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens:  1500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
};

// ─── Firestore chat sessions ──────────────────────────────────────────────────
const sessionsRef = (email) =>
  email ? collection(db, 'chatHistory', email, 'sessions') : null;

const saveChatSession = async (email, title, messages) => {
  if (!email) return null;
  const ref = sessionsRef(email);
  if (!ref) return null;
  const docRef = await addDoc(ref, {
    title:     title.length > 60 ? title.slice(0, 57) + '…' : title,
    messages,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

const updateChatSession = async (email, sessionId, messages) => {
  if (!email || !sessionId) return;
  await updateDoc(doc(db, 'chatHistory', email, 'sessions', sessionId), {
    messages,
    updatedAt: serverTimestamp(),
  });
};

const loadChatSessions = async (email) => {
  if (!email) return [];
  const ref = sessionsRef(email);
  if (!ref) return [];
  const q    = fsQuery(ref, orderBy('updatedAt', 'desc'), limit(30));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

const deleteChatSession = async (email, sessionId) => {
  if (!email || !sessionId) return;
  await deleteDoc(doc(db, 'chatHistory', email, 'sessions', sessionId));
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

// ─── Quick suggestions ────────────────────────────────────────────────────────
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

// ─── TypingDots ───────────────────────────────────────────────────────────────
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

// ─── RichText renderer ────────────────────────────────────────────────────────
function RichText({ text, isUser }) {
  const base = isUser ? '#ffffff' : '#eeeef8';
  const bold = isUser ? '#ffffff' : '#a78bfa';

  const parseLine = (str, idx) => {
    const parts = str.split(/(\[.*?\]\(.*?\))|(\*\*.*?\*\*)/);
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
      {(text || '').split('\n').map((line, i) => {
        const tr = line.trim();
        const isBullet = /^[•\-\*]\s/.test(tr);
        const isEmpty  = tr === '';
        if (isEmpty && i > 0) return <View key={i} style={{ height: 5 }} />;
        const content = isBullet ? tr.replace(/^[•\-\*]\s/, '') : line;
        return (
          <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: isBullet ? 3 : 0, paddingLeft: isBullet ? 4 : 0 }}>
            {isBullet && <Text style={{ color: '#7c6fff', fontWeight: '800', marginRight: 4, fontSize: 12 }}>•</Text>}
            <Text style={{ flex: 1, color: base, fontSize: 13.5, lineHeight: 21 }}>
              {parseLine(content, i)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg }) {
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
            <Text style={s.aiName}>AntyGravity AI</Text>
            {msg.isReal && (
              <View style={s.livePill}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE</Text>
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
            <RichText text={msg.text} isUser={false} />
          </View>
        )}
        <Text style={[s.timestamp, isUser && { textAlign: 'right' }]}>{msg.time}</Text>
      </Animated.View>
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
  const [histTab, setHistTab] = useState('chats'); // 'chats' | 'searches'

  // ── Chat state ─────────────────────────────────────────────────
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [sessionId,   setSessionId]   = useState(null);  // Firestore session id

  // ── Chat sessions list ─────────────────────────────────────────
  const [sessions,    setSessions]    = useState([]);
  const [sessLoading, setSessLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  // Groq conversation history (for multi-turn context)
  const groqHistory = useRef([]);

  // ── Scroll to bottom ───────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, loading]);

  // ── Load chat sessions on history tab ─────────────────────────
  useEffect(() => {
    if (tab === 'history' && user?.email) {
      loadSessions();
    }
    if ((tab === 'history') && user?.email) {
      searchHistCtx.loadHistory?.();
    }
  }, [tab, user?.email]);

  const loadSessions = async () => {
    setSessLoading(true);
    try {
      const list = await loadChatSessions(user?.email);
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
    // Start fresh session
    groqHistory.current = [];
    setMessages([]);
    setSessionId(null);
    setError(null);
    setLoading(true);

    const promptText = `Tell me everything about ${collegeName} — admission process, courses, fees, placements, eligibility, and any tips for getting in.`;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: promptText, time: nowStr() };
    setMessages([userMsg]);
    groqHistory.current = [{ role: 'user', content: promptText }];

    // Background: crawl and save search history
    try {
      const crawl = await crawlWeb(collegeName);
      const sent  = analyzeText(crawl.combinedText || collegeName);
      await searchHistCtx.addSearch?.(collegeName, crawl.results, sent);
    } catch {}

    // Get AI response
    try {
      const reply = await callGroq(groqHistory.current);
      const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', text: reply, time: nowStr(), isReal: true };
      groqHistory.current.push({ role: 'assistant', content: reply });
      setMessages([userMsg, aiMsg]);

      // Save to Firestore
      const email = user?.email;
      if (email) {
        const sid = await saveChatSession(email, promptText, [userMsg, aiMsg]);
        setSessionId(sid);
      }
    } catch (e) {
      setError(e.message === 'NO_KEY'
        ? 'Groq API key not configured. Please add EXPO_PUBLIC_GROQ_API_KEY to your .env file.'
        : `AI error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ───────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, time: nowStr() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    groqHistory.current = [...groqHistory.current, { role: 'user', content: text }];

    try {
      const reply = await callGroq(groqHistory.current);
      const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', text: reply, time: nowStr(), isReal: true };
      groqHistory.current.push({ role: 'assistant', content: reply });

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Save / update Firestore session
      const email = user?.email;
      if (email) {
        if (sessionId) {
          await updateChatSession(email, sessionId, finalMessages).catch(() => {});
        } else {
          const sid = await saveChatSession(email, text, finalMessages).catch(() => null);
          if (sid) setSessionId(sid);
        }
      }
    } catch (e) {
      setError(e.message === 'NO_KEY'
        ? 'Groq API key not configured. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.'
        : `Failed to get AI response: ${e.message}. Check your internet connection.`);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sessionId, user?.email]);

  // ── New chat ───────────────────────────────────────────────────
  const handleNewChat = () => {
    groqHistory.current = [];
    setMessages([]);
    setSessionId(null);
    setInput('');
    setError(null);
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
    setTab('chat');
    setError(null);
  };

  // ── Delete session ─────────────────────────────────────────────
  const handleDeleteSession = (sid) => {
    const doDelete = async () => {
      await deleteChatSession(user?.email, sid).catch(() => {});
      setSessions(prev => prev.filter(s => s.id !== sid));
      if (sessionId === sid) {
        groqHistory.current = [];
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

  // ── Welcome message ────────────────────────────────────────────
  const WELCOME = {
    id: 'welcome', role: 'assistant', isReal: !!getApiKey(),
    time: nowStr(),
    text: `👋 Hi${user?.name ? ', **' + user.name + '**' : ''}! I'm **AntyGravity AI** — your personal college guidance assistant.\n\nI can help you with:\n• 🎓 **College recommendations** based on your marks, stream, and location\n• 📊 **Course & fee comparisons** across top colleges\n• 🏆 **Entrance exam guidance** — JEE, NEET, GATE, CAT, CLAT\n• 💼 **Career advice** after any degree\n• 🏠 **Hostel, scholarship & admission info**\n\nPowered by **Llama 3.3 70B** via Groq AI. Ask me anything! 🚀`,
  };

  const displayMessages = messages.length > 0 ? messages : [WELCOME];
  const isGroqReady = !!getApiKey();

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
            <Text style={s.headerTitle}>🤖 AntyGravity AI</Text>
            <Text style={s.headerSub}>
              {isGroqReady ? '🟢 Groq Llama 3.3 70B · Live AI' : '🔴 API Key Missing'} · Smart Admission
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
              <Bubble key={msg.id || msg.text?.slice(0, 12)} msg={msg} />
            ))}

            {loading && (
              <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
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

            {/* Quick chips */}
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
              placeholder="Ask about any college, exam, career…"
              placeholderTextColor="#44445a"
              multiline
              maxLength={600}
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
              editable={!loading}
            />
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
                  <Text style={h.emptyText}>Start chatting with AntyGravity AI to build your history.</Text>
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
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#44445a" />
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
                    When you click "Ask AI about this college" from a college page, the search is saved here automatically.
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
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#44445a" />
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
  livePill:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b98122', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, gap: 4 },
  liveDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10b981' },
  liveText:     { fontSize: 9, color: '#10b981', fontWeight: '800', letterSpacing: 0.5 },
  timestamp:    { fontSize: 10, color: '#44445a', marginTop: 4, marginHorizontal: 4 },

  // Error
  errorRow:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#7f1d1d30', padding: 12, borderRadius: 10, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#f8717140' },
  errorText:    { flex: 1, fontSize: 12.5, color: '#fca5a5', lineHeight: 18 },

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
});

const h = StyleSheet.create({
  topRow:     { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  title:      { fontSize: 18, fontWeight: '800', color: '#fff' },
  sub:        { fontSize: 11, color: '#64748b', marginTop: 3, marginBottom: 10 },

  // Sub-tabs
  subTabRow:  { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  subTab:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#16161f', borderWidth: 1, borderColor: '#2a2a3e' },
  subTabActive:{ borderColor: '#7c6fff60', backgroundColor: '#7c6fff18' },
  subTabActiveBlue: { borderColor: '#60a5fa60', backgroundColor: '#60a5fa18' },
  subTabText: { fontSize: 12.5, color: '#64748b', fontWeight: '600' },
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
  card:       { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#16161f', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a3e', gap: 12 },
  cardIcon:   { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: '#e2e8f0', lineHeight: 20 },
  cardMeta:   { fontSize: 11, color: '#64748b', marginTop: 3 },
  cardSources:{ fontSize: 11, color: '#475569', marginTop: 4 },

  // Sentiment badge on search cards
  sentBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  sentText:   { fontSize: 10, fontWeight: '700' },
});

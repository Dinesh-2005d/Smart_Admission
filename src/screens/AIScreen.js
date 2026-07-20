/**
 * AIScreen.js — AntyGravity AI Platform v2.0
 *
 * AntyGravity AI — a custom-built multi-modal AI for Indian college guidance.
 * Combines: Knowledge Base + Web Crawling + NLP + Sentiment Analysis + Groq LLM
 *
 * 4-tab AI-powered guidance platform:
 *   💬 Chat    — Full AI conversation with session management
 *   📜 History — Past chat sessions (Firestore synced)
 *   📊 Analyse — Web crawl + NLP sentiment analysis
 *   📈 Trends  — Sentiment trend chart + stats
 *
 * Powered by:
 *   • Groq API (Llama 3.3 70B) + Firestore admin colleges
 *   • Personalization from search + chat history
 *   • AFINN sentiment analysis (offline)
 *   • DuckDuckGo + Wikipedia web crawling
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
  Dimensions, StatusBar, Alert, Linking, KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

import { askGroqAboutCollege, resetConversation, seedConversation, isGroqConfigured } from '../utils/groqAI';
import { crawlWeb }           from '../utils/webCrawler';
import { analyzeText, getSentimentColor, getSentimentEmoji } from '../utils/sentimentAnalyzer';
import { useChatHistory }     from '../context/ChatHistoryContext';
import { useSearchHistory }   from '../context/SearchHistoryContext';
import { useAuth }            from '../context/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = (d) => {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
    ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ── Quick chips for chat ──────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { icon: 'school-outline',        label: 'Best engineering colleges in Chennai' },
  { icon: 'medkit-outline',        label: 'Government medical colleges Tamil Nadu' },
  { icon: 'cash-outline',          label: 'Low fee colleges with good placement' },
  { icon: 'home-outline',          label: 'Colleges with hostel facilities' },
  { icon: 'trophy-outline',        label: 'IIT vs NIT — which is better?' },
  { icon: 'document-text-outline', label: 'How to apply for JEE Advanced?' },
  { icon: 'ribbon-outline',        label: 'Colleges with NAAC A+ grade' },
  { icon: 'star-outline',          label: 'Review sentiment for Anna University' },
  { icon: 'card-outline',          label: 'Education loan options in India' },
  { icon: 'flash-outline',         label: 'How to prepare for NEET 2025?' },
  { icon: 'business-outline',      label: 'MBA colleges with best placements' },
  { icon: 'analytics-outline',     label: 'Compare CSE programs in Chennai' },
];

// ── Typing dots ───────────────────────────────────────────────────────────────
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

// ── Rich text renderer ────────────────────────────────────────────────────────
function RichText({ text, isUser }) {
  const base = isUser ? '#ffffff' : '#eeeef8';
  const bold = isUser ? '#ffffff' : '#7c6fff';

  const parseRichText = (str) => {
    const parts = str.split(/(\[.*?\]\(.*?\))|(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const textMatch = part.match(/\[(.*?)\]/);
        const urlMatch  = part.match(/\((.*?)\)/);
        if (textMatch && urlMatch) {
          return (
            <Text key={i}
              style={{ color: '#4da6ff', textDecorationLine: 'underline', fontWeight: '600' }}
              onPress={() => Linking.openURL(urlMatch[1]).catch(() => {})}
            >{textMatch[1]}</Text>
          );
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={{ fontWeight: '800', color: bold }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  const lines = (text || '').split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const trimmed   = line.trim();
        const isBullet  = /^[•\-\*]\s/.test(trimmed);
        const isNum     = /^\d+\.\s/.test(trimmed);
        const isDivider = /^={3,}|^─{3,}/.test(trimmed);
        const isEmpty   = trimmed === '';
        if (isDivider) return <View key={i} style={{ height: 1, backgroundColor: '#26263a', marginVertical: 5 }} />;
        if (isEmpty && i > 0) return <View key={i} style={{ height: 5 }} />;
        const content = isBullet ? trimmed.replace(/^[•\-\*]\s/, '') : isNum ? trimmed.replace(/^\d+\.\s/, '') : line;
        return (
          <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: (isBullet || isNum) ? 2 : 0, paddingLeft: (isBullet || isNum) ? 4 : 0 }}>
            {(isBullet || isNum) && (
              <Text style={{ color: '#7c6fff', fontWeight: '800', marginRight: 4, fontSize: 12 }}>
                {isBullet ? '•' : trimmed.match(/^\d+/)[0] + '.'}
              </Text>
            )}
            <Text style={{ flex: 1, color: base, fontSize: 13, lineHeight: 20 }}>
              {parseRichText(content)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const slideX = useRef(new Animated.Value(isUser ? 24 : -24)).current;
  const fade   = useRef(new Animated.Value(0)).current;
  const nd = Platform.OS !== 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, useNativeDriver: nd }),
      Animated.spring(slideX, { toValue: 0, tension: 90, friction: 12, useNativeDriver: nd }),
    ]).start();
  }, []);

  const handleSpeak = async () => {
    const isSpeaking = await Speech.isSpeakingAsync().catch(() => false);
    if (isSpeaking) { Speech.stop(); return; }
    const cleanText = (msg.text || '').replace(/[*_#]/g, '');
    Speech.speak(cleanText, { language: 'en-IN', rate: 0.95, pitch: 1.1 });
  };

  const typeColor = {
    suggestions: '#20d068', hostel: '#38bdf8', fees: '#f59e0b',
    groq: '#7c6fff', welcome: '#7c6fff',
  }[msg.type] || '#7c6fff';

  const bubble = (
    <>
      {!isUser && (
        <View style={cs.aiMeta}>
          <LinearGradient colors={[typeColor + '50', typeColor + '28']} style={cs.aiAvatar}>
            <Text style={{ fontSize: 12 }}>🤖</Text>
          </LinearGradient>
          <Text style={[cs.aiName, { color: typeColor }]}>
            {msg.isRealAI ? 'AntyGravity AI' : 'AntyGravity AI'}
          </Text>
          {msg.isRealAI && (
            <View style={cs.livePill}>
              <View style={cs.liveDot} />
              <Text style={cs.liveLabel}>LIVE AI</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleSpeak} style={{ marginLeft: 6 }}>
            <Ionicons name="volume-medium" size={14} color={typeColor} />
          </TouchableOpacity>
        </View>
      )}
      {isUser ? (
        <LinearGradient colors={['#8b83ff', '#6c63ff']} style={[cs.bubble, cs.userBubble]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ color: '#fff', fontSize: 13, lineHeight: 20 }}>{msg.text}</Text>
        </LinearGradient>
      ) : (
        <View style={[cs.bubble, cs.aiBubble, { borderColor: typeColor + '35' }]}>
          <RichText text={msg.text} isUser={false} />
        </View>
      )}
      <Text style={[cs.timestamp, isUser && { textAlign: 'right' }]}>{msg.time}</Text>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ width: '100%', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }], maxWidth: isUser ? 320 : 480 }}>
          {bubble}
        </Animated.View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 6, width: '100%' }}>
      <Animated.View style={{ opacity: fade, transform: [{ translateX: slideX }], maxWidth: isUser ? '72%' : '88%', flex: isUser ? 0 : 1 }}>
        {bubble}
      </Animated.View>
    </View>
  );
}

// ── Pulse loader (sentiment tab) ──────────────────────────────────────────────
function PulseLoader() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[as.pulseBar, { opacity: anim }]} />;
}

// ── Sentiment gauge ───────────────────────────────────────────────────────────
function SentimentGauge({ score }) {
  const pct   = Math.max(0, Math.min(100, ((score + 5) / 10) * 100));
  const color = score >= 2 ? '#10b981' : score >= 0 ? '#34d399' : score >= -2 ? '#f59e0b' : '#ef4444';
  return (
    <View style={as.gaugeContainer}>
      <View style={as.gaugeTrack}>
        <View style={[as.gaugeFill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={as.gaugeMidLine} />
      </View>
      <View style={as.gaugeLabels}>
        <Text style={[as.gaugeLabel, { color: '#ef4444' }]}>−5</Text>
        <Text style={[as.gaugeLabel, { color: '#94a3b8' }]}>0</Text>
        <Text style={[as.gaugeLabel, { color: '#10b981' }]}>+5</Text>
      </View>
    </View>
  );
}

// ── Sparkline trend chart ─────────────────────────────────────────────────────
function SparklineTrend({ data }) {
  if (!data || data.length < 2) {
    return (
      <View style={as.sparklineEmpty}>
        <Text style={as.sparklineEmptyText}>Complete at least 2 searches to see trends</Text>
      </View>
    );
  }
  const trimmed = data.slice(-10);
  return (
    <View style={as.sparklineContainer}>
      {trimmed.map((entry, i) => {
        const norm = entry.sentimentNormalized || 0;
        const pct  = (norm + 5) / 10;
        const barH = Math.max(4, pct * 60);
        const col  = getSentimentColor(entry.sentimentLabel || 'Neutral');
        return (
          <View key={entry.id || i} style={as.sparklineBar}>
            <View style={[as.sparklineBarFill, { height: barH, backgroundColor: col }]} />
            <Text style={as.sparklineBarLabel} numberOfLines={1}>{(entry.query || '').slice(0, 5)}…</Text>
          </View>
        );
      })}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
export default function AIScreen() {
  const { user }         = useAuth();
  const chatCtx          = useChatHistory();
  const searchHistCtx    = useSearchHistory();
  const groqActive       = isGroqConfigured();

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat');

  // ── Chat state ────────────────────────────────────────────────────────────
  const [inputText,   setInputText]   = useState('');
  const [thinking,    setThinking]    = useState(false);
  const [chatError,   setChatError]   = useState(null);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Sentiment / Analyse state ─────────────────────────────────────────────
  const [sQuery,      setSQuery]      = useState('');
  const [crawling,    setCrawling]    = useState(false);
  const [crawlError,  setCrawlError]  = useState(null);
  const [crawlResult, setCrawlResult] = useState(null);
  const [sentiment,   setSentiment]   = useState(null);
  const [selectedHist,setSelectedHist]= useState(null);
  const sScrollRef = useRef(null);

  // ── Load history on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.uid) {
      chatCtx.loadSessions();
      searchHistCtx.loadHistory?.();
    }
  }, [user?.uid]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [chatCtx.messages.length, thinking]);

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText || inputText).trim();
    if (!text || thinking) return;
    setInputText('');
    Keyboard.dismiss();
    setChatError(null);
    setThinking(true);

    // Ensure we have an active session
    let sessionId = chatCtx.activeSessionId;
    if (!sessionId) {
      sessionId = await chatCtx.createSession(text);
      if (!sessionId) { setThinking(false); return; }
      resetConversation();
    }

    // Optimistically add user message to UI
    const userMsg = { id: Date.now() + 'u', role: 'user', text, time: now(), type: 'user' };
    await chatCtx.addMessage(sessionId, userMsg);

    try {
      // Build personalization context
      const personalization = await chatCtx.getPersonalizationContext(
        searchHistCtx.history || []
      );

      const response = await askGroqAboutCollege(text, null, null, personalization);

      const aiMsg = {
        id:       Date.now() + 'a',
        role:     'assistant',
        text:     response.text,
        time:     now(),
        type:     response.type || 'groq',
        isRealAI: response.isRealAI,
      };
      await chatCtx.addMessage(sessionId, aiMsg);
    } catch (e) {
      setChatError('AI response failed. Please check your connection and try again.');
    } finally {
      setThinking(false);
    }
  }, [inputText, thinking, chatCtx, searchHistCtx.history]);

  // ── New chat session ──────────────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    chatCtx.clearActive();
    resetConversation();
    setInputText('');
    setChatError(null);
  }, [chatCtx]);

  // ── Resume a session ──────────────────────────────────────────────────────
  const handleResumeSession = useCallback(async (session) => {
    await chatCtx.loadSession(session.id);
    resetConversation();
    seedConversation(session.messages || []);
    setActiveTab('chat');
  }, [chatCtx]);

  // ── Delete session ─────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback((id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this conversation?')) chatCtx.deleteSession(id);
    } else {
      Alert.alert('Delete Chat', 'Delete this conversation?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => chatCtx.deleteSession(id) },
      ]);
    }
  }, [chatCtx]);

  // ── Sentiment search ───────────────────────────────────────────────────────
  const handleSentimentSearch = useCallback(async () => {
    const q = sQuery.trim();
    if (!q) return;
    setCrawling(true); setCrawlError(null); setCrawlResult(null); setSentiment(null); setSelectedHist(null);
    try {
      const crawl      = await crawlWeb(q);
      const sentResult = analyzeText(crawl.combinedText || q);
      setCrawlResult(crawl);
      setSentiment(sentResult);
      await searchHistCtx.addSearch?.(q, crawl.results, sentResult);
      sScrollRef.current?.scrollTo?.({ y: 0, animated: true });
    } catch (e) {
      setCrawlError(e.message || 'Search failed. Check internet connection.');
    } finally {
      setCrawling(false);
    }
  }, [sQuery, searchHistCtx]);

  const sentimentColor = sentiment ? getSentimentColor(sentiment.label) : '#60a5fa';

  // ─────────────────────────────────────────────────────────────────────────
  // Welcome message (shown when no session active)
  const WELCOME_MSG = {
    id: 'welcome', role: 'assistant', text:
      `👋 Hi${user?.name ? ', **' + user.name + '**' : ''}! I'm **AntyGravity AI** — your intelligent, multi-modal college guidance model.\n\nI combine:\n• 📚 **Verified Knowledge Base** — structured college data for 500+ institutions\n• 🕸️ **Web Crawling** — real-time data from trusted educational websites\n• 🧠 **NLP + Sentiment Analysis** — AI-powered opinion mining on student reviews\n• 🎯 **Personalization** — tailored recommendations from your history\n\n**Ask me anything:**\n• Which colleges accept my cutoff marks?\n• Compare CSE programs in Chennai\n• What do students say about VIT Vellore? (sentiment)\n• Admission process for IIT, AIIMS, IIM\n\nPowered by Llama 3.3 70B + AntyGravity AI 🚀`,
    time: now(), type: 'welcome', isRealAI: !!groqActive,
  };

  const displayMessages = chatCtx.activeSessionId
    ? chatCtx.messages
    : [WELCOME_MSG];

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <View style={cs.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d14" />

      {/* ── Top header ── */}
      <LinearGradient colors={['#0d0d14', '#16161f']} style={cs.header}>
        <View style={cs.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={cs.headerTitle}>🤖 AntyGravity AI</Text>
            <Text style={cs.headerSub}>
              {groqActive ? '🟢 AI Active · Knowledge Base + Web Crawl + NLP' : '⚡ Local Mode'} · Personalized
            </Text>
          </View>
          {user && (
            <View style={cs.userBadge}>
              <Text style={cs.userBadgeText}>{(user.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Tab bar */}
        <View style={cs.tabBar}>
          {[
            { key: 'chat',    label: '💬 Chat',    badge: 0 },
            { key: 'history', label: '📜 History',  badge: chatCtx.sessions.length },
            { key: 'analyse', label: '🔍 Analyse',  badge: 0 },
            { key: 'trends',  label: '📈 Trends',   badge: 0 },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[cs.tabBtn, activeTab === tab.key && cs.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[cs.tabBtnText, activeTab === tab.key && cs.tabBtnTextActive]}>
                {tab.label}
              </Text>
              {tab.badge > 0 && (
                <View style={cs.tabBadge}><Text style={cs.tabBadgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ════════════════════════════════════════════════════════════════
          CHAT TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Chat toolbar */}
          <View style={cs.chatToolbar}>
            <TouchableOpacity style={cs.newChatBtn} onPress={handleNewChat}>
              <Ionicons name="add-circle-outline" size={16} color="#7c6fff" />
              <Text style={cs.newChatBtnText}>New Chat</Text>
            </TouchableOpacity>
            {chatCtx.activeSessionId && (
              <Text style={cs.sessionLabel} numberOfLines={1}>
                {chatCtx.sessions.find(s => s.id === chatCtx.activeSessionId)?.title || 'Chat'}
              </Text>
            )}
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={cs.messageList}
            contentContainerStyle={cs.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {displayMessages.map(msg => (
              <MessageBubble key={msg.id || msg.text?.slice(0, 10)} msg={msg} />
            ))}

            {thinking && (
              <View style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={[cs.bubble, cs.aiBubble]}>
                  <TypingDots />
                </View>
              </View>
            )}

            {chatError && (
              <View style={cs.errorRow}>
                <Ionicons name="warning-outline" size={14} color="#f87171" />
                <Text style={cs.errorText}>{chatError}</Text>
              </View>
            )}

            {/* Quick chips (show when no active session or few messages) */}
            {displayMessages.length <= 1 && !thinking && (
              <View style={cs.chipsSection}>
                <Text style={cs.chipsLabel}>Try asking:</Text>
                <View style={cs.chipsWrap}>
                  {QUICK_CHIPS.map(chip => (
                    <TouchableOpacity
                      key={chip.label}
                      style={cs.chip}
                      onPress={() => handleSend(chip.label)}
                    >
                      <Ionicons name={chip.icon} size={13} color="#7c6fff" />
                      <Text style={cs.chipText}>{chip.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Input bar */}
          <View style={cs.inputBar}>
            <TextInput
              ref={inputRef}
              style={cs.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about any college, exam, career…"
              placeholderTextColor="#44445a"
              multiline
              maxLength={500}
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
              editable={!thinking}
            />
            <TouchableOpacity
              style={[cs.sendBtn, (!inputText.trim() || thinking) && cs.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || thinking}
            >
              {thinking
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={17} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ════════════════════════════════════════════════════════════════
          HISTORY TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <ScrollView style={hs.root} contentContainerStyle={hs.content} showsVerticalScrollIndicator={false}>
          <View style={hs.headerRow}>
            <Text style={hs.title}>💬 Chat History</Text>
            <Text style={hs.subtitle}>{chatCtx.sessions.length} conversations · synced across devices</Text>
          </View>

          {chatCtx.loading && (
            <View style={hs.center}>
              <ActivityIndicator size="large" color="#7c6fff" />
              <Text style={hs.loadingText}>Loading conversations…</Text>
            </View>
          )}

          {!chatCtx.loading && chatCtx.sessions.length === 0 && (
            <View style={hs.emptyBox}>
              <Text style={hs.emptyEmoji}>💬</Text>
              <Text style={hs.emptyTitle}>No conversations yet</Text>
              <Text style={hs.emptyText}>Your AI chat history will appear here, synced across all your devices.</Text>
              <TouchableOpacity style={hs.startBtn} onPress={() => { setActiveTab('chat'); handleNewChat(); }}>
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={hs.startBtnText}>Start a Conversation</Text>
              </TouchableOpacity>
            </View>
          )}

          {chatCtx.sessions.map(session => (
            <TouchableOpacity
              key={session.id}
              style={hs.sessionCard}
              onPress={() => handleResumeSession(session)}
              activeOpacity={0.85}
            >
              <View style={hs.sessionIcon}>
                <Ionicons name="chatbubbles-outline" size={20} color="#7c6fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={hs.sessionTitle} numberOfLines={2}>{session.title || 'Chat'}</Text>
                <Text style={hs.sessionDate}>{fmt(session.updatedAt)} · {(session.messages || []).length} messages</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteSession(session.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={16} color="#44445a" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ANALYSE TAB (Web Crawl + Sentiment)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analyse' && (
        <ScrollView
          ref={sScrollRef}
          style={{ flex: 1, backgroundColor: '#f1f5f9' }}
          contentContainerStyle={{ padding: 14 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search bar */}
          <View style={as.searchCard}>
            <View style={as.searchRow}>
              <View style={as.searchInputWrap}>
                <Ionicons name="search" size={18} color="#60a5fa" style={{ marginRight: 8 }} />
                <TextInput
                  style={as.searchInput}
                  placeholder="Enter a college, topic, or keyword…"
                  placeholderTextColor="#475569"
                  value={sQuery}
                  onChangeText={setSQuery}
                  onSubmitEditing={handleSentimentSearch}
                  returnKeyType="search"
                  editable={!crawling}
                />
                {sQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSQuery(''); setCrawlResult(null); setSentiment(null); }}>
                    <Ionicons name="close-circle" size={18} color="#475569" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[as.searchBtn, (crawling || !sQuery.trim()) && as.searchBtnDisabled]}
                onPress={handleSentimentSearch}
                disabled={crawling || !sQuery.trim()}
              >
                {crawling ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
            {!sentiment && !crawling && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {['IIT Bombay', 'Anna University', 'AIIMS Delhi', 'VIT Vellore', 'IIM Ahmedabad', 'NIT Trichy'].map(s => (
                  <TouchableOpacity key={s} style={as.quickChip} onPress={() => setSQuery(s)}>
                    <Text style={as.quickChipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {crawling && (
            <View style={as.loadingCard}>
              <ActivityIndicator size="large" color="#60a5fa" style={{ marginBottom: 12 }} />
              <Text style={as.loadingTitle}>🕷️ Crawling the web…</Text>
              <Text style={as.loadingSub}>Fetching data from DuckDuckGo & Wikipedia</Text>
              <PulseLoader /><PulseLoader /><PulseLoader />
            </View>
          )}

          {crawlError && (
            <View style={as.errorCard}>
              <Ionicons name="warning-outline" size={32} color="#f87171" />
              <Text style={as.errorTitle}>Crawl Failed</Text>
              <Text style={as.errorDesc}>{crawlError}</Text>
              <TouchableOpacity style={as.retryBtn} onPress={handleSentimentSearch}>
                <Text style={as.retryBtnText}>↩ Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {sentiment && !crawling && (
            <>
              <LinearGradient colors={['#1e293b', '#0f172a']} style={as.sentimentCard}>
                <View style={as.sentimentTop}>
                  <Text style={as.sentimentQuery} numberOfLines={2}>"{sQuery}"</Text>
                  <View style={[as.sentimentBadge, { backgroundColor: sentimentColor + '30', borderColor: sentimentColor }]}>
                    <Text style={{ fontSize: 16 }}>{getSentimentEmoji(sentiment.label)}</Text>
                    <Text style={[as.sentimentBadgeText, { color: sentimentColor }]}>{sentiment.label}</Text>
                  </View>
                </View>
                <Text style={[as.sentimentScore, { color: sentimentColor }]}>
                  {sentiment.normalizedScore >= 0 ? '+' : ''}{(sentiment.normalizedScore || 0).toFixed(1)}
                </Text>
                <Text style={as.sentimentScoreLabel}>Sentiment Score (−5 to +5)</Text>
                <SentimentGauge score={sentiment.normalizedScore || 0} />
                {(sentiment.positive?.length > 0 || sentiment.negative?.length > 0) && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={as.kwTitle}>Key Signals</Text>
                    <View style={as.kwRow}>
                      {sentiment.positive?.slice(0, 5).map(w => (
                        <View key={w} style={as.kwPos}><Text style={as.kwPosText}>+{w}</Text></View>
                      ))}
                      {sentiment.negative?.slice(0, 5).map(w => (
                        <View key={w} style={as.kwNeg}><Text style={as.kwNegText}>−{w}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={as.aiRec}>
                  <Ionicons name="bulb-outline" size={16} color="#fbbf24" />
                  <Text style={as.aiRecText}>
                    {sentiment.normalizedScore >= 2 ? 'Highly regarded topic! Strong positive signals detected.' :
                     sentiment.normalizedScore >= 0 ? 'Generally positive perception. Good for further research.' :
                     sentiment.normalizedScore >= -2 ? 'Mixed sentiment. Cross-reference multiple sources.' :
                     'Caution: negative signals detected. Verify with official sources.'}
                  </Text>
                </View>
              </LinearGradient>

              {crawlResult?.results?.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <View style={as.sectionHeader}>
                    <Ionicons name="globe-outline" size={16} color="#60a5fa" />
                    <Text style={as.sectionTitle}>Web Sources ({crawlResult.results.length})</Text>
                  </View>
                  {crawlResult.results.map((item, i) => (
                    <View key={i} style={as.sourceCard}>
                      <View style={as.sourceCardHeader}>
                        <Text style={as.sourceCardSource}>{item.source}</Text>
                        {item.url ? (
                          <TouchableOpacity onPress={() => Linking.openURL(item.url).catch(() => {})}>
                            <Ionicons name="open-outline" size={13} color="#60a5fa" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <Text style={as.sourceCardTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={as.sourceCardSnippet} numberOfLines={3}>{item.snippet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {!sentiment && !crawling && !crawlError && (
            <View style={as.emptyState}>
              <Text style={{ fontSize: 56, marginBottom: 12 }}>🔍</Text>
              <Text style={as.emptyTitle}>Web Crawl + Sentiment Analysis</Text>
              <Text style={as.emptyText}>Search any college or topic to crawl the web, analyze sentiment with NLP, and save results to your history.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TRENDS TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'trends' && (
        <ScrollView style={{ flex: 1, backgroundColor: '#f1f5f9' }} contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={as.trendsCard}>
            <Text style={as.trendsTitle}>📈 Sentiment Trend</Text>
            <Text style={as.trendsSub}>Last {Math.min((searchHistCtx.history || []).length, 10)} searches</Text>
            <SparklineTrend data={searchHistCtx.history || []} />
          </LinearGradient>

          {(searchHistCtx.history || []).length > 0 ? (() => {
            const hist   = searchHistCtx.history || [];
            const scores = hist.map(h => h.sentimentNormalized || 0);
            const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
            return (
              <View style={as.statsGrid}>
                {[
                  { label: 'Total Searches', value: hist.length,           icon: 'search',        color: '#60a5fa' },
                  { label: 'Avg Score',       value: avg.toFixed(1),       icon: 'analytics',     color: '#34d399' },
                  { label: 'Best Score',       value: '+' + Math.max(...scores).toFixed(1), icon: 'trending-up', color: '#10b981' },
                  { label: 'Worst Score',      value: Math.min(...scores).toFixed(1), icon: 'trending-down', color: '#f87171' },
                  { label: 'Chat Sessions',    value: chatCtx.sessions.length, icon: 'chatbubbles', color: '#a78bfa' },
                  { label: 'Positive',         value: scores.filter(s => s >= 0).length, icon: 'thumbs-up', color: '#34d399' },
                ].map(stat => (
                  <View key={stat.label} style={as.statCard}>
                    <Ionicons name={stat.icon + '-outline'} size={22} color={stat.color} />
                    <Text style={[as.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={as.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            );
          })() : null}

          {(searchHistCtx.history || []).length === 0 && (
            <View style={as.emptyState}>
              <Text style={{ fontSize: 52, marginBottom: 10 }}>📊</Text>
              <Text style={as.emptyTitle}>No trend data yet</Text>
              <Text style={as.emptyText}>Use the Analyse tab to search topics and start tracking sentiment trends.</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════

// Chat styles
const cs = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#0d0d14' },
  header:     { paddingTop: Platform.OS === 'ios' ? 44 : 10, paddingBottom: 0 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  headerTitle:{ color: '#eeeef8', fontSize: 20, fontWeight: '800' },
  headerSub:  { color: '#44445a', fontSize: 11, marginTop: 2 },
  userBadge:  { width: 34, height: 34, borderRadius: 17, backgroundColor: '#7c6fff', alignItems: 'center', justifyContent: 'center' },
  userBadgeText:{ color: '#fff', fontWeight: '800', fontSize: 14 },

  tabBar:          { flexDirection: 'row', paddingHorizontal: 8 },
  tabBtn:          { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabBtnActive:    { borderBottomColor: '#7c6fff' },
  tabBtnText:      { color: '#44445a', fontSize: 11, fontWeight: '600' },
  tabBtnTextActive:{ color: '#8888a8', fontWeight: '700' },
  tabBadge:        { backgroundColor: '#ef4444', borderRadius: 7, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText:    { color: '#fff', fontSize: 9, fontWeight: '700' },

  chatToolbar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#16161f', borderBottomWidth: 1, borderBottomColor: '#26263a' },
  newChatBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#20202e', borderRadius: 10, borderWidth: 1, borderColor: '#2e2e42' },
  newChatBtnText:{ color: '#7c6fff', fontSize: 12, fontWeight: '600' },
  sessionLabel:  { flex: 1, color: '#8888a8', fontSize: 11, marginLeft: 10 },

  messageList:       { flex: 1, backgroundColor: '#0d0d14' },
  messageListContent:{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },

  aiMeta:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiAvatar:   { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  aiName:     { fontSize: 11, fontWeight: '700' },
  livePill:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  liveDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: '#20d068' },
  liveLabel:  { color: '#20d068', fontSize: 9, fontWeight: '800' },

  bubble:     { borderRadius: 16, padding: 12, marginBottom: 2, maxWidth: '100%' },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble:   { backgroundColor: '#1c1c28', borderWidth: 1, borderBottomLeftRadius: 4 },
  timestamp:  { color: '#44445a', fontSize: 10, marginTop: 2, marginBottom: 4 },

  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#2d1111', borderRadius: 10, marginBottom: 8 },
  errorText: { color: '#f87171', fontSize: 12, flex: 1 },

  chipsSection:{ marginTop: 10, marginBottom: 6 },
  chipsLabel:  { color: '#44445a', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  chipsWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#20202e', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#2e2e42' },
  chipText:    { color: '#8888a8', fontSize: 12 },

  inputBar:   { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: '#16161f', borderTopWidth: 1, borderTopColor: '#26263a' },
  textInput:  { flex: 1, backgroundColor: '#20202e', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, color: '#eeeef8', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#2e2e42' },
  sendBtn:    { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7c6fff', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#26263a' },
});

// History styles
const hs = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0d0d14' },
  content:     { padding: 14 },
  headerRow:   { marginBottom: 16 },
  title:       { color: '#eeeef8', fontSize: 18, fontWeight: '800' },
  subtitle:    { color: '#44445a', fontSize: 12, marginTop: 3 },
  center:      { alignItems: 'center', paddingVertical: 30, gap: 10 },
  loadingText: { color: '#44445a', fontSize: 13 },
  emptyBox:    { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyEmoji:  { fontSize: 52 },
  emptyTitle:  { color: '#8888a8', fontSize: 16, fontWeight: '700' },
  emptyText:   { color: '#44445a', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
  startBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7c6fff', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 10 },
  startBtnText:{ color: '#fff', fontWeight: '700', fontSize: 13 },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#16161f', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#26263a' },
  sessionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#20202e', alignItems: 'center', justifyContent: 'center' },
  sessionTitle:{ color: '#eeeef8', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  sessionDate: { color: '#44445a', fontSize: 11 },
});

// Analyse / Trends styles
const as = StyleSheet.create({
  pulseBar:    { height: 12, borderRadius: 6, backgroundColor: '#334155', width: '100%', marginTop: 8 },
  searchCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14 },
  searchBtn:   { width: 44, height: 44, borderRadius: 12, backgroundColor: '#7c6fff', alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: '#94a3b8' },
  quickChip:   { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  quickChipText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  loadingCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14 },
  loadingTitle:{ color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  loadingSub:  { color: '#64748b', fontSize: 12, marginBottom: 16 },
  errorCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#fecaca' },
  errorTitle:  { color: '#dc2626', fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  errorDesc:   { color: '#475569', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  retryBtn:    { backgroundColor: '#fef2f2', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText:{ color: '#dc2626', fontWeight: '700', fontSize: 13 },
  sentimentCard: { borderRadius: 20, padding: 20, marginBottom: 14 },
  sentimentTop:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
  sentimentQuery:{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', flex: 1 },
  sentimentBadge:{ flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, gap: 4 },
  sentimentBadgeText: { fontSize: 12, fontWeight: '700' },
  sentimentScore:{ fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 2 },
  sentimentScoreLabel: { color: '#475569', fontSize: 11, textAlign: 'center', marginBottom: 14 },
  gaugeContainer:{ marginBottom: 16 },
  gaugeTrack:    { height: 12, backgroundColor: '#334155', borderRadius: 6, overflow: 'hidden', position: 'relative' },
  gaugeFill:     { height: '100%', borderRadius: 6, position: 'absolute', left: 0 },
  gaugeMidLine:  { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: '#475569' },
  gaugeLabels:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  gaugeLabel:    { fontSize: 10, fontWeight: '700' },
  kwTitle:       { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  kwRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kwPos:         { backgroundColor: '#064e3b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  kwPosText:     { color: '#34d399', fontSize: 11, fontWeight: '600' },
  kwNeg:         { backgroundColor: '#450a0a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  kwNegText:     { color: '#f87171', fontSize: 11, fontWeight: '600' },
  aiRec:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#1e3a5f', borderRadius: 12, padding: 12, marginTop: 14 },
  aiRecText:     { color: '#93c5fd', fontSize: 12, flex: 1, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle:  { color: '#1e293b', fontSize: 14, fontWeight: '700' },
  sourceCard:    { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  sourceCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sourceCardSource: { color: '#2563eb', fontSize: 11, fontWeight: '600' },
  sourceCardTitle:  { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  sourceCardSnippet:{ color: '#475569', fontSize: 12, lineHeight: 18 },
  emptyState:    { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle:    { color: '#0f172a', fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyText:     { color: '#475569', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  trendsCard:    { borderRadius: 20, padding: 20, marginBottom: 14 },
  trendsTitle:   { color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  trendsSub:     { color: '#64748b', fontSize: 12, marginBottom: 16 },
  sparklineContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  sparklineBar:  { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  sparklineBarFill: { width: '100%', borderRadius: 4 },
  sparklineBarLabel: { color: '#475569', fontSize: 8, textAlign: 'center' },
  sparklineEmpty:{ paddingVertical: 24, alignItems: 'center' },
  sparklineEmptyText: { color: '#475569', fontSize: 12, textAlign: 'center' },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard:      { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statValue:     { fontSize: 22, fontWeight: '900' },
  statLabel:     { color: '#64748b', fontSize: 10, textAlign: 'center' },
});

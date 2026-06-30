import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Keyboard, Platform,
  Animated, useWindowDimensions, ActivityIndicator, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { askGroqAboutCollege, isGroqConfigured, resetConversation } from '../utils/groqAI';

// ── Color palette ──────────────────────────────────────────────────────────────
const C = {
  bg:          '#0d0d14',
  surface:     '#16161f',
  card:        '#1c1c28',
  border:      '#26263a',
  accent:      '#7c6fff',
  accentDark:  '#5a54cc',
  green:       '#20d068',
  amber:       '#f59e0b',
  rose:        '#f43f5e',
  sky:         '#38bdf8',
  textPri:     '#eeeef8',
  textSec:     '#8888a8',
  textDim:     '#44445a',
  userBg:      '#7c6fff',
  aiBg:        '#1c1c28',
  chip:        '#20202e',
  chipBorder:  '#2e2e42',
  white:       '#ffffff',
};

// ── Quick chips ────────────────────────────────────────────────────────────────
const CHIPS = [
  { icon: 'information-circle-outline', label: 'Tell me about this college' },
  { icon: 'home-outline',               label: 'Is hostel available?' },
  { icon: 'trending-up-outline',        label: 'What is the placement rate?' },
  { icon: 'book-outline',               label: 'What courses are offered?' },
  { icon: 'document-text-outline',      label: 'Admission process?' },
  { icon: 'cash-outline',               label: 'Annual fee details' },
  { icon: 'ribbon-outline',             label: 'NAAC grade and ranking' },
  { icon: 'business-outline',           label: 'Top recruiting companies' },
  { icon: 'star-outline',               label: 'Best engineering colleges' },
  { icon: 'medkit-outline',             label: 'Government medical colleges' },
  { icon: 'school-outline',             label: 'JEE vs NEET difference' },
  { icon: 'card-outline',               label: 'Education loan options' },
  { icon: 'flash-outline',              label: 'How to prepare for NEET?' },
  { icon: 'trophy-outline',             label: 'Best private colleges in TN' },
];

// ── Typing dots ────────────────────────────────────────────────────────────────
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
          backgroundColor: C.accent,
          marginHorizontal: 3,
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
        }} />
      ))}
    </View>
  );
}

// ── Rich text (markdown-like) ──────────────────────────────────────────────────
function RichText({ text, isUser }) {
  const base = isUser ? C.white : C.textPri;
  const bold = isUser ? C.white : C.accent;
  const lines = (text || '').split('\n');

  const parseBold = (str) => {
    const parts = str.split('**');
    return parts.map((p, i) => (
      <Text key={i} style={{ fontWeight: i % 2 === 1 ? '800' : '400', color: i % 2 === 1 ? bold : base }}>
        {p}
      </Text>
    ));
  };

  return (
    <View>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const isBullet   = /^[•\-\*]\s/.test(trimmed);
        const isNumbered = /^\d+\.\s/.test(trimmed);
        const isDivider  = /^={3,}|^─{3,}/.test(trimmed);
        const isEmpty    = trimmed === '';

        if (isDivider) return <View key={i} style={{ height: 1, backgroundColor: C.border, marginVertical: 5 }} />;
        if (isEmpty && i > 0)   return <View key={i} style={{ height: 5 }} />;

        const content = isBullet
          ? trimmed.replace(/^[•\-\*]\s/, '')
          : isNumbered
            ? trimmed.replace(/^\d+\.\s/, '')
            : line;

        return (
          <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: (isBullet || isNumbered) ? 2 : 0, paddingLeft: (isBullet || isNumbered) ? 4 : 0 }}>
            {(isBullet || isNumbered) && (
              <Text style={{ color: C.accent, fontWeight: '800', marginRight: 5, fontSize: 13 }}>
                {isBullet ? '•' : trimmed.match(/^\d+/)[0] + '.'}
              </Text>
            )}
            <Text style={{ flex: 1, color: base, fontSize: 14.5, lineHeight: 22 }}>
              {parseBold(content)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.sender === 'user';
  const slideX = useRef(new Animated.Value(isUser ? 24 : -24)).current;
  const fade   = useRef(new Animated.Value(0)).current;
  const nd = Platform.OS !== 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, useNativeDriver: nd }),
      Animated.spring(slideX, { toValue: 0, tension: 90, friction: 12, useNativeDriver: nd }),
    ]).start();
  }, []);

  const typeColor = {
    suggestions: C.green, hostel: C.sky, placement: C.green,
    fees: C.amber, courses: C.accent, admission: '#fb923c',
    rating: C.amber, rejected: C.rose, groq: C.accent, welcome: C.accent,
  }[msg.type] || C.accent;

  return (
    // Outer full-width row — justifyContent handles LEFT/RIGHT alignment
    // This is the correct Android-safe pattern (no alignSelf on Animated.View)
    <View style={{
      flexDirection: 'row',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 8,
      width: '100%',
    }}>
      <Animated.View style={{
        opacity: fade,
        transform: [{ translateX: slideX }],
        // AI: nearly full width | User: 78% max
        maxWidth: isUser ? '78%' : '97%',
        flex: isUser ? 0 : 1,
      }}>
        {/* AI label row */}
        {!isUser && (
          <View style={styles.aiMeta}>
            <LinearGradient
              colors={[typeColor + '50', typeColor + '28']}
              style={styles.aiAvatar}
            >
              <Text style={{ fontSize: 13 }}>🤖</Text>
            </LinearGradient>
            <Text style={[styles.aiName, { color: typeColor }]}>
              {msg.isRealAI ? 'Acadivo AI' : 'College AI'}
            </Text>
            {msg.isRealAI && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>LIVE AI</Text>
              </View>
            )}
          </View>
        )}

        {/* Bubble */}
        {isUser ? (
          <LinearGradient
            colors={['#8b83ff', '#6c63ff']}
            style={[styles.bubble, styles.userBubble]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={{ color: C.white, fontSize: 15, lineHeight: 23 }}>{msg.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.aiBubble, { borderColor: typeColor + '35' }]}>
            <RichText text={msg.text} isUser={false} />
          </View>
        )}

        {/* Timestamp */}
        <Text style={[styles.timestamp, isUser && { textAlign: 'right' }]}>{msg.time}</Text>
      </Animated.View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function CollegeChatScreen({ route, navigation }) {
  const { college, departmentLabel } = route.params || {};
  const groqActive = isGroqConfigured();
  const insets = useSafeAreaInsets();
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Full welcome message — matches web version
  const buildWelcome = () => {
    if (college) {
      return `👋 Hello! I'm **Acadivo AI** — your personal college counsellor.\n\nI'm currently loaded with everything about **${college.name}** (${college.location}, ${college.state}).\n\n${groqActive ? '🟢 **Real AI is active** — I can answer anything about colleges, admissions, exams, and careers!\n\n' : ''}Ask me about:\n• 🏠 Hostel & Accommodation\n• 📊 Placements & Salary packages\n• 🎓 Courses & Eligibility\n• 📋 Admission & Counselling\n• 💰 Fees & Scholarships\n• 🏆 Rankings & NAAC Grade\n\nWhat would you like to know? 😊`;
    }
    return `👋 Hello! I'm **Acadivo AI** — your personal Indian college counsellor.\n\n${groqActive ? '🟢 **Real AI is active!**\n\n' : ''}I can help you with:\n• 🏛️ Finding the right college\n• 📝 JEE, NEET, CLAT, CAT preparation\n• 💼 Career paths after graduation\n• 💰 Scholarships & Education loans\n• 📊 Comparing colleges\n\nAsk me anything about Indian college admissions! 🎓`;
  };

  const [messages, setMessages] = useState([{
    id: 1, sender: 'ai', type: 'welcome',
    isRealAI: groqActive, time: getTime(), text: buildWelcome(),
  }]);
  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);

  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  // Keyboard height — used on Android to slide input above keyboard (ChatGPT style)
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, []);

  // Android: listen to keyboard events and shift content up (ChatGPT-style)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates.height);
      // Scroll to last message so it's visible above keyboard
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKbHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (textOverride) => {
    const msgText = (textOverride || inputText).trim();
    if (!msgText || isTyping) return;

    setInputText('');
    setChipsVisible(false);
    setIsTyping(true);

    const userMsg = { id: Date.now(), sender: 'user', text: msgText, time: getTime() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await askGroqAboutCollege(msgText, college || {}, departmentLabel || '');
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        text: res.text, type: res.type, isRealAI: res.isRealAI, time: getTime(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        text: '⚠️ Something went wrong. Please try again.',
        type: 'rejected', isRealAI: false, time: getTime(),
      }]);
    }
    setIsTyping(false);
  }, [inputText, isTyping, college, departmentLabel]);

  const clearChat = () => {
    resetConversation();
    setMessages([{
      id: Date.now(), sender: 'ai', type: 'welcome',
      isRealAI: groqActive, time: getTime(),
      text: `🔄 Chat cleared! Ask me anything about ${college ? `**${college.name}**` : 'Indian colleges'}. 😊`,
    }]);
    setChipsVisible(true);
  };

  // ── Shared inner content (messages + chips + input) ─────────────────────────
  const chatBody = (
    <>
      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 16, width: '100%' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.aiMeta}>
                <LinearGradient colors={[C.accent + '50', C.accent + '28']} style={styles.aiAvatar}>
                  <Text style={{ fontSize: 13 }}>🤖</Text>
                </LinearGradient>
                <Text style={[styles.aiName, { color: C.accent }]}>Thinking…</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 10, alignSelf: 'flex-start', minWidth: 80 }]}>
                <TypingDots />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Quick chips ── */}
      {chipsVisible && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
        >
          {CHIPS.map((chip, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => sendMessage(chip.label)}
              activeOpacity={0.7}
            >
              <Ionicons name={chip.icon} size={12} color={C.accent} />
              <Text style={styles.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Input bar ── */}
      <View style={styles.inputWrap}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.iconBtn, chipsVisible && { borderColor: C.accent, backgroundColor: C.accent + '18' }]}
            onPress={() => setChipsVisible(v => !v)}
            activeOpacity={0.7}
          >
            <Ionicons name="apps-outline" size={18} color={chipsVisible ? C.accent : C.textDim} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={groqActive ? 'Ask about colleges, exams, careers…' : 'Ask about this college…'}
            placeholderTextColor={C.textDim}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
            editable={!isTyping}
            selectionColor={C.accent}
          />

          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() && !isTyping && styles.sendBtnActive]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            {isTyping
              ? <ActivityIndicator size="small" color={C.accent} />
              : <Ionicons name="send" size={16} color={inputText.trim() ? C.white : C.textDim} />
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          {groqActive ? '⚡ Llama 3 70B · Groq · College questions only' : '🤖 Local AI · Add GROQ_API_KEY for real AI'}
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.safe, Platform.OS === 'android' && { paddingBottom: kbHeight }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <LinearGradient colors={['#12121c', '#191926']} style={StyleSheet.absoluteFill} />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={17} color={C.accent} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarWrap}>
            <LinearGradient colors={['#7c6fff', '#a855f7']} style={styles.headerAvatar}>
              <Text style={{ fontSize: 14 }}>🤖</Text>
            </LinearGradient>
            <View style={[styles.onlineDot, { backgroundColor: groqActive ? C.green : C.amber }]} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>Acadivo AI</Text>
              {groqActive && (
                <View style={styles.badge70B}>
                  <Text style={styles.badge70BText}>70B</Text>
                </View>
              )}
              {groqActive && (
                <View style={styles.liveHeaderPill}>
                  <View style={styles.liveHeaderDot} />
                  <Text style={styles.liveHeaderLabel}>LIVE AI</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSub} numberOfLines={1}>
              {college ? `📍 ${college.name}` : '🇮🇳 Indian College Counsellor'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.headerBtn}>
          <Ionicons name="refresh-outline" size={16} color={C.textSec} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Body: iOS uses KAV padding, Android uses direct paddingBottom ── */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={0}>
          {chatBody}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          {chatBody}
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header — compact to maximise chat space
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 1,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 6,
  },
  headerBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: C.bg,
  },
  headerTitle: { color: C.textPri, fontSize: 13, fontWeight: '800', flexShrink: 1 },
  headerSub:   { color: C.textSec, fontSize: 9, marginTop: 0 },
  badge70B: {
    backgroundColor: C.accent + '28', borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
    borderWidth: 1, borderColor: C.accent + '60',
  },
  badge70BText: { color: C.accent, fontSize: 8, fontWeight: '900' },
  liveHeaderPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.green + '20', borderRadius: 5,
    paddingHorizontal: 4, paddingVertical: 1,
    borderWidth: 1, borderColor: C.green + '40',
  },
  liveHeaderDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: C.green },
  liveHeaderLabel: { color: C.green, fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },

  // Messages
  messageScroll:   { flex: 1, backgroundColor: C.bg },
  messageContent:  { paddingHorizontal: 10, paddingTop: 4, paddingBottom: 3 },

  // AI meta
  aiMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  aiAvatar: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  aiName:   { color: C.textSec, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.green + '20', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: C.green + '40',
  },
  liveDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: C.green },
  liveLabel:{ color: C.green, fontSize: 8, fontWeight: '800' },

  // Bubbles
  bubble: { borderRadius: 16, padding: 9, borderWidth: 1 },
  userBubble: { borderColor: '#9d96ff', borderBottomRightRadius: 4 },
  aiBubble:   {
    backgroundColor: C.aiBg, borderColor: C.border,
    borderBottomLeftRadius: 4,
  },
  timestamp: { color: C.textDim, fontSize: 9, marginTop: 4, marginHorizontal: 2 },

  // Chips — compact
  chipScroll: {
    backgroundColor: C.surface, borderTopWidth: 1,
    borderTopColor: C.border, maxHeight: 36,
  },
  chipContent: { paddingHorizontal: 6, paddingVertical: 1, gap: 5, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.chip, borderRadius: 12,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: C.chipBorder,
  },
  chipText: { color: C.accent, fontSize: 10.5, fontWeight: '600' },

  // Input — compact to maximise chat space
  inputWrap: {
    backgroundColor: C.surface, borderTopWidth: 1,
    borderTopColor: C.border, paddingTop: 6, paddingBottom: Platform.OS === 'android' ? 6 : 2,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 8, gap: 6,
  },
  iconBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.chipBorder,
  },
  input: {
    flex: 1, backgroundColor: C.card,
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7,
    color: C.textPri, fontSize: 13.5, lineHeight: 19,
    borderWidth: 1, borderColor: C.border, maxHeight: 90,
  },
  sendBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.chipBorder,
  },
  sendBtnActive: {
    backgroundColor: C.accent, borderColor: C.accent,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
  },
  footer: {
    color: C.textDim, fontSize: 8, textAlign: 'center',
    marginTop: 0, paddingHorizontal: 8,
  },
});

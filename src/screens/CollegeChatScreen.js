import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView,
  Animated, useWindowDimensions, ActivityIndicator,
  StatusBar, Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { askGroqAboutCollege, isGroqConfigured, resetConversation } from '../utils/groqAI';

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#0f0f13',
  surface:   '#18181f',
  card:      '#1e1e28',
  border:    '#2a2a38',
  accent:    '#6c63ff',
  accentSoft:'#6c63ff22',
  accentGlow:'#6c63ff55',
  green:     '#22c55e',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  sky:       '#38bdf8',
  textPri:   '#f0f0f8',
  textSec:   '#9898b0',
  textDim:   '#55556a',
  userBg:    '#6c63ff',
  aiBg:      '#1e1e28',
  chip:      '#252532',
  chipBorder:'#33334a',
  white:     '#ffffff',
};

// ── Quick question chips ───────────────────────────────────────────────────────
const CHIPS = [
  { icon: 'information-circle-outline', label: 'About this college' },
  { icon: 'home-outline',               label: 'Hostel available?' },
  { icon: 'trending-up-outline',        label: 'Placement rate' },
  { icon: 'book-outline',               label: 'Courses offered' },
  { icon: 'document-text-outline',      label: 'Admission process' },
  { icon: 'business-outline',           label: 'Top recruiters' },
  { icon: 'ribbon-outline',             label: 'NAAC grade' },
  { icon: 'cash-outline',               label: 'Annual fee' },
  { icon: 'star-outline',               label: 'Show top engineering colleges' },
  { icon: 'medkit-outline',             label: 'Show government medical colleges' },
  { icon: 'school-outline',             label: 'JEE vs NEET difference' },
  { icon: 'card-outline',               label: 'Education loan options' },
  { icon: 'search-outline',             label: 'Suggest colleges with hostel' },
  { icon: 'flash-outline',              label: 'How to prepare for NEET?' },
  { icon: 'trophy-outline',             label: 'Best private colleges in TN' },
];

// ── Typing dots animation component ──────────────────────────────────────────
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (dot) => ({
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.accent,
    marginHorizontal: 3,
    opacity: dot,
    transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

// ── Markdown-like text renderer ───────────────────────────────────────────────
function RichText({ text, isUser }) {
  const baseColor = isUser ? C.white : C.textPri;
  const boldColor = isUser ? C.white : C.accent;

  const lines = (text || '').split('\n');

  return (
    <View>
      {lines.map((line, li) => {
        // Bullet line
        const isBullet = /^[•\-\*]\s/.test(line.trim());
        const isNumbered = /^\d+\.\s/.test(line.trim());
        const isHeader = /^={3,}/.test(line.trim()) || /^─{3,}/.test(line.trim());
        const isEmptyLine = line.trim() === '';

        if (isHeader) return <View key={li} style={{ height: 1, backgroundColor: C.border, marginVertical: 6 }} />;
        if (isEmptyLine && li > 0) return <View key={li} style={{ height: 6 }} />;

        // Parse bold **text**
        const parseBold = (str) => {
          const parts = str.split('**');
          return parts.map((part, i) => (
            <Text key={i} style={i % 2 === 1
              ? { fontWeight: '800', color: boldColor }
              : { color: baseColor }
            }>{part}</Text>
          ));
        };

        return (
          <View key={li} style={[
            { flexDirection: 'row', flexWrap: 'wrap', marginBottom: isBullet || isNumbered ? 3 : 0 },
            isBullet || isNumbered ? { paddingLeft: 8 } : {},
          ]}>
            {(isBullet || isNumbered) && (
              <Text style={{ color: C.accent, fontWeight: '800', marginRight: 4 }}>
                {isBullet ? '•' : line.trim().match(/^\d+/)[0] + '.'}
              </Text>
            )}
            <Text style={{ flex: 1, color: baseColor, fontSize: 13, lineHeight: 20 }}>
              {parseBold(isBullet
                ? line.trim().replace(/^[•\-\*]\s/, '')
                : isNumbered
                  ? line.trim().replace(/^\d+\.\s/, '')
                  : line
              )}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, scale }) {
  const isUser = msg.sender === 'user';
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeColors = {
    suggestions: C.green,
    hostel:      C.sky,
    placement:   C.green,
    fees:        C.amber,
    courses:     C.accent,
    admission:   '#fb923c',
    rating:      C.amber,
    rejected:    C.rose,
    groq:        C.accent,
    welcome:     C.accent,
  };
  const accentColor = typeColors[msg.type] || C.accent;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateX: slideAnim }],
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '88%',
      marginBottom: 10,
    }}>
      {/* AI avatar label */}
      {!isUser && (
        <View style={styles.aiMeta}>
          <View style={[styles.aiAvatar, { backgroundColor: accentColor + '22', borderColor: accentColor + '66' }]}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.aiName, { color: accentColor }]}>
              {msg.isRealAI ? 'SmartAdmission AI' : 'College AI'}
            </Text>
            {msg.isRealAI && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>LIVE AI</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Bubble */}
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : [styles.aiBubble, { borderColor: accentColor + '33' }],
        !isUser && msg.isRealAI && { borderColor: accentColor + '55' },
      ]}>
        {isUser ? (
          <Text style={{ color: C.white, fontSize: 14, lineHeight: 22 }}>{msg.text}</Text>
        ) : (
          <RichText text={msg.text} isUser={false} />
        )}
      </View>

      {/* Timestamp */}
      <Text style={[styles.timestamp, isUser && { textAlign: 'right' }]}>
        {msg.time}
      </Text>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CollegeChatScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const scale = width < 380 ? 0.9 : width > 700 ? 1.15 : 1;

  const { college, departmentLabel } = route.params || {};
  const groqActive = isGroqConfigured();

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      type: 'welcome',
      isRealAI: groqActive,
      time: getTime(),
      text: college
        ? `👋 Hello! I'm **SmartAdmission AI** — your personal college counsellor.\n\nI'm currently loaded with everything about **${college.name}** (${college.location}, ${college.state}).\n\n${groqActive ? '🟢 **Real AI is active** — I can answer anything about colleges, admissions, exams, and careers!\n\n' : ''}Ask me about:\n• 🏠 Hostel & Accommodation\n• 📊 Placements & Salary packages\n• 🎓 Courses & Eligibility\n• 📋 Admission & Counselling\n• 💰 Fees & Scholarships\n• 🏆 Rankings & NAAC Grade\n\nWhat would you like to know? 😊`
        : `👋 Hello! I'm **SmartAdmission AI** — your personal Indian college counsellor.\n\n${groqActive ? '🟢 **Real AI is active!**\n\n' : ''}I can help you with:\n• 🏛️ Finding the right college\n• 📝 JEE, NEET, CLAT, CAT preparation\n• 💼 Career paths after graduation\n• 💰 Scholarships & Education loans\n• 📊 Compare colleges\n\nAsk me anything about Indian college admissions! 🎓`,
    }
  ]);

  const [inputText, setInputText]   = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const scrollRef   = useRef(null);
  const inputRef    = useRef(null);
  const headerAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
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
      const response = await askGroqAboutCollege(msgText, college || {}, departmentLabel || '');
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        type: response.type,
        isRealAI: response.isRealAI,
        time: getTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: '⚠️ Something went wrong. Please try again.',
        type: 'rejected',
        isRealAI: false,
        time: getTime(),
      }]);
    }
    setIsTyping(false);
  }, [inputText, isTyping, college, departmentLabel]);

  const clearChat = () => {
    resetConversation();
    setMessages([{
      id: Date.now(),
      sender: 'ai',
      type: 'welcome',
      isRealAI: groqActive,
      time: getTime(),
      text: `🔄 Chat cleared! I'm ready to help. What would you like to know about ${college ? `**${college.name}**` : 'Indian colleges'}? 😊`,
    }]);
    setChipsVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <LinearGradient
          colors={['#13131c', '#1a1a26']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={C.accent} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarWrap}>
            <LinearGradient colors={['#6c63ff', '#a855f7']} style={styles.headerAvatar}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </LinearGradient>
            <View style={[styles.onlineBadge, { backgroundColor: groqActive ? C.green : C.amber }]} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>SmartAdmission AI</Text>
              {groqActive && (
                <View style={styles.groqBadge}>
                  <Text style={styles.groqBadgeText}>70B</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSub} numberOfLines={1}>
              {college ? `📍 ${college.name}` : '🇮🇳 Indian College Counsellor'}
            </Text>
            {groqActive && (
              <View style={styles.livePillHeader}>
                <View style={styles.liveDotHeader} />
                <Text style={styles.liveLabelHeader}>LIVE AI</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.headerBtn}>
          <Ionicons name="refresh-outline" size={20} color={C.textSec} />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {/* ── Messages ─────────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageScroll}
          contentContainerStyle={[styles.messageContent, { flexGrow: 1, justifyContent: 'flex-end' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} scale={scale} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View style={[styles.aiBubble, {
              alignSelf: 'flex-start', maxWidth: '50%',
              borderColor: C.accent + '33', marginBottom: 10,
            }]}>
              <View style={styles.aiMeta}>
                <View style={[styles.aiAvatar, { backgroundColor: C.accent + '22', borderColor: C.accent + '66' }]}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
                <Text style={[styles.aiName, { color: C.accent }]}>Thinking...</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, { borderColor: C.accent + '44' }]}>
                <TypingDots />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* ── Quick chips ──────────────────────────────────────────────────── */}
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
                <Ionicons name={chip.icon} size={13} color={C.accent} />
                <Text style={styles.chipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Input row ────────────────────────────────────────────────────── */}
        <View style={styles.inputWrap}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.chipToggle}
              onPress={() => setChipsVisible(v => !v)}
              activeOpacity={0.7}
            >
              <Ionicons name="apps-outline" size={20} color={chipsVisible ? C.accent : C.textDim} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={groqActive
                ? 'Ask anything about colleges, exams, careers...'
                : 'Ask about this college...'}
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
              style={[
                styles.sendBtn,
                inputText.trim() && !isTyping && styles.sendBtnActive,
              ]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color={C.accent} />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={inputText.trim() ? C.white : C.textDim}
                />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            {groqActive
              ? '⚡ Powered by Llama 3 70B via Groq · College questions only'
              : '🤖 Local AI · Configure GROQ_API_KEY for real AI'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 6,
  },
  headerBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: 5,
    borderWidth: 2, borderColor: C.bg,
  },
  headerTitle: { color: C.textPri, fontSize: 14, fontWeight: '700' },
  headerSub: { color: C.textSec, fontSize: 10, marginTop: 1 },
  groqBadge: {
    backgroundColor: '#6c63ff33',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: C.accent + '66',
  },
  groqBadgeText: { color: C.accent, fontSize: 9, fontWeight: '800' },

  // Messages
  messageScroll: { flex: 1, backgroundColor: C.bg },
  messageContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },

  // AI meta row
  aiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiAvatar: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  aiName: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.green + '22',
    borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.green + '44',
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green },
  liveLabel: { color: C.green, fontSize: 9, fontWeight: '800' },

  // Header LIVE AI pill
  livePillHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.green + '22',
    borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1,
    borderColor: C.green + '44',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  liveDotHeader: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.green },
  liveLabelHeader: { color: C.green, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },

  // Bubbles
  bubble: {
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: C.userBg,
    borderColor: '#8b85ff',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: C.aiBg,
    borderColor: C.border,
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    color: C.textDim,
    fontSize: 9,
    marginTop: 2,
    marginHorizontal: 4,
  },

  // Chips
  chipScroll: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    maxHeight: 44,
  },
  chipContent: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.chip,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  chipText: { color: C.accent, fontSize: 11, fontWeight: '600' },

  // Input
  inputWrap: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 7,
    paddingBottom: 7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    gap: 6,
  },
  chipToggle: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: C.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  input: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: C.textPri,
    fontSize: 13,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: 90,
    lineHeight: 18,
  },
  sendBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: C.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  sendBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  footer: {
    color: C.textDim,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
});

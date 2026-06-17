import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView,
  Animated, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { askGroqAboutCollege, isGroqConfigured } from '../utils/groqAI';

const COLORS = {
  bg: '#ffffff', card: '#f8f9fa', border: '#e2e8f0',
  purple: '#2563eb', gold: '#eab308', green: '#16a34a',
  blue: '#0284c7', text: '#0f172a', sub: '#334155', dim: '#475569',
  groq: '#6366f1',
};

const QUICK_QUESTIONS = [
  "Tell me about this college",
  "Is hostel available?",
  "What is the placement rate?",
  "What courses are offered?",
  "What is the admission process?",
  "What companies visit for placement?",
  "What is the NAAC grade?",
  "How to apply for this college?",
];

export default function CollegeChatScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const scale = width < 380 ? 0.9 : (width > 700 ? 1.2 : 1);
  const styles = getStyles(scale);

  const { college, departmentLabel } = route.params;
  const groqActive = isGroqConfigured();

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `👋 Hello! I'm the **AI Counsellor** for **${college.name}**.\n\n${groqActive ? '🟢 Real AI is active (Groq Llama 3)\n\n' : ''}I only answer college-related questions. Ask me about:\n\n🏠 Hostel  |  📊 Placements  |  🎓 Courses\n📋 Admission  |  ⭐ Ratings  |  💼 Companies`,
      sender: 'ai',
      type: 'welcome',
      isRealAI: groqActive,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || inputText.trim();
    if (!msgText || isTyping) return;

    const userMsg = { id: Date.now(), text: msgText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const response = await askGroqAboutCollege(msgText, college, departmentLabel);

    const aiMsg = {
      id: Date.now() + 1,
      text: response.text,
      sender: 'ai',
      type: response.type,
      isRealAI: response.isRealAI,
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const getMessageColor = (type) => {
    const colors = {
      groq: COLORS.groq,
      fees: COLORS.gold,
      hostel: COLORS.blue,
      placement: COLORS.green,
      courses: COLORS.purple,
      admission: '#ea580c',
      facilities: COLORS.blue,
      rating: COLORS.gold,
      rejected: '#b91c1c',
      welcome: COLORS.purple,
      default: COLORS.purple,
    };
    return colors[type] || COLORS.purple;
  };

  const formatText = (text) => {
    return text.split('**').map((part, i) =>
      i % 2 === 1
        ? <Text key={i} style={{ fontWeight: '800', color: COLORS.purple }}>{part}</Text>
        : <Text key={i}>{part}</Text>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22 * scale} color={COLORS.purple} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>🤖 AI Counsellor</Text>
            {groqActive && (
              <View style={styles.groqBadge}>
                <Text style={styles.groqBadgeText}>LIVE AI</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>{college.name}</Text>
        </View>
        <View style={[styles.onlineDot, { backgroundColor: groqActive ? COLORS.groq : COLORS.green }]} />
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                  msg.sender === 'ai' && { borderColor: getMessageColor(msg.type) + '44' },
                ]}
              >
                {msg.sender === 'ai' && (
                  <View style={styles.aiLabelRow}>
                    <Text style={[styles.aiLabel, { color: getMessageColor(msg.type) }]}>
                      🤖 {msg.isRealAI ? 'Groq AI (Llama 3)' : 'College AI'}
                    </Text>
                    {msg.isRealAI && (
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                )}
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.aiText,
                  msg.type === 'rejected' && { color: '#b91c1c' },
                ]}>
                  {formatText(msg.text)}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={[styles.aiLabel, { color: groqActive ? COLORS.groq : COLORS.purple }]}>
                  🤖 {groqActive ? 'Groq AI thinking...' : 'College AI'}
                </Text>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={groqActive ? COLORS.groq : COLORS.purple} />
                  <Text style={[styles.typingText, { color: groqActive ? COLORS.groq : COLORS.purple }]}>
                    {groqActive ? ' Generating response...' : ' ● ● ●'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickQs}
            contentContainerStyle={styles.quickQsContent}
          >
            {QUICK_QUESTIONS.map((q, i) => (
              <TouchableOpacity key={i} style={styles.quickQBtn} onPress={() => sendMessage(q)}>
                <Text style={styles.quickQText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={groqActive ? "Ask the AI anything about this college..." : "Ask about this college..."}
              placeholderTextColor={COLORS.dim}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              multiline
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: groqActive ? COLORS.groq : COLORS.purple },
                (!inputText.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons name="send" size={20 * scale} color={inputText.trim() && !isTyping ? '#ffffff' : COLORS.dim} />
            </TouchableOpacity>
          </View>

          {/* Powered by */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>
              {groqActive
                ? '⚡ Powered by Groq · Llama 3 · College questions only'
                : '🤖 Local AI · Add GROQ_API_KEY to GitHub Secrets for real AI'}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const getStyles = (scale) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16 * scale, paddingVertical: 12 * scale,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: 12 * scale,
  },
  backBtn: { padding: 4 * scale },
  headerInfo: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * scale },
  headerTitle: { color: COLORS.text, fontSize: 16 * scale, fontWeight: '700' },
  groqBadge: {
    backgroundColor: COLORS.groq, borderRadius: 6 * scale,
    paddingHorizontal: 6 * scale, paddingVertical: 2 * scale,
  },
  groqBadgeText: { color: '#fff', fontSize: 9 * scale, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: COLORS.dim, fontSize: 12 * scale, marginTop: 2 },
  onlineDot: { width: 10 * scale, height: 10 * scale, borderRadius: 5 * scale },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 16 * scale, paddingVertical: 12 * scale, gap: 12 * scale },
  messageBubble: { maxWidth: '85%', borderRadius: 16 * scale, padding: 12 * scale, borderWidth: 1 },
  userBubble: {
    alignSelf: 'flex-end', backgroundColor: COLORS.purple + '18',
    borderColor: COLORS.purple + '55', borderBottomRightRadius: 4 * scale,
  },
  aiBubble: {
    alignSelf: 'flex-start', backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4 * scale,
  },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * scale, marginBottom: 6 * scale },
  aiLabel: { fontSize: 10 * scale, fontWeight: '700', letterSpacing: 0.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 3 * scale },
  liveDot: { width: 5 * scale, height: 5 * scale, borderRadius: 3 * scale, backgroundColor: COLORS.groq },
  liveText: { color: COLORS.groq, fontSize: 9 * scale, fontWeight: '800' },
  messageText: { fontSize: 13 * scale, lineHeight: 20 * scale },
  userText: { color: COLORS.text },
  aiText: { color: COLORS.sub },
  messageTime: { color: COLORS.dim, fontSize: 10 * scale, marginTop: 6 * scale, textAlign: 'right' },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center' },
  typingText: { fontSize: 13 * scale },

  // Quick questions
  quickQs: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingVertical: 8 * scale, maxHeight: 60 * scale,
  },
  quickQsContent: { paddingHorizontal: 12 * scale, gap: 8 * scale, alignItems: 'center' },
  quickQBtn: {
    backgroundColor: COLORS.card, borderRadius: 20 * scale,
    paddingHorizontal: 14 * scale, paddingVertical: 8 * scale,
    borderWidth: 1, borderColor: COLORS.border,
  },
  quickQText: { color: COLORS.purple, fontSize: 12 * scale, fontWeight: '600' },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12 * scale, paddingVertical: 10 * scale,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 * scale,
  },
  input: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 20 * scale,
    paddingHorizontal: 16 * scale, paddingVertical: 12 * scale,
    color: COLORS.text, fontSize: 14 * scale, borderWidth: 1, borderColor: COLORS.border,
    maxHeight: 100 * scale,
  },
  sendBtn: {
    width: 44 * scale, height: 44 * scale, borderRadius: 22 * scale,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },

  // Footer
  poweredBy: { paddingVertical: 6 * scale, alignItems: 'center', backgroundColor: COLORS.card },
  poweredByText: { color: COLORS.dim, fontSize: 10 * scale },
});

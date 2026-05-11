import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateAIResponse } from '../utils/localAI';

const COLORS = {
  bg: '#ffffff', card: '#f8f9fa', border: '#e2e8f0',
  purple: '#2563eb', gold: '#eab308', green: '#16a34a',
  blue: '#0284c7', text: '#0f172a', sub: '#334155', dim: '#475569',
};


const QUICK_QUESTIONS = [
  "What is the fee structure?",
  "Is hostel available?",
  "What is the placement rate?",
  "What courses are offered?",
  "What is the admission process?",
  "What facilities are available?",
  "Tell me about this college",
  "What companies visit for placement?",
];

export default function CollegeChatScreen({ route, navigation }) {
  const { college } = route.params;
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `👋 Hello! I'm the AI Assistant for **${college.name}**.\n\nI can only answer questions about this college. Ask me anything about:\n\n💰 Fees | 🏠 Hostel | 📊 Placements\n🎓 Courses | 📋 Admission | 🏛️ Facilities\n⭐ Ratings | 📍 Location | 💼 Internships`,
      sender: 'ai',
      type: 'welcome',
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

  const sendMessage = (text) => {
    const msgText = text || inputText.trim();
    if (!msgText) return;

    const userMsg = { id: Date.now(), text: msgText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time to make it feel natural
    setTimeout(() => {
      const response = generateAIResponse(msgText, college);
      const aiMsg = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'ai',
        type: response.type,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400); // Random delay between 600ms and 1000ms
  };

  const getMessageColor = (type) => {
    const colors = {
      fees: COLORS.gold,
      hostel: COLORS.blue,
      placement: COLORS.green,
      courses: COLORS.purple,
      admission: '#ea580c',
      facilities: COLORS.blue,
      rating: COLORS.gold,
      location: COLORS.green,
      gender: COLORS.pink || '#dc2626',
      rejected: '#b91c1c',
      welcome: COLORS.purple,
      contact: COLORS.blue,
      scholarship: COLORS.gold,
      internship: COLORS.green,
      alumni: COLORS.purple,
      default: COLORS.purple,
    };
    return colors[type] || COLORS.purple;
  };

  const formatText = (text) => {
    return text.split('**').map((part, i) =>
      i % 2 === 1
        ? <Text key={i} style={{ fontWeight: '800', color: '#fff' }}>{part}</Text>
        : <Text key={i}>{part}</Text>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.purple} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>🤖 AI Assistant</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{college.name}</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
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
                <Text style={[styles.aiLabel, { color: getMessageColor(msg.type) }]}>
                  🤖 College AI
                </Text>
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

          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.aiLabel, { color: COLORS.purple }]}>🤖 College AI</Text>
              <Text style={styles.typingText}>● ● ●</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQs} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickQBtn} onPress={() => sendMessage(q)}>
              <Text style={styles.quickQText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask about this college..."
              placeholderTextColor={COLORS.dim}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color={inputText.trim() ? '#ffffff' : COLORS.dim} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  headerSub: { color: COLORS.dim, fontSize: 12 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  messageBubble: { maxWidth: '85%', borderRadius: 16, padding: 12, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.purple + '22', borderColor: COLORS.purple + '55', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
  aiLabel: { fontSize: 10, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  messageText: { fontSize: 13, lineHeight: 20 },
  userText: { color: COLORS.text },
  aiText: { color: COLORS.sub },
  messageTime: { color: COLORS.dim, fontSize: 10, marginTop: 6, textAlign: 'right' },
  typingText: { color: COLORS.purple, fontSize: 18, letterSpacing: 4 },
  quickQs: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 8, maxHeight: 56 },
  quickQBtn: { backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  quickQText: { color: COLORS.purple, fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
});

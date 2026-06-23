import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// ── Report type chips ─────────────────────────────────────────────────────────
const REPORT_TYPES = [
  { id: 'bug',     label: '🐛 Bug',         color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  { id: 'ui',      label: '🎨 UI Issue',    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { id: 'data',    label: '📚 Wrong Data',  color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  { id: 'feature', label: '💡 Feature Req', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  { id: 'other',   label: '📝 Other',       color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
];

const STATUS_META = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7', icon: 'time-outline' },
  reviewing: { label: 'Reviewing', color: '#2563eb', bg: '#eff6ff', icon: 'eye-outline' },
  resolved:  { label: 'Resolved',  color: '#16a34a', bg: '#f0fdf4', icon: 'checkmark-circle-outline' },
};

function fmtDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Sent message card ─────────────────────────────────────────────────────────
function MessageCard({ report }) {
  const [expanded, setExpanded] = useState(false);
  const rtype = REPORT_TYPES.find(t => t.id === report.type) || REPORT_TYPES[4];
  const smeta = STATUS_META[report.status] || STATUS_META.pending;

  return (
    <TouchableOpacity
      style={[styles.msgCard, { borderLeftColor: rtype.color }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.msgCardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.msgTopRow}>
            <View style={[styles.typePill, { backgroundColor: rtype.bg, borderColor: rtype.border }]}>
              <Text style={[styles.typePillText, { color: rtype.color }]}>{rtype.label}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: smeta.bg }]}>
              <Ionicons name={smeta.icon} size={11} color={smeta.color} />
              <Text style={[styles.statusPillText, { color: smeta.color }]}>{smeta.label}</Text>
            </View>
          </View>
          <Text style={styles.msgText} numberOfLines={expanded ? undefined : 2}>
            {report.message}
          </Text>
          <Text style={styles.msgDate}>{fmtDate(report.createdAt)}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16} color="#94a3b8" style={{ marginLeft: 8, marginTop: 4 }}
        />
      </View>

      {/* Admin reply */}
      {expanded && report.adminReply && (
        <View style={styles.adminReplyBox}>
          <View style={styles.adminReplyHeader}>
            <Ionicons name="shield-checkmark" size={13} color="#7c3aed" />
            <Text style={styles.adminReplyLabel}>Admin Reply</Text>
          </View>
          <Text style={styles.adminReplyText}>{report.adminReply}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main ReportScreen ─────────────────────────────────────────────────────────
export default function ReportScreen() {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState(null);
  const [message,      setMessage]      = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const [myReports,      setMyReports]      = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const toastAnim = useRef(new Animated.Value(-80)).current; // slides in from above

  // Animate toast in then out
  const showSuccessToast = () => {
    toastAnim.setValue(-80);
    Animated.sequence([
      Animated.spring(toastAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: -80, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
    fetchMyReports();
  }, []);

  const fetchMyReports = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingReports(true);
    try {
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      setMyReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setMyReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, [user]);

  const handleSend = async () => {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    try {
      alert("Message was sent successfully");
      setMessage('');
      setSelectedType(null);
    } catch (err) {
      console.error('Report send error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSend = message.trim().length > 0 && !submitting;

  return (
    <LinearGradient colors={['#f0f4ff', '#e8effe']} style={styles.container}>

      {/* ── Floating success toast ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingToast,
          { transform: [{ translateY: toastAnim }] },
        ]}
      >
        <View style={styles.toastInner}>
          <View style={styles.toastIconWrap}>
            <Ionicons name="checkmark-circle" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>Message Sent!</Text>
            <Text style={styles.toastSub}>Your report has been sent to the admin.</Text>
          </View>
        </View>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Ionicons name="flag" size={26} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Report to Admin</Text>
            <Text style={styles.headerSub}>Send a message directly to the administrator</Text>
          </View>
        </Animated.View>

        {/* ── Compose card ── */}
        <Animated.View style={[styles.composeCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* From info */}
          <View style={styles.fromRow}>
            <View style={styles.fromAvatar}>
              <Text style={styles.fromAvatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fromName}>{user?.name || 'You'}</Text>
              <Text style={styles.fromEmail}>{user?.email}</Text>
            </View>
            <View style={styles.toChip}>
              <Ionicons name="shield-checkmark" size={12} color="#7c3aed" />
              <Text style={styles.toChipText}>To: Admin</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Type selector */}
          <Text style={styles.fieldLabel}>Category <Text style={{ color: '#94a3b8', fontWeight: '500', fontSize: 10 }}>(optional)</Text></Text>
          <View style={styles.typesRow}>
            {REPORT_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeBtn,
                  {
                    borderColor: selectedType === t.id ? t.color : t.border,
                    backgroundColor: selectedType === t.id ? t.bg : '#f8fafc',
                    borderWidth: selectedType === t.id ? 2 : 1.5,
                  },
                ]}
                onPress={() => setSelectedType(t.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, { color: selectedType === t.id ? t.color : '#64748b' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Message <Text style={{ color: '#dc2626', fontWeight: '700' }}>*</Text></Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Write your message to the admin…"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{message.length} / 1000</Text>

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color={canSend ? '#fff' : '#94a3b8'} />
                <Text style={[styles.sendBtnText, !canSend && { color: '#94a3b8' }]}>
                  Send to Admin
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { padding: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 18, marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  headerIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#bfdbfe',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  headerSub:   { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },

  // Floating Toast
  floatingToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  toastIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  toastSub: {
    color: '#ecfdf5',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },

  // Compose card
  composeCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 20, marginBottom: 24,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },

  // From/To row
  fromRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  fromAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  fromAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  fromName:  { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  fromEmail: { fontSize: 11, color: '#64748b', marginTop: 1 },
  toChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#f5f3ff', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#ddd6fe',
  },
  toChipText: { fontSize: 11, fontWeight: '700', color: '#7c3aed' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 18 },

  // Fields
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#374151', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },

  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn:  { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  typeBtnText: { fontSize: 12, fontWeight: '700' },

  messageInput: {
    backgroundColor: '#f8fafc', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    padding: 14, fontSize: 14, color: '#0f172a', minHeight: 130,
  },
  charCount: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 5 },

  // Send button
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, marginTop: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: '#e2e8f0', shadowOpacity: 0 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  // History
  historySection: { marginTop: 4 },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  sectionTitle:{ fontSize: 10, fontWeight: '800', color: '#64748b', letterSpacing: 1.5 },

  // Message card
  msgCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  msgCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  msgTopRow:  { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  typePill:   { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText:{ fontSize: 11, fontWeight: '700' },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  msgText:  { fontSize: 13, color: '#374151', lineHeight: 20, fontWeight: '500' },
  msgDate:  { fontSize: 11, color: '#94a3b8', marginTop: 6 },

  // Admin reply
  adminReplyBox: {
    backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: '#7c3aed',
  },
  adminReplyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  adminReplyLabel:  { fontSize: 11, fontWeight: '800', color: '#7c3aed', letterSpacing: 0.5 },
  adminReplyText:   { fontSize: 13, color: '#4c1d95', lineHeight: 19, fontWeight: '500' },

  // Empty
  empty:     { alignItems: 'center', paddingTop: 30, gap: 10 },
  emptyText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
});

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type:'error'|'success', text }
  const [sent,    setSent]    = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim]);

  const showMsg = (type, text) => setMessage({ type, text });

  const handleSendReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      return showMsg('error', 'Please enter a valid email address');
    }
    setLoading(true);
    setMessage(null);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setSent(true);
      showMsg('success', res.message);
    } else {
      showMsg('error', res.message || 'Failed to send reset email. Try again.');
    }
  };

  return (
    <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            {/* Back button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={16} color="#2563eb" />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={36} color="#2563eb" />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {sent
                  ? 'Check your email inbox'
                  : 'Enter your email to receive a reset link'}
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {!sent ? (
                /* ── Email input ── */
                <>
                  <Field label="Email Address" icon="mail-outline" isFocused={focusedField === 'email'}>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => { setFocusedField(null); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </Field>
                </>
              ) : (
                /* ── Success state ── */
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
                  <Text style={styles.successTitle}>Reset Email Sent!</Text>
                  <Text style={styles.successText}>
                    {"We've sent a reset link to:"}{'\n'}
                    <Text style={styles.successEmail}>{email}</Text>
                  </Text>

                  {/* Step-by-step guide */}
                  <View style={styles.stepsBox}>
                    {[
                      { icon: '📬', text: 'Open your Gmail / email app' },
                      { icon: '🔍', text: 'Look for email from:\nnoreply@smartadmission.firebaseapp.com' },
                      { icon: '🗑️', text: 'Also check your Spam / Junk folder' },
                      { icon: '🔗', text: 'Click "Reset Password" in the email' },
                    ].map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <Text style={styles.stepIcon}>{step.icon}</Text>
                        <Text style={styles.stepText}>{step.text}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.warnBox}>
                    <Ionicons name="warning-outline" size={14} color="#92400e" style={{ marginTop: 2 }} />
                    <Text style={styles.warnText}>
                      {"Didn't get it? Make sure "}<Text style={{ fontWeight: '700' }}>{email}</Text> is registered in this app.
                    </Text>
                  </View>
                </View>
              )}

              {/* Message */}
              {message && (
                <View style={[styles.msgBox, message.type === 'error' ? styles.msgError : styles.msgSuccess]}>
                  <Ionicons
                    name={message.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={message.type === 'error' ? '#dc2626' : '#16a34a'}
                  />
                  <Text style={[styles.msgText, { color: message.type === 'error' ? '#dc2626' : '#16a34a' }]}>
                    {message.text}
                  </Text>
                </View>
              )}

              {/* Action button */}
              {!sent ? (
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={handleSendReset}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                      <Text style={styles.btnText}>Send Reset Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.btnOutline}
                  onPress={() => navigation.replace('Login')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="log-in-outline" size={18} color="#2563eb" />
                  <Text style={styles.btnOutlineText}>Back to Login</Text>
                </TouchableOpacity>
              )}

              {/* Resend option */}
              {sent && (
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => { setSent(false); setMessage(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>{"Didn't receive it? Try again →"}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ── Small helper component ──────────────────────────────────────────────── */
function Field({ label, icon, children, style = {}, isFocused }) {
  return (
    <View style={style}>
      <View style={localS.fieldLabel}>
        <Ionicons name={icon} size={15} color={isFocused ? "#2563eb" : "#64748b"} />
        <Text style={[localS.labelText, isFocused && { color: '#2563eb', fontWeight: '700' }]}>{label}</Text>
      </View>
      <View style={[localS.inputWrap, isFocused && { borderColor: '#2563eb', backgroundColor: '#ffffff', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }]}>
        {children}
      </View>
    </View>
  );
}

const localS = StyleSheet.create({
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelText:  { fontSize: 13, fontWeight: '600', color: '#475569' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 54,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  contentWrapper: { width: '100%', maxWidth: 420, alignItems: 'center' },

  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 20, backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  backText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },

  header:   { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  title:    { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },

  card: {
    width: '100%',
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(219,234,254,0.5)',
  },

  input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a', fontWeight: '500' },

  // Success state
  successBox:   { alignItems: 'center', paddingVertical: 8 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#15803d', marginTop: 12, marginBottom: 8 },
  successText:  { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 14 },
  successEmail: { fontWeight: '700', color: '#2563eb' },

  stepsBox: {
    width: '100%', backgroundColor: '#f0fdf4', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#bbf7d0', gap: 10, marginBottom: 12,
  },
  stepRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  stepText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 20 },

  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fde68a', width: '100%',
  },
  warnText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },

  msgBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 12, marginTop: 12 },
  msgError:  { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  msgSuccess:{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  msgText:   { flex: 1, fontSize: 13, lineHeight: 18 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 14, height: 52, marginTop: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 16 },

  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: '#2563eb', borderRadius: 14, height: 52, marginTop: 20,
  },
  btnOutlineText: { color: '#2563eb', fontWeight: '800', fontSize: 16 },

  resendBtn:  { alignItems: 'center', marginTop: 14 },
  resendText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
});

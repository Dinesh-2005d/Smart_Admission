import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type:'error'|'success', text }
  const [sent,    setSent]    = useState(false);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2563eb" />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={36} color="#fff" />
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
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </>
          ) : (
            /* ── Success state ── */
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successText}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>
              <Text style={styles.successHint}>
                Click the link in the email to set a new password. Check your spam folder if you don't see it.
              </Text>
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
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                    <Text style={styles.btnText}>Send Reset Link</Text>
                  </>
                )
              }
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.replace('Login')}
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
            >
              <Text style={styles.resendText}>Didn't receive it? Try again →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll:    { flexGrow: 1, padding: 24, paddingTop: 16 },

  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },

  header:   { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  title:    { fontSize: 22, fontWeight: '800', color: '#1e3a8a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
  },

  label:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap:{
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 52, marginBottom: 4,
  },
  input: { flex: 1, fontSize: 15, color: '#0f172a' },

  // Success state
  successBox:   { alignItems: 'center', paddingVertical: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#15803d', marginTop: 12, marginBottom: 8 },
  successText:  { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 22 },
  successEmail: { fontWeight: '700', color: '#2563eb' },
  successHint:  { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 10, lineHeight: 18 },

  msgBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 12, marginTop: 12 },
  msgError:  { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  msgSuccess:{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  msgText:   { flex: 1, fontSize: 13, lineHeight: 18 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 14, height: 52, marginTop: 20,
  },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },

  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: '#2563eb', borderRadius: 14, height: 52, marginTop: 20,
  },
  btnOutlineText: { color: '#2563eb', fontWeight: '700', fontSize: 16 },

  resendBtn:  { alignItems: 'center', marginTop: 14 },
  resendText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Email', 'OTP', 'NewPassword'];

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const [step,         setStep]         = useState(0);
  const [email,        setEmail]        = useState('');
  const [otp,          setOtp]          = useState('');
  const [newPass,      setNewPass]      = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState(null); // { type:'error'|'success', text }

  const showMsg = (type, text) => setMessage({ type, text });

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      return showMsg('error', 'Please enter a valid Gmail address');
    }
    setLoading(true); setMessage(null);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      showMsg('success', res.message || 'OTP sent! Check your Gmail inbox.');
      setTimeout(() => { setMessage(null); setStep(1); }, 1200);
    } else {
      showMsg('error', res.message || 'Failed to send OTP. Try again.');
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return showMsg('error', 'Enter the 6-digit OTP');
    setLoading(true); setMessage(null);
    const res = await verifyOtp(email, otp);
    setLoading(false);
    if (res.success) {
      showMsg('success', 'OTP verified!');
      setTimeout(() => { setMessage(null); setStep(2); }, 900);
    } else {
      showMsg('error', res.message || 'Invalid OTP. Try again.');
    }
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPass.length < 6) return showMsg('error', 'Password must be at least 6 characters');
    if (newPass !== confirmPass) return showMsg('error', 'Passwords do not match');
    setLoading(true); setMessage(null);
    const res = await resetPassword(email, otp, newPass);
    setLoading(false);
    if (res.success) {
      showMsg('success', 'Password reset! Redirecting to login…');
      setTimeout(() => navigation.replace('Login'), 1500);
    } else {
      showMsg('error', res.message || 'Reset failed. Try again.');
    }
  };

  const stepHandlers = [handleSendOtp, handleVerifyOtp, handleResetPassword];
  const stepLabels   = ['Send OTP', 'Verify OTP', 'Reset Password'];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back button */}
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2563eb" />
          <Text style={styles.backText}>{step > 0 ? 'Back' : 'Login'}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 0 && 'Enter your Gmail to receive an OTP'}
            {step === 1 && `OTP sent to ${email}`}
            {step === 2 && 'Set your new password'}
          </Text>
        </View>

        {/* Step indicators */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                {i < step
                  ? <Ionicons name="checkmark" size={14} color="#fff" />
                  : <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Step 1 — Email */}
          {step === 0 && (
            <>
              <Text style={styles.label}>Gmail Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="you@gmail.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 1 && (
            <>
              <Text style={styles.label}>6-Digit OTP</Text>
              <TextInput
                style={[styles.inputWrap, styles.otpInput]}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor="#94a3b8"
                value={otp}
                onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity onPress={() => { setStep(0); showMsg(null, ''); }}>
                <Text style={styles.resendLink}>Resend OTP →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3 — New Password */}
          {step === 2 && (
            <>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#94a3b8"
                  value={newPass}
                  onChangeText={setNewPass}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showPass}
                />
              </View>
            </>
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
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={stepHandlers[step]} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{stepLabels[step]}</Text>
            }
          </TouchableOpacity>
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

  steps:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepDot:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  stepDotActive:{ backgroundColor: '#2563eb' },
  stepNum:      { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  stepNumActive:{ color: '#fff' },
  stepLine:     { width: 40, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  stepLineActive:{ backgroundColor: '#2563eb' },

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
  input:    { flex: 1, fontSize: 15, color: '#0f172a' },
  otpInput: {
    textAlign: 'center', fontSize: 28, fontWeight: '800', letterSpacing: 12,
    color: '#2563eb', borderColor: '#2563eb',
  },
  resendLink: { color: '#2563eb', fontSize: 13, fontWeight: '600', marginTop: 10, textAlign: 'right' },

  msgBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginTop: 12 },
  msgError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  msgSuccess:{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  msgText:  { flex: 1, fontSize: 13, lineHeight: 18 },

  btn:        { backgroundColor: '#2563eb', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnDisabled:{ opacity: 0.7 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
});

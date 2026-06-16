import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

/**
 * LoginScreen — Open Gmail Login
 *
 * PRIMARY:   Any Gmail user enters their email → auto login/register (no password)
 * SECONDARY: Admin tap → shows password field for admin login
 *
 * Admin can block or remove accounts from Admin Panel.
 */
export default function LoginScreen({ navigation }) {
  const { gmailAutoLogin, login, loading, error } = useAuth();

  const [email,      setEmail]      = useState('');
  const [name,       setName]       = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [adminMode,  setAdminMode]  = useState(false); // toggle admin login
  const [step,       setStep]       = useState('email'); // 'email' | 'name'
  const [localErr,   setLocalErr]   = useState('');

  const emailValid = /\S+@\S+\.\S+/.test(email.trim());

  // ── Step 1: validate email, ask for display name if new user ─────────────
  const handleContinue = async () => {
    setLocalErr('');
    if (!emailValid) { setLocalErr('Please enter a valid email address'); return; }

    if (adminMode) {
      // Admin: email + password
      if (!password) { setLocalErr('Password is required'); return; }
      await login(email.trim(), password);
      return;
    }

    // Gmail auto-login (open access)
    if (step === 'email') {
      // Ask for display name if we don't know them yet
      setStep('name');
      return;
    }

    // step === 'name' — proceed with login
    await gmailAutoLogin(email.trim(), name.trim() || email.split('@')[0]);
  };

  const handleBack = () => {
    if (step === 'name') { setStep('email'); setLocalErr(''); }
    else if (adminMode)  { setAdminMode(false); setLocalErr(''); setPassword(''); }
  };

  const displayError = localErr || error;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={44} color="#fff" />
          </View>
          <Text style={styles.appName}>SmartCampus AI</Text>
          <Text style={styles.tagline}>India's Smartest College Finder</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Back button (step 2 or admin mode) */}
          {(step === 'name' || adminMode) && (
            <TouchableOpacity onPress={handleBack} style={styles.backRow}>
              <Ionicons name="arrow-back" size={18} color="#2563eb" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Title */}
        <Text style={styles.cardTitle}>
          {adminMode        ? '🛡️ Admin Sign In'       :
           step === 'name'  ? '👋 What’s your name?' :
           '✉️ Continue with Email'}
        </Text>
        <Text style={styles.cardSub}>
          {adminMode        ? 'Enter your admin credentials'              :
           step === 'name'  ? `Signing in as ${email}`                   :
           'Enter your email to access the app — no password needed'}
        </Text>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <View style={styles.fieldLabel}>
                <Ionicons name="mail-outline" size={15} color="#2563eb" />
                <Text style={styles.labelText}>Email Address</Text>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="at-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              {/* Admin password (only in admin mode) */}
              {adminMode && (
                <>
                  <View style={[styles.fieldLabel, { marginTop: 14 }]}>
                    <Ionicons name="lock-closed-outline" size={15} color="#2563eb" />
                    <Text style={styles.labelText}>Admin Password</Text>
                  </View>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Enter password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                      <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* ── Step 2: Name ── */}
          {step === 'name' && !adminMode && (
            <>
              <View style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={15} color="#2563eb" />
                <Text style={styles.labelText}>Your Name <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</Text></Text>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder={email.split('@')[0]}
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>
              <Text style={styles.hintText}>
                ℹ️ This is how your name appears in the app. You can skip it.
              </Text>
            </>
          )}

          {/* Error */}
          {displayError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Main button */}
          <TouchableOpacity
            style={[styles.mainBtn, loading && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={step === 'name' ? 'log-in-outline' : adminMode ? 'shield-checkmark-outline' : 'arrow-forward-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.mainBtnText}>
                  {step === 'name' ? 'Enter App' : adminMode ? 'Sign In as Admin' : 'Continue'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* What happens on first login */}
          {step === 'email' && !adminMode && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
              <Text style={styles.infoText}>
                First time? Your account is created automatically. No signup needed.
              </Text>
            </View>
          )}

          {/* Admin toggle */}
          {!adminMode && step === 'email' && (
            <TouchableOpacity onPress={() => { setAdminMode(true); setStep('email'); setLocalErr(''); }} style={styles.adminToggle}>
              <Ionicons name="shield-outline" size={14} color="#94a3b8" />
              <Text style={styles.adminToggleText}>Admin? Sign in with password</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>🇮🇳 Free for all Indian students · 100+ Colleges</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll:    { flexGrow: 1, alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },

  header:     { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38, shadowRadius: 18, elevation: 12,
  },
  appName:  { fontSize: 27, fontWeight: '800', color: '#1e3a8a', letterSpacing: -0.5 },
  tagline:  { fontSize: 13, color: '#64748b', marginTop: 5 },

  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
  },

  backRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },

  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  cardSub:   { fontSize: 13, color: '#64748b', marginBottom: 22, lineHeight: 19 },

  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelText:  { fontSize: 13, fontWeight: '600', color: '#374151' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 13,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 54,
    marginBottom: 4,
  },
  input: { flex: 1, fontSize: 15, color: '#0f172a' },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },

  hintText:  { fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 17 },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626', lineHeight: 18 },

  mainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 14, height: 54, marginTop: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38, shadowRadius: 12, elevation: 6,
  },
  btnDisabled:  { opacity: 0.7 },
  mainBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  infoText: { flex: 1, fontSize: 12, color: '#1d4ed8', lineHeight: 17 },

  adminToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 20,
  },
  adminToggleText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  footer: { marginTop: 32, fontSize: 12, color: '#94a3b8', textAlign: 'center' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

/** LoginScreen — supports:
 *   - Email + password login
 *   - Register new account (toggle)
 *   - "Forgot Password" → ForgotPasswordScreen
 *   - Quick Demo Access (auto-fills credentials)
 */
export default function LoginScreen({ navigation }) {
  const { login, register, loading, error } = useAuth();

  const [mode,        setMode]        = useState('login');   // 'login' | 'register'
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [touched,     setTouched]     = useState({});

  const emailValid    = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const isLogin       = mode === 'login';

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, password: true, confirmPass: true });
    if (!emailValid || !passwordValid) return;
    if (!isLogin) {
      if (!name.trim()) return;
      if (password !== confirmPass) return;
      await register(email.trim(), password, name.trim());
    } else {
      await login(email.trim(), password);
    }
  };

  const fillDemo = (type) => {
    setMode('login');
    if (type === 'admin') {
      setEmail('admin@smartcampus.ai'); setPassword('Smart@2024');
    } else {
      setEmail('student@smartcampus.ai'); setPassword('Student@123');
    }
    setTouched({});
  };

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setTouched({});
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={44} color="#fff" />
          </View>
          <Text style={styles.appName}>SmartCampus AI</Text>
          <Text style={styles.tagline}>India's Smartest College Finder</Text>
        </View>

        {/* ── Card ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Welcome Back 👋' : 'Create Account 🎓'}</Text>
          <Text style={styles.cardSub}>{isLogin ? 'Sign in to continue' : 'Register with your Gmail'}</Text>

          {/* Name (register only) */}
          {!isLogin && (
            <>
              <View style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={15} color="#2563eb" />
                <Text style={styles.labelText}>Full Name</Text>
              </View>
              <View style={[styles.inputWrap, touched.name && !name.trim() && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  autoCapitalize="words"
                />
              </View>
              {touched.name && !name.trim() && <Text style={styles.fieldError}>Name is required</Text>}
            </>
          )}

          {/* Email */}
          <View style={[styles.fieldLabel, !isLogin && { marginTop: 14 }]}>
            <Ionicons name="mail-outline" size={15} color="#2563eb" />
            <Text style={styles.labelText}>Gmail Address</Text>
          </View>
          <View style={[styles.inputWrap, touched.email && !emailValid && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="you@gmail.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {touched.email && !emailValid && <Text style={styles.fieldError}>Please enter a valid email</Text>}

          {/* Password */}
          <View style={[styles.fieldLabel, { marginTop: 14 }]}>
            <Ionicons name="lock-closed-outline" size={15} color="#2563eb" />
            <Text style={styles.labelText}>Password</Text>
          </View>
          <View style={[styles.inputWrap, touched.password && !passwordValid && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min 6 characters"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          {touched.password && !passwordValid && <Text style={styles.fieldError}>Min 6 characters</Text>}

          {/* Confirm password (register only) */}
          {!isLogin && (
            <>
              <View style={[styles.fieldLabel, { marginTop: 14 }]}>
                <Ionicons name="lock-closed-outline" size={15} color="#2563eb" />
                <Text style={styles.labelText}>Confirm Password</Text>
              </View>
              <View style={[styles.inputWrap, touched.confirmPass && password !== confirmPass && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  onBlur={() => setTouched(t => ({ ...t, confirmPass: true }))}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
              </View>
              {touched.confirmPass && password !== confirmPass && <Text style={styles.fieldError}>Passwords do not match</Text>}
            </>
          )}

          {/* Forgot password link (login only) */}
          {isLogin && (
            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name={isLogin ? 'log-in-outline' : 'person-add-outline'} size={20} color="#fff" />
                  <Text style={styles.loginBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                </>
            }
          </TouchableOpacity>

          {/* Toggle login / register */}
          <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
            <Text style={styles.toggleText}>
              {isLogin ? "New user? " : "Already have an account? "}
              <Text style={styles.toggleLink}>{isLogin ? 'Register' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>Quick Demo Access</Text>
            <View style={styles.divLine} />
          </View>

          {/* Demo buttons */}
          <View style={styles.demoRow}>
            <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('admin')}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#2563eb" />
              <Text style={styles.demoBtnText}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('student')}>
              <Ionicons name="person-outline" size={16} color="#2563eb" />
              <Text style={styles.demoBtnText}>Student</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>🇮🇳 Free for all Indian students · 100+ Colleges</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll:    { flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },

  header:     { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  appName:  { fontSize: 26, fontWeight: '800', color: '#1e3a8a', letterSpacing: -0.5 },
  tagline:  { fontSize: 13, color: '#64748b', marginTop: 4 },

  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  cardSub:   { fontSize: 14, color: '#64748b', marginBottom: 24 },

  fieldLabel:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelText:   { fontSize: 13, fontWeight: '600', color: '#374151' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#f87171', backgroundColor: '#fff5f5' },
  input:      { flex: 1, fontSize: 15, color: '#0f172a' },
  eyeBtn:     { padding: 4 },
  fieldError: { fontSize: 12, color: '#dc2626', marginTop: 4, marginLeft: 2 },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626', lineHeight: 18 },

  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 14, height: 54, marginTop: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },

  toggleBtn:  { alignItems: 'center', marginTop: 14 },
  toggleText: { fontSize: 14, color: '#64748b' },
  toggleLink: { color: '#2563eb', fontWeight: '700' },

  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  divLine:    { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  divText:    { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  demoRow:   { flexDirection: 'row', gap: 12 },
  demoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: '#2563eb', borderRadius: 12, height: 44,
    backgroundColor: '#eff6ff',
  },
  demoBtnText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },

  footer: { marginTop: 28, fontSize: 13, color: '#94a3b8', textAlign: 'center' },
});

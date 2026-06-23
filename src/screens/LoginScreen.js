import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Animated, LayoutAnimation, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  const { login, register, loading, error } = useAuth();

  const [mode,        setMode]        = useState('signin');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [touched,     setTouched]     = useState({});
  const [localErr,    setLocalErr]    = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const isSignIn = mode === 'signin';

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

  const emailOk   = /\S+@\S+\.\S+/.test(email.trim());
  const passOk    = password.length >= 6;
  const nameOk    = name.trim().length >= 2;
  const confirmOk = password === confirmPass;

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async () => {
    setLocalErr('');
    setTouched({ name: true, email: true, password: true, confirmPass: true });

    if (!emailOk || !passOk) return;

    if (isSignIn) {
      const res = await login(email.trim(), password);
      if (!res?.success && !error) setLocalErr('Invalid email or password.');
    } else {
      if (!nameOk)    { setLocalErr('Please enter your full name (min 2 chars)'); return; }
      if (!confirmOk) { setLocalErr('Passwords do not match'); return; }
      const res = await register(email.trim(), password, name.trim());
      if (!res?.success && !error) setLocalErr('Registration failed. Email may already exist.');
    }
  };

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(m => m === 'signin' ? 'register' : 'signin');
    setLocalErr('');
    setTouched({});
    setName('');
    setPassword('');
    setConfirmPass('');
  };

  const displayError = localErr || error;

  return (
    <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            {/* ── Logo ─────────────────────────────────────────── */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons name="school" size={44} color="#2563eb" />
              </View>
              <Text style={styles.appName}>Acad<Text style={{ color: '#2563eb' }}>ivo</Text></Text>
              <Text style={styles.tagline}>Your Intelligent Admission counselor</Text>
            </View>

            {/* ── Card ─────────────────────────────────────────── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{isSignIn ? 'Welcome Back 👋' : 'Create Account 🎓'}</Text>
              <Text style={styles.cardSub}>{isSignIn ? 'Sign in to your account' : 'Register with your email'}</Text>

              {/* Name (register only) */}
              {!isSignIn && (
                <>
                  <Field label="Full Name" icon="person-outline" isFocused={focusedField === 'name'}>
                    <TextInput
                      style={styles.input}
                      placeholder="Your full name"
                      placeholderTextColor="#94a3b8"
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => { setFocusedField(null); touch('name'); }}
                      autoCapitalize="words"
                    />
                  </Field>
                  {touched.name && !nameOk && <ErrText>Name must be at least 2 characters</ErrText>}
                </>
              )}

              {/* Email */}
              <Field label="Email Address" icon="mail-outline" style={!isSignIn ? { marginTop: 14 } : {}} isFocused={focusedField === 'email'}>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => { setFocusedField(null); touch('email'); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>
              {touched.email && !emailOk && <ErrText>Enter a valid email address</ErrText>}

              {/* Password */}
              <Field label="Password" icon="lock-closed-outline" style={{ marginTop: 14 }} isFocused={focusedField === 'password'}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => { setFocusedField(null); touch('password'); }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 4 }}>
                  <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                </TouchableOpacity>
              </Field>
              {touched.password && !passOk && <ErrText>Password must be at least 6 characters</ErrText>}

              {/* Confirm password (register only) */}
              {!isSignIn && (
                <>
                  <Field label="Confirm Password" icon="lock-closed-outline" style={{ marginTop: 14 }} isFocused={focusedField === 'confirmPass'}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Re-enter password"
                      placeholderTextColor="#94a3b8"
                      value={confirmPass}
                      onChangeText={setConfirmPass}
                      onFocus={() => setFocusedField('confirmPass')}
                      onBlur={() => { setFocusedField(null); touch('confirmPass'); }}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                    />
                  </Field>
                  {touched.confirmPass && !confirmOk && <ErrText>Passwords do not match</ErrText>}
                </>
              )}

              {/* Forgot Password — sign in only */}
              {isSignIn && (
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Error message */}
              {displayError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name={isSignIn ? 'log-in-outline' : 'person-add-outline'} size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{isSignIn ? 'Sign In' : 'Create Account'}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Toggle sign in / register */}
              <TouchableOpacity onPress={toggle} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>
                  {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={styles.toggleLink}>{isSignIn ? 'Create Account' : 'Sign In'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.footer}>🇮🇳 Free for all Indian students · 118,000+ Colleges</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ── Small helper components ──────────────────────────────────────────────── */
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

function ErrText({ children }) {
  return <Text style={localS.fieldErr}>{children}</Text>;
}

const localS = StyleSheet.create({
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelText:  { fontSize: 13, fontWeight: '600', color: '#475569' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 54,
  },
  fieldErr:   { fontSize: 12, color: '#dc2626', marginTop: 4, marginLeft: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, alignItems: 'center', paddingVertical: 44, paddingHorizontal: 24, justifyContent: 'center' },
  contentWrapper: { width: '100%', maxWidth: 420, alignItems: 'center' },

  header:     { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  appName:  { fontSize: 28, fontWeight: '950', color: '#0f172a', letterSpacing: -1 },
  tagline:  { fontSize: 13, color: '#64748b', marginTop: 5 },

  card: {
    width: '100%',
    backgroundColor: '#ffffff', borderRadius: 24, padding: 28,
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(219,234,254,0.5)',
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  cardSub:   { fontSize: 14, color: '#64748b', marginBottom: 22 },

  input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a', fontWeight: '500' },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { fontSize: 13, color: '#2563eb', fontWeight: '700' },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626', lineHeight: 18 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 14, height: 54, marginTop: 22,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btnDisabled:    { opacity: 0.7 },
  submitBtnText:  { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  toggleBtn:  { alignItems: 'center', marginTop: 18 },
  toggleText: { fontSize: 14, color: '#64748b' },
  toggleLink: { color: '#2563eb', fontWeight: '800' },

  footer: { marginTop: 32, fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '500' },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, StatusBar, Platform, SafeAreaView,
  LayoutAnimation, UIManager, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { STATES } from '../constants/indiaData';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_W = Dimensions.get('window').width;

// ── Curated top colleges for animations ───────────────────────────────────────
const SPOTLIGHT_COLLEGES = [
  { name: 'IIT Bombay',          location: 'Mumbai, Maharashtra',       dept: 'Engineering',  naac: 'A++', rating: 5.0, icon: '🏛️', color: '#7c3aed', bg: ['#f5f3ff','#ede9fe'] },
  { name: 'AIIMS New Delhi',     location: 'New Delhi, Delhi',          dept: 'Medical',      naac: 'A++', rating: 5.0, icon: '🏥', color: '#dc2626', bg: ['#fff1f2','#ffe4e6'] },
  { name: 'IIT Madras',          location: 'Chennai, Tamil Nadu',       dept: 'Engineering',  naac: 'A++', rating: 4.9, icon: '⚙️', color: '#2563eb', bg: ['#eff6ff','#dbeafe'] },
  { name: 'BITS Pilani',         location: 'Pilani, Rajasthan',         dept: 'Engineering',  naac: 'A++', rating: 4.8, icon: '💡', color: '#0891b2', bg: ['#ecfeff','#cffafe'] },
  { name: 'CMC Vellore',         location: 'Vellore, Tamil Nadu',       dept: 'Medical',      naac: 'A++', rating: 4.9, icon: '🩺', color: '#059669', bg: ['#ecfdf5','#d1fae5'] },
  { name: 'IIT Kharagpur',       location: 'Kharagpur, West Bengal',    dept: 'Engineering',  naac: 'A++', rating: 5.0, icon: '🎓', color: '#d97706', bg: ['#fffbeb','#fef3c7'] },
  { name: 'NIT Trichy',          location: 'Tiruchirappalli, Tamil Nadu', dept: 'Engineering',naac: 'A++', rating: 4.8, icon: '🔬', color: '#7c3aed', bg: ['#f5f3ff','#ede9fe'] },
  { name: 'TNAU Coimbatore',     location: 'Coimbatore, Tamil Nadu',    dept: 'Agriculture',  naac: 'A++', rating: 4.8, icon: '🌾', color: '#16a34a', bg: ['#f0fdf4','#dcfce7'] },
];

// ── About the app feature data ───────────────────────────────────────────────
const APP_FEATURES = [
  {
    icon: 'sparkles', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    title: 'AI-Powered Matching',
    desc: 'Get personalised college recommendations based on your marks, state, and dream department.',
  },
  {
    icon: 'school', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    title: '10,000+ Colleges',
    desc: 'Explore a comprehensive database spanning all 28 states and 8 union territories of India.',
  },
  {
    icon: 'git-compare', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    title: 'Side-by-Side Compare',
    desc: 'Compare colleges on fees, NAAC grade, placement rates, and available courses instantly.',
  },
  {
    icon: 'shield-checkmark', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    title: 'Secure & Private',
    desc: 'Your data is end-to-end encrypted and never sold or shared with any third party.',
  },
];

const DEPT_COLORS = {
  Engineering:  '#2563eb',
  Medical:      '#dc2626',
  Agriculture:  '#16a34a',
  Management:   '#d97706',
  Law:          '#7c3aed',
};

function starRating(r) {
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
}

// ── Animated Feature Card ─────────────────────────────────────────────────────
function FeatureCard({ feature, delay }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 550, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        aboutStyles.featureCard,
        { backgroundColor: feature.bg, borderColor: feature.border,
          opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[aboutStyles.featureIconWrap, { backgroundColor: feature.color + '1a' }]}>
        <Ionicons name={feature.icon} size={22} color={feature.color} />
      </View>
      <Text style={[aboutStyles.featureTitle, { color: feature.color }]}>{feature.title}</Text>
      <Text style={aboutStyles.featureDesc}>{feature.desc}</Text>
    </Animated.View>
  );
}

const aboutStyles = StyleSheet.create({
  featureCard: {
    width: '47.5%', borderRadius: 20, padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  featureIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  featureTitle: { fontSize: 13, fontWeight: '900', marginBottom: 6, letterSpacing: -0.2 },
  featureDesc:  { fontSize: 11, color: '#64748b', fontWeight: '500', lineHeight: 16 },
});

// ── Cycling college spotlight card ────────────────────────────────────────────
function CollegeSpotlight() {
  const [idx, setIdx] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -12, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setIdx(prev => (prev + 1) % SPOTLIGHT_COLLEGES.length);
        slideAnim.setValue(12);
        // Fade back in + slide to center
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const college = SPOTLIGHT_COLLEGES[idx];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient colors={college.bg} style={spotStyles.card}>
        {/* Top row */}
        <View style={spotStyles.topRow}>
          <Text style={spotStyles.icon}>{college.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[spotStyles.name, { color: college.color }]} numberOfLines={1}>
              {college.name}
            </Text>
            <Text style={spotStyles.location}>📍 {college.location}</Text>
          </View>
          <View style={[spotStyles.naacBadge, { backgroundColor: college.color }]}>
            <Text style={spotStyles.naacText}>NAAC {college.naac}</Text>
          </View>
        </View>

        {/* Dept + rating */}
        <View style={spotStyles.bottomRow}>
          <View style={[spotStyles.deptChip, { backgroundColor: college.color + '18', borderColor: college.color + '40' }]}>
            <Ionicons name="school" size={11} color={college.color} />
            <Text style={[spotStyles.deptText, { color: college.color }]}>{college.dept}</Text>
          </View>
          <Text style={[spotStyles.stars, { color: college.color }]}>
            {starRating(Math.round(college.rating))} {college.rating}
          </Text>
        </View>

        {/* Dot indicators */}
        <View style={spotStyles.dots}>
          {SPOTLIGHT_COLLEGES.map((_, i) => (
            <View
              key={i}
              style={[
                spotStyles.dot,
                { backgroundColor: i === idx ? college.color : college.color + '30',
                  width: i === idx ? 16 : 6 },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const spotStyles = StyleSheet.create({
  card: {
    borderRadius: 22, padding: 18, marginTop: 2,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09, shadowRadius: 14, elevation: 5,
  },
  topRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  icon:       { fontSize: 32 },
  name:       { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  location:   { fontSize: 10.5, color: '#64748b', fontWeight: '500', marginTop: 2 },
  naacBadge:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  naacText:   { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  bottomRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deptChip:   { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  deptText:   { fontSize: 10.5, fontWeight: '800' },
  stars:      { fontSize: 12, fontWeight: '700', letterSpacing: -0.3 },
  dots:       { flexDirection: 'row', gap: 5, marginTop: 16, justifyContent: 'center', alignItems: 'center' },
  dot:        { height: 6, borderRadius: 3 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [selectedState, setSelectedState] = useState(null);
  const [stateSearch, setStateSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sectionFade  = useRef(new Animated.Value(0)).current;
  const sectionSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Animate bottom section in
    Animated.parallel([
      Animated.timing(sectionFade,  { toValue: 1, duration: 700, delay: 500, useNativeDriver: true }),
      Animated.timing(sectionSlide, { toValue: 0, duration: 700, delay: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const filteredStates = STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateSelect = (state) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedState(state);
    setShowDropdown(false);
    setStateSearch('');
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDropdown(!showDropdown);
  };

  const handleNext = () => {
    if (selectedState) {
      navigation.navigate('MarksEntry', {
        state: selectedState,
        board: '',
        targetState: selectedState,
      });
    }
  };

  return (
    <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Branding */}
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>🎓</Text>
            </View>
            <Text style={styles.appTitle}>Acad<Text style={styles.appTitleBlue}>ivo</Text></Text>
            <Text style={styles.appTagline}>Your Intelligent College Admission Guide</Text>
          </Animated.View>

          {/* Main Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.cardHeading}>📍 Select Which State You Want to Join Colleges In</Text>

            {/* State Dropdown */}
            <TouchableOpacity
              style={[styles.dropdown, showDropdown && styles.dropdownOpen]}
              onPress={toggleDropdown}
              activeOpacity={0.85}
            >
              <Ionicons name="location" size={18} color="#2563eb" style={{ marginRight: 10 }} />
              <Text style={selectedState ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {selectedState || 'Choose your state or union territory'}
              </Text>
              <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#2563eb" />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownPanel}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={16} color="#475569" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search state..."
                    placeholderTextColor="#94a3b8"
                    value={stateSearch}
                    onChangeText={setStateSearch}
                    autoFocus
                  />
                  {stateSearch !== '' && (
                    <TouchableOpacity onPress={() => setStateSearch('')}>
                      <Ionicons name="close-circle" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.stateList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredStates.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.stateItem, selectedState === item && styles.stateItemSelected]}
                      onPress={() => handleStateSelect(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.stateItemText, selectedState === item && styles.stateItemTextSelected]}>
                        {item}
                      </Text>
                      {selectedState === item && (
                        <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selected State Chip */}
            {selectedState && !showDropdown && (
              <View style={styles.selectedChip}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.selectedChipText}>{selectedState} selected</Text>
              </View>
            )}

            {/* Next Button */}
            {selectedState && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                <TouchableOpacity
                  style={[styles.nextBtn, !selectedState && styles.nextBtnDisabled]}
                  onPress={handleNext}
                  disabled={!selectedState}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                  <Text style={styles.nextBtnText}>Select Department</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#ffffff" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          {/* ── College Animations Section ──────────────────────────── */}
          <Animated.View
            style={[styles.collegeSection, {
              opacity: sectionFade,
              transform: [{ translateY: sectionSlide }],
            }]}
          >
            {/* Section label */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionLine} />
              <View style={styles.sectionLabelBadge}>
                <Ionicons name="school" size={12} color="#2563eb" />
                <Text style={styles.sectionLabel}>TOP COLLEGES IN INDIA</Text>
              </View>
              <View style={styles.sectionLine} />
            </View>

            {/* Spotlight cycling card */}
            <CollegeSpotlight />

            {/* About the App */}
            <View style={styles.aboutSection}>
              <View style={styles.aboutHeader}>
                <View style={styles.aboutLine} />
                <Text style={styles.aboutHeaderText}>Why Acadivo?</Text>
                <View style={styles.aboutLine} />
              </View>
              <View style={styles.featureGrid}>
                {APP_FEATURES.map((f, i) => (
                  <FeatureCard key={f.title} feature={f} delay={300 + i * 130} />
                ))}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons name="heart" size={13} color="#f43f5e" />
              <Text style={styles.footerText}>Built with love for Indian students</Text>
              <Ionicons name="heart" size={13} color="#f43f5e" />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 24 : 16 },

  // Hero
  hero: { alignItems: 'center', paddingBottom: 28, paddingTop: 10 },
  logoBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#2563eb', marginBottom: 14,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  logoText: { fontSize: 36 },
  appTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -1, marginBottom: 6 },
  appTitleBlue: { color: '#2563eb' },
  appTagline: { fontSize: 13, color: '#64748b', textAlign: 'center', fontWeight: '500' },

  // Card
  card: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(219,234,254,0.5)',
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
  },
  cardHeading: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 18, lineHeight: 22 },

  // Dropdown
  dropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 15, borderWidth: 1.5, borderColor: '#e2e8f0' },
  dropdownOpen: { borderColor: '#2563eb', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: '#ffffff' },
  dropdownSelected: { color: '#0f172a', fontSize: 15, fontWeight: '700', flex: 1 },
  dropdownPlaceholder: { color: '#94a3b8', fontSize: 14, flex: 1, fontWeight: '500' },

  dropdownPanel: { backgroundColor: '#ffffff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2563eb', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14, padding: 0, fontWeight: '500' },
  stateList: { maxHeight: 240 },
  stateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  stateItemSelected: { backgroundColor: '#eff6ff' },
  stateItemText: { color: '#475569', fontSize: 14, fontWeight: '500' },
  stateItemTextSelected: { color: '#2563eb', fontWeight: '800' },

  // Selected chip
  selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 14, borderWidth: 1, borderColor: '#bbf7d0', alignSelf: 'flex-start' },
  selectedChipText: { color: '#16a34a', fontWeight: '800', fontSize: 13 },

  // Next Button
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, marginTop: 18,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  nextBtnDisabled: { backgroundColor: '#cbd5e1' },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },

  // ── College animations section ────────────────────────────────────────────
  collegeSection: { marginTop: 28 },

  sectionLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionLine:      { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  sectionLabelBadge:{ flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#bfdbfe' },
  sectionLabel:     { fontSize: 10, fontWeight: '800', color: '#2563eb', letterSpacing: 1 },

  // About section
  aboutSection:    { marginTop: 20 },
  aboutHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  aboutLine:       { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  aboutHeaderText: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase' },
  featureGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, paddingBottom: 4 },
  footerText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});

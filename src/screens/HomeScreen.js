import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, StatusBar, Platform, FlatList,
  Dimensions, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STATES, getBoards } from '../constants/indiaData';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const filteredStates = STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const boards = selectedState ? getBoards(selectedState) : [];

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedBoard(null);
    setShowStateDropdown(false);
    setStateSearch('');
  };

  const handleNext = () => {
    if (selectedState && selectedBoard) {
      navigation.navigate('MarksEntry', { state: selectedState, board: selectedBoard });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🎓</Text>
          </View>
          <Text style={styles.appTitle}>SmartCampus<Text style={styles.appTitleAI}> AI</Text></Text>
          <Text style={styles.appTagline}>Your Intelligent College Admission Guide</Text>
          <View style={styles.heroBadgesRow}>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🇮🇳 India</Text></View>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🤖 AI Powered</Text></View>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🆓 Free</Text></View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.stepRow}>
            <View style={styles.stepActive}><Text style={styles.stepNumActive}>1</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}><Text style={styles.stepNumInactive}>2</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}><Text style={styles.stepNumInactive}>3</Text></View>
          </View>
          <Text style={styles.stepLabel}>Step 1 of 3 — Select Your State & Board</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitle}>📍 Where are you from?</Text>

          <Text style={styles.label}>Select Your State / UT</Text>
          <TouchableOpacity
            style={[styles.dropdown, showStateDropdown && styles.dropdownOpen]}
            onPress={() => { setShowStateDropdown(!showStateDropdown); setShowBoardDropdown(false); }}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={16} color="#2563eb" style={{ marginRight: 8 }} />
            <Text style={selectedState ? styles.dropdownSelected : styles.dropdownPlaceholder}>
              {selectedState || 'Choose your state or union territory'}
            </Text>
            <Ionicons name={showStateDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#2563eb" />
          </TouchableOpacity>

          {showStateDropdown && (
            <View style={styles.dropdownPanel}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color="#475569" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search state..."
                  placeholderTextColor="#475569"
                  value={stateSearch}
                  onChangeText={setStateSearch}
                  autoFocus
                />
              </View>
              <ScrollView style={styles.stateList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {filteredStates.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.stateItem, selectedState === item && styles.stateItemSelected]}
                    onPress={() => handleStateSelect(item)}
                  >
                    <Text style={[styles.stateItemText, selectedState === item && styles.stateItemTextSelected]}>{item}</Text>
                    {selectedState === item && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 18 }]}>Select Your Board</Text>
          <TouchableOpacity
            style={[styles.dropdown, !selectedState && styles.dropdownDisabled, showBoardDropdown && styles.dropdownOpen]}
            onPress={() => { if (selectedState) { setShowBoardDropdown(!showBoardDropdown); setShowStateDropdown(false); } }}
            activeOpacity={selectedState ? 0.8 : 1}
          >
            <Ionicons name="school" size={16} color={selectedState ? '#2563eb' : '#334155'} style={{ marginRight: 8 }} />
            <Text style={[selectedBoard ? styles.dropdownSelected : styles.dropdownPlaceholder, !selectedState && styles.dropdownPlaceholderDim]}>
              {selectedBoard || (selectedState ? 'Choose your board' : 'Select a state first')}
            </Text>
            <Ionicons name={showBoardDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={selectedState ? '#2563eb' : '#334155'} />
          </TouchableOpacity>

          {showBoardDropdown && (
            <View style={styles.dropdownPanel}>
              {boards.map((board) => (
                <TouchableOpacity
                  key={board}
                  style={[styles.stateItem, selectedBoard === board && styles.stateItemSelected]}
                  onPress={() => { setSelectedBoard(board); setShowBoardDropdown(false); }}
                >
                  <Text style={[styles.stateItemText, selectedBoard === board && styles.stateItemTextSelected]}>{board}</Text>
                  {selectedBoard === board && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedState && selectedBoard && (
            <View style={styles.infoBox}>
              <Ionicons name="sparkles" size={16} color="#eab308" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>AI ready to find colleges in <Text style={{ color: '#eab308', fontWeight: '700' }}>{selectedState}</Text>!</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, !(selectedState && selectedBoard) && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!(selectedState && selectedBoard)}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Next: Enter Your Marks</Text>
            <Ionicons name="arrow-forward-circle" size={22} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          {[
            { num: '1000+', label: 'Colleges' },
            { num: '28+', label: 'States' },
            { num: '10+', label: 'Depts' },
            { num: '100%', label: 'Free' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel2}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.featuresGrid, { opacity: fadeAnim }]}>
          {[
            { icon: '🤖', title: 'AI Powered', desc: 'Smart recommendations' },
            { icon: '📊', title: 'Placement Data', desc: 'Real campus stats' },
            { icon: '🗺️', title: 'Google Maps', desc: 'Find college location' },
            { icon: '⚖️', title: 'Compare', desc: 'Side by side compare' },
          ].map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { paddingHorizontal: 18, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingTop: Platform.OS === 'android' ? 30 : 20, paddingBottom: 24 },
  logoBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2563eb', marginBottom: 14 },
  logoText: { fontSize: 36 },
  appTitle: { fontSize: 30, fontWeight: '900', color: '#0f172a', letterSpacing: -1, marginBottom: 6 },
  appTitleAI: { color: '#2563eb', fontWeight: '900' },
  appTagline: { fontSize: 13, color: '#475569', marginBottom: 14, textAlign: 'center' },
  heroBadgesRow: { flexDirection: 'row', gap: 8 },
  heroBadge: { backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#cbd5e1' },
  heroBadgeText: { color: '#2563eb', fontSize: 11, fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepActive: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  stepInactive: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  stepNumActive: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  stepNumInactive: { color: '#475569', fontWeight: '700', fontSize: 15 },
  stepLine: { width: 40, height: 2, backgroundColor: '#0f172a' },
  stepLabel: { textAlign: 'center', color: '#475569', fontSize: 12, marginBottom: 18, fontWeight: '500' },
  card: { backgroundColor: '#f8f9fa', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  cardTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  label: { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  dropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  dropdownOpen: { borderColor: '#2563eb', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  dropdownDisabled: { opacity: 0.4 },
  dropdownSelected: { color: '#0f172a', fontSize: 14, fontWeight: '600', flex: 1 },
  dropdownPlaceholder: { color: '#475569', fontSize: 14, flex: 1 },
  dropdownPlaceholderDim: { color: '#e2e8f0' },
  dropdownPanel: { backgroundColor: '#ffffff', borderWidth: 1, borderTopWidth: 0, borderColor: '#2563eb', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, maxHeight: 250, overflow: 'hidden' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14, padding: 0 },
  stateList: { maxHeight: 200 },
  stateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
  stateItemSelected: { backgroundColor: '#0f172a' },
  stateItemText: { color: '#334155', fontSize: 14 },
  stateItemTextSelected: { color: '#2563eb', fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#fde047' },
  infoText: { color: '#ca8a04', fontSize: 13, flex: 1, lineHeight: 18 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 17, marginTop: 20 },
  nextBtnDisabled: { backgroundColor: '#0f172a' },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  statsRow: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: '#2563eb', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  statLabel2: { color: '#475569', fontSize: 11, fontWeight: '600' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: { width: (width - 48) / 2, backgroundColor: '#f8f9fa', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { color: '#0f172a', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: '#475569', fontSize: 11, lineHeight: 16 },
});

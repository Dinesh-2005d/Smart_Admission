import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
  Animated, LayoutAnimation, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { searchColleges } from '../constants/collegeDatabase';
import { useSavedColleges } from '../context/SavedCollegesContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CompareScreen({ navigation }) {
  const [college1Query, setCollege1Query] = useState('');
  const [college2Query, setCollege2Query] = useState('');
  const [c1Results, setC1Results] = useState([]);
  const [c2Results, setC2Results] = useState([]);
  const [college1, setCollege1] = useState(null);
  const [college2, setCollege2] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { issaved, toggleSave } = useSavedColleges();

  // Animation values
  const resultFade = useRef(new Animated.Value(0)).current;
  const resultSlide = useRef(new Animated.Value(40)).current;

  const triggerResultAnimation = () => {
    resultFade.setValue(0);
    resultSlide.setValue(40);
    Animated.parallel([
      Animated.timing(resultFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(resultSlide, { toValue: 0, friction: 7, tension: 35, useNativeDriver: true }),
    ]).start();
  };

  const handleC1Search = (t) => {
    setCollege1Query(t);
    setCollege1(null);
    setShowResult(false);
    if (t.trim().length > 0) {
      setC1Results(searchColleges(t.trim()).slice(0, 5));
    } else {
      setC1Results([]);
    }
  };

  const handleC2Search = (t) => {
    setCollege2Query(t);
    setCollege2(null);
    setShowResult(false);
    if (t.trim().length > 0) {
      setC2Results(searchColleges(t.trim()).slice(0, 5));
    } else {
      setC2Results([]);
    }
  };

  const selectC1 = (c) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollege1(c);
    setCollege1Query(c.name);
    setC1Results([]);
  };

  const selectC2 = (c) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollege2(c);
    setCollege2Query(c.name);
    setC2Results([]);
  };

  const handleCompare = () => {
    if (college1 && college2) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowResult(true);
      triggerResultAnimation();
    }
  };

  // Animated comparative row helper for numeric fields
  const CompareProgressBarRow = ({ label, val1, val2, max = 100, suffix = '' }) => {
    const n1 = parseFloat(val1);
    const n2 = parseFloat(val2);
    const v1 = isNaN(n1) ? 0 : n1;
    const v2 = isNaN(n2) ? 0 : n2;

    const w1Anim = useRef(new Animated.Value(0)).current;
    const w2Anim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      w1Anim.setValue(0);
      w2Anim.setValue(0);
      Animated.parallel([
        Animated.timing(w1Anim, { toValue: v1 / max, duration: 800, useNativeDriver: false }),
        Animated.timing(w2Anim, { toValue: v2 / max, duration: 800, useNativeDriver: false }),
      ]).start();
    }, [val1, val2]);

    const width1 = w1Anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    const width2 = w2Anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    const isC1Winner = v1 > v2;
    const isC2Winner = v2 > v1;

    return (
      <View style={styles.compBarContainer}>
        <Text style={styles.compBarLabel}>{label}</Text>
        <View style={styles.compBarRow}>
          {/* College 1 */}
          <View style={styles.compBarCol}>
            <Text style={[styles.compBarValue, isC1Winner && styles.compBarWinner]}>
              {val1}{suffix} {isC1Winner ? '🏆' : ''}
            </Text>
            <View style={styles.barBackground}>
              <Animated.View style={[styles.barFill, { width: width1, backgroundColor: isC1Winner ? '#16a34a' : '#94a3b8' }]} />
            </View>
          </View>

          <View style={styles.vsDivider}>
            <Text style={styles.vsDividerText}>vs</Text>
          </View>

          {/* College 2 */}
          <View style={styles.compBarCol}>
            <Text style={[styles.compBarValue, isC2Winner && styles.compBarWinner]}>
              {val2}{suffix} {isC2Winner ? '🏆' : ''}
            </Text>
            <View style={styles.barBackground}>
              <Animated.View style={[styles.barFill, { width: width2, backgroundColor: isC2Winner ? '#16a34a' : '#94a3b8' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const CompareTextRow = ({ label, val1, val2 }) => {
    return (
      <View style={styles.compareRow}>
        <Text style={styles.compareVal}>{val1}</Text>
        <Text style={styles.compareLabel}>{label}</Text>
        <Text style={styles.compareVal}>{val2}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.container}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.headerTitle}>⚖️ Compare Colleges</Text>
            <Text style={styles.headerSub}>Enter two college names to compare side by side</Text>

            <View style={styles.inputsRow}>
              {/* Input College 1 */}
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>College 1</Text>
                <View style={[styles.inputWrapper, focusedField === 'c1' && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search college name..."
                    placeholderTextColor="#94a3b8"
                    value={college1Query}
                    onChangeText={handleC1Search}
                    onFocus={() => setFocusedField('c1')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {c1Results.length > 0 && (
                  <View style={styles.dropdown}>
                    {c1Results.map((c, i) => (
                      <TouchableOpacity key={i} style={styles.dropItem} onPress={() => selectC1(c)}>
                        <Text style={styles.dropText} numberOfLines={1}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>

              {/* Input College 2 */}
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>College 2</Text>
                <View style={[styles.inputWrapper, focusedField === 'c2' && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search college name..."
                    placeholderTextColor="#94a3b8"
                    value={college2Query}
                    onChangeText={handleC2Search}
                    onFocus={() => setFocusedField('c2')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {c2Results.length > 0 && (
                  <View style={styles.dropdown}>
                    {c2Results.map((c, i) => (
                      <TouchableOpacity key={i} style={styles.dropItem} onPress={() => selectC2(c)}>
                        <Text style={styles.dropText} numberOfLines={1}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.compareBtn, (!college1 || !college2) && styles.compareBtnDisabled]}
              onPress={handleCompare}
              activeOpacity={0.85}
              disabled={!college1 || !college2}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.compareBtnText}>⚡ Compare Now</Text>
            </TouchableOpacity>

            {showResult && college1 && college2 && (
              <Animated.View style={[styles.resultCard, { opacity: resultFade, transform: [{ translateY: resultSlide }] }]}>
                {/* College headers with Save buttons */}
                <View style={styles.resultHeader}>
                  {/* College 1 */}
                  <View style={styles.collegeHeaderCol}>
                    <Text style={styles.resultCollegeName} numberOfLines={2}>{college1.name}</Text>
                    <TouchableOpacity
                      style={[styles.saveBtn, issaved(college1) && styles.saveBtnActive]}
                      onPress={() => toggleSave(college1)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={issaved(college1) ? 'bookmark' : 'bookmark-outline'}
                        size={13}
                        color={issaved(college1) ? '#ffffff' : '#2563eb'}
                      />
                      <Text style={[styles.saveBtnText, issaved(college1) && { color: '#ffffff' }]}>
                        {issaved(college1) ? 'Saved' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.resultVs}>VS</Text>

                  {/* College 2 */}
                  <View style={styles.collegeHeaderCol}>
                    <Text style={styles.resultCollegeName} numberOfLines={2}>{college2.name}</Text>
                    <TouchableOpacity
                      style={[styles.saveBtn, issaved(college2) && styles.saveBtnActive]}
                      onPress={() => toggleSave(college2)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={issaved(college2) ? 'bookmark' : 'bookmark-outline'}
                        size={13}
                        color={issaved(college2) ? '#ffffff' : '#2563eb'}
                      />
                      <Text style={[styles.saveBtnText, issaved(college2) && { color: '#ffffff' }]}>
                        {issaved(college2) ? 'Saved' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Animated progress comparison bar rows */}
                <CompareProgressBarRow label="⭐ Rating Score" val1={String(college1.rating)} val2={String(college2.rating)} max={5} />
                <CompareProgressBarRow label="📈 Placement Rate" val1={String(college1.placementRate)} val2={String(college2.placementRate)} max={100} suffix="%" />
                <CompareProgressBarRow label="🎯 Minimum Cutoff Marks" val1={String(college1.minPercentage)} val2={String(college2.minPercentage)} max={100} suffix="%" />

                {/* Metadata comparison rows */}
                <CompareTextRow label="🏆 NAAC Grade" val1={college1.naacGrade || 'N/A'} val2={college2.naacGrade || 'N/A'} />
                <CompareTextRow label="🏠 Hostel Facility" val1={college1.hostelAvailable ? 'Yes' : 'No'} val2={college2.hostelAvailable ? 'Yes' : 'No'} />
                <CompareTextRow label="🏫 Management Type" val1={college1.type} val2={college2.type} />
                <CompareTextRow label="📅 Year Established" val1={String(college1.established)} val2={String(college2.established)} />

                <View style={styles.viewBtns}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('Details', { college: college1, departmentLabel: college1.department || '' })} activeOpacity={0.8}>
                    <Text style={styles.viewBtnText}>View details 1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('Details', { college: college2, departmentLabel: college2.department || '' })} activeOpacity={0.8}>
                    <Text style={styles.viewBtnText}>View details 2</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  headerTitle: { color: '#0f172a', fontSize: 22, fontWeight: '950', marginBottom: 4 },
  headerSub: { color: '#64748b', fontSize: 13, marginBottom: 20, fontWeight: '500' },
  inputsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16, zIndex: 10 },
  inputBox: { flex: 1, position: 'relative', zIndex: 10 },
  inputLabel: { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },

  inputWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: { paddingHorizontal: 12, paddingVertical: 10, color: '#0f172a', fontSize: 13, fontWeight: '600' },

  dropdown: { position: 'absolute', top: 64, left: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', zIndex: 999, elevation: 6, overflow: 'hidden' },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  vsCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#cbd5e1', marginTop: 24, shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  vsText: { color: '#2563eb', fontWeight: '900', fontSize: 11 },

  compareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 15, marginBottom: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  compareBtnDisabled: { backgroundColor: '#cbd5e1', opacity: 0.8 },
  compareBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },

  resultCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(219,234,254,0.5)',
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
  collegeHeaderCol: { flex: 1, alignItems: 'center', gap: 10 },
  resultCollegeName: { color: '#0f172a', fontSize: 13, fontWeight: '850', textAlign: 'center', lineHeight: 18 },
  resultVs: { color: '#2563eb', fontWeight: '900', fontSize: 14, textTransform: 'uppercase' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: '#2563eb', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#eff6ff',
  },
  saveBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  saveBtnText: { color: '#2563eb', fontSize: 11, fontWeight: '700' },

  // Compare Progress Bar Row
  compBarContainer: { marginBottom: 18 },
  compBarLabel: { color: '#475569', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', marginBottom: 8 },
  compBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compBarCol: { flex: 1 },
  compBarValue: { fontSize: 14, fontWeight: '800', color: '#64748b', marginBottom: 6, textAlign: 'center' },
  compBarWinner: { color: '#16a34a', fontWeight: '900' },
  barBackground: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', borderWidth: 0.5, borderColor: '#cbd5e1' },
  barFill: { height: '100%', borderRadius: 4 },
  vsDivider: { width: 20, alignItems: 'center', justifyContent: 'center' },
  vsDividerText: { color: '#94a3b8', fontSize: 10, fontWeight: '750' },

  // Metadata Compare Text Row
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  compareVal: { flex: 1, color: '#334155', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  compareLabel: { flex: 1, color: '#64748b', fontSize: 11, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.2 },

  viewBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  viewBtn: { flex: 1, backgroundColor: '#eff6ff', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#2563eb' },
  viewBtnText: { color: '#2563eb', fontWeight: '800', fontSize: 12 },
});

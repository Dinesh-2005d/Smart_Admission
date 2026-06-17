import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, StatusBar, Platform, SafeAreaView,
  KeyboardAvoidingView, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEPARTMENTS, STATES } from '../constants/indiaData';

// All states for the picker (with emoji flags)
const STATE_OPTIONS = [
  { key: 'All India', label: '🇮🇳 All India (Show from all states)' },
  ...STATES.map(s => ({ key: s, label: `📍 ${s}` })),
];

export default function MarksEntryScreen({ navigation, route }) {
  const { state: homeState, board } = route.params;
  const [selectedDept, setSelectedDept] = useState(null);
  const [percentage, setPercentage] = useState('');
  const [entranceScore, setEntranceScore] = useState('');
  const [showEntrance, setShowEntrance] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [targetState, setTargetState] = useState(homeState); // default = home state
  const [stateSearch, setStateSearch] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const getEntranceLabel = () => {
    if (selectedDept === 'engineering') return 'JEE / State Entrance Score (optional)';
    if (selectedDept === 'medical')     return 'NEET Score (required)';
    if (selectedDept === 'law')         return 'CLAT Score (optional)';
    if (selectedDept === 'architecture') return 'NATA Score (optional)';
    if (selectedDept === 'management')  return 'CAT / MAT Score (optional)';
    return null;
  };

  const handleDeptSelect = (id) => {
    setSelectedDept(id);
    setEntranceScore('');
    setShowEntrance(['engineering', 'medical', 'law', 'architecture', 'management'].includes(id));
  };

  const isValid = () => {
    if (!selectedDept || !percentage) return false;
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) return false;
    if (selectedDept === 'medical' && !entranceScore) return false;
    return true;
  };

  const getScoreColor = () => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return '#16a34a';
    if (pct >= 75) return '#eab308';
    if (pct >= 60) return '#2563eb';
    return '#b91c1c';
  };

  const getScoreMessage = () => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return '🌟 Outstanding! Top colleges await you!';
    if (pct >= 75) return '👍 Great score! Many top colleges available.';
    if (pct >= 60) return '✅ Good score! Several colleges available.';
    return '📚 Keep going! Some colleges still available.';
  };

  const filteredStates = STATE_OPTIONS.filter(s =>
    s.label.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const navigateToColleges = () => {
    navigation.navigate('CollegeList', {
      homeState,
      targetState: targetState === 'All India' ? null : targetState,
      board,
      department: selectedDept,
      departmentLabel: DEPARTMENTS.find(d => d.id === selectedDept)?.label,
      percentage: parseFloat(percentage),
      entranceScore: entranceScore ? parseFloat(entranceScore) : null,
    });
  };

  const targetStateLabel =
    targetState === homeState ? `🏠 My State (${homeState})` :
    targetState === 'All India' ? '🇮🇳 All India' :
    `📍 ${targetState}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
              <Ionicons name="home" size={18} color="#0f172a" />
              <Text style={styles.backBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepDone}><Ionicons name="checkmark" size={16} color="#ffffff" /></View>
            <View style={styles.stepLineActive} />
            <View style={styles.stepActive}><Text style={styles.stepNumActive}>2</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}><Text style={styles.stepNumInactive}>3</Text></View>
          </View>
          <Text style={styles.stepLabel}>Step 2 of 3 — Department & Marks</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}><Ionicons name="location" size={12} color="#2563eb" /><Text style={styles.infoChipText}> {homeState}</Text></View>
            <View style={styles.infoChip}><Ionicons name="school" size={12} color="#2563eb" /><Text style={styles.infoChipText}> {board.split('(')[0].trim()}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🎓 Select Department</Text>
            <View style={styles.deptGrid}>
              {DEPARTMENTS.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[styles.deptCard, selectedDept === dept.id && styles.deptCardSelected]}
                  onPress={() => handleDeptSelect(dept.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deptIcon}>{dept.icon}</Text>
                  <Text style={[styles.deptLabel, selectedDept === dept.id && styles.deptLabelSelected]}>
                    {dept.label.split('(')[0].trim()}
                  </Text>
                  <Text style={[styles.deptSub, selectedDept === dept.id && styles.deptSubSelected]}>
                    {dept.label.match(/\(([^)]+)\)/)?.[1] || ''}
                  </Text>
                  {selectedDept === dept.id && <View style={styles.deptCheck}><Ionicons name="checkmark-circle" size={16} color="#16a34a" /></View>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedDept && (
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>📊 Enter Your Marks</Text>

              <Text style={styles.label}>12th / HSC Percentage *</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 85.5"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={percentage}
                  onChangeText={(t) => {
                    if (t === '' || (/^\d{0,3}(\.\d{0,2})?$/.test(t) && parseFloat(t) <= 100)) setPercentage(t);
                  }}
                  maxLength={6}
                />
                <View style={[styles.inputSuffix, percentage && { backgroundColor: getScoreColor() + '33' }]}>
                  <Text style={[styles.inputSuffixText, percentage && { color: getScoreColor() }]}>%</Text>
                </View>
              </View>

              {percentage !== '' && parseFloat(percentage) >= 0 && parseFloat(percentage) <= 100 && (
                <>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreFill, { width: `${Math.min(parseFloat(percentage), 100)}%`, backgroundColor: getScoreColor() }]} />
                  </View>
                  <View style={styles.hintBox}>
                    <Text style={styles.hintText}>{getScoreMessage()}</Text>
                  </View>
                </>
              )}

              {showEntrance && (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>{getEntranceLabel()}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder={selectedDept === 'medical' ? 'e.g. 650' : 'e.g. 120'}
                      placeholderTextColor="#475569"
                      keyboardType="numeric"
                      value={entranceScore}
                      onChangeText={setEntranceScore}
                      maxLength={6}
                    />
                    <View style={styles.inputSuffix}>
                      <Text style={styles.inputSuffixText}>pts</Text>
                    </View>
                  </View>
                </>
              )}

              {/* State Selector Row */}
              <Text style={[styles.label, { marginTop: 16 }]}>📍 State Preference</Text>
              <TouchableOpacity style={styles.statePickerBtn} onPress={() => setShowStateModal(true)} activeOpacity={0.85}>
                <Text style={styles.statePickerText}>{targetStateLabel}</Text>
                <Ionicons name="chevron-down" size={18} color="#2563eb" />
              </TouchableOpacity>
              <Text style={styles.stateHint}>Change to search colleges in a different state</Text>

              <TouchableOpacity
                style={[styles.findBtn, !isValid() && styles.findBtnDisabled]}
                onPress={() => { if (isValid()) setShowStateModal(true); }}
                disabled={!isValid()}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={20} color="#ffffff" />
                <Text style={styles.findBtnText}>Find Best Colleges with AI</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {!selectedDept && (
            <View style={styles.promptBox}>
              <Text style={styles.promptEmoji}>👆</Text>
              <Text style={styles.promptText}>Select a department above to continue</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🗺️ Which state do you want colleges from?</Text>
            <Text style={styles.modalSubtitle}>
              Showing colleges from: <Text style={{ color: '#2563eb', fontWeight: '700' }}>{targetStateLabel}</Text>
            </Text>

            {/* Search box */}
            <View style={styles.stateSearchRow}>
              <Ionicons name="search" size={16} color="#475569" />
              <TextInput
                style={styles.stateSearchInput}
                placeholder="Search state..."
                placeholderTextColor="#94a3b8"
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              {stateSearch !== '' && (
                <TouchableOpacity onPress={() => setStateSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#475569" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick picks */}
            {stateSearch === '' && (
              <View style={styles.quickPicks}>
                <TouchableOpacity
                  style={[styles.quickPickBtn, targetState === homeState && styles.quickPickBtnActive]}
                  onPress={() => { setTargetState(homeState); setShowStateModal(false); navigateToColleges(); }}
                >
                  <Text style={[styles.quickPickText, targetState === homeState && styles.quickPickTextActive]}>🏠 My State ({homeState})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickPickBtn, targetState === 'All India' && styles.quickPickBtnActive]}
                  onPress={() => { setTargetState('All India'); setShowStateModal(false); setTimeout(navigateToColleges, 50); }}
                >
                  <Text style={[styles.quickPickText, targetState === 'All India' && styles.quickPickTextActive]}>🇮🇳 All India</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={filteredStates}
              keyExtractor={item => item.key}
              style={{ maxHeight: 320 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, targetState === item.key && styles.stateItemActive]}
                  onPress={() => {
                    const chosen = item.key === 'All India' ? 'All India' : item.key;
                    setTargetState(chosen);
                    setShowStateModal(false);
                    setStateSearch('');
                    setTimeout(() => {
                      navigation.navigate('CollegeList', {
                        homeState,
                        targetState: chosen === 'All India' ? null : chosen,
                        board,
                        department: selectedDept,
                        departmentLabel: DEPARTMENTS.find(d => d.id === selectedDept)?.label,
                        percentage: parseFloat(percentage),
                        entranceScore: entranceScore ? parseFloat(entranceScore) : null,
                      });
                    }, 50);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.stateItemText, targetState === item.key && styles.stateItemTextActive]}>
                    {item.label}
                  </Text>
                  {targetState === item.key && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setShowStateModal(false); setStateSearch(''); }}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 16 : 16 },
  headerRow: { flexDirection: 'row', marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e2e8f0' },
  backBtnText: { color: '#0f172a', fontWeight: '700', marginLeft: 6, fontSize: 13 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepDone: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  stepActive: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  stepInactive: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  stepNumActive: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  stepNumInactive: { color: '#475569', fontWeight: '700', fontSize: 15 },
  stepLine: { width: 40, height: 2, backgroundColor: '#0f172a' },
  stepLineActive: { width: 40, height: 2, backgroundColor: '#2563eb' },
  stepLabel: { textAlign: 'center', color: '#475569', fontSize: 12, marginBottom: 14, fontWeight: '500' },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 16, justifyContent: 'center' },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#cbd5e1' },
  infoChipText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: '#f8f9fa', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, elevation: 6 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  deptCard: { width: '48%', backgroundColor: '#ffffff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', position: 'relative', marginBottom: 14 },
  deptCardSelected: { borderColor: '#16a34a', backgroundColor: '#dcfce7' },
  deptIcon: { fontSize: 26, marginBottom: 8 },
  deptLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  deptLabelSelected: { color: '#16a34a' },
  deptSub: { color: '#475569', fontSize: 11 },
  deptSubSelected: { color: '#15803d' },
  deptCheck: { position: 'absolute', top: 10, right: 10 },
  label: { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  input: { flex: 1, color: '#0f172a', fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingVertical: 14 },
  inputSuffix: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0f172a' },
  inputSuffixText: { color: '#2563eb', fontWeight: '800', fontSize: 16 },
  scoreBar: { height: 6, backgroundColor: '#0f172a', borderRadius: 3, marginTop: 10, marginBottom: 4, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3 },
  hintBox: { backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#fde047' },
  hintText: { color: '#ca8a04', fontSize: 13, lineHeight: 18 },
  statePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1.5, borderColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 13 },
  statePickerText: { color: '#0f172a', fontSize: 15, fontWeight: '700', flex: 1 },
  stateHint: { color: '#94a3b8', fontSize: 11, marginTop: 5, marginBottom: 4 },
  findBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, marginTop: 16 },
  findBtnDisabled: { backgroundColor: '#0f172a' },
  findBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  promptBox: { alignItems: 'center', padding: 30, gap: 8 },
  promptEmoji: { fontSize: 32 },
  promptText: { color: '#475569', fontSize: 14, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 16, maxHeight: '88%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { color: '#475569', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  stateSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  stateSearchInput: { flex: 1, color: '#0f172a', fontSize: 14, fontWeight: '500' },
  quickPicks: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickPickBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0' },
  quickPickBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  quickPickText: { color: '#334155', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  quickPickTextActive: { color: '#2563eb' },
  stateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stateItemActive: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 10 },
  stateItemText: { color: '#334155', fontSize: 14 },
  stateItemTextActive: { color: '#2563eb', fontWeight: '700' },
  modalCloseBtn: { backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalCloseBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});

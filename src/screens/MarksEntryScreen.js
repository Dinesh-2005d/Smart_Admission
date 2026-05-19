import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, StatusBar, Platform, SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEPARTMENTS } from '../constants/indiaData';

export default function MarksEntryScreen({ navigation, route }) {
  const { state, board } = route.params;
  const [selectedDept, setSelectedDept] = useState(null);
  const [percentage, setPercentage] = useState('');
  const [entranceScore, setEntranceScore] = useState('');
  const [showEntrance, setShowEntrance] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const getEntranceLabel = () => {
    if (selectedDept === 'engineering') return 'JEE / State Entrance Score (optional)';
    if (selectedDept === 'medical') return 'NEET Score (required)';
    if (selectedDept === 'law') return 'CLAT Score (optional)';
    if (selectedDept === 'architecture') return 'NATA Score (optional)';
    if (selectedDept === 'management') return 'CAT / MAT Score (optional)';
    return null;
  };

  const handleDeptSelect = (id) => {
    setSelectedDept(id);
    setEntranceScore('');
    setShowEntrance(['engineering','medical','law','architecture','management'].includes(id));
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.stepRow}>
          <View style={styles.stepDone}><Ionicons name="checkmark" size={16} color="#ffffff" /></View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepActive}><Text style={styles.stepNumActive}>2</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}><Text style={styles.stepNumInactive}>3</Text></View>
        </View>
        <Text style={styles.stepLabel}>Step 2 of 3 — Department & Marks</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoChip}><Ionicons name="location" size={12} color="#2563eb" /><Text style={styles.infoChipText}> {state}</Text></View>
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
                {selectedDept === dept.id && <View style={styles.deptCheck}><Ionicons name="checkmark-circle" size={16} color="#2563eb" /></View>}
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

            <TouchableOpacity
              style={[styles.findBtn, !isValid() && styles.findBtnDisabled]}
              onPress={() => {
                if (isValid()) navigation.navigate('CollegeList', {
                  state, board,
                  department: selectedDept,
                  departmentLabel: DEPARTMENTS.find(d => d.id === selectedDept)?.label,
                  percentage: parseFloat(percentage),
                  entranceScore: entranceScore ? parseFloat(entranceScore) : null,
                });
              }}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 16 : 8 },
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
  deptCardSelected: { borderColor: '#2563eb', backgroundColor: '#0f172a' },
  deptIcon: { fontSize: 26, marginBottom: 8 },
  deptLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  deptLabelSelected: { color: '#0f172a' },
  deptSub: { color: '#475569', fontSize: 11 },
  deptSubSelected: { color: '#2563eb' },
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
  findBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 17, marginTop: 20 },
  findBtnDisabled: { backgroundColor: '#0f172a' },
  findBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  promptBox: { alignItems: 'center', padding: 30, gap: 8 },
  promptEmoji: { fontSize: 32 },
  promptText: { color: '#475569', fontSize: 14, textAlign: 'center' },
});

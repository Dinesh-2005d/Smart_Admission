import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, Platform, SafeAreaView,
  LayoutAnimation, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DEPARTMENTS } from '../constants/indiaData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PCT_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

const PCT_COLOR = (pct) => {
  if (pct >= 90) return '#16a34a';
  if (pct >= 75) return '#2563eb';
  if (pct >= 60) return '#d97706';
  return '#dc2626';
};

export default function MarksEntryScreen({ navigation, route }) {
  const { state: homeState, targetState } = route.params;
  const [selectedDept, setSelectedDept] = useState(null);
  const [percentage, setPercentage] = useState(75);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleDeptSelect = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDept(id);
  };

  const handleFindColleges = () => {
    if (!selectedDept) return;
    navigation.navigate('CollegeList', {
      homeState,
      targetState: targetState || homeState,
      department: selectedDept,
      departmentLabel: DEPARTMENTS.find(d => d.id === selectedDept)?.label,
      percentage: percentage,
    });
  };

  return (
    <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={16} color="#2563eb" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.stateChip}>
              <Ionicons name="location" size={13} color="#2563eb" />
              <Text style={styles.stateChipText}>{targetState || homeState}</Text>
            </View>
          </View>

          {/* Title */}
          <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
            <Text style={styles.pageTitle}>🎓 Select Department</Text>
            <Text style={styles.pageSubtitle}>Choose the field you want to study</Text>
          </Animated.View>

          {/* Department Grid */}
          <Animated.View style={[styles.deptGrid, { opacity: fadeAnim }]}>
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDept === dept.id;
              return (
                <TouchableOpacity
                  key={dept.id}
                  style={[styles.deptCard, isSelected && styles.deptCardSelected]}
                  onPress={() => handleDeptSelect(dept.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deptIcon}>{dept.icon}</Text>
                  <Text style={[styles.deptLabel, isSelected && styles.deptLabelSelected]}>
                    {dept.label.split('(')[0].trim()}
                  </Text>
                  <Text style={[styles.deptSub, isSelected && styles.deptSubSelected]}>
                    {dept.label.match(/\(([^)]+)\)/)?.[1] || ''}
                  </Text>
                  {isSelected && (
                    <View style={styles.deptCheck}>
                      <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* Percentage Selector */}
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
            <Text style={styles.inputLabel}>📊 Select Your 12th / HSC Percentage</Text>

            {/* Selected value badge */}
            <View style={[styles.selectedBadge, { borderColor: PCT_COLOR(percentage) }]}>
              <Text style={[styles.selectedBadgeNum, { color: PCT_COLOR(percentage) }]}>{percentage}%</Text>
              <Text style={styles.selectedBadgeLabel}>
                {percentage >= 90 ? '🌟 Excellent – Top colleges available!' :
                 percentage >= 75 ? '👍 Good – Many colleges qualify!' :
                 percentage >= 60 ? '🙂 Average – Some colleges qualify.' :
                 '⚠️ Low – Limited options available.'}
              </Text>
            </View>

            {/* Step buttons grid */}
            <View style={styles.stepsGrid}>
              {PCT_STEPS.map((step) => {
                const active = percentage === step;
                const col = PCT_COLOR(step);
                return (
                  <TouchableOpacity
                    key={step}
                    style={[
                      styles.stepBtn,
                      { borderColor: col + (active ? 'ff' : '55') },
                      active && { backgroundColor: col },
                    ]}
                    onPress={() => setPercentage(step)}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      styles.stepBtnText,
                      { color: active ? '#ffffff' : col },
                    ]}>{step}%</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputHint}>Colleges below your selected percentage cutoff are filtered out automatically.</Text>
          </Animated.View>

          {/* Find Button */}
          <TouchableOpacity
            style={[styles.findBtn, !selectedDept && styles.findBtnDisabled]}
            onPress={handleFindColleges}
            disabled={!selectedDept}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color={selectedDept ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.findBtnText, !selectedDept && styles.findBtnTextDisabled]}>
              {selectedDept
                ? `Find Colleges · ${DEPARTMENTS.find(d => d.id === selectedDept)?.label.split('(')[0].trim()}`
                : 'Select a Department to Continue'}
            </Text>
            {selectedDept && <Ionicons name="arrow-forward-circle" size={20} color="#ffffff" />}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 16 : 12 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  backBtnText: { color: '#2563eb', fontWeight: '750', fontSize: 13 },
  stateChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  stateChipText: { color: '#2563eb', fontWeight: '750', fontSize: 12 },

  // Title
  titleSection: { marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '950', color: '#0f172a', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  // Dept grid
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  deptCard: {
    width: '48%', backgroundColor: '#ffffff', borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: '#e2e8f0', position: 'relative', marginBottom: 14,
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  deptCardSelected: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  deptIcon: { fontSize: 28, marginBottom: 8 },
  deptLabel: { color: '#334155', fontSize: 13, fontWeight: '800', marginBottom: 2 },
  deptLabelSelected: { color: '#16a34a' },
  deptSub: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
  deptSubSelected: { color: '#15803d' },
  deptCheck: { position: 'absolute', top: 10, right: 10 },

  // Percentage selector styles
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(219,234,254,0.5)',
    marginBottom: 24,
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  inputLabel: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f8faff',
  },
  selectedBadgeNum: {
    fontSize: 32,
    fontWeight: '900',
  },
  selectedBadgeLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 18,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  stepBtn: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f8faff',
    minWidth: 62,
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  inputHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Find button
  findBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 17, marginBottom: 10,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  findBtnDisabled: { backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1' },
  findBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  findBtnTextDisabled: { color: '#94a3b8' },
});

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, ActivityIndicator,
  Modal, FlatList, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTop25ForPercentage, getAllCollegesInState } from '../constants/collegeDatabase';
import { getAIMessage, predictAdmissionChance } from '../constants/offlineAI';
import { useSavedColleges } from '../context/SavedCollegesContext';
import { DEPARTMENTS, STATES } from '../constants/indiaData';
import CollegeLogo from '../components/CollegeLogo';

// ─── Animated card wrapper ────────────────────────────────────────────────────
function AnimatedCard({ index, children }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index * 40, 500),
      useNativeDriver: true,
    }).start();
  }, [index, animatedValue]);
  const translateY = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return (
    <Animated.View style={{ opacity: animatedValue, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#ffffff', card: '#f8f9fa', border: '#e2e8f0',
  purple: '#2563eb', gold: '#eab308', green: '#16a34a',
  blue: '#0284c7', pink: '#dc2626', text: '#0f172a',
  sub: '#334155', dim: '#475569', navy: '#0f172a',
  teal: '#0d9488',
};

const PCT_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

const STATE_OPTIONS = [
  { key: 'All India', label: '🇮🇳 All India' },
  ...STATES.map(s => ({ key: s, label: `📍 ${s}` })),
];

const getTypeColor  = (type) => type === 'Government' ? C.green : C.gold;
const placementColor = (rate) => rate >= 90 ? C.green : rate >= 75 ? C.gold : '#ea580c';
const pctColor = (pct) => {
  if (pct >= 90) return C.green;
  if (pct >= 75) return C.purple;
  if (pct >= 60) return '#d97706';
  return C.pink;
};

// ─── College Card (shared) ────────────────────────────────────────────────────
function CollegeCard({ college, index, percentage, navigation, departmentLabel, sectionPrefix = '' }) {
  const { issaved, toggleSave } = useSavedColleges();
  const admission = predictAdmissionChance(college, percentage || 75, 0);
  const saved = issaved(college);

  return (
    <AnimatedCard index={index}>
      <TouchableOpacity
        style={styles.collegeCard}
        onPress={() => navigation.navigate('Details', { college, departmentLabel })}
        activeOpacity={0.85}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        <View style={styles.collegeHeader}>
          <CollegeLogo
            collegeName={college.name}
            department={college.department}
            size={52}
            borderRadius={12}
            collegeDomain={college.domain}
          />
          <View style={styles.collegeHeaderInfo}>
            <Text style={styles.collegeName}>{college.name}</Text>
            <Text style={styles.collegeLocation}>📍 {college.location}, {college.state}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <View style={[styles.tag, { borderColor: getTypeColor(college.type), backgroundColor: getTypeColor(college.type) + '15' }]}>
            <Text style={[styles.tagText, { color: getTypeColor(college.type) }]}>{college.type}</Text>
          </View>
          {college.naacGrade && (
            <View style={[styles.tag, { borderColor: C.gold, backgroundColor: C.gold + '15' }]}>
              <Text style={[styles.tagText, { color: C.gold }]}>NAAC {college.naacGrade}</Text>
            </View>
          )}
          <View style={[styles.tag, { borderColor: admission.color, backgroundColor: admission.color + '15' }]}>
            <Text style={[styles.tagText, { color: admission.color }]}>{admission.emoji} {admission.chance}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: C.gold }]}>⭐ {college.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: placementColor(college.placementRate) }]}>{college.placementRate}%</Text>
            <Text style={styles.statLabel}>Placement</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: college.hostelAvailable ? C.green : C.pink }]}>
              {college.hostelAvailable ? '✅' : '❌'}
            </Text>
            <Text style={styles.statLabel}>Hostel</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: C.blue, fontSize: 10 }]}>🎯 {college.minPercentage}%</Text>
            <Text style={styles.statLabel}>Min Marks</Text>
          </View>
        </View>

        {college.highlight ? (
          <View style={styles.highlightBox}>
            <Ionicons name="star" size={13} color={C.gold} />
            <Text style={styles.highlightText}>{college.highlight}</Text>
          </View>
        ) : null}

        {college.topCompanies?.length > 0 && (
          <View style={styles.companiesRow}>
            <Text style={styles.companiesLabel}>🏢 </Text>
            <Text style={styles.companiesText}>{college.topCompanies.slice(0, 3).join(' • ')}</Text>
          </View>
        )}

        <View style={styles.viewDetailRow}>
          <Text style={styles.viewDetailText}>View Full Details & Map</Text>
          <TouchableOpacity
            style={[styles.saveCardBtn, saved && styles.saveCardBtnActive]}
            onPress={() => toggleSave(college)}
            activeOpacity={0.8}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={14} color={saved ? '#ffffff' : C.purple} />
            <Text style={[styles.saveCardBtnText, saved && { color: '#ffffff' }]}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, subtitle, color = C.purple }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={styles.sectionHeaderEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionHeaderTitle, { color }]}>{title}</Text>
        {subtitle ? <Text style={styles.sectionHeaderSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CollegeListScreen({ navigation, route }) {
  const {
    targetState: initialTargetState,
    department: initialDept,
    departmentLabel: initialDeptLabel,
    percentage,
    state: legacyState,
  } = route.params || {};


  // ── Active filters ─────────────────────────────────────────────────────────
  const [activeDept, setActiveDept]           = useState(initialDept);
  const [activeDeptLabel, setActiveDeptLabel] = useState(initialDeptLabel);
  const [activeTargetState, setActiveTargetState] = useState(
    initialTargetState !== undefined ? initialTargetState : (legacyState || null)
  );

  // ── Active percentage (can change in-screen using step buttons) ────────────
  const [activePct, setActivePct] = useState(percentage || 75);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [top25, setTop25]         = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aiMessage, setAiMessage] = useState('');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showStateModal, setShowStateModal] = useState(false);
  const [showDeptModal, setShowDeptModal]   = useState(false);
  const [stateSearch, setStateSearch]       = useState('');
  const [deptSearch, setDeptSearch]         = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const loadData = useCallback(() => {
    setLoading(true);
    fadeAnim.setValue(0);
    setTimeout(() => {
      // ── Section 1: Top 25 recommended ──
      const recommended = getTop25ForPercentage(activeTargetState, activeDept, activePct);
      setTop25(recommended);
      setAiMessage(getAIMessage(recommended, activePct, activeDeptLabel, activeTargetState || 'All India'));

      // ── Section 2: All colleges in state ──
      const stateColleges = getAllCollegesInState(activeTargetState);
      setAllColleges(stateColleges);

      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 350);
  }, [activeTargetState, activeDept, activePct, activeDeptLabel, fadeAnim]);

  // Reload whenever filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick counts for filter chips
  const allDeptColleges = allColleges.filter(c => c.department === activeDept);
  const govtAllCount    = allDeptColleges.filter(c => c.type === 'Government').length;
  const pvtAllCount     = allDeptColleges.filter(c => c.type !== 'Government').length;
  const totalAllCount   = allDeptColleges.length;

  // ── Label helpers ──────────────────────────────────────────────────────────
  const stateLabel = !activeTargetState || activeTargetState === 'All India'
    ? '🇮🇳 All India'
    : `📍 ${activeTargetState}`;

  const filteredStates = STATE_OPTIONS.filter(s =>
    s.label.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const filteredDepts = DEPARTMENTS.filter(d =>
    d.label.toLowerCase().includes(deptSearch.toLowerCase())
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={C.purple} />
            <Text style={styles.loadingTitle}>🤖 AI Analyzing Your Profile...</Text>
            <Text style={styles.loadingSubtitle}>{activePct}% · {activeDeptLabel?.split('(')?.[0] || ''}</Text>
            <Text style={styles.loadingState}>{stateLabel}</Text>
            <View style={styles.loadingSteps}>
              {['Checking eligibility...', 'Finding Top 25...', 'Loading all colleges...', 'Ready!'].map((s, i) => (
                <Text key={i} style={styles.loadingStep}>✓ {s}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ─── Render modals ────────────────────────────────────────────────────────
  function renderStateModal() {
    return (
      <Modal visible={showStateModal} animationType="slide" transparent onRequestClose={() => { setShowStateModal(false); setStateSearch(''); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🗺️ Select State</Text>
            <View style={styles.modalSearchRow}>
              <Ionicons name="search" size={16} color={C.dim} />
              <TextInput style={styles.modalSearchInput} placeholder="Search state..." placeholderTextColor="#94a3b8" value={stateSearch} onChangeText={setStateSearch} />
              {stateSearch !== '' && <TouchableOpacity onPress={() => setStateSearch('')}><Ionicons name="close-circle" size={16} color={C.dim} /></TouchableOpacity>}
            </View>
            <FlatList
              data={filteredStates}
              keyExtractor={item => item.key}
              style={{ maxHeight: 400 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, (activeTargetState || 'All India') === item.key && styles.modalItemActive]}
                  onPress={() => { setActiveTargetState(item.key === 'All India' ? null : item.key); setShowStateModal(false); setStateSearch(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalItemText, (activeTargetState || 'All India') === item.key && styles.modalItemTextActive]}>{item.label}</Text>
                  {(activeTargetState || 'All India') === item.key && <Ionicons name="checkmark-circle" size={18} color={C.purple} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setShowStateModal(false); setStateSearch(''); }}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderDeptModal() {
    return (
      <Modal visible={showDeptModal} animationType="slide" transparent onRequestClose={() => { setShowDeptModal(false); setDeptSearch(''); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🎓 Select Department</Text>
            <View style={styles.modalSearchRow}>
              <Ionicons name="search" size={16} color={C.dim} />
              <TextInput style={styles.modalSearchInput} placeholder="Search department..." placeholderTextColor="#94a3b8" value={deptSearch} onChangeText={setDeptSearch} />
              {deptSearch !== '' && <TouchableOpacity onPress={() => setDeptSearch('')}><Ionicons name="close-circle" size={16} color={C.dim} /></TouchableOpacity>}
            </View>
            <FlatList
              data={filteredDepts}
              keyExtractor={item => item.id}
              style={{ maxHeight: 420 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, activeDept === item.id && styles.modalItemActive]}
                  onPress={() => { setActiveDept(item.id); setActiveDeptLabel(item.label); setShowDeptModal(false); setDeptSearch(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deptItemIcon}>{item.icon}</Text>
                  <Text style={[styles.modalItemText, activeDept === item.id && styles.modalItemTextActive]}>{item.label}</Text>
                  {activeDept === item.id && <Ionicons name="checkmark-circle" size={18} color={C.purple} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setShowDeptModal(false); setDeptSearch(''); }}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Top Filter Bar (Dept + State) ── */}
      <View style={styles.topFilterBar}>
        <TouchableOpacity style={styles.topFilterBtn} onPress={() => setShowDeptModal(true)} activeOpacity={0.85}>
          <Ionicons name="school-outline" size={14} color={C.purple} />
          <Text style={styles.topFilterBtnText} numberOfLines={1}>{activeDeptLabel?.split('(')?.[0]?.trim() || 'Department'}</Text>
          <Ionicons name="chevron-down" size={13} color={C.purple} />
        </TouchableOpacity>
        <View style={styles.topFilterDivider} />
        <TouchableOpacity style={styles.topFilterBtn} onPress={() => setShowStateModal(true)} activeOpacity={0.85}>
          <Ionicons name="location-outline" size={14} color={C.purple} />
          <Text style={styles.topFilterBtnText} numberOfLines={1}>{stateLabel}</Text>
          <Ionicons name="chevron-down" size={13} color={C.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── AI Message ── */}
        <View style={styles.aiMessageCard}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiMessage}>{aiMessage}</Text>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — ALL COLLEGES IN STATE
        ══════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerLine} />
          <View style={[styles.sectionDividerBadge, { backgroundColor: C.teal }]}>
            <Text style={styles.sectionDividerText}>🏫 ALL COLLEGES</Text>
          </View>
          <View style={styles.sectionDividerLine} />
        </View>

        <TouchableOpacity
          style={styles.allCollegesBanner}
          onPress={() => navigation.navigate('AllColleges', {
            targetState: activeTargetState,
            department: activeDept,
            departmentLabel: activeDeptLabel,
            percentage: activePct,
          })}
          activeOpacity={0.85}
        >
          <View style={styles.allCollegesBannerContent}>
            <View style={styles.allCollegesTextContainer}>
              <Text style={styles.allCollegesBannerTitle}>🏛️ Explore All Colleges</Text>
              <Text style={styles.allCollegesBannerSub}>
                View all {totalAllCount} {activeDeptLabel?.split('(')?.[0]?.trim() || ''} colleges in {activeTargetState || 'All India'}
              </Text>
            </View>
            <View style={styles.allCollegesGoBtn}>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </View>
          </View>

          <View style={styles.allCollegesStatsBar}>
            <View style={styles.allCollegesStatItem}>
              <Text style={styles.allCollegesStatValue}>🏫 {govtAllCount}</Text>
              <Text style={styles.allCollegesStatLabel}>Government</Text>
            </View>
            <View style={styles.allCollegesStatDivider} />
            <View style={styles.allCollegesStatItem}>
              <Text style={styles.allCollegesStatValue}>🏢 {pvtAllCount}</Text>
              <Text style={styles.allCollegesStatLabel}>Private</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — TOP 25 RECOMMENDED
        ══════════════════════════════════════════════════════════════════ */}
        <View style={[styles.sectionDivider, { marginTop: 24 }]}>
          <View style={styles.sectionDividerLine} />
          <View style={[styles.sectionDividerBadge, { backgroundColor: C.purple }]}>
            <Text style={styles.sectionDividerText}>🏆 TOP 25 RECOMMENDED</Text>
          </View>
          <View style={styles.sectionDividerLine} />
        </View>

        {/* Percentage selector */}
        <View style={styles.pctSelectorCard}>
          <Text style={styles.pctSelectorTitle}>📊 Your Percentage — Adjust to see different colleges</Text>
          <View style={[styles.pctActiveBadge, { borderColor: pctColor(activePct) }]}>
            <Text style={[styles.pctActiveBadgeNum, { color: pctColor(activePct) }]}>{activePct}%</Text>
            <Text style={styles.pctActiveBadgeLabel}>
              {activePct >= 90 ? '🌟 Excellent – Top colleges!' :
               activePct >= 75 ? '👍 Good – Many options!' :
               activePct >= 60 ? '🙂 Average – Some options.' :
               '⚠️ Low – Limited options.'}
            </Text>
          </View>
          <View style={styles.pctStepRow}>
            {PCT_STEPS.map(step => {
              const active = activePct === step;
              const col = pctColor(step);
              return (
                <TouchableOpacity
                  key={step}
                  style={[styles.pctStepBtn, { borderColor: col + (active ? 'ff' : '55') }, active && { backgroundColor: col }]}
                  onPress={() => setActivePct(step)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pctStepText, { color: active ? '#fff' : col }]}>{step}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SectionHeader
          emoji="🎯"
          title={`Top ${top25.length} Colleges for ${activePct}%`}
          subtitle={`${activeDeptLabel?.split('(')?.[0]?.trim() || ''} · ${stateLabel}`}
          color={C.purple}
        />

        {top25.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyMiniIcon}>🔍</Text>
            <Text style={styles.emptyMiniText}>No colleges found for {activePct}% in this state/department.</Text>
            <Text style={styles.emptyMiniHint}>Try lowering your percentage or selecting &quot;All India&quot;.</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {top25.map((college, index) => (
              <CollegeCard
                key={`top25-${college.name}-${index}`}
                college={college}
                index={index}
                percentage={activePct}
                navigation={navigation}
                departmentLabel={activeDeptLabel}
                sectionPrefix="top25"
              />
            ))}
          </Animated.View>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={C.purple} />
          <Text style={styles.refreshBtnText}>Change Filters / Go Back</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderStateModal()}
      {renderDeptModal()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // Top filter bar
  topFilterBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  topFilterBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1.5,
    borderColor: C.purple + '55', paddingHorizontal: 10, paddingVertical: 8,
  },
  topFilterBtnText: { flex: 1, color: C.text, fontSize: 12, fontWeight: '700' },
  topFilterDivider: { width: 10 },

  // Main scroll
  container: { flex: 1, backgroundColor: C.bg },
  contentContainer: { paddingHorizontal: 14, paddingBottom: 40, paddingTop: 12 },

  // AI Message
  aiMessageCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.purple + '15', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: C.purple + '44',
  },
  aiEmoji: { fontSize: 24 },
  aiMessage: { color: C.sub, fontSize: 13, flex: 1, lineHeight: 20 },

  // Section dividers
  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  sectionDividerLine: { flex: 1, height: 1.5, backgroundColor: C.border },
  sectionDividerBadge: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  sectionDividerText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderLeftWidth: 4, paddingLeft: 12,
    marginBottom: 14,
  },
  sectionHeaderEmoji: { fontSize: 22 },
  sectionHeaderTitle: { fontSize: 17, fontWeight: '900', marginBottom: 2 },
  sectionHeaderSub: { color: C.dim, fontSize: 12, fontWeight: '500' },

  // Percentage selector
  pctSelectorCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: C.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  pctSelectorTitle: {
    color: C.text, fontSize: 12, fontWeight: '800',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  pctActiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14, backgroundColor: '#f8faff',
  },
  pctActiveBadgeNum: { fontSize: 28, fontWeight: '900' },
  pctActiveBadgeLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: C.dim, lineHeight: 18 },
  pctStepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pctStepBtn: {
    borderWidth: 2, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8,
    backgroundColor: '#f8faff', minWidth: 54, alignItems: 'center',
  },
  pctStepText: { fontSize: 13, fontWeight: '800' },

  // Empty mini
  emptyMini: {
    alignItems: 'center', padding: 24,
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 14,
  },
  emptyMiniIcon: { fontSize: 36, marginBottom: 10 },
  emptyMiniText: { color: C.sub, fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyMiniHint: { color: C.dim, fontSize: 12, textAlign: 'center' },

  // All colleges new banner
  allCollegesBanner: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.teal + '44',
    padding: 16,
    marginBottom: 16,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  allCollegesBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  allCollegesTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  allCollegesBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.teal,
    marginBottom: 4,
  },
  allCollegesBannerSub: {
    fontSize: 12,
    color: C.dim,
    lineHeight: 16,
  },
  allCollegesGoBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allCollegesStatsBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  allCollegesStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  allCollegesStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  allCollegesStatLabel: {
    fontSize: 10,
    color: C.dim,
    marginTop: 2,
  },
  allCollegesStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: C.border,
    alignSelf: 'center',
  },

  // College Card
  collegeCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, elevation: 4, position: 'relative',
  },
  rankBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#0f172a', borderRadius: 10,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: C.purple,
  },
  rankText: { color: C.purple, fontWeight: '800', fontSize: 12 },
  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 8 },
  collegeHeaderInfo: { flex: 1, paddingRight: 40 },
  collegeName: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  collegeLocation: { color: C.dim, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: 12,
    padding: 10, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: C.text, fontSize: 11, fontWeight: '700', marginBottom: 2 },
  statLabel: { color: C.dim, fontSize: 9 },
  statDivider: { width: 1, height: 30, backgroundColor: C.border },
  highlightBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.gold + '15', borderRadius: 8,
    padding: 10, marginBottom: 10, borderWidth: 1, borderColor: C.gold + '44',
  },
  highlightText: { color: C.gold, fontSize: 12, flex: 1 },
  companiesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companiesLabel: { color: C.dim, fontSize: 12 },
  companiesText: { color: C.sub, fontSize: 12, fontWeight: '600', flex: 1 },
  viewDetailRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 6,
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginTop: 4,
  },
  viewDetailText: { color: C.purple, fontSize: 13, fontWeight: '700' },
  saveCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: C.purple, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.purple + '15',
  },
  saveCardBtnActive: { backgroundColor: C.purple, borderColor: C.purple },
  saveCardBtnText: { color: C.purple, fontSize: 12, fontWeight: '700' },

  // Load more / End
  loadMoreContainer: { marginBottom: 12 },
  loadMoreInfo: { color: C.dim, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  loadMoreBtnRow: { flexDirection: 'row', gap: 8 },
  loadMoreBtn: { flex: 1, backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  loadMoreText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  loadAllBtn: { flex: 1, backgroundColor: C.purple, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  loadAllText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  endBanner: {
    backgroundColor: C.green + '15', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.green + '44', alignItems: 'center',
  },
  endBannerText: { color: C.green, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.card, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: C.border, marginTop: 4, marginBottom: 20,
  },
  refreshBtnText: { color: C.purple, fontSize: 14, fontWeight: '700' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingCard: {
    backgroundColor: C.card, borderRadius: 24, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: C.purple + '44', width: '100%',
  },
  loadingTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8, textAlign: 'center' },
  loadingSubtitle: { color: C.dim, fontSize: 14, textAlign: 'center', marginBottom: 4 },
  loadingState: { color: C.purple, fontSize: 13, fontWeight: '600', marginBottom: 16 },
  loadingSteps: { gap: 6, width: '100%' },
  loadingStep: { color: C.green, fontSize: 12 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 16, maxHeight: '88%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  modalSearchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f1f5f9', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  modalSearchInput: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 8,
  },
  modalItemActive: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 10 },
  modalItemText: { flex: 1, color: C.sub, fontSize: 14 },
  modalItemTextActive: { color: C.purple, fontWeight: '700' },
  deptItemIcon: { fontSize: 20 },
  modalCloseBtn: {
    backgroundColor: C.navy, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  modalCloseBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});

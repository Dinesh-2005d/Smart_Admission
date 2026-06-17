import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, SafeAreaView, ActivityIndicator,
  Modal, FlatList, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCollegesForStudent } from '../constants/collegeDatabase';
import { getAIMessage, predictAdmissionChance } from '../constants/offlineAI';
import { useSavedColleges } from '../context/SavedCollegesContext';
import { DEPARTMENTS, STATES } from '../constants/indiaData';

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#ffffff', card: '#f8f9fa', border: '#e2e8f0',
  purple: '#2563eb', gold: '#eab308', green: '#16a34a',
  blue: '#0284c7', pink: '#dc2626', text: '#0f172a',
  sub: '#334155', dim: '#475569', navy: '#0f172a',
};

const PAGE_SIZE = 10;

// State list for modal (same structure as MarksEntryScreen)
const STATE_OPTIONS = [
  { key: 'All India', label: '🇮🇳 All India' },
  ...STATES.map(s => ({ key: s, label: `📍 ${s}` })),
];

export default function CollegeListScreen({ navigation, route }) {
  const {
    homeState,
    targetState: initialTargetState,
    board,
    department: initialDept,
    departmentLabel: initialDeptLabel,
    percentage,
    entranceScore,
    state: legacyState,
  } = route.params;

  const effectiveHomeState = homeState || legacyState || '';

  const { issaved, toggleSave } = useSavedColleges();

  // ── Active filters (can be changed in-screen) ──────────────────────────────
  const [activeDept, setActiveDept]         = useState(initialDept);
  const [activeDeptLabel, setActiveDeptLabel] = useState(initialDeptLabel);
  const [activeTargetState, setActiveTargetState] = useState(
    initialTargetState !== undefined ? initialTargetState : (legacyState || null)
  );

  // ── UI state ───────────────────────────────────────────────────────────────
  const [colleges, setColleges]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [aiMessage, setAiMessage]   = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Government' | 'Private'
  const [needHostel, setNeedHostel] = useState(false);
  const [page, setPage]             = useState(1);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showStateModal, setShowStateModal]   = useState(false);
  const [showDeptModal, setShowDeptModal]     = useState(false);
  const [stateSearch, setStateSearch]         = useState('');
  const [deptSearch, setDeptSearch]           = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  // Re-load whenever any filter changes
  useEffect(() => {
    loadColleges();
  }, [activeDept, activeTargetState, typeFilter, needHostel]);

  const loadColleges = () => {
    setLoading(true);
    fadeAnim.setValue(0);
    setTimeout(() => {
      let results = getCollegesForStudent(
        activeTargetState,
        activeDept,
        percentage,
        entranceScore,
        effectiveHomeState,
      );

      if (typeFilter === 'Government') {
        results = results.filter(c => c.type === 'Government');
      } else if (typeFilter === 'Private') {
        results = results.filter(c => c.type !== 'Government');
      }

      if (needHostel) {
        results = results.filter(c => c.hostelAvailable === true);
      }

      setColleges(results);
      setAiMessage(getAIMessage(results, percentage, activeDeptLabel, activeTargetState || 'All India'));
      setPage(1);
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 600);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalCount  = colleges.length;
  const govtCount   = colleges.filter(c => c.type === 'Government').length;
  const pvtCount    = colleges.filter(c => c.type !== 'Government').length;
  const hostelCount = colleges.filter(c => c.hostelAvailable === true).length;
  const homeCount   = colleges.filter(c =>
    c.state && effectiveHomeState &&
    c.state.toLowerCase() === effectiveHomeState.toLowerCase()
  ).length;

  // ── Label helpers ──────────────────────────────────────────────────────────
  const stateLabel = !activeTargetState || activeTargetState === 'All India'
    ? '🇮🇳 All India'
    : `📍 ${activeTargetState}`;

  const getTypeColor = (type) => {
    if (type === 'Government') return C.green;
    if (type === 'Private')    return C.gold;
    return C.purple;
  };

  const placementColor = (rate) => {
    if (rate >= 90) return C.green;
    if (rate >= 75) return C.gold;
    return '#ea580c';
  };

  // Filtered options for modals
  const filteredStates = STATE_OPTIONS.filter(s =>
    s.label.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const filteredDepts = DEPARTMENTS.filter(d =>
    d.label.toLowerCase().includes(deptSearch.toLowerCase())
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={C.purple} />
            <Text style={styles.loadingTitle}>🤖 AI Analyzing Your Profile...</Text>
            <Text style={styles.loadingSubtitle}>{percentage}% · {activeDeptLabel?.split('(')[0]}</Text>
            <Text style={styles.loadingState}>{stateLabel}</Text>
            <View style={styles.loadingSteps}>
              {['Checking eligibility...', 'Matching colleges...', 'Ranking by fit...', 'Preparing results...'].map((s, i) => (
                <Text key={i} style={styles.loadingStep}>✓ {s}</Text>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── No Results ─────────────────────────────────────────────────────────────
  if (!loading && colleges.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Filter Bar even on empty state */}
        <View style={styles.topFilterBar}>
          <TouchableOpacity style={styles.topFilterBtn} onPress={() => setShowDeptModal(true)}>
            <Ionicons name="school-outline" size={14} color={C.purple} />
            <Text style={styles.topFilterBtnText} numberOfLines={1}>
              {activeDeptLabel?.split('(')[0].trim() || 'Department'}
            </Text>
            <Ionicons name="chevron-down" size={13} color={C.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topFilterBtn} onPress={() => setShowStateModal(true)}>
            <Ionicons name="location-outline" size={14} color={C.purple} />
            <Text style={styles.topFilterBtnText} numberOfLines={1}>{stateLabel}</Text>
            <Ionicons name="chevron-down" size={13} color={C.purple} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏫</Text>
          <Text style={styles.emptyTitle}>No Colleges Found</Text>
          <Text style={styles.emptyDesc}>
            No <Text style={{ fontWeight: '800', color: C.purple }}>{activeDeptLabel?.split('(')[0].trim()}</Text> colleges
            {typeFilter !== 'All' ? ` (${typeFilter})` : ''}{needHostel ? ' with Hostel' : ''} found in{'\n'}
            <Text style={{ fontWeight: '800', color: C.purple }}>{activeTargetState || 'All India'}</Text>
          </Text>
          <Text style={styles.emptyHint}>
            💡 Try changing the state, department, or removing type/hostel filters.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle" size={20} color="#fff" />
            <Text style={styles.emptyBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modals */}
        {renderStateModal()}
        {renderDeptModal()}
      </SafeAreaView>
    );
  }

  const displayedColleges = colleges.slice(0, page * PAGE_SIZE);
  const hasMore = colleges.length > page * PAGE_SIZE;

  // ─── Render helpers ───────────────────────────────────────────────────────
  function renderStateModal() {
    return (
      <Modal visible={showStateModal} animationType="slide" transparent onRequestClose={() => { setShowStateModal(false); setStateSearch(''); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🗺️ Select State</Text>
            <View style={styles.modalSearchRow}>
              <Ionicons name="search" size={16} color={C.dim} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search state..."
                placeholderTextColor="#94a3b8"
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              {stateSearch !== '' && (
                <TouchableOpacity onPress={() => setStateSearch('')}>
                  <Ionicons name="close-circle" size={16} color={C.dim} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredStates}
              keyExtractor={item => item.key}
              style={{ maxHeight: 400 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, (activeTargetState || 'All India') === item.key && styles.modalItemActive]}
                  onPress={() => {
                    const chosen = item.key === 'All India' ? null : item.key;
                    setActiveTargetState(chosen);
                    setShowStateModal(false);
                    setStateSearch('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalItemText, (activeTargetState || 'All India') === item.key && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {(activeTargetState || 'All India') === item.key && (
                    <Ionicons name="checkmark-circle" size={18} color={C.purple} />
                  )}
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
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search department..."
                placeholderTextColor="#94a3b8"
                value={deptSearch}
                onChangeText={setDeptSearch}
              />
              {deptSearch !== '' && (
                <TouchableOpacity onPress={() => setDeptSearch('')}>
                  <Ionicons name="close-circle" size={16} color={C.dim} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredDepts}
              keyExtractor={item => item.id}
              style={{ maxHeight: 420 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, activeDept === item.id && styles.modalItemActive]}
                  onPress={() => {
                    setActiveDept(item.id);
                    setActiveDeptLabel(item.label);
                    setShowDeptModal(false);
                    setDeptSearch('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deptItemIcon}>{item.icon}</Text>
                  <Text style={[styles.modalItemText, activeDept === item.id && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {activeDept === item.id && (
                    <Ionicons name="checkmark-circle" size={18} color={C.purple} />
                  )}
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Top Filter Bar (Dept + State) ── */}
      <View style={styles.topFilterBar}>
        <TouchableOpacity style={styles.topFilterBtn} onPress={() => setShowDeptModal(true)} activeOpacity={0.85}>
          <Ionicons name="school-outline" size={14} color={C.purple} />
          <Text style={styles.topFilterBtnText} numberOfLines={1}>
            {activeDeptLabel?.split('(')[0].trim() || 'Department'}
          </Text>
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
      >
        {/* AI Message */}
        <View style={styles.aiMessageCard}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiMessage}>{aiMessage}</Text>
        </View>

        {/* Summary header */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>🎯 Top Colleges for You</Text>
          <View style={styles.summaryChips}>
            <View style={styles.chip}><Text style={styles.chipText}>{stateLabel}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📊 {percentage}%</Text></View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🎓 {activeDeptLabel?.split('(')[0].trim()}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats Banner ── */}
        <View style={styles.statsBanner}>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerNum}>{totalCount}</Text>
            <Text style={styles.statsBannerLabel}>Total</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: C.green }]}>{govtCount}</Text>
            <Text style={styles.statsBannerLabel}>Govt</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: C.gold }]}>{pvtCount}</Text>
            <Text style={styles.statsBannerLabel}>Private</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: C.blue }]}>{hostelCount}</Text>
            <Text style={styles.statsBannerLabel}>Hostel ✅</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: C.purple }]}>{homeCount}</Text>
            <Text style={styles.statsBannerLabel}>Your State</Text>
          </View>
        </View>

        {/* ── Type + Hostel Filter Chips ── */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>FILTER BY TYPE</Text>
          <View style={styles.filterChipRow}>
            {[
              { key: 'All',        label: '🏛️ All',     color: C.purple },
              { key: 'Government', label: '🏫 Govt',    color: C.green  },
              { key: 'Private',    label: '🏢 Private', color: C.gold   },
            ].map(f => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  typeFilter === f.key && { borderColor: f.color, backgroundColor: f.color + '18' },
                ]}
                onPress={() => setTypeFilter(f.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  typeFilter === f.key && { color: f.color, fontWeight: '700' },
                ]}>
                  {f.label}
                  {f.key === 'Government' && typeFilter === 'Government' ? ` (${govtCount})` : ''}
                  {f.key === 'Private' && typeFilter === 'Private' ? ` (${pvtCount})` : ''}
                  {f.key === 'All' && typeFilter === 'All' ? ` (${totalCount})` : ''}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.filterChip,
                needHostel && { borderColor: C.green, backgroundColor: C.green + '18' },
              ]}
              onPress={() => setNeedHostel(!needHostel)}
            >
              <Text style={[styles.filterChipText, needHostel && { color: C.green, fontWeight: '700' }]}>
                🏠 Hostel{needHostel ? ` (${hostelCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.foundText}>
          ✅ Showing {displayedColleges.length} of {totalCount} colleges
          {typeFilter !== 'All' ? ` · ${typeFilter} only` : ''}
          {needHostel ? ' · With Hostel' : ''}
        </Text>

        {/* ── College Cards ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {displayedColleges.map((college, index) => {
            const admission = predictAdmissionChance(college, percentage, entranceScore);
            const isHomeState = effectiveHomeState &&
              college.state?.toLowerCase() === effectiveHomeState.toLowerCase();

            return (
              <TouchableOpacity
                key={`${college.name}-${index}`}
                style={[
                  styles.collegeCard,
                  { borderColor: index === 0 ? C.purple + '88' : C.border },
                ]}
                onPress={() => navigation.navigate('Details', { college, departmentLabel: activeDeptLabel })}
                activeOpacity={0.85}
              >
                {index === 0 && (
                  <View style={styles.bestMatchBadge}>
                    <Text style={styles.bestMatchText}>⭐ Best Match</Text>
                  </View>
                )}

                {isHomeState && index !== 0 && (
                  <View style={styles.pdsBadge}>
                    <Text style={styles.pdsBadgeText}>🏠 Your State</Text>
                  </View>
                )}

                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>

                <View style={styles.collegeHeader}>
                  <View style={[styles.collegeIconCircle, { borderColor: getTypeColor(college.type) + '88' }]}>
                    <Text style={styles.collegeIconText}>🏛️</Text>
                  </View>
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
                    <Text style={[styles.statValue, { color: placementColor(college.placementRate) }]}>
                      {college.placementRate}%
                    </Text>
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
                    <Text style={[styles.statValue, { color: C.sub, fontSize: 10 }]}>
                      {college.type === 'Government' ? '🏛️ Govt' : '🏢 Pvt'}
                    </Text>
                    <Text style={styles.statLabel}>Type</Text>
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
                    style={[styles.saveCardBtn, issaved(college) && styles.saveCardBtnActive]}
                    onPress={() => toggleSave(college)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={issaved(college) ? 'bookmark' : 'bookmark-outline'}
                      size={14}
                      color={issaved(college) ? '#ffffff' : C.purple}
                    />
                    <Text style={[styles.saveCardBtnText, issaved(college) && { color: '#ffffff' }]}>
                      {issaved(college) ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ── Load More ── */}
        {hasMore && (
          <View style={styles.loadMoreContainer}>
            <Text style={styles.loadMoreInfo}>
              Showing {displayedColleges.length} of {totalCount} colleges
            </Text>
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(p => p + 1)}>
              <Text style={styles.loadMoreText}>
                Show Next {Math.min(PAGE_SIZE, totalCount - displayedColleges.length)} Colleges ⬇️
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!hasMore && totalCount > 0 && (
          <View style={styles.endBanner}>
            <Text style={styles.endBannerText}>
              🎉 You've seen all {totalCount} colleges{'\n'}
              {govtCount} Government · {pvtCount} Private · {hostelCount} with Hostel · {homeCount} from {effectiveHomeState || 'your state'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={C.purple} />
          <Text style={styles.refreshBtnText}>Change Filters / Go Back</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modals ── */}
      {renderStateModal()}
      {renderDeptModal()}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // Top filter bar (Dept + State)
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

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  emptyDesc: { color: C.sub, fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 16 },
  emptyHint: {
    color: C.dim, fontSize: 13, textAlign: 'center', lineHeight: 22,
    marginBottom: 28, backgroundColor: C.card, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: C.border,
  },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.purple, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Container
  container: { flex: 1, backgroundColor: C.bg },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },

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

  // AI Message
  aiMessageCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.purple + '15', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: C.purple + '44',
  },
  aiEmoji: { fontSize: 24 },
  aiMessage: { color: C.sub, fontSize: 13, flex: 1, lineHeight: 20 },

  // Summary box
  summaryBox: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  summaryTitle: { color: C.text, fontSize: 17, fontWeight: '700', marginBottom: 10 },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: C.purple + '22', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: C.purple + '44',
  },
  chipText: { color: C.purple, fontSize: 12, fontWeight: '600' },

  // Stats Banner
  statsBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 16,
    padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b',
  },
  statsBannerItem: { flex: 1, alignItems: 'center' },
  statsBannerNum: { color: '#ffffff', fontSize: 19, fontWeight: '900', lineHeight: 24 },
  statsBannerLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsBannerDivider: { width: 1, height: 34, backgroundColor: '#334155' },

  // Filter section
  filterSection: { marginBottom: 12 },
  filterSectionLabel: {
    color: C.dim, fontSize: 10, fontWeight: '700',
    letterSpacing: 1, marginBottom: 8,
  },
  filterChipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card,
  },
  filterChipText: { color: C.sub, fontSize: 12, fontWeight: '600' },

  // Found text
  foundText: { color: C.dim, fontSize: 12, marginBottom: 14, textAlign: 'center' },

  // College Card
  collegeCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 16,
    marginBottom: 16, borderWidth: 1, elevation: 6, position: 'relative',
  },
  bestMatchBadge: {
    position: 'absolute', top: -10, left: 16,
    backgroundColor: C.purple, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  bestMatchText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  pdsBadge: {
    position: 'absolute', top: -10, left: 16,
    backgroundColor: C.green, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  pdsBadgeText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  rankBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#0f172a', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: C.purple,
  },
  rankText: { color: C.purple, fontWeight: '800', fontSize: 13 },
  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 8 },
  collegeIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  collegeIconText: { fontSize: 24 },
  collegeHeaderInfo: { flex: 1, paddingRight: 40 },
  collegeName: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  collegeLocation: { color: C.dim, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
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
  loadMoreBtn: { backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  loadMoreText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  endBanner: {
    backgroundColor: C.green + '15', borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: C.green + '44', alignItems: 'center',
  },
  endBannerText: { color: C.green, fontSize: 14, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.card, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: C.border, marginTop: 4, marginBottom: 20,
  },
  refreshBtnText: { color: C.purple, fontSize: 14, fontWeight: '700' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 16, maxHeight: '88%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
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

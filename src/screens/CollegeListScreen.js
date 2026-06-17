import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCollegesForStudent } from '../constants/collegeDatabase';
import { getAIMessage, predictAdmissionChance } from '../constants/offlineAI';
import { useSavedColleges } from '../context/SavedCollegesContext';

const COLORS = {
  bg: '#ffffff', card: '#f8f9fa', border: '#e2e8f0',
  purple: '#2563eb', gold: '#eab308', green: '#16a34a',
  blue: '#0284c7', pink: '#dc2626', text: '#0f172a',
  sub: '#334155', dim: '#475569',
};

const PAGE_SIZE = 10;

export default function CollegeListScreen({ navigation, route }) {
  const {
    homeState,    // student's actual home state (from Step 1)
    targetState,  // null = All India, string = specific state chosen in modal
    board, department, departmentLabel, percentage, entranceScore,
    // backward compat: older nav may pass 'state' directly
    state: legacyState,
  } = route.params;

  const effectiveHomeState  = homeState  || legacyState || '';
  const effectiveTargetState = targetState !== undefined ? targetState : (legacyState || null);

  const { issaved, toggleSave } = useSavedColleges();
  const [colleges, setColleges]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [typeFilter, setTypeFilter]   = useState('All'); // 'All' | 'Government' | 'Private'
  const [needHostel, setNeedHostel]   = useState(false);
  const [page, setPage]           = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => { loadColleges(); }, [typeFilter, needHostel]);

  const loadColleges = () => {
    setLoading(true);
    setTimeout(() => {
      let results = getCollegesForStudent(
        effectiveTargetState,
        department,
        percentage,
        entranceScore,
        effectiveHomeState,
      );

      // Type filter: Government / Private
      if (typeFilter === 'Government') {
        const govtOnly = results.filter(c => c.type === 'Government');
        if (govtOnly.length > 0) results = govtOnly;
      } else if (typeFilter === 'Private') {
        const pvtOnly = results.filter(c => c.type !== 'Government');
        if (pvtOnly.length > 0) results = pvtOnly;
      }

      // Hostel filter
      if (needHostel) {
        const hostelOnly = results.filter(c => c.hostelAvailable === true);
        if (hostelOnly.length > 0) results = hostelOnly;
      }

      setColleges(results);
      setAiMessage(getAIMessage(results, percentage, departmentLabel, effectiveTargetState || 'All India'));
      setPage(1);
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 800);
  };

  /* ──────────────── Derived stats ──────────────── */
  const totalCount   = colleges.length;
  const govtCount    = colleges.filter(c => c.type === 'Government').length;
  const hostelCount  = colleges.filter(c => c.hostelAvailable === true).length;
  const pdsCount     = colleges.filter(c =>
    c.state && effectiveHomeState &&
    c.state.toLowerCase() === effectiveHomeState.toLowerCase()
  ).length;

  /* ──────────────── Helpers ──────────────── */
  const getTypeColor = (type) => {
    if (type === 'Government') return COLORS.green;
    if (type === 'Private')    return COLORS.gold;
    return COLORS.purple;
  };

  const placementColor = (rate) => {
    if (rate >= 90) return COLORS.green;
    if (rate >= 75) return COLORS.gold;
    return '#ea580c';
  };

  const targetLabel = !effectiveTargetState || effectiveTargetState === 'All India'
    ? '🇮🇳 All India'
    : `📍 ${effectiveTargetState}`;

  /* ──────────────── Loading screen ──────────────── */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingTitle}>🤖 AI Analyzing Your Profile...</Text>
            <Text style={styles.loadingSubtitle}>{percentage}% in {departmentLabel?.split('(')[0]}</Text>
            <Text style={styles.loadingState}>{targetLabel}</Text>
            <View style={styles.loadingSteps}>
              {["Checking eligibility...", "Matching colleges...", "Ranking by fit...", "Preparing results..."].map((step, i) => (
                <Text key={i} style={styles.loadingStep}>✓ {step}</Text>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const displayedColleges = colleges.slice(0, page * PAGE_SIZE);
  const hasMore = colleges.length > page * PAGE_SIZE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* AI Message */}
        <View style={styles.aiMessageCard}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiMessage}>{aiMessage}</Text>
        </View>

        {/* Summary header */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>🎯 Top Colleges for You</Text>
          <View style={styles.summaryChips}>
            <View style={styles.chip}><Text style={styles.chipText}>{targetLabel}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📊 {percentage}%</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🎓 {departmentLabel?.split('(')[0].trim()}</Text></View>
          </View>
        </View>

        {/* ─── Stats Banner ─────────────────────────────────────── */}
        <View style={styles.statsBanner}>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerNum}>{totalCount}</Text>
            <Text style={styles.statsBannerLabel}>Total</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: COLORS.green }]}>{govtCount}</Text>
            <Text style={styles.statsBannerLabel}>Govt</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: COLORS.blue }]}>{hostelCount}</Text>
            <Text style={styles.statsBannerLabel}>Hostel ✅</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={[styles.statsBannerNum, { color: COLORS.purple }]}>{pdsCount}</Text>
            <Text style={styles.statsBannerLabel}>Your State</Text>
          </View>
        </View>
        {/* ────────────────────────────────────────────────────────── */}

        {/* Filters - Quick Chip Row */}
        <View style={styles.filterChipRow}>
          {['All', 'Government', 'Private'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, typeFilter === f && styles.filterChipActive]}
              onPress={() => setTypeFilter(f)}
            >
              <Text style={[styles.filterChipText, typeFilter === f && styles.filterChipTextActive]}>
                {f === 'All' ? '🏛️ All' : f === 'Government' ? '🏫 Govt' : '🏢 Private'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.filterChip, needHostel && styles.filterChipHostelActive]}
            onPress={() => setNeedHostel(!needHostel)}
          >
            <Text style={[styles.filterChipText, needHostel && styles.filterChipTextHostel]}>
              🏠 Hostel {needHostel ? '✅' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.foundText}>
          ✅ Showing {displayedColleges.length} of {totalCount} colleges · {govtCount} Govt · {hostelCount} with Hostel
        </Text>

        {/* College Cards */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {displayedColleges.map((college, index) => {
            const admission = predictAdmissionChance(college, percentage, entranceScore);
            const isHomeState = effectiveHomeState &&
              college.state?.toLowerCase() === effectiveHomeState.toLowerCase();
            return (
              <TouchableOpacity
                key={`${college.name}-${index}`}
                style={[styles.collegeCard, { borderColor: index === 0 ? COLORS.purple + '88' : COLORS.border }]}
                onPress={() => navigation.navigate('Details', { college, departmentLabel })}
                activeOpacity={0.85}
              >
                {index === 0 && (
                  <View style={styles.bestMatchBadge}>
                    <Text style={styles.bestMatchText}>⭐ Best Match</Text>
                  </View>
                )}

                {/* PDS / Home-state badge */}
                {isHomeState && index !== 0 && (
                  <View style={styles.pdsBadge}>
                    <Text style={styles.pdsBadgeText}>🏠 Your State</Text>
                  </View>
                )}

                <View style={styles.rankBadge}><Text style={styles.rankText}>#{index + 1}</Text></View>

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
                    <View style={[styles.tag, { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '15' }]}>
                      <Text style={[styles.tagText, { color: COLORS.gold }]}>NAAC {college.naacGrade}</Text>
                    </View>
                  )}
                  <View style={[styles.tag, { borderColor: admission.color, backgroundColor: admission.color + '15' }]}>
                    <Text style={[styles.tagText, { color: admission.color }]}>{admission.emoji} {admission.chance}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.gold }]}>⭐ {college.rating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: placementColor(college.placementRate) }]}>{college.placementRate}%</Text>
                    <Text style={styles.statLabel}>Placement</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: college.hostelAvailable ? COLORS.green : COLORS.pink }]}>
                      {college.hostelAvailable ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.statLabel}>Hostel</Text>
                  </View>
                </View>

                {college.highlight ? (
                  <View style={styles.highlightBox}>
                    <Ionicons name="star" size={13} color={COLORS.gold} />
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
                      color={issaved(college) ? '#ffffff' : COLORS.purple}
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

        {/* Load More */}
        {displayedColleges.length < totalCount && (
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
              {govtCount} Government  ·  {hostelCount} with Hostel  ·  {pdsCount} from {effectiveHomeState || 'your state'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.purple} />
          <Text style={styles.refreshBtnText}>Change Filters / State</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.purple + '44', width: '100%' },
  loadingTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8, textAlign: 'center' },
  loadingSubtitle: { color: COLORS.dim, fontSize: 14, textAlign: 'center', marginBottom: 4 },
  loadingState: { color: COLORS.purple, fontSize: 13, fontWeight: '600', marginBottom: 16 },
  loadingSteps: { gap: 6, width: '100%' },
  loadingStep: { color: COLORS.green, fontSize: 12 },
  aiMessageCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.purple + '15', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.purple + '44' },
  aiEmoji: { fontSize: 24 },
  aiMessage: { color: COLORS.sub, fontSize: 13, flex: 1, lineHeight: 20 },
  summaryBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 10 },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.purple + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.purple + '44' },
  chipText: { color: COLORS.purple, fontSize: 12, fontWeight: '600' },
  // Stats Banner
  statsBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  statsBannerItem: { flex: 1, alignItems: 'center' },
  statsBannerNum: { color: '#ffffff', fontSize: 22, fontWeight: '900', lineHeight: 26 },
  statsBannerLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '600', marginTop: 2 },
  statsBannerDivider: { width: 1, height: 36, backgroundColor: '#334155' },
  // Filter Chips
  filterChipRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card },
  filterChipActive: { borderColor: COLORS.purple, backgroundColor: COLORS.purple + '18' },
  filterChipHostelActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '18' },
  filterChipText: { color: COLORS.sub, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.purple, fontWeight: '700' },
  filterChipTextHostel: { color: COLORS.green, fontWeight: '700' },
  foundText: { color: COLORS.dim, fontSize: 12, marginBottom: 14, textAlign: 'center' },
  // College Card
  collegeCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 6, position: 'relative' },
  bestMatchBadge: { position: 'absolute', top: -10, left: 16, backgroundColor: COLORS.purple, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  bestMatchText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  pdsBadge: { position: 'absolute', top: -10, left: 16, backgroundColor: COLORS.green, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  pdsBadgeText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  rankBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.purple },
  rankText: { color: COLORS.purple, fontWeight: '800', fontSize: 13 },
  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 8 },
  collegeIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  collegeIconText: { fontSize: 24 },
  collegeHeaderInfo: { flex: 1, paddingRight: 40 },
  collegeName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  collegeLocation: { color: COLORS.dim, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, padding: 10, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.text, fontSize: 11, fontWeight: '700', marginBottom: 2 },
  statLabel: { color: COLORS.dim, fontSize: 9 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  highlightBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.gold + '15', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gold + '44' },
  highlightText: { color: COLORS.gold, fontSize: 12, flex: 1 },
  companiesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companiesLabel: { color: COLORS.dim, fontSize: 12 },
  companiesText: { color: COLORS.sub, fontSize: 12, fontWeight: '600', flex: 1 },
  viewDetailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 },
  viewDetailText: { color: COLORS.purple, fontSize: 13, fontWeight: '700' },
  saveCardBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: COLORS.purple, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.purple + '15' },
  saveCardBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  saveCardBtnText: { color: COLORS.purple, fontSize: 12, fontWeight: '700' },
  // Load more / End
  loadMoreContainer: { marginBottom: 12 },
  loadMoreInfo: { color: COLORS.dim, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  loadMoreBtn: { backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  loadMoreText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  endBanner: { backgroundColor: COLORS.green + '15', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.green + '44', alignItems: 'center' },
  endBannerText: { color: COLORS.green, fontSize: 14, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 4, marginBottom: 20 },
  refreshBtnText: { color: COLORS.purple, fontSize: 14, fontWeight: '700' },
});

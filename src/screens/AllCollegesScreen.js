import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllCollegesInState } from '../constants/collegeDatabase';
import { predictAdmissionChance } from '../constants/offlineAI';
import { useSavedColleges } from '../context/SavedCollegesContext';
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

const getTypeColor  = (type) => type === 'Government' ? C.green : C.gold;
const placementColor = (rate) => rate >= 90 ? C.green : rate >= 75 ? C.gold : '#ea580c';

// ─── College Card ────────────────────────────────────────────────────
function CollegeCard({ college, index, percentage, navigation, departmentLabel }) {
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AllCollegesScreen({ navigation, route }) {
  const { targetState, department, departmentLabel, percentage } = route.params || {};

  const [allSearch, setAllSearch]         = useState('');
  const [allTypeFilter, setAllTypeFilter] = useState('All');
  const [allPage, setAllPage]             = useState(1);
  const [allColleges, setAllColleges]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ALL_PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    fadeAnim.setValue(0);
    const timer = setTimeout(() => {
      const stateColleges = getAllCollegesInState(targetState);
      setAllColleges(stateColleges);
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 300);
    return () => clearTimeout(timer);
  }, [targetState, fadeAnim]);

  // Filter logic
  const filteredAll = allColleges.filter(c => {
    const matchDept = c.department === department;
    const q = allSearch.toLowerCase();
    const matchSearch = q === '' || (
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q)
    );
    const matchType = allTypeFilter === 'All' || c.type === allTypeFilter ||
      (allTypeFilter === 'Private' && c.type !== 'Government');
    return matchDept && matchSearch && matchType;
  });

  const allDeptColleges = allColleges.filter(c => c.department === department);
  const govtAllCount    = allDeptColleges.filter(c => c.type === 'Government').length;
  const pvtAllCount     = allDeptColleges.filter(c => c.type !== 'Government').length;
  const totalAllCount   = allDeptColleges.length;

  const displayedAll = filteredAll.slice(0, allPage * ALL_PAGE_SIZE);
  const hasMoreAll   = filteredAll.length > displayedAll.length;

  const boxes = [
    {
      key: 'Private',
      icon: '🏢',
      label: 'Private',
      subLabel: 'Self-funded',
      color: C.gold,
      count: pvtAllCount,
    },
    {
      key: 'All',
      icon: '🏛️',
      label: 'Both',
      subLabel: 'Govt + Private',
      color: C.teal,
      count: totalAllCount,
    },
    {
      key: 'Government',
      icon: '🏫',
      label: 'Government',
      subLabel: 'State-funded',
      color: C.green,
      count: govtAllCount,
    },
  ];

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.teal} />
          <Text style={styles.loadingText}>Fetching database colleges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={C.teal} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>All {departmentLabel?.split('(')?.[0]?.trim() || ''} Colleges</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>📍 {targetState || 'All India'} · {percentage}% Eligibility</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selector Boxes */}
        <View style={styles.typeBoxRow}>
          {boxes.map(box => {
            const active = allTypeFilter === box.key;
            return (
              <TouchableOpacity
                key={box.key}
                style={[
                  styles.typeBox,
                  {
                    borderColor: active ? box.color : C.border,
                    backgroundColor: active ? box.color + '18' : C.card,
                    shadowColor: active ? box.color : 'transparent',
                    elevation: active ? 6 : 1,
                  },
                ]}
                onPress={() => { setAllTypeFilter(box.key); setAllPage(1); }}
                activeOpacity={0.8}
              >
                {active && (
                  <View style={[styles.typeBoxActiveDot, { backgroundColor: box.color }]} />
                )}
                <Text style={styles.typeBoxIcon}>{box.icon}</Text>
                <Text style={[styles.typeBoxLabel, active && { color: box.color }]}>
                  {box.label}
                </Text>
                <Text style={styles.typeBoxSub}>{box.subLabel}</Text>
                <View style={[styles.typeBoxCountBadge, { backgroundColor: active ? box.color : '#e2e8f0' }]}>
                  <Text style={[styles.typeBoxCountText, { color: active ? '#fff' : C.sub }]}>
                    {box.count}
                  </Text>
                </View>
                {active && (
                  <View style={styles.typeBoxCheckRow}>
                    <Ionicons name="checkmark-circle" size={14} color={box.color} />
                    <Text style={[styles.typeBoxCheckText, { color: box.color }]}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search Bar */}
        <View style={styles.allSearchRow}>
          <Ionicons name="search" size={18} color={allSearch ? C.teal : C.dim} />
          <TextInput
            style={styles.allSearchInput}
            placeholder="Search by name, city..."
            placeholderTextColor="#94a3b8"
            value={allSearch}
            onChangeText={t => { setAllSearch(t); setAllPage(1); }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {allSearch !== '' && (
            <TouchableOpacity onPress={() => { setAllSearch(''); setAllPage(1); }}>
              <Ionicons name="close-circle" size={18} color={C.dim} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results summary text */}
        <Text style={styles.allCountText}>
          {allSearch
            ? `🔍 "${allSearch}" — ${filteredAll.length} result${filteredAll.length !== 1 ? 's' : ''}`
            : `📋 Showing ${filteredAll.length} ${allTypeFilter === 'All' ? '' : allTypeFilter} colleges`}
        </Text>

        {filteredAll.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyMiniIcon}>🏫</Text>
            <Text style={styles.emptyMiniText}>No colleges found matching search criteria.</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {displayedAll.map((college, index) => (
              <CollegeCard
                key={`all-screen-${college.name}-${index}`}
                college={college}
                index={index}
                percentage={percentage}
                navigation={navigation}
                departmentLabel={departmentLabel}
              />
            ))}
          </Animated.View>
        )}

        {/* Load more logic */}
        {hasMoreAll && (
          <View style={styles.loadMoreContainer}>
            <Text style={styles.loadMoreInfo}>
              Showing {displayedAll.length} of {filteredAll.length} colleges
            </Text>
            <View style={styles.loadMoreBtnRow}>
              <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setAllPage(p => p + 1)}>
                <Text style={styles.loadMoreText}>⬇️ Next {Math.min(ALL_PAGE_SIZE, filteredAll.length - displayedAll.length)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.loadAllBtn, { backgroundColor: C.teal }]} onPress={() => setAllPage(Math.ceil(filteredAll.length / ALL_PAGE_SIZE))}>
                <Text style={styles.loadAllText}>📋 Load All {filteredAll.length}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!hasMoreAll && filteredAll.length > 0 && (
          <View style={[styles.endBanner, { borderColor: C.teal + '44', backgroundColor: C.teal + '15' }]}>
            <Text style={[styles.endBannerText, { color: C.teal }]}>
              🎉 All {filteredAll.length} colleges shown
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { paddingHorizontal: 14, paddingBottom: 40, paddingTop: 12 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { color: C.dim, fontSize: 14 },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.dim,
    marginTop: 2,
  },

  // 3 Boxes styles
  typeBoxRow: {
    flexDirection: 'row', gap: 10, marginBottom: 14,
  },
  typeBox: {
    flex: 1,
    borderRadius: 16, borderWidth: 2,
    padding: 14, alignItems: 'center',
    position: 'relative', overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10,
  },
  typeBoxActiveDot: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, borderTopLeftRadius: 14, borderTopRightRadius: 14,
  },
  typeBoxIcon: { fontSize: 28, marginBottom: 4 },
  typeBoxLabel: { color: C.text, fontSize: 13, fontWeight: '900', marginBottom: 2, textAlign: 'center' },
  typeBoxSub: { color: C.dim, fontSize: 9, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  typeBoxCountBadge: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 6, minWidth: 36, alignItems: 'center',
  },
  typeBoxCountText: { fontSize: 14, fontWeight: '900' },
  typeBoxCheckRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2,
  },
  typeBoxCheckText: { fontSize: 10, fontWeight: '700' },

  // Search Row
  allSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8faff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.teal + '55',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  allSearchInput: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500', paddingVertical: 2 },
  allCountText: { color: C.dim, fontSize: 12, marginBottom: 14, textAlign: 'center' },

  // Empty state
  emptyMini: {
    alignItems: 'center', padding: 24,
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 14,
  },
  emptyMiniIcon: { fontSize: 36, marginBottom: 10 },
  emptyMiniText: { color: C.sub, fontSize: 14, fontWeight: '700', textAlign: 'center' },

  // College Card
  collegeCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 4, position: 'relative',
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

  // Pagination
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
});

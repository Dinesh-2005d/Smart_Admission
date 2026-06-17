import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, SafeAreaView, ActivityIndicator, Switch,
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

export default function CollegeListScreen({ navigation, route }) {
  const { state, board, department, departmentLabel, percentage, entranceScore } = route.params;
  const { issaved, toggleSave, savedColleges } = useSavedColleges();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [preferGovt, setPreferGovt] = useState(false);
  const [needHostel, setNeedHostel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadColleges(); }, [preferGovt, needHostel]);

  const loadColleges = () => {
    setLoading(true);
    setTimeout(() => {
      let results = getCollegesForStudent(state, department, percentage, entranceScore);
      
      if (preferGovt) {
        const govtOnly = results.filter(c => c.type === "Government");
        if (govtOnly.length > 0) {
          results = govtOnly.concat(results.filter(c => c.type !== "Government"));
        }
      }
      
      if (needHostel) {
        const hostelOnly = results.filter(c => c.hostelAvailable);
        if (hostelOnly.length > 0) {
          results = hostelOnly;
        }
      }
      
      if (results.length === 0) {
        results = getCollegesForStudent(state, department, percentage, entranceScore);
      }
      
      setColleges(results);
      setAiMessage(getAIMessage(results, percentage, departmentLabel, state));
      setPage(1);
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 1200);
  };

  const getTypeColor = (type) => {
    if (type === 'Government') return COLORS.green;
    if (type === 'Private') return COLORS.gold;
    return COLORS.purple;
  };

  const placementColor = (rate) => {
    if (rate >= 90) return COLORS.green;
    if (rate >= 75) return COLORS.gold;
    return '#ea580c';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingTitle}>🤖 AI Analyzing Your Profile...</Text>
            <Text style={styles.loadingSubtitle}>{percentage}% in {departmentLabel?.split('(')[0]}</Text>
            <Text style={styles.loadingState}>📍 {state}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* AI Message */}
        <View style={styles.aiMessageCard}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiMessage}>{aiMessage}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>🎯 Top Colleges for You</Text>
          <View style={styles.summaryChips}>
            <View style={styles.chip}><Text style={styles.chipText}>📍 {state}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📊 {percentage}%</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🎓 {departmentLabel?.split('(')[0].trim()}</Text></View>
          </View>
        </View>

        {/* Filters */}
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={16} color={COLORS.purple} />
          <Text style={styles.filterToggleText}>Smart Filters</Text>
          <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color={COLORS.purple} />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersCard}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>🏫 Prefer Government Colleges</Text>
              <Switch value={preferGovt} onValueChange={setPreferGovt} trackColor={{ false: COLORS.border, true: COLORS.purple }} thumbColor={preferGovt ? COLORS.gold : COLORS.dim} />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>🏠 Hostel Required</Text>
              <Switch value={needHostel} onValueChange={setNeedHostel} trackColor={{ false: COLORS.border, true: COLORS.purple }} thumbColor={needHostel ? COLORS.gold : COLORS.dim} />
            </View>
          </View>
        )}

        <Text style={styles.foundText}>✅ Found {colleges.length} best colleges matching your profile</Text>

        {/* College Cards */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {colleges.slice(0, page * 10).map((college, index) => {
            const admission = predictAdmissionChance(college, percentage, entranceScore);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.collegeCard, { borderColor: index === 0 ? COLORS.purple + '88' : COLORS.border }]}
                onPress={() => navigation.navigate('Details', { college, departmentLabel })}
                activeOpacity={0.85}
              >
                {index === 0 && (
                  <View style={styles.bestMatchBadge}>
                    <Text style={styles.bestMatchText}>⭐ Best Match</Text>
                  </View>
                )}
                <View style={styles.rankBadge}><Text style={styles.rankText}>#{index + 1}</Text></View>

                {/* Removed absolute bookmark - now shown in footer row below */}

                <View style={styles.collegeHeader}>
                  <View style={[styles.collegeIconCircle, { borderColor: getTypeColor(college.type) + '88' }]}>
                    <Text style={styles.collegeIconText}>🏛️</Text>
                  </View>
                  <View style={styles.collegeHeaderInfo}>
                    <Text style={styles.collegeName}>{college.name}</Text>
                    <Text style={styles.collegeLocation}>📍 {college.location}</Text>
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
                    <Text style={styles.statValue}>{college.hostelAvailable ? '✅' : '❌'}</Text>
                    <Text style={styles.statLabel}>Hostel</Text>
                  </View>
                </View>

                {college.highlight && (
                  <View style={styles.highlightBox}>
                    <Ionicons name="star" size={13} color={COLORS.gold} />
                    <Text style={styles.highlightText}>{college.highlight}</Text>
                  </View>
                )}

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

        {colleges.length > page * 10 && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(page + 1)}>
            <Text style={styles.loadMoreText}>Show Next 10 Colleges ⬇️</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.purple} />
          <Text style={styles.refreshBtnText}>Change Filters</Text>
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
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  filterToggleText: { color: COLORS.purple, fontSize: 14, fontWeight: '600', flex: 1 },
  filtersCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, gap: 14 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterLabel: { color: COLORS.sub, fontSize: 14 },
  foundText: { color: COLORS.dim, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  collegeCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 6, position: 'relative' },
  bestMatchBadge: { position: 'absolute', top: -10, left: 16, backgroundColor: COLORS.purple, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  bestMatchText: { color: '#ffffff', fontWeight: '800', fontSize: 11 },
  rankBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.purple },
  rankText: { color: COLORS.purple, fontWeight: '800', fontSize: 13 },
  bookmarkBtn: { position: 'absolute', top: 14, right: 52, zIndex: 10, padding: 4 },
  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 8 },
  collegeIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  collegeIconText: { fontSize: 24 },
  collegeHeaderInfo: { flex: 1, paddingRight: 40 },
  collegeName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  collegeLocation: { color: COLORS.dim, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.text, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  statLabel: { color: COLORS.dim, fontSize: 10 },
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
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 4, marginBottom: 20 },
  refreshBtnText: { color: COLORS.purple, fontSize: 14, fontWeight: '700' },
  loadMoreBtn: { backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  loadMoreText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
});

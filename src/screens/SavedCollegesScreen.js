import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedColleges } from '../context/SavedCollegesContext';

const COLORS = {
  bg: '#f0f4ff', card: '#ffffff', border: '#e2e8f0',
  blue: '#2563eb', gold: '#eab308', green: '#16a34a',
  text: '#0f172a', sub: '#334155', dim: '#64748b',
  red: '#dc2626',
};

export default function SavedCollegesScreen({ navigation }) {
  const { savedColleges, toggleSave, clearAll } = useSavedColleges();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Saved Colleges',
      'Are you sure you want to remove all saved colleges?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  const handleRemove = (college) => {
    Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }).start(() => {
      toggleSave(college);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const getTypeColor = (type) => {
    if (type === 'Government') return COLORS.green;
    if (type === 'Private') return COLORS.gold;
    return COLORS.blue;
  };

  // ── Empty State ─────────────────────────────────────────────────────────────
  if (savedColleges.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={52} color={COLORS.blue} />
          </View>
          <Text style={styles.emptyTitle}>No Saved Colleges Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the 🔖 bookmark icon on any college card to save it here for quick access.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.exploreBtnText}>Find Colleges</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Saved list ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header summary */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Ionicons name="bookmark" size={22} color={COLORS.blue} />
            <View>
              <Text style={styles.headerTitle}>Saved Colleges</Text>
              <Text style={styles.headerSub}>{savedColleges.length} college{savedColleges.length !== 1 ? 's' : ''} saved</Text>
            </View>
          </View>
          {savedColleges.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={16} color={COLORS.red} />
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* College cards */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {savedColleges.map((college, index) => (
            <TouchableOpacity
              key={college.name + index}
              style={styles.collegeCard}
              onPress={() => navigation.navigate('Details', { college })}
              activeOpacity={0.85}
            >
              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(college)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="bookmark" size={20} color={COLORS.blue} />
              </TouchableOpacity>

              {/* College info */}
              <View style={styles.collegeHeader}>
                <View style={[styles.iconCircle, { borderColor: getTypeColor(college.type) + '88' }]}>
                  <Text style={styles.iconText}>🏛️</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.collegeName} numberOfLines={2}>{college.name}</Text>
                  <Text style={styles.collegeLocation}>📍 {college.location}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { borderColor: getTypeColor(college.type), backgroundColor: getTypeColor(college.type) + '15' }]}>
                  <Text style={[styles.tagText, { color: getTypeColor(college.type) }]}>{college.type}</Text>
                </View>
                {college.naacGrade && (
                  <View style={[styles.tag, { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '15' }]}>
                    <Text style={[styles.tagText, { color: COLORS.gold }]}>NAAC {college.naacGrade}</Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.gold }]}>⭐ {college.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: college.placementRate >= 80 ? COLORS.green : COLORS.gold }]}>
                    {college.placementRate}%
                  </Text>
                  <Text style={styles.statLabel}>Placement</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{(college.annualFee / 1000).toFixed(0)}K</Text>
                  <Text style={styles.statLabel}>Annual Fee</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{college.hostelAvailable ? '✅' : '❌'}</Text>
                  <Text style={styles.statLabel}>Hostel</Text>
                </View>
              </View>

              {/* Highlight */}
              {college.highlight && (
                <View style={styles.highlightBox}>
                  <Ionicons name="star" size={12} color={COLORS.gold} />
                  <Text style={styles.highlightText} numberOfLines={1}>{college.highlight}</Text>
                </View>
              )}

              {/* View details row */}
              <View style={styles.viewDetailRow}>
                <Text style={styles.viewDetailText}>View Full Details & Map</Text>
                <Ionicons name="arrow-forward-circle" size={20} color={COLORS.blue} />
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: COLORS.bg },
  container:  { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#bfdbfe', marginBottom: 20,
  },
  emptyTitle:    { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.dim, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  exploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.blue, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
    shadowColor: COLORS.blue, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Header summary card
  headerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  headerSub:   { fontSize: 12, color: COLORS.dim, marginTop: 2 },
  clearBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderRadius: 8, backgroundColor: '#fef2f2' },
  clearBtnText:{ fontSize: 12, color: COLORS.red, fontWeight: '600' },

  // College cards
  collegeCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
    position: 'relative',
  },
  removeBtn: { position: 'absolute', top: 14, right: 14, padding: 4, zIndex: 10 },

  collegeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 36 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  iconText:   { fontSize: 24 },
  headerInfo: { flex: 1 },
  collegeName:    { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  collegeLocation:{ color: COLORS.dim, fontSize: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },

  statsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10 },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { color: COLORS.text, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  statLabel:   { color: COLORS.dim, fontSize: 10 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  highlightBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.gold + '15', borderRadius: 8, padding: 8,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  highlightText: { color: '#92400e', fontSize: 11, flex: 1 },

  viewDetailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4,
  },
  viewDetailText: { color: COLORS.blue, fontSize: 13, fontWeight: '700' },
});

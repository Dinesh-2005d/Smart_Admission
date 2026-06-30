import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, StatusBar, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchColleges } from '../constants/collegeDatabase';
import { useSavedColleges } from '../context/SavedCollegesContext';
import CollegeLogo from '../components/CollegeLogo';

function AnimatedCard({ index, children }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index * 50, 400),
      useNativeDriver: true,
    }).start();
  }, [index]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Animated.View style={{ opacity: animatedValue, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const { issaved, toggleSave } = useSavedColleges();

  const handleSearch = (text) => {
    setQuery(text);
    setPage(1);
    if (text.trim().length > 0) {
      setSearched(true);
      setResults(searchColleges(text.trim()));
    } else {
      setSearched(false);
      setResults([]);
    }
  };

  const getTypeColor = (type) => {
    if (type === 'Government') return '#16a34a';
    if (type === 'Private') return '#eab308';
    return '#3b82f6';
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search Colleges</Text>
        <Text style={styles.headerSub}>Search by name, city, state or course</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#2563eb" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Engineering, Government, Delhi..."
            placeholderTextColor="#475569"
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); setPage(1); }}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {!searched && (
          <View>
            <Text style={styles.suggestLabel}>🔥 Popular Searches</Text>
            <View style={styles.tagsWrap}>
              {['Engineering', 'Medical', 'Management', 'Government', 'Private', 'Education', 'Law', 'Pharmacy', 'Commerce'].map((s) => (
                <TouchableOpacity key={s} style={styles.quickTag} onPress={() => handleSearch(s)}>
                  <Text style={styles.quickTagText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.suggestLabel}>💡 Search Suggestions</Text>
            {['Engineering colleges', 'Medical colleges', 'Government colleges', 'Private colleges', 'Management colleges'].map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => handleSearch(s)}>
                <Ionicons name="search-outline" size={15} color="#2563eb" />
                <Text style={styles.suggestionText}>{s}</Text>
                <Ionicons name="arrow-forward" size={14} color="#334155" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searched && results.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>😕</Text>
            <Text style={styles.emptyTitle}>No colleges found</Text>
            <Text style={styles.emptyText}>Try searching with different keywords</Text>
          </View>
        )}

        {searched && results.length > 0 && (
          <Text style={styles.resultCount}>Found {results.length} colleges</Text>
        )}

        {results.slice(0, page * 10).map((college, index) => (
          <AnimatedCard key={index} index={index}>
            <TouchableOpacity
              style={styles.collegeCard}
              onPress={() => navigation.navigate('Details', { college })}
              activeOpacity={0.85}
            >
            {/* Top row: icon + name/location + type badge */}
            <View style={styles.cardHeader}>
              <CollegeLogo
                collegeName={college.name}
                department={college.department}
                size={40}
                borderRadius={20}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.collegeName}>{college.name}</Text>
                <Text style={styles.collegeLocation}>📍 {college.location}</Text>
              </View>
              <View style={[styles.typeTag, { borderColor: getTypeColor(college.type), backgroundColor: getTypeColor(college.type) + '15' }]}>
                <Text style={[styles.typeText, { color: getTypeColor(college.type) }]}>{college.type}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <Text style={styles.stat}>⭐ {college.rating}</Text>
              <Text style={styles.stat}>📈 {college.placementRate}%</Text>
              <Text style={styles.stat}>NAAC {college.naacGrade}</Text>
            </View>

            <Text style={styles.deptBadge}>🎓 {college.department.replace('_', ' & ').toUpperCase()}</Text>

            {/* Save button row — always visible at the bottom */}
            <View style={styles.cardFooter}>
              <Text style={styles.viewDetailText}>View Details →</Text>
              <TouchableOpacity
                style={[styles.saveBtn, issaved(college) && styles.saveBtnActive]}
                onPress={(e) => { e.stopPropagation?.(); toggleSave(college); }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={issaved(college) ? 'bookmark' : 'bookmark-outline'}
                  size={15}
                  color={issaved(college) ? '#ffffff' : '#2563eb'}
                />
                <Text style={[styles.saveBtnText, issaved(college) && { color: '#ffffff' }]}>
                  {issaved(college) ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {searched && results.length > page * 10 && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(page + 1)}>
            <Text style={styles.loadMoreText}>Show Next 10 Colleges ⬇️</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },
  headerTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#475569', fontSize: 12, marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14 },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  suggestLabel: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickTag: { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#bfdbfe' },
  quickTagText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
  suggestionText: { color: '#0ea5e9', fontSize: 13, flex: 1 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  emptyText: { color: '#475569', fontSize: 13 },
  resultCount: { color: '#475569', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  collegeCard: { backgroundColor: '#f8f9fa', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  collegeName: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  collegeLocation: { color: '#475569', fontSize: 12 },
  typeTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  typeText: { fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  stat: { color: '#334155', fontSize: 12 },
  deptBadge: { color: '#2563eb', fontSize: 11, fontWeight: '600', marginBottom: 10 },
  // Footer row with Save button
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, marginTop: 2 },
  viewDetailText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  saveBtnText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
  loadMoreBtn: { backgroundColor: '#e2e8f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  loadMoreText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
});

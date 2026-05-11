import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchColleges } from '../constants/collegeDatabase';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 2) {
      setSearched(true);
      setResults(searchColleges(text));
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search Colleges</Text>
        <Text style={styles.headerSub}>Search by name, city, state or course</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#2563eb" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. IIT, Medical, Tamil Nadu, CSE..."
            placeholderTextColor="#475569"
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
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
              {['IIT', 'Medical', 'Tamil Nadu', 'Government', 'Engineering', 'MBA', 'Law', 'Pharmacy', 'Karnataka', 'Delhi'].map((s) => (
                <TouchableOpacity key={s} style={styles.quickTag} onPress={() => handleSearch(s)}>
                  <Text style={styles.quickTagText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.suggestLabel}>💡 Search Suggestions</Text>
            {['Engineering colleges Tamil Nadu', 'Medical colleges Karnataka', 'IIT colleges India', 'Government colleges Delhi', 'Law colleges Mumbai'].map((s, i) => (
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

        {results.map((college, index) => (
          <TouchableOpacity
            key={index}
            style={styles.collegeCard}
            onPress={() => navigation.navigate('Details', { college })}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}><Text style={styles.iconText}>🏛️</Text></View>
              <View style={styles.cardInfo}>
                <Text style={styles.collegeName}>{college.name}</Text>
                <Text style={styles.collegeLocation}>📍 {college.location}</Text>
              </View>
              <View style={[styles.typeTag, { borderColor: getTypeColor(college.type) }]}>
                <Text style={[styles.typeText, { color: getTypeColor(college.type) }]}>{college.type}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>⭐ {college.rating}</Text>
              <Text style={styles.stat}>📈 {college.placementRate}%</Text>
              <Text style={styles.stat}>💰 ₹{college.annualFee}</Text>
              <Text style={styles.stat}>NAAC {college.naacGrade}</Text>
            </View>
            <Text style={styles.deptBadge}>🎓 {college.department.replace('_', ' & ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { color: '#0f172a', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#475569', fontSize: 13, marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14 },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  suggestLabel: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickTag: { backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#cbd5e1' },
  quickTagText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
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
  deptBadge: { color: '#2563eb', fontSize: 11, fontWeight: '600' },
});

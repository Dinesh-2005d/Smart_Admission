import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { searchColleges } from '../constants/collegeDatabase';

export default function CompareScreen({ navigation }) {
  const [college1Query, setCollege1Query] = useState('');
  const [college2Query, setCollege2Query] = useState('');
  const [c1Results, setC1Results] = useState([]);
  const [c2Results, setC2Results] = useState([]);
  const [college1, setCollege1] = useState(null);
  const [college2, setCollege2] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleC1Search = (t) => {
    setCollege1Query(t);
    setCollege1(null);
    setShowResult(false);
    if (t.trim().length > 0) {
      setC1Results(searchColleges(t.trim()).slice(0, 5));
    } else {
      setC1Results([]);
    }
  };

  const handleC2Search = (t) => {
    setCollege2Query(t);
    setCollege2(null);
    setShowResult(false);
    if (t.trim().length > 0) {
      setC2Results(searchColleges(t.trim()).slice(0, 5));
    } else {
      setC2Results([]);
    }
  };

  const selectC1 = (c) => {
    setCollege1(c);
    setCollege1Query(c.name);
    setC1Results([]);
  };

  const selectC2 = (c) => {
    setCollege2(c);
    setCollege2Query(c.name);
    setC2Results([]);
  };

  const handleCompare = () => {
    if (college1 && college2) {
      setShowResult(true);
    }
  };

  const CompareRow = ({ label, val1, val2, higher = 'higher' }) => {
    const n1 = parseFloat(val1);
    const n2 = parseFloat(val2);
    const c1Better = !isNaN(n1) && !isNaN(n2) && (higher === 'higher' ? n1 > n2 : n1 < n2);
    const c2Better = !isNaN(n1) && !isNaN(n2) && (higher === 'higher' ? n2 > n1 : n2 < n1);
    return (
      <View style={styles.compareRow}>
        <Text style={[styles.compareVal, c1Better && styles.winner]}>{val1}</Text>
        <Text style={styles.compareLabel}>{label}</Text>
        <Text style={[styles.compareVal, c2Better && styles.winner]}>{val2}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>⚖️ Compare Colleges</Text>
        <Text style={styles.headerSub}>Enter two college names to compare side by side</Text>

        <View style={styles.inputsRow}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>College 1</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. search college name..."
              placeholderTextColor="#475569"
              value={college1Query}
              onChangeText={handleC1Search}
            />
            {c1Results.length > 0 && (
              <View style={styles.dropdown}>
                {c1Results.map((c, i) => (
                  <TouchableOpacity key={i} style={styles.dropItem} onPress={() => selectC1(c)}>
                    <Text style={styles.dropText} numberOfLines={1}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>College 2</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. search college name..."
              placeholderTextColor="#475569"
              value={college2Query}
              onChangeText={handleC2Search}
            />
            {c2Results.length > 0 && (
              <View style={styles.dropdown}>
                {c2Results.map((c, i) => (
                  <TouchableOpacity key={i} style={styles.dropItem} onPress={() => selectC2(c)}>
                    <Text style={styles.dropText} numberOfLines={1}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={[styles.compareBtn, (!college1 || !college2) && { opacity: 0.5 }]} onPress={handleCompare} activeOpacity={0.85} disabled={!college1 || !college2}>
          <Text style={styles.compareBtnText}>⚡ Compare Now</Text>
        </TouchableOpacity>

        {showResult && college1 && college2 && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCollegeName} numberOfLines={2}>{college1.name}</Text>
              <Text style={styles.resultVs}>VS</Text>
              <Text style={styles.resultCollegeName} numberOfLines={2}>{college2.name}</Text>
            </View>

            <CompareRow label="⭐ Rating" val1={String(college1.rating)} val2={String(college2.rating)} higher="higher" />
            <CompareRow label="📈 Placement %" val1={String(college1.placementRate)} val2={String(college2.placementRate)} higher="higher" />
            <CompareRow label="📋 Min %" val1={String(college1.minPercentage)} val2={String(college2.minPercentage)} higher="lower" />
            <CompareRow label="🏆 NAAC" val1={college1.naacGrade || 'N/A'} val2={college2.naacGrade || 'N/A'} />
            <CompareRow label="🏠 Hostel" val1={college1.hostelAvailable ? 'Yes' : 'No'} val2={college2.hostelAvailable ? 'Yes' : 'No'} />
            <CompareRow label="🏫 Type" val1={college1.type} val2={college2.type} />
            <CompareRow label="📅 Est." val1={String(college1.established)} val2={String(college2.established)} />

            <View style={styles.viewBtns}>
              <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('Details', { college: college1 })}>
                <Text style={styles.viewBtnText}>View {college1.name.split(' ')[0]}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('Details', { college: college2 })}>
                <Text style={styles.viewBtnText}>View {college2.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0f1e' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#94a3b8', fontSize: 12, marginBottom: 12 },
  inputsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16, zIndex: 10 },
  inputBox: { flex: 1, position: 'relative', zIndex: 10 },
  inputLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#ffffff', fontSize: 13, borderWidth: 1, borderColor: '#1e293b' },
  dropdown: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#1e293b', borderRadius: 8, borderWidth: 1, borderColor: '#334155', zIndex: 999, elevation: 5 },
  dropItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  dropText: { color: '#f8fafc', fontSize: 12 },
  vsCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0284c7', marginTop: 24 },
  vsText: { color: '#0284c7', fontWeight: '800', fontSize: 11 },
  compareBtn: { backgroundColor: '#0284c7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  compareBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  resultCard: { backgroundColor: '#111827', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1e293b', zIndex: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  resultCollegeName: { flex: 1, color: '#ffffff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  resultVs: { color: '#0284c7', fontWeight: '800', fontSize: 14 },
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  compareVal: { flex: 1, color: '#e2e8f0', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  compareLabel: { flex: 1, color: '#94a3b8', fontSize: 11, textAlign: 'center' },
  winner: { color: '#4ade80', fontSize: 14 },
  viewBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  viewBtn: { flex: 1, backgroundColor: '#0f2744', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#0284c7' },
  viewBtnText: { color: '#38bdf8', fontWeight: '700', fontSize: 13 },
});

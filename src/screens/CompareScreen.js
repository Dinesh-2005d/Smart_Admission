import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompareScreen({ navigation }) {
  const [college1Query, setCollege1Query] = useState('');
  const [college2Query, setCollege2Query] = useState('');
  const [college1, setCollege1] = useState(null);
  const [college2, setCollege2] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCollege = async (query) => {
    const response = await fetch('http://localhost:3001/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Give details for this Indian college: "${query}". Return ONLY one JSON object, no extra text: {"name":"College Name","location":"City, State","type":"Government","gender":"Co-Education","rating":4.5,"minPercentage":75,"annualFee":"45000","placementRate":87,"topCompanies":["TCS","Infosys"],"hostelAvailable":true,"naacGrade":"A+","established":1990,"description":"Brief description.","courses":["B.Tech CSE"],"highlight":"Key highlight","mapQuery":"College Name City State India"}`
        }]
      }),
    });
    const data = await response.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  };

  const handleCompare = async () => {
    if (!college1Query.trim() || !college2Query.trim()) return;
    setLoading(true);
    try {
      const [c1, c2] = await Promise.all([
        fetchCollege(college1Query),
        fetchCollege(college2Query),
      ]);
      setCollege1(c1);
      setCollege2(c2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      <StatusBar barStyle="dark-content" backgroundColor="#0a0f1e" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>⚖️ Compare Colleges</Text>
        <Text style={styles.headerSub}>Enter two college names to compare side by side</Text>

        <View style={styles.inputsRow}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>College 1</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. IIT Madras"
              placeholderTextColor="#475569"
              value={college1Query}
              onChangeText={setCollege1Query}
            />
          </View>
          <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>College 2</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. NIT Trichy"
              placeholderTextColor="#475569"
              value={college2Query}
              onChangeText={setCollege2Query}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.compareBtn} onPress={handleCompare} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#0a0f1e" /> : <Text style={styles.compareBtnText}>⚡ Compare Now</Text>}
        </TouchableOpacity>

        {college1 && college2 && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCollegeName} numberOfLines={2}>{college1.name}</Text>
              <Text style={styles.resultVs}>VS</Text>
              <Text style={styles.resultCollegeName} numberOfLines={2}>{college2.name}</Text>
            </View>

            <CompareRow label="⭐ Rating" val1={String(college1.rating)} val2={String(college2.rating)} higher="higher" />
            <CompareRow label="📈 Placement %" val1={String(college1.placementRate)} val2={String(college2.placementRate)} higher="higher" />
            <CompareRow label="💰 Annual Fee" val1={'₹'+college1.annualFee} val2={'₹'+college2.annualFee} higher="lower" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0f1e' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  headerTitle: { color: '#0f172a', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#475569', fontSize: 13, marginBottom: 20 },
  inputsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#334155', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', fontSize: 13, borderWidth: 1, borderColor: '#1e293b' },
  vsCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0284c7', marginTop: 18 },
  vsText: { color: '#0284c7', fontWeight: '800', fontSize: 11 },
  compareBtn: { backgroundColor: '#0284c7', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  compareBtnText: { color: '#0a0f1e', fontWeight: '800', fontSize: 16 },
  resultCard: { backgroundColor: '#111827', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  resultCollegeName: { flex: 1, color: '#0f172a', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  resultVs: { color: '#0284c7', fontWeight: '800', fontSize: 14 },
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  compareVal: { flex: 1, color: '#334155', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  compareLabel: { flex: 1, color: '#475569', fontSize: 11, textAlign: 'center' },
  winner: { color: '#16a34a', fontSize: 14 },
  viewBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  viewBtn: { flex: 1, backgroundColor: '#0f2744', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#0284c7' },
  viewBtnText: { color: '#0284c7', fontWeight: '700', fontSize: 13 },
});

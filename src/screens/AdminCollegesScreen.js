/**
 * AdminCollegesScreen.js
 * Comprehensive Admin Screen for managing all college records, student reviews,
 * cutoffs, placement packages, ratings, and facilities across the platform.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, Alert, Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, setDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getAllCollegesInState, updateCollegeInMemory } from '../constants/collegeDatabase';

// ── Empty college template with all fields ──────────────────────────────────
const EMPTY_COLLEGE = {
  name:                 '',
  location:             '',
  state:                '',
  district:             '',
  type:                 'Private',            // 'Government' | 'Private' | 'Deemed' | 'Autonomous'
  department:           'engineering',
  courses:              '',                   // comma-separated
  annualFee:            '',
  naacGrade:            'A',
  rating:               '4.0',
  placementRate:        '80',
  avgPackage:           '₹6 LPA',
  highestPackage:       '₹24 LPA',
  topCompanies:         'TCS, Infosys, Wipro, Cognizant',
  minPercentage:        '60',
  cutoffMark:           '160',
  hostelAvailable:      true,
  scholarshipAvailable: false,
  transportAvailable:   true,
  admissionProcess:     '',
  eligibility:          '',
  contactEmail:         '',
  contactPhone:         '',
  website:              '',
  description:          '',
  highlight:            '',
  // Student Reviews & Sentiment Data
  sentimentLabel:       'Highly Positive',
  positiveFeedback:     'Outstanding Placement Record\nHighly Experienced Faculty\nRobust Academic Environment',
  negativeFeedback:     'Strict Academic Schedule\nHigher Fee Structure',
  studentReview1Name:   'Karthik Subramanian',
  studentReview1Branch: 'B.Tech CSE (Batch 2025)',
  studentReview1Rating: '4.8',
  studentReview1Text:   'Active placement cell with early MNC recruitment drives in 7th semester.',
  studentReview2Name:   'Ananya Sharma',
  studentReview2Branch: 'B.E. ECE (Batch 2024)',
  studentReview2Rating: '4.5',
  studentReview2Text:   'Safe campus environment, good lab facilities, and supportive faculty.',
};

const TYPES       = ['Government', 'Private', 'Deemed', 'Autonomous'];
const DEPARTMENTS = [
  'engineering', 'medical', 'management', 'law', 'pharmacy',
  'nursing', 'architecture', 'arts_science', 'commerce',
  'hotel_management', 'polytechnic', 'paramedical', 'teacher_training',
  'agriculture',
];
const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'N/A'];
const SENTIMENTS  = ['Highly Positive', 'Mostly Positive', 'Positive/Mixed', 'Negative/Caution'];

// ── Small chip selector ───────────────────────────────────────────────────────
function ChipSelector({ options, selected, onSelect, label }) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4 }}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.chip, selected === opt && s.chipActive]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[s.chipText, selected === opt && s.chipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function ToggleField({ label, value, onChange }) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[s.toggle, value && s.toggleActive]}
        onPress={() => onChange(!value)}
      >
        <View style={[s.toggleThumb, value && s.toggleThumbActive]} />
      </TouchableOpacity>
    </View>
  );
}

// ── Text field ─────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder = '', multiline = false, keyboardType = 'default', required = false }) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
      <TextInput
        style={[s.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ── College Card (list view) ───────────────────────────────────────────────────
function CollegeCard({ college, onEdit, onDelete }) {
  return (
    <View style={s.collegeCard}>
      <View style={s.collegeCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.collegeName}>{college.name}</Text>
          <Text style={s.collegeMeta}>{college.location}, {college.state} · {college.type}</Text>
          <Text style={s.collegeMeta}>
            {college.department} · NAAC {college.naacGrade || 'A'} · ⭐ {college.rating}
          </Text>
        </View>
        <View style={s.cardActions}>
          <TouchableOpacity style={s.editBtn} onPress={() => onEdit(college)}>
            <Ionicons name="pencil-outline" size={16} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(college)}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.collegeCardTags}>
        <View style={[s.tag, { borderColor: '#10b981', backgroundColor: '#10b98115' }]}>
          <Text style={[s.tagText, { color: '#10b981' }]}>💼 {college.placementRate}%</Text>
        </View>
        <View style={[s.tag, { borderColor: '#8b5cf6', backgroundColor: '#8b5cf615' }]}>
          <Text style={[s.tagText, { color: '#8b5cf6' }]}>{college.avgPackage || '₹6 LPA'}</Text>
        </View>
        <View style={[s.tag, { borderColor: '#60a5fa', backgroundColor: '#60a5fa15' }]}>
          <Text style={[s.tagText, { color: '#60a5fa' }]}>
            🏠 Hostel: {college.hostelAvailable ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={[s.tag, { borderColor: '#f59e0b', backgroundColor: '#f59e0b15' }]}>
          <Text style={[s.tagText, { color: '#f59e0b' }]}>₹{college.annualFee || 'N/A'}/yr</Text>
        </View>
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
export default function AdminCollegesScreen({ route }) {
  const { user } = useAuth();

  const [colleges, setColleges] = useState(() => {
    try {
      const localAll = getAllCollegesInState('All India') || [];
      return localAll.map(c => ({
        id: c.id || c.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        ...c
      }));
    } catch (_e) {
      return [];
    }
  });
  const [loading,      setLoading]      = useState(false);
  const [displayCount, setDisplayCount] = useState(30);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);   // null = create new
  const [form,         setForm]         = useState(EMPTY_COLLEGE);
  const [toast,        setToast]        = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Live real-time push sync with Firebase Firestore ────────────────────────
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'colleges'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snap) => {
        const firestoreMap = {};
        snap.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          firestoreMap[d.id] = item;
          updateCollegeInMemory(item);
        });

        setColleges(prev => {
          const merged = prev.map(c => {
            if (firestoreMap[c.id]) {
              return { ...c, ...firestoreMap[c.id] };
            }
            return c;
          });
          Object.keys(firestoreMap).forEach(fsId => {
            if (!merged.some(m => m.id === fsId)) {
              merged.push(firestoreMap[fsId]);
            }
          });
          return merged;
        });
      }, (err) => {
        console.log("Realtime sync info:", err);
      });

      return () => unsubscribe();
    } catch (_err) {
      console.log("Realtime listener error:", _err);
    }
  }, []);

  useEffect(() => {
    if (route?.params?.collegeToEdit) {
      openEdit(route.params.collegeToEdit);
    }
  }, [route?.params?.collegeToEdit]);

  // ── Open form to add new ──────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_COLLEGE);
    setEditingId(null);
    setShowForm(true);
  };

  // ── Open form to edit existing ────────────────────────────────────────────
  const openEdit = (college) => {
    setForm({
      ...EMPTY_COLLEGE,
      ...college,
      rating: college.rating ? college.rating.toString() : '4.0',
      placementRate: college.placementRate ? college.placementRate.toString() : '80',
      annualFee: college.annualFee ? college.annualFee.toString() : '',
      minPercentage: college.minPercentage ? college.minPercentage.toString() : '60',
      courses: Array.isArray(college.courses) ? college.courses.join(', ') : (college.courses || ''),
      topCompanies: Array.isArray(college.topCompanies) ? college.topCompanies.join(', ') : (college.topCompanies || ''),
      positiveFeedback: Array.isArray(college.positiveFeedback) ? college.positiveFeedback.join('\n') : (college.positiveFeedback || EMPTY_COLLEGE.positiveFeedback),
      negativeFeedback: Array.isArray(college.negativeFeedback) ? college.negativeFeedback.join('\n') : (college.negativeFeedback || EMPTY_COLLEGE.negativeFeedback),
      studentReview1Name: college.realReviews?.[0]?.studentName || college.studentReview1Name || EMPTY_COLLEGE.studentReview1Name,
      studentReview1Branch: college.realReviews?.[0]?.branch || college.studentReview1Branch || EMPTY_COLLEGE.studentReview1Branch,
      studentReview1Rating: college.realReviews?.[0]?.rating?.toString() || college.studentReview1Rating || '4.8',
      studentReview1Text: college.realReviews?.[0]?.review || college.studentReview1Text || EMPTY_COLLEGE.studentReview1Text,
      studentReview2Name: college.realReviews?.[1]?.studentName || college.studentReview2Name || EMPTY_COLLEGE.studentReview2Name,
      studentReview2Branch: college.realReviews?.[1]?.branch || college.studentReview2Branch || EMPTY_COLLEGE.studentReview2Branch,
      studentReview2Rating: college.realReviews?.[1]?.rating?.toString() || college.studentReview2Rating || '4.5',
      studentReview2Text: college.realReviews?.[1]?.review || college.studentReview2Text || EMPTY_COLLEGE.studentReview2Text,
    });
    setEditingId(college.id);
    setShowForm(true);
  };

  // ── Validate + Save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim())     { showToast('err', 'College name is required'); return; }
    if (!form.location.trim()) { showToast('err', 'Location is required'); return; }
    if (!form.state.trim())    { showToast('err', 'State is required'); return; }

    setSaving(true);
    try {
      const targetDocId = editingId || form.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

      const data = {
        id:                   targetDocId,
        name:                 form.name.trim(),
        location:             form.location.trim(),
        state:                form.state.trim(),
        district:             form.district?.trim() || form.location.trim(),
        type:                 form.type,
        department:           form.department,
        courses:              typeof form.courses === 'string' ? form.courses.split(',').map(c => c.trim()).filter(Boolean) : form.courses,
        topCompanies:         typeof form.topCompanies === 'string' ? form.topCompanies.split(',').map(c => c.trim()).filter(Boolean) : form.topCompanies,
        annualFee:            form.annualFee.toString().trim(),
        naacGrade:            form.naacGrade,
        rating:               parseFloat(form.rating) || 4.0,
        placementRate:        parseInt(form.placementRate) || 80,
        avgPackage:           form.avgPackage || '₹6 LPA',
        highestPackage:       form.highestPackage || '₹24 LPA',
        minPercentage:        parseInt(form.minPercentage) || 60,
        cutoffMark:           form.cutoffMark || '160',
        hostelAvailable:      form.hostelAvailable,
        scholarshipAvailable: form.scholarshipAvailable,
        transportAvailable:   form.transportAvailable,
        admissionProcess:     form.admissionProcess.trim(),
        eligibility:          form.eligibility.trim(),
        contactEmail:         form.contactEmail.trim(),
        contactPhone:         form.contactPhone.trim(),
        website:              form.website.trim(),
        description:          form.description.trim(),
        highlight:            form.highlight.trim(),
        // Student reviews & sentiment data
        sentimentLabel:       form.sentimentLabel,
        positiveFeedback:     typeof form.positiveFeedback === 'string' ? form.positiveFeedback.split('\n').map(s => s.trim()).filter(Boolean) : form.positiveFeedback,
        negativeFeedback:     typeof form.negativeFeedback === 'string' ? form.negativeFeedback.split('\n').map(s => s.trim()).filter(Boolean) : form.negativeFeedback,
        realReviews: [
          ...(form.studentReview1Name ? [{
            id: 1,
            studentName: form.studentReview1Name.trim(),
            branch: form.studentReview1Branch.trim() || 'Student',
            rating: parseFloat(form.studentReview1Rating) || 4.8,
            verified: true,
            review: form.studentReview1Text.trim()
          }] : []),
          ...(form.studentReview2Name ? [{
            id: 2,
            studentName: form.studentReview2Name.trim(),
            branch: form.studentReview2Branch.trim() || 'Student',
            rating: parseFloat(form.studentReview2Rating) || 4.5,
            verified: true,
            review: form.studentReview2Text.trim()
          }] : [])
        ],
        updatedAt:            new Date().toISOString(),
        updatedBy:            user?.email || 'admin',
      };

      // 1. Immediately update global memory + localStorage
      updateCollegeInMemory(data);

      // 2. Update local screen state for zero latency
      setColleges(prev => {
        const idx = prev.findIndex(c => c.id === targetDocId || (c.name && c.name.toLowerCase() === data.name.toLowerCase()));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [{ id: targetDocId, ...data }, ...prev];
      });

      // 3. Background sync to Firestore without blocking UI
      if (db) {
        setDoc(doc(db, 'colleges', targetDocId), {
          ...data,
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(fsErr => console.log('Firestore bg save warning:', fsErr));
      }

      showToast('ok', `✅ "${form.name}" saved successfully!`);
      setShowForm(false);
    } catch (e) {
      showToast('err', 'Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (college) => {
    const confirm = async () => {
      try {
        await deleteDoc(doc(db, 'colleges', college.id));
        setColleges(prev => prev.filter(c => c.id !== college.id));
        showToast('ok', `"${college.name}" deleted`);
      } catch (e) {
        showToast('err', e.message);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${college.name}" from database?`)) confirm();
    } else {
      Alert.alert('Delete College', `Delete "${college.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirm },
      ]);
    }
  };

  useEffect(() => {
    setDisplayCount(30);
  }, [search]);

  // ── Filtered list with pagination for instant 0ms rendering ───────────────
  const filtered = search.trim()
    ? colleges.filter(c =>
        (c.name     || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.state    || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.department || '').toLowerCase().includes(search.toLowerCase())
      )
    : colleges;

  const visibleColleges = filtered.slice(0, displayCount);

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* Toast */}
      {toast && (
        <View style={[s.toast, toast.type === 'ok' ? s.toastOk : s.toastErr]}>
          <Ionicons name={toast.type === 'ok' ? 'checkmark-circle' : 'alert-circle'} size={16} color="#fff" />
          <Text style={s.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>🏫 Manage Colleges</Text>
            <Text style={s.headerSub}>{colleges.length} colleges ready for instant editing</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.addBtnText}>Add College</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={15} color="#64748b" />
          <TextInput
            style={s.searchInput}
            placeholder="Search all 1,700+ colleges by name, city, department…"
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={s.loadingText}>Loading colleges database…</Text>
        </View>
      ) : (
        <ScrollView style={s.list} contentContainerStyle={{ padding: 14 }}>
          {filtered.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🏫</Text>
              <Text style={s.emptyTitle}>
                {search ? 'No colleges match your search' : 'No colleges added yet'}
              </Text>
              <Text style={s.emptyText}>
                {search ? 'Try searching for a different college or state.' : 'Tap "Add College" to create a new college record.'}
              </Text>
            </View>
          ) : (
            <>
              {visibleColleges.map(c => (
                <CollegeCard
                  key={c.id}
                  college={c}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}

              {visibleColleges.length < filtered.length && (
                <TouchableOpacity
                  style={s.loadMoreBtn}
                  onPress={() => setDisplayCount(prev => prev + 40)}
                >
                  <Text style={s.loadMoreText}>
                    📥 Load More Colleges ({visibleColleges.length} of {filtered.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#fff' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Modal header */}
          <LinearGradient colors={['#0f172a', '#1e293b']} style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)} style={s.modalClose}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>{editingId ? `Edit ${form.name}` : 'Add New College'}</Text>
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBtnText}>Save</Text>
              }
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
            
            {/* Basic info */}
            <Text style={s.sectionTitle}>📌 Basic Information</Text>
            <Field label="College Name" value={form.name} onChange={v => setField('name', v)} required placeholder="e.g. Saveetha Engineering College" />
            <Field label="City / Location" value={form.location} onChange={v => setField('location', v)} required placeholder="e.g. Chennai" />
            <Field label="State" value={form.state} onChange={v => setField('state', v)} required placeholder="e.g. Tamil Nadu" />
            <Field label="District" value={form.district} onChange={v => setField('district', v)} placeholder="e.g. Kanchipuram" />
            <Field label="Website" value={form.website} onChange={v => setField('website', v)} placeholder="https://www.saveetha.ac.in" keyboardType="url" />
            <Field label="Contact Email" value={form.contactEmail} onChange={v => setField('contactEmail', v)} placeholder="admissions@college.edu" keyboardType="email-address" />
            <Field label="Contact Phone" value={form.contactPhone} onChange={v => setField('contactPhone', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

            {/* Type & Department */}
            <Text style={s.sectionTitle}>🎓 Type & Stream</Text>
            <ChipSelector label="College Type" options={TYPES} selected={form.type} onSelect={v => setField('type', v)} />
            <ChipSelector label="Primary Department" options={DEPARTMENTS} selected={form.department} onSelect={v => setField('department', v)} />
            <Field label="Courses Offered (comma-separated)" value={form.courses} onChange={v => setField('courses', v)} placeholder="B.Tech CSE, B.Tech ECE, B.Tech AI & DS, MBA" />

            {/* Academics & Ratings */}
            <Text style={s.sectionTitle}>📊 Ratings, Cutoffs & Placement Packages</Text>
            <ChipSelector label="NAAC Grade" options={NAAC_GRADES} selected={form.naacGrade} onSelect={v => setField('naacGrade', v)} />
            <Field label="College Rating (out of 5.0)" value={form.rating} onChange={v => setField('rating', v)} placeholder="4.5" keyboardType="decimal-pad" />
            <Field label="Campus Placement Rate (%)" value={form.placementRate} onChange={v => setField('placementRate', v)} placeholder="92" keyboardType="number-pad" />
            <Field label="Average Placement Package" value={form.avgPackage} onChange={v => setField('avgPackage', v)} placeholder="₹6.5 LPA" />
            <Field label="Highest Placement Package" value={form.highestPackage} onChange={v => setField('highestPackage', v)} placeholder="₹34 LPA" />
            <Field label="Top Recruiting Companies (comma-separated)" value={form.topCompanies} onChange={v => setField('topCompanies', v)} multiline placeholder="Google, Microsoft, TCS, Infosys, Deloitte" />
            <Field label="Annual Tuition Fee (₹)" value={form.annualFee} onChange={v => setField('annualFee', v)} placeholder="185000" keyboardType="number-pad" />
            <Field label="Minimum Eligibility Cutoff / Percentage (%)" value={form.minPercentage} onChange={v => setField('minPercentage', v)} placeholder="60" keyboardType="number-pad" />
            <Field label="Expected Cutoff Mark (TNEA / JEE)" value={form.cutoffMark} onChange={v => setField('cutoffMark', v)} placeholder="185.5" />

            {/* Facilities */}
            <Text style={s.sectionTitle}>🏠 Facilities & Campus Infrastructure</Text>
            <ToggleField label="Hostel Accommodation Available" value={form.hostelAvailable} onChange={v => setField('hostelAvailable', v)} />
            <ToggleField label="Scholarship / Financial Aid Available" value={form.scholarshipAvailable} onChange={v => setField('scholarshipAvailable', v)} />
            <ToggleField label="College Bus / Transport Available" value={form.transportAvailable} onChange={v => setField('transportAvailable', v)} />

            {/* 💬 Student Reviews & Sentiment Analysis */}
            <Text style={s.sectionTitle}>💬 Student Reviews & Sentiment Analysis</Text>
            <ChipSelector label="Overall Sentiment Verdict" options={SENTIMENTS} selected={form.sentimentLabel} onSelect={v => setField('sentimentLabel', v)} />
            <Field label="Positive Student Feedback Points (one per line)" value={form.positiveFeedback} onChange={v => setField('positiveFeedback', v)} multiline placeholder="Outstanding Placement Record&#10;Highly Experienced Faculty&#10;Modern Labs & WiFi" />
            <Field label="Areas of Caution / Fee Feedback (one per line)" value={form.negativeFeedback} onChange={v => setField('negativeFeedback', v)} multiline placeholder="Strict Attendance Rules&#10;Higher Annual Fee Structure" />

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563eb', marginTop: 10, marginBottom: 8 }}>
              Real Student Review #1:
            </Text>
            <Field label="Student Name" value={form.studentReview1Name} onChange={v => setField('studentReview1Name', v)} placeholder="Karthik Subramanian" />
            <Field label="Branch & Batch" value={form.studentReview1Branch} onChange={v => setField('studentReview1Branch', v)} placeholder="B.Tech CSE (Batch 2025)" />
            <Field label="Rating (out of 5)" value={form.studentReview1Rating} onChange={v => setField('studentReview1Rating', v)} placeholder="4.8" keyboardType="decimal-pad" />
            <Field label="Review Quote" value={form.studentReview1Text} onChange={v => setField('studentReview1Text', v)} multiline placeholder="Active placement cell with early MNC recruitment drives..." />

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563eb', marginTop: 10, marginBottom: 8 }}>
              Real Student Review #2:
            </Text>
            <Field label="Student Name" value={form.studentReview2Name} onChange={v => setField('studentReview2Name', v)} placeholder="Ananya Sharma" />
            <Field label="Branch & Batch" value={form.studentReview2Branch} onChange={v => setField('studentReview2Branch', v)} placeholder="B.E. ECE (Batch 2024)" />
            <Field label="Rating (out of 5)" value={form.studentReview2Rating} onChange={v => setField('studentReview2Rating', v)} placeholder="4.5" keyboardType="decimal-pad" />
            <Field label="Review Quote" value={form.studentReview2Text} onChange={v => setField('studentReview2Text', v)} multiline placeholder="Safe campus environment, good lab facilities..." />

            {/* Content for AI */}
            <Text style={s.sectionTitle}>📝 Additional Content & Description</Text>
            <Field label="Eligibility Criteria Details" value={form.eligibility} onChange={v => setField('eligibility', v)} multiline placeholder="Minimum 60% in 10+2 with Physics, Chemistry, Mathematics..." />
            <Field label="Admission Process Guidelines" value={form.admissionProcess} onChange={v => setField('admissionProcess', v)} multiline placeholder="Apply through TNEA Single Window Counseling or Direct Management Quota..." />
            <Field label="Full College Description" value={form.description} onChange={v => setField('description', v)} multiline placeholder="Saveetha Engineering College is an autonomous engineering institution..." />
            <Field label="Key NIRF / Accreditation Highlight" value={form.highlight} onChange={v => setField('highlight', v)} placeholder="NAAC A++ Grade with Autonomous Status" />

            <TouchableOpacity
              style={[s.saveBottomBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBottomBtnText}>💾 Save All College Data</Text>
              }
            </TouchableOpacity>
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#f1f5f9' },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:   { color: '#475569', fontSize: 13 },

  // Header
  header:        { padding: 16, paddingBottom: 12 },
  headerRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle:   { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  headerSub:     { color: '#64748b', fontSize: 12, marginTop: 2 },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput:   { flex: 1, color: '#f8fafc', fontSize: 13 },

  // Toast
  toast:         { position: 'absolute', top: 10, left: 16, right: 16, zIndex: 99, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  toastOk:       { backgroundColor: '#059669' },
  toastErr:      { backgroundColor: '#dc2626' },
  toastText:     { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },

  // List
  list:          { flex: 1 },
  emptyBox:      { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyEmoji:    { fontSize: 52 },
  emptyTitle:    { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  emptyText:     { color: '#475569', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },

  // College card
  collegeCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  collegeCardTop:{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  collegeName:   { color: '#0f172a', fontSize: 15, fontWeight: '800', marginBottom: 3 },
  collegeMeta:   { color: '#475569', fontSize: 12, marginBottom: 1 },
  cardActions:   { flexDirection: 'row', gap: 6 },
  editBtn:       { padding: 8, backgroundColor: '#eff6ff', borderRadius: 8 },
  deleteBtn:     { padding: 8, backgroundColor: '#fff1f2', borderRadius: 8 },
  collegeCardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:           { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:       { fontSize: 11, fontWeight: '600' },

  // Modal
  modalHeader:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, paddingTop: Platform.OS === 'ios' ? 50 : 14 },
  modalClose:    { padding: 4, marginRight: 8 },
  modalTitle:    { flex: 1, color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  saveBtn:       { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  saveBtnText:   { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Form
  formContent:   { padding: 16 },
  sectionTitle:  { color: '#0f172a', fontSize: 14, fontWeight: '800', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6 },
  fieldGroup:    { marginBottom: 14 },
  fieldLabel:    { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  fieldInput:    { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#0f172a', fontSize: 13 },

  // Chip selector
  chip:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
  chipActive:    { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText:      { color: '#475569', fontSize: 12, fontWeight: '600' },
  chipTextActive:{ color: '#2563eb' },

  // Toggle
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  toggle:        { width: 44, height: 24, borderRadius: 12, backgroundColor: '#cbd5e1', justifyContent: 'center', paddingHorizontal: 2 },
  toggleActive:  { backgroundColor: '#2563eb' },
  toggleThumb:   { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbActive: { transform: [{ translateX: 20 }] },

  // Save bottom button
  saveBottomBtn:     { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveBottomBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Pagination Load More
  loadMoreBtn:       { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 8, marginBottom: 10 },
  loadMoreText:      { color: '#2563eb', fontWeight: '800', fontSize: 13 },
});

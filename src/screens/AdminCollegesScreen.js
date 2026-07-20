/**
 * AdminCollegesScreen.js
 * Admin-only screen for managing college records in Firestore.
 * Admins can add, edit, and delete colleges without any code changes.
 *
 * Firestore: colleges/{collegeId}
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
  doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// ── Empty college template ────────────────────────────────────────────────────
const EMPTY_COLLEGE = {
  name:             '',
  location:         '',
  state:            '',
  type:             'Private',            // 'Government' | 'Private' | 'Deemed'
  department:       'engineering',
  courses:          '',                   // comma-separated
  annualFee:        '',
  naacGrade:        'A',
  rating:           '4.0',
  placementRate:    '80',
  minPercentage:    '60',
  hostelAvailable:  true,
  scholarshipAvailable: false,
  admissionProcess: '',
  eligibility:      '',
  contactEmail:     '',
  contactPhone:     '',
  website:          '',
  description:      '',
  highlight:        '',
};

const TYPES       = ['Government', 'Private', 'Deemed', 'Autonomous'];
const DEPARTMENTS = [
  'engineering', 'medical', 'management', 'law', 'pharmacy',
  'nursing', 'architecture', 'arts_science', 'commerce',
  'hotel_management', 'polytechnic', 'paramedical', 'teacher_training',
  'agriculture',
];
const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'N/A'];

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
            {college.department} · NAAC {college.naacGrade} · ⭐ {college.rating}
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
        <View style={[s.tag, { borderColor: '#10b981' }]}>
          <Text style={[s.tagText, { color: '#10b981' }]}>💼 {college.placementRate}%</Text>
        </View>
        <View style={[s.tag, { borderColor: '#60a5fa' }]}>
          <Text style={[s.tagText, { color: '#60a5fa' }]}>
            🏠 Hostel: {college.hostelAvailable ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={[s.tag, { borderColor: '#f59e0b' }]}>
          <Text style={[s.tagText, { color: '#f59e0b' }]}>₹{college.annualFee || 'N/A'}/yr</Text>
        </View>
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
export default function AdminCollegesScreen() {
  const { user } = useAuth();

  const [colleges,   setColleges]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);   // null = create new
  const [form,       setForm]       = useState(EMPTY_COLLEGE);
  const [toast,      setToast]      = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Fetch all colleges ────────────────────────────────────────────────────
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, 'colleges'), orderBy('name'));
      const snap = await getDocs(q);
      setColleges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      showToast('err', 'Failed to load: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

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
      courses: Array.isArray(college.courses) ? college.courses.join(', ') : (college.courses || ''),
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
      const data = {
        name:                 form.name.trim(),
        location:             form.location.trim(),
        state:                form.state.trim(),
        type:                 form.type,
        department:           form.department,
        courses:              form.courses.split(',').map(c => c.trim()).filter(Boolean),
        annualFee:            form.annualFee.trim(),
        naacGrade:            form.naacGrade,
        rating:               parseFloat(form.rating) || 4.0,
        placementRate:        parseInt(form.placementRate) || 80,
        minPercentage:        parseInt(form.minPercentage) || 60,
        hostelAvailable:      form.hostelAvailable,
        scholarshipAvailable: form.scholarshipAvailable,
        admissionProcess:     form.admissionProcess.trim(),
        eligibility:          form.eligibility.trim(),
        contactEmail:         form.contactEmail.trim(),
        contactPhone:         form.contactPhone.trim(),
        website:              form.website.trim(),
        description:          form.description.trim(),
        highlight:            form.highlight.trim(),
        updatedAt:            serverTimestamp(),
        updatedBy:            user?.email || 'admin',
      };

      if (editingId) {
        await updateDoc(doc(db, 'colleges', editingId), data);
        showToast('ok', '✅ College updated successfully');
      } else {
        await addDoc(collection(db, 'colleges'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user?.email || 'admin',
        });
        showToast('ok', '✅ College added successfully');
      }

      setShowForm(false);
      fetchColleges();
    } catch (e) {
      showToast('err', 'Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (college) => {
    const confirm = () => {
      deleteDoc(doc(db, 'colleges', college.id))
        .then(() => { showToast('ok', `${college.name} deleted`); fetchColleges(); })
        .catch(e => showToast('err', e.message));
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${college.name}"?`)) confirm();
    } else {
      Alert.alert('Delete College', `Delete "${college.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirm },
      ]);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = search.trim()
    ? colleges.filter(c =>
        (c.name     || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.state    || '').toLowerCase().includes(search.toLowerCase())
      )
    : colleges;

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
            <Text style={s.headerSub}>{colleges.length} colleges in AI database</Text>
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
            placeholder="Search colleges…"
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
          <Text style={s.loadingText}>Loading colleges…</Text>
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
                {search ? 'Try a different keyword.' : 'Tap "Add College" to add your first college to the AI knowledge base.'}
              </Text>
            </View>
          ) : (
            filtered.map(c => (
              <CollegeCard
                key={c.id}
                college={c}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))
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
            <Text style={s.modalTitle}>{editingId ? 'Edit College' : 'Add New College'}</Text>
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
            <Field label="College Name" value={form.name} onChange={v => setField('name', v)} required placeholder="e.g. Anna University" />
            <Field label="City / Location" value={form.location} onChange={v => setField('location', v)} required placeholder="e.g. Chennai" />
            <Field label="State" value={form.state} onChange={v => setField('state', v)} required placeholder="e.g. Tamil Nadu" />
            <Field label="Website" value={form.website} onChange={v => setField('website', v)} placeholder="https://..." keyboardType="url" />
            <Field label="Contact Email" value={form.contactEmail} onChange={v => setField('contactEmail', v)} placeholder="admissions@college.edu" keyboardType="email-address" />
            <Field label="Contact Phone" value={form.contactPhone} onChange={v => setField('contactPhone', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

            {/* Type & Department */}
            <Text style={s.sectionTitle}>🎓 Type & Department</Text>
            <ChipSelector label="College Type" options={TYPES} selected={form.type} onSelect={v => setField('type', v)} />
            <ChipSelector label="Primary Department" options={DEPARTMENTS} selected={form.department} onSelect={v => setField('department', v)} />
            <Field label="Courses Offered (comma-separated)" value={form.courses} onChange={v => setField('courses', v)} placeholder="B.Tech CSE, B.Tech ECE, MBA, MCA" />

            {/* Academics */}
            <Text style={s.sectionTitle}>📊 Academic Details</Text>
            <ChipSelector label="NAAC Grade" options={NAAC_GRADES} selected={form.naacGrade} onSelect={v => setField('naacGrade', v)} />
            <Field label="Rating (out of 5)" value={form.rating} onChange={v => setField('rating', v)} placeholder="4.5" keyboardType="decimal-pad" />
            <Field label="Placement Rate (%)" value={form.placementRate} onChange={v => setField('placementRate', v)} placeholder="85" keyboardType="number-pad" />
            <Field label="Annual Fee (₹)" value={form.annualFee} onChange={v => setField('annualFee', v)} placeholder="150000" keyboardType="number-pad" />
            <Field label="Minimum Eligibility (%)" value={form.minPercentage} onChange={v => setField('minPercentage', v)} placeholder="60" keyboardType="number-pad" />

            {/* Facilities */}
            <Text style={s.sectionTitle}>🏠 Facilities</Text>
            <ToggleField label="Hostel Available" value={form.hostelAvailable} onChange={v => setField('hostelAvailable', v)} />
            <ToggleField label="Scholarship Available" value={form.scholarshipAvailable} onChange={v => setField('scholarshipAvailable', v)} />

            {/* Content */}
            <Text style={s.sectionTitle}>📝 Content for AI</Text>
            <Field label="Eligibility Details" value={form.eligibility} onChange={v => setField('eligibility', v)} multiline placeholder="Minimum 60% in 10+2 with PCM / PCB..." />
            <Field label="Admission Process" value={form.admissionProcess} onChange={v => setField('admissionProcess', v)} multiline placeholder="Apply via TANCA / JoSAA counselling..." />
            <Field label="College Description" value={form.description} onChange={v => setField('description', v)} multiline placeholder="A premier institution established in 1978..." />
            <Field label="Key Highlight" value={form.highlight} onChange={v => setField('highlight', v)} placeholder="Ranked #5 in Tamil Nadu by NIRF 2024" />

            <TouchableOpacity
              style={[s.saveBottomBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBottomBtnText}>💾 Save College</Text>
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
});

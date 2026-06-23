import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const REPORT_TYPES = [
  { id: 'bug',     label: '🐛 Bug',         color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  { id: 'ui',      label: '🎨 UI Issue',    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { id: 'data',    label: '📚 Wrong Data',  color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  { id: 'feature', label: '💡 Feature Req', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  { id: 'other',   label: '📝 Other',       color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
];

const STATUSES = ['pending', 'reviewing', 'resolved'];
const STATUS_META = {
  pending:   { label: 'Pending',   color: '#d97706', bg: '#fef3c7', icon: 'time-outline' },
  reviewing: { label: 'Reviewing', color: '#2563eb', bg: '#eff6ff', icon: 'eye-outline' },
  resolved:  { label: 'Resolved',  color: '#16a34a', bg: '#f0fdf4', icon: 'checkmark-circle-outline' },
};

function fmtDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Single admin report card ──────────────────────────────────────────────────
function AdminReportCard({ report, onStatusChange, onReply }) {
  const [expanded,  setExpanded]  = useState(false);
  const [replying,  setReplying]  = useState(false);
  const [replyText, setReplyText] = useState(report.adminReply || '');
  const [saving,    setSaving]    = useState(false);

  const rtype  = REPORT_TYPES.find(t => t.id === report.type) || REPORT_TYPES[4];
  const smeta  = STATUS_META[report.status] || STATUS_META.pending;

  const handleSaveReply = async () => {
    setSaving(true);
    await onReply(report.id, replyText);
    setSaving(false);
    setReplying(false);
  };

  return (
    <View style={[aStyles.card, { borderLeftColor: rtype.color }]}>
      {/* Collapsed header */}
      <TouchableOpacity
        style={aStyles.cardHeader}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.85}
      >
        <View style={{ flex: 1 }}>
          <View style={aStyles.cardTopRow}>
            <View style={[aStyles.typePill, { backgroundColor: rtype.bg, borderColor: rtype.border }]}>
              <Text style={[aStyles.typePillText, { color: rtype.color }]}>{rtype.label}</Text>
            </View>
            <View style={[aStyles.statusPill, { backgroundColor: smeta.bg }]}>
              <Ionicons name={smeta.icon} size={11} color={smeta.color} />
              <Text style={[aStyles.statusPillText, { color: smeta.color }]}>{smeta.label}</Text>
            </View>
          </View>
          {/* User info */}
          <Text style={aStyles.userLine}>
            👤 {report.userName}  ·  {report.userEmail}
          </Text>
          <Text style={aStyles.msgPreview} numberOfLines={expanded ? undefined : 2}>
            {report.message}
          </Text>
          <Text style={aStyles.dateText}>{fmtDate(report.createdAt)}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16} color="#94a3b8" style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={aStyles.expandBody}>

          {/* Change status */}
          <Text style={aStyles.sectionLabel}>⚙️ UPDATE STATUS</Text>
          <View style={aStyles.statusRow}>
            {STATUSES.map(s => {
              const sm = STATUS_META[s];
              const active = report.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    aStyles.statusBtn,
                    { borderColor: sm.color + (active ? 'ff' : '44'), backgroundColor: active ? sm.bg : '#f8fafc' },
                  ]}
                  onPress={() => !active && onStatusChange(report.id, s)}
                  activeOpacity={0.8}
                >
                  <Text style={[aStyles.statusBtnText, { color: active ? sm.color : '#94a3b8' }]}>
                    {sm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Admin reply */}
          <Text style={[aStyles.sectionLabel, { marginTop: 14 }]}>💬 REPLY TO USER</Text>
          {replying ? (
            <View>
              <TextInput
                style={aStyles.replyInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a response visible to the user…"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />
              <View style={aStyles.replyActions}>
                <TouchableOpacity
                  style={[aStyles.replyBtn, { backgroundColor: '#2563eb' }]}
                  onPress={handleSaveReply}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={aStyles.replyBtnText}>Save Reply</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[aStyles.replyBtn, { backgroundColor: '#e2e8f0' }]}
                  onPress={() => setReplying(false)}
                >
                  <Text style={[aStyles.replyBtnText, { color: '#374151' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={aStyles.addReplyBtn}
              onPress={() => setReplying(true)}
              activeOpacity={0.8}
            >
              <Ionicons name={report.adminReply ? 'create-outline' : 'add-circle-outline'} size={16} color="#2563eb" />
              <Text style={aStyles.addReplyText}>
                {report.adminReply ? 'Edit Reply' : 'Add Reply'}
              </Text>
              {report.adminReply && (
                <Text style={aStyles.replyPreview} numberOfLines={1}> — "{report.adminReply}"</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ── Admin Reports Screen ──────────────────────────────────────────────────────
export default function AdminReportsScreen() {
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');    // 'all' | type id
  const [filterStat, setFilterStat] = useState('all');    // 'all' | status
  const [toast,      setToast]      = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReports = useCallback(async () => {
    try {
      const q    = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Fetch reports error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  // ── Update report status ───────────────────────────────────────────────
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      showToast('ok', `Status updated to "${STATUS_META[newStatus].label}"`);
    } catch {
      showToast('err', 'Failed to update status');
    }
  };

  // ── Save admin reply ───────────────────────────────────────────────────
  const handleReply = async (reportId, replyText) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        adminReply: replyText.trim() || null,
        updatedAt: serverTimestamp(),
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, adminReply: replyText.trim() || null } : r));
      showToast('ok', 'Reply saved successfully');
    } catch {
      showToast('err', 'Failed to save reply');
    }
  };

  // Filter
  const filtered = reports.filter(r => {
    const typeOk = filterType === 'all' || r.type === filterType;
    const statOk = filterStat === 'all' || r.status === filterStat;
    return typeOk && statOk;
  });

  // Stats
  const total    = reports.length;
  const pending  = reports.filter(r => r.status === 'pending').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  if (loading) {
    return (
      <View style={aStyles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={aStyles.loadingText}>Loading reports…</Text>
      </View>
    );
  }

  return (
    <View style={aStyles.container}>

      {/* Toast */}
      {toast && (
        <View style={[aStyles.toast, toast.type === 'ok' ? aStyles.toastOk : aStyles.toastErr]}>
          <Ionicons
            name={toast.type === 'ok' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            size={16} color="#fff"
          />
          <Text style={aStyles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* Stats row */}
      <View style={aStyles.statsRow}>
        {[
          { label: 'Total',    value: total,    color: '#2563eb' },
          { label: 'Pending',  value: pending,  color: '#d97706' },
          { label: 'Resolved', value: resolved, color: '#16a34a' },
        ].map(s => (
          <View key={s.label} style={aStyles.statCard}>
            <Text style={[aStyles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={aStyles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aStyles.filterScroll}
        contentContainerStyle={aStyles.filterRow}>
        <Text style={aStyles.filterGroupLabel}>Status:</Text>
        {['all', ...STATUSES].map(s => {
          const sm = STATUS_META[s] || { label: 'All', color: '#2563eb', bg: '#eff6ff' };
          const active = filterStat === s;
          return (
            <TouchableOpacity
              key={s}
              style={[aStyles.filterChip, active && { backgroundColor: s === 'all' ? '#2563eb' : sm.bg, borderColor: s === 'all' ? '#2563eb' : sm.color }]}
              onPress={() => setFilterStat(s)}
            >
              <Text style={[aStyles.filterChipText, active && { color: s === 'all' ? '#fff' : sm.color }]}>
                {s === 'all' ? 'All' : sm.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={aStyles.filterDivider} />
        <Text style={aStyles.filterGroupLabel}>Type:</Text>
        {[{ id: 'all', label: 'All', color: '#2563eb', bg: '#eff6ff' }, ...REPORT_TYPES].map(t => {
          const active = filterType === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[aStyles.filterChip, active && { backgroundColor: t.bg, borderColor: t.color }]}
              onPress={() => setFilterType(t.id)}
            >
              <Text style={[aStyles.filterChipText, active && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reports list */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={aStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        renderItem={({ item }) => (
          <AdminReportCard
            report={item}
            onStatusChange={handleStatusChange}
            onReply={handleReply}
          />
        )}
        ListEmptyComponent={
          <View style={aStyles.empty}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#cbd5e1" />
            <Text style={aStyles.emptyText}>No reports found</Text>
          </View>
        }
      />
    </View>
  );
}

const aStyles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f0f4ff' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },

  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, borderRadius: 12, padding: 12 },
  toastOk: { backgroundColor: '#16a34a' },
  toastErr:{ backgroundColor: '#dc2626' },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },

  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 },

  filterScroll: { maxHeight: 50 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center', gap: 6, flexDirection: 'row' },
  filterGroupLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginRight: 2 },
  filterDivider: { width: 1, height: 22, backgroundColor: '#e2e8f0', marginHorizontal: 6 },
  filterChip: {
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#f8fafc',
  },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
  cardTopRow:  { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'center' },
  typePill:    { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText:{ fontSize: 11, fontWeight: '700' },
  statusPill:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  userLine:    { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  msgPreview:  { fontSize: 13, color: '#374151', lineHeight: 19, fontWeight: '500' },
  dateText:    { fontSize: 11, color: '#94a3b8', marginTop: 6 },

  expandBody:  { paddingHorizontal: 16, paddingBottom: 16 },
  sectionLabel:{ fontSize: 10, fontWeight: '800', color: '#64748b', letterSpacing: 1, marginBottom: 8 },

  screenshotWrap: { marginTop: 4 },
  screenshotImg:  { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#f1f5f9' },

  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, borderRadius: 10, borderWidth: 1.5, paddingVertical: 9, alignItems: 'center' },
  statusBtnText: { fontSize: 12, fontWeight: '700' },

  replyInput: {
    backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
    padding: 12, fontSize: 13, color: '#0f172a', minHeight: 80, textAlignVertical: 'top',
  },
  replyActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  replyBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  replyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  addReplyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#bfdbfe',
  },
  addReplyText:  { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  replyPreview:  { fontSize: 12, color: '#64748b', flex: 1 },

  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
});

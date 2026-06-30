import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function AdminPanelScreen() {
  const { user, adminGetUsers, adminBlockUser, adminUnblockUser, adminDeleteUser } = useAuth();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actionId,   setActionId]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all'); // 'all' | 'active' | 'blocked' | 'admin'

  const fetchUsers = useCallback(async () => {
    const list = await adminGetUsers();
    setUsers(list);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const doBlock = async (u) => {
    setConfirm(null);
    setActionId(u.id);
    const fn  = u.blocked ? adminUnblockUser : adminBlockUser;
    const res = await fn(u.id);
    setActionId(null);
    if (res.success) { showToast('ok', res.message); fetchUsers(); }
    else              showToast('err', res.message || 'Action failed');
  };

  const doDelete = async (u) => {
    setConfirm(null);
    setActionId(u.id);
    const res = await adminDeleteUser(u.id);
    setActionId(null);
    if (res.success) { showToast('ok', `${u.email} removed`); fetchUsers(); }
    else              showToast('err', res.message || 'Delete failed');
  };

  const stats = {
    total:   users.length,
    active:  users.filter(u => !u.blocked).length,
    blocked: users.filter(u => u.blocked).length,
    admins:  users.filter(u => u.role === 'Admin').length,
  };

  // Filter + search
  const filteredUsers = users.filter(u => {
    const matchSearch = search.trim() === '' ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'active'  ? !u.blocked :
      filter === 'blocked' ? u.blocked :
      filter === 'admin'   ? u.role === 'Admin' : true;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading users…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <LinearGradient colors={['#1e3a8a', '#2563eb']} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSub}>Manage registered users</Text>
            </View>
          </View>
          <TouchableOpacity onPress={fetchUsers} style={styles.refreshBtn} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color="#bfdbfe" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total',   value: stats.total,   color: '#fff',    bg: 'rgba(255,255,255,0.15)', icon: 'people-outline' },
            { label: 'Active',  value: stats.active,  color: '#86efac', bg: 'rgba(134,239,172,0.15)', icon: 'checkmark-circle-outline' },
            { label: 'Blocked', value: stats.blocked, color: '#fca5a5', bg: 'rgba(252,165,165,0.15)', icon: 'ban-outline' },
            { label: 'Admins',  value: stats.admins,  color: '#c4b5fd', bg: 'rgba(196,181,253,0.15)', icon: 'shield-outline' },
          ].map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.statCard, { backgroundColor: s.bg }]}
              onPress={() => setFilter(s.label.toLowerCase())}
              activeOpacity={0.8}
            >
              <Ionicons name={s.icon} size={14} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: s.color + 'cc' }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <View style={[styles.toast, toast.type === 'ok' ? styles.toastOk : styles.toastErr]}>
          <Ionicons
            name={toast.type === 'ok' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            size={16} color="#fff"
          />
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* ── Search + Filter bar ─────────────────────────────────────── */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email…"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'active', 'blocked', 'admin'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── User List ───────────────────────────────────────────────── */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {search ? 'No users match your search' : 'No users registered yet'}
            </Text>
          </View>
        ) : (
          filteredUsers.map(u => {
            const isProcessing  = actionId === u.id;
            const isCurrentUser = u.id === user?.uid;
            const pendingBlock  = confirm?.id === u.id && confirm.type === 'block';
            const pendingDelete = confirm?.id === u.id && confirm.type === 'delete';
            const isAdmin       = u.role === 'Admin';

            return (
              <View
                key={u.id}
                style={[styles.userCard, (pendingBlock || pendingDelete) && styles.userCardActive]}
              >
                {/* Left: Avatar */}
                <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
                  <Text style={styles.avatarText}>{(u.name || u.email || 'U')[0].toUpperCase()}</Text>
                </View>

                {/* Middle: Info */}
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.name || 'No name'}</Text>
                    {isAdmin && (
                      <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMIN</Text></View>
                    )}
                    {isCurrentUser && (
                      <View style={styles.youBadge}><Text style={styles.youBadgeText}>YOU</Text></View>
                    )}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaPill}>
                      <Ionicons
                        name={u.provider === 'google' ? 'logo-google' : 'mail-outline'}
                        size={11} color="#64748b"
                      />
                      <Text style={styles.metaText}>{u.provider === 'google' ? 'Google' : 'Email'}</Text>
                    </View>
                    <View style={[styles.statusPill, u.blocked ? styles.statusPillBlocked : styles.statusPillActive]}>
                      <View style={[styles.statusDot, { backgroundColor: u.blocked ? '#dc2626' : '#16a34a' }]} />
                      <Text style={[styles.statusText, u.blocked ? styles.statusTextBlocked : styles.statusTextActive]}>
                        {u.blocked ? 'Blocked' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  {/* Confirm: block */}
                  {pendingBlock && !isProcessing && (
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmMsg}>
                        {u.blocked ? `Unblock ${u.name || 'this user'}?` : `Block ${u.name || 'this user'}?`}
                      </Text>
                      <TouchableOpacity style={styles.confirmYes} onPress={() => doBlock(u)}>
                        <Text style={styles.confirmYesTxt}>{u.blocked ? 'Unblock' : 'Block'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirm(null)}>
                        <Text style={styles.confirmNoTxt}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Confirm: delete */}
                  {pendingDelete && !isProcessing && (
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmMsg}>Remove this account?</Text>
                      <TouchableOpacity style={[styles.confirmYes, { backgroundColor: '#dc2626' }]} onPress={() => doDelete(u)}>
                        <Text style={styles.confirmYesTxt}>Remove</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirm(null)}>
                        <Text style={styles.confirmNoTxt}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Right: Actions */}
                {!isCurrentUser && !isAdmin && (
                  <View style={styles.actions}>
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.actionBtn, u.blocked ? styles.actionUnblock : styles.actionBlock, pendingBlock && styles.actionBtnActive]}
                          onPress={() => setConfirm(pendingBlock ? null : { id: u.id, type: 'block' })}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={u.blocked ? 'lock-open-outline' : 'ban-outline'}
                            size={16}
                            color={u.blocked ? '#16a34a' : '#d97706'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionDelete, pendingDelete && styles.actionBtnActive]}
                          onPress={() => setConfirm(pendingDelete ? null : { id: u.id, type: 'delete' })}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trash-outline" size={16} color="#dc2626" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    // Web fix: ensure full height renders
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },

  // Header
  header: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 16 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon:  {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerSub:   { color: '#93c5fd', fontSize: 11, fontWeight: '500', marginTop: 1 },
  refreshBtn:  {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsRow:  { flexDirection: 'row', gap: 8 },
  statCard:  {
    flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Toast
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, borderRadius: 12, padding: 12,
  },
  toastOk:   { backgroundColor: '#16a34a' },
  toastErr:  { backgroundColor: '#dc2626' },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },

  // Toolbar
  toolbar:     { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  filterScroll: { marginTop: 4 },
  filterChip: {
    marginRight: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
  },
  filterChipActive:     { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  filterChipText:       { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterChipTextActive: { color: '#2563eb', fontWeight: '800' },

  // User list
  listScroll:  { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },

  userCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  userCardActive: { borderColor: '#bfdbfe', backgroundColor: '#f0f7ff' },

  avatar:      { width: 46, height: 46, borderRadius: 23, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarAdmin: { backgroundColor: '#7c3aed' },
  avatarText:  { color: '#fff', fontSize: 19, fontWeight: '700' },

  userInfo:    { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  userName:    { fontSize: 15, fontWeight: '700', color: '#0f172a', flexShrink: 1 },
  userEmail:   { fontSize: 12, color: '#64748b', marginTop: 2 },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  metaText: { fontSize: 10, color: '#64748b', fontWeight: '600' },

  statusPill:        { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  statusPillActive:  { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  statusPillBlocked: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  statusDot:         { width: 6, height: 6, borderRadius: 3 },
  statusText:        { fontSize: 10, fontWeight: '700' },
  statusTextActive:  { color: '#16a34a' },
  statusTextBlocked: { color: '#dc2626' },

  adminBadge:     { backgroundColor: '#ede9fe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  adminBadgeText: { fontSize: 9, fontWeight: '700', color: '#7c3aed' },
  youBadge:       { backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  youBadgeText:   { fontSize: 9, fontWeight: '700', color: '#2563eb' },

  confirmRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  confirmMsg:    { fontSize: 12, color: '#374151', fontWeight: '500', flex: 1 },
  confirmYes:    { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  confirmYesTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confirmNo:     { backgroundColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  confirmNoTxt:  { color: '#374151', fontSize: 12, fontWeight: '600' },

  actions:         { flexDirection: 'row', gap: 8, marginLeft: 8, paddingTop: 2 },
  actionBtn:       { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBlock:     { backgroundColor: '#fef3c7' },
  actionUnblock:   { backgroundColor: '#dcfce7' },
  actionDelete:    { width: 38, height: 38, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  actionBtnActive: { opacity: 0.7 },

  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '500' },
});

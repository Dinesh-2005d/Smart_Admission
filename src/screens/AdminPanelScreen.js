import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
export default function AdminPanelScreen() {
  const { user, adminGetUsers, adminBlockUser, adminUnblockUser, adminDeleteUser } = useAuth();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId,   setActionId]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState(null);

  const fetchUsers = useCallback(async () => {
    const list = await adminGetUsers();
    setUsers(list);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  // ── Inline confirm block/unblock ──────────────────────────────────────────
  const doBlock = async (u) => {
    setConfirm(null);
    setActionId(u.id);
    const fn  = u.blocked ? adminUnblockUser : adminBlockUser;
    const res = await fn(u.id);
    setActionId(null);
    if (res.success) { showToast('ok', res.message); fetchUsers(); }
    else              showToast('err', res.message || 'Action failed');
  };

  // ── Inline confirm delete ─────────────────────────────────────────────────
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

  const renderUser = ({ item: u }) => {
    const isProcessing  = actionId === u.id;
    const isCurrentUser = u.id === user?.id;
    const pendingBlock  = confirm?.id === u.id && confirm.type === 'block';
    const pendingDelete = confirm?.id === u.id && confirm.type === 'delete';
    const isAdmin       = u.role === 'Admin';

    return (
      <View style={[styles.userCard, (pendingBlock || pendingDelete) && styles.userCardActive]}>
        {/* Avatar */}
        <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
          <Text style={styles.avatarText}>{(u.name || u.email)[0].toUpperCase()}</Text>
        </View>

        {/* Info */}
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
            <Text style={styles.metaText}>
              {u.provider === 'google' ? '🔵 Google' : '📧 Email'}
            </Text>
            <Text style={[styles.statusBadge, u.blocked ? styles.statusBlocked : styles.statusActive]}>
              {u.blocked ? '🔴 Blocked' : '🟢 Active'}
            </Text>
          </View>

          {/* ── Inline confirmation row (block) ── */}
          {pendingBlock && !isProcessing && (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmMsg}>
                {u.blocked ? `Unblock ${u.name}?` : `Block ${u.name}?`}
              </Text>
              <TouchableOpacity style={styles.confirmYes} onPress={() => doBlock(u)}>
                <Text style={styles.confirmYesTxt}>{u.blocked ? 'Unblock' : 'Block'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirm(null)}>
                <Text style={styles.confirmNoTxt}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Inline confirmation row (delete) ── */}
          {pendingDelete && !isProcessing && (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmMsg}>Remove account?</Text>
              <TouchableOpacity style={[styles.confirmYes, { backgroundColor: '#dc2626' }]} onPress={() => doDelete(u)}>
                <Text style={styles.confirmYesTxt}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirm(null)}>
                <Text style={styles.confirmNoTxt}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action buttons (only for non-admin, non-self users) */}
        {!isCurrentUser && !isAdmin && (
          <View style={styles.actions}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                {/* Block / Unblock button */}
                <TouchableOpacity
                  style={[styles.actionBtn, u.blocked ? styles.actionUnblock : styles.actionBlock,
                    pendingBlock && styles.actionBtnActive]}
                  onPress={() => setConfirm(
                    pendingBlock ? null : { id: u.id, type: 'block' }
                  )}
                >
                  <Ionicons
                    name={u.blocked ? 'lock-open-outline' : 'ban-outline'}
                    size={17}
                    color={u.blocked ? '#16a34a' : '#d97706'}
                  />
                </TouchableOpacity>

                {/* Delete button */}
                <TouchableOpacity
                  style={[styles.actionDelete, pendingDelete && styles.actionBtnActive]}
                  onPress={() => setConfirm(
                    pendingDelete ? null : { id: u.id, type: 'delete' }
                  )}
                >
                  <Ionicons name="trash-outline" size={17} color="#dc2626" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading users…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {toast && (
        <View style={[styles.toast, toast.type === 'ok' ? styles.toastOk : styles.toastErr]}>
          <Ionicons
            name={toast.type === 'ok' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            size={16} color="#fff"
          />
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total',   value: stats.total,   color: '#2563eb' },
          { label: 'Active',  value: stats.active,  color: '#16a34a' },
          { label: 'Blocked', value: stats.blocked, color: '#dc2626' },
          { label: 'Admins',  value: stats.admins,  color: '#7c3aed' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* User list */}
      <FlatList
        data={users}
        keyExtractor={u => u.id}
        renderItem={renderUser}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No users registered yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f0f4ff' },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:{ color: '#64748b', fontSize: 14 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16, paddingTop: 12, gap: 4,
  },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: '#f8fafc',
  },
  tabBtnActive: {
    backgroundColor: '#eff6ff', borderColor: '#bfdbfe',
  },
  tabBtnText:       { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabBtnTextActive: { color: '#2563eb', fontWeight: '800' },

  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, borderRadius: 12, padding: 12,
  },
  toastOk:   { backgroundColor: '#16a34a' },
  toastErr:  { backgroundColor: '#dc2626' },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 13, flex: 1 },

  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 },

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  userCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  userCardActive: { borderColor: '#bfdbfe', backgroundColor: '#f0f7ff' },

  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarAdmin: { backgroundColor: '#7c3aed' },
  avatarText:  { color: '#fff', fontSize: 18, fontWeight: '700' },

  userInfo:    { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  userName:    { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 },
  userEmail:   { fontSize: 12, color: '#64748b', marginTop: 2 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaText:    { fontSize: 11, color: '#94a3b8' },

  adminBadge:     { backgroundColor: '#ede9fe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  adminBadgeText: { fontSize: 9, fontWeight: '700', color: '#7c3aed' },
  youBadge:       { backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  youBadgeText:   { fontSize: 9, fontWeight: '700', color: '#2563eb' },

  statusBadge:   { fontSize: 11, fontWeight: '600' },
  statusActive:  { color: '#16a34a' },
  statusBlocked: { color: '#dc2626' },

  confirmRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  confirmMsg:    { fontSize: 12, color: '#374151', fontWeight: '500' },
  confirmYes:    { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  confirmYesTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confirmNo:     { backgroundColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  confirmNoTxt:  { color: '#374151', fontSize: 12, fontWeight: '600' },

  actions:        { flexDirection: 'row', gap: 8, marginLeft: 8, paddingTop: 2 },
  actionBtn:      { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBlock:    { backgroundColor: '#fef3c7' },
  actionUnblock:  { backgroundColor: '#dcfce7' },
  actionDelete:   { width: 38, height: 38, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  actionBtnActive:{ opacity: 0.7, transform: [{ scale: 0.95 }] },

  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
});

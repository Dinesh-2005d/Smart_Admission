import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function AdminPanelScreen() {
  const { user, adminGetUsers, adminBlockUser, adminUnblockUser, adminDeleteUser } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId,  setActionId]  = useState(null); // which user is processing

  const fetchUsers = useCallback(async () => {
    const list = await adminGetUsers();
    setUsers(list);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const handleBlock = (u) => {
    Alert.alert(
      u.blocked ? 'Unblock User' : 'Block User',
      u.blocked
        ? `Allow ${u.email} to log in again?`
        : `Prevent ${u.email} from logging in?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: u.blocked ? 'Unblock' : 'Block',
          style: u.blocked ? 'default' : 'destructive',
          onPress: async () => {
            setActionId(u.id);
            const fn  = u.blocked ? adminUnblockUser : adminBlockUser;
            const res = await fn(u.id);
            setActionId(null);
            if (res.success) {
              Alert.alert('Done', res.message);
              fetchUsers();
            } else {
              Alert.alert('Error', res.message);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (u) => {
    Alert.alert(
      'Delete User',
      `Permanently remove ${u.email}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionId(u.id);
            const res = await adminDeleteUser(u.id);
            setActionId(null);
            if (res.success) fetchUsers();
            else Alert.alert('Error', res.message);
          },
        },
      ]
    );
  };

  const stats = {
    total:   users.length,
    active:  users.filter(u => !u.blocked).length,
    blocked: users.filter(u => u.blocked).length,
    admins:  users.filter(u => u.role === 'Admin').length,
  };

  const renderUser = ({ item: u }) => {
    const isProcessing = actionId === u.id;
    const isCurrentUser = u.id === user?.id;
    return (
      <View style={styles.userCard}>
        {/* Avatar */}
        <View style={[styles.avatar, u.role === 'Admin' && styles.avatarAdmin]}>
          <Text style={styles.avatarText}>{(u.name || u.email)[0].toUpperCase()}</Text>
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>{u.name || 'No name'}</Text>
            {u.role === 'Admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
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
        </View>

        {/* Actions */}
        {!isCurrentUser && u.role !== 'Admin' && (
          <View style={styles.actions}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, u.blocked ? styles.actionUnblock : styles.actionBlock]}
                  onPress={() => handleBlock(u)}
                >
                  <Ionicons
                    name={u.blocked ? 'lock-open-outline' : 'ban-outline'}
                    size={16}
                    color={u.blocked ? '#16a34a' : '#d97706'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionDelete} onPress={() => handleDelete(u)}>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
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
      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total,   color: '#2563eb' },
          { label: 'Active', value: stats.active,  color: '#16a34a' },
          { label: 'Blocked', value: stats.blocked, color: '#dc2626' },
          { label: 'Admins', value: stats.admins,  color: '#7c3aed' },
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
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },

  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 },

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarAdmin:  { backgroundColor: '#7c3aed' },
  avatarText:   { color: '#fff', fontSize: 18, fontWeight: '700' },

  userInfo:    { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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

  actions:     { flexDirection: 'row', gap: 8, marginLeft: 8 },
  actionBtn:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBlock: { backgroundColor: '#fef3c7' },
  actionUnblock:{ backgroundColor: '#dcfce7' },
  actionDelete:{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },

  empty:      { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:  { color: '#94a3b8', fontSize: 15 },
});

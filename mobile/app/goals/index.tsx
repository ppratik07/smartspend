import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../constants/theme';
import { useAppStore, Goal } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDateShort } from '../../utils/format';

export default function GoalsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'USD';
  const { goals, isLoading, fetchGoals, addGoal, deleteGoal } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '' });

  useEffect(() => { fetchGoals(); }, []);

  async function handleCreate() {
    if (!form.name || !form.targetAmount) {
      Alert.alert('Validation', 'Name and target amount are required.');
      return;
    }
    await addGoal({
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      targetDate: form.targetDate || undefined,
    });
    setModalVisible(false);
    setForm({ name: '', targetAmount: '', targetDate: '' });
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Goal', 'Remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchGoals} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {goals.length} goal{goals.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => { setForm({ name: '', targetAmount: '', targetDate: '' }); setModalVisible(true); }}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>New Goal</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="flag-outline" size={52} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No goals yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Create a savings goal and track your progress
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const pct = Math.min(((item as any).progressPercent ?? 0), 100);
          return (
            <Card style={styles.goalCard}>
              <TouchableOpacity onPress={() => router.push(`/goals/${item.id}`)}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIconCircle, { backgroundColor: theme.primaryLight ?? '#D1FAE5' }]}>
                    <Ionicons name="flag" size={22} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalName, { color: theme.text }]}>{item.name}</Text>
                    {item.targetDate && (
                      <Text style={[styles.goalDate, { color: theme.textSecondary }]}>
                        Target: {formatDateShort(item.targetDate)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>

                <ProgressBar percent={pct} style={{ marginVertical: 12 }} />

                <View style={styles.amounts}>
                  <View>
                    <Text style={[styles.amtLabel, { color: theme.textSecondary }]}>Saved</Text>
                    <Text style={[styles.amtValue, { color: theme.primary }]}>
                      {formatCurrency(item.savedAmount, currency)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amtLabel, { color: theme.textSecondary }]}>Goal</Text>
                    <Text style={[styles.amtValue, { color: theme.text }]}>
                      {formatCurrency(item.targetAmount, currency)}
                    </Text>
                  </View>
                </View>

                {pct >= 100 && (
                  <View style={[styles.achievedBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700' }}>Goal achieved!</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Savings Goal</Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Goal Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Emergency Fund"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Target Amount</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={form.targetAmount}
              onChangeText={(v) => setForm((f) => ({ ...f, targetAmount: v }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Target Date (optional, YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={form.targetDate}
              onChangeText={(v) => setForm((f) => ({ ...f, targetDate: v }))}
              placeholder="2025-12-31"
              placeholderTextColor={theme.textMuted}
            />

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button onPress={handleCreate} style={{ flex: 1 }}>Create</Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionLabel: { fontSize: 13 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  goalCard: { marginBottom: 0 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: 16, fontWeight: '700' },
  goalDate: { fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 4 },
  amounts: { flexDirection: 'row', justifyContent: 'space-between' },
  amtLabel: { fontSize: 11 },
  amtValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  achievedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 10, alignSelf: 'flex-start' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  textInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 4 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

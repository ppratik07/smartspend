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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAppStore, Budget } from '../../store/appStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { CATEGORY_COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';

const PERIODS = ['WEEKLY', 'MONTHLY'] as const;

export default function BudgetsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'USD';
  const { budgets, categories, isLoading, fetchBudgets, fetchCategories, addBudget, updateBudget, deleteBudget } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState({ categoryId: '', amount: '', period: 'MONTHLY' as 'WEEKLY' | 'MONTHLY' });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ categoryId: '', amount: '', period: 'MONTHLY' });
    setModalVisible(true);
  }

  function openEdit(b: Budget) {
    setEditing(b);
    setForm({ categoryId: b.categoryId, amount: String(b.amount), period: b.period as 'WEEKLY' | 'MONTHLY' });
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.categoryId || !form.amount) {
      Alert.alert('Validation', 'Please select a category and enter an amount.');
      return;
    }
    const payload = { categoryId: form.categoryId, amount: parseFloat(form.amount), period: form.period };
    if (editing) {
      await updateBudget(editing.id, payload);
    } else {
      await addBudget(payload);
    }
    setModalVisible(false);
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
    ]);
  }

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const getCategoryIcon = (id: string) =>
    categories.find((c) => c.id === id)?.icon ?? '💰';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchBudgets} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={openNew}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>New Budget</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={52} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No budgets yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Set budgets to track your spending limits
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const spent = (item as any).spentAmount ?? 0;
          const pct = (item as any).percentUsed ?? 0;
          const remaining = (item as any).remainingAmount ?? item.amount;
          const isOver = (item as any).isOverLimit;
          const isNear = (item as any).isNearLimit;
          return (
            <Card style={styles.budgetCard}>
              <View style={styles.budgetRow}>
                <Text style={styles.icon}>{getCategoryIcon(item.categoryId)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catName, { color: theme.text }]}>{getCategoryName(item.categoryId)}</Text>
                  <Text style={[styles.period, { color: theme.textSecondary }]}>{item.period}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </TouchableOpacity>
              </View>

              <ProgressBar percent={pct} style={{ marginVertical: 10 }} />

              <View style={styles.amounts}>
                <View>
                  <Text style={[styles.amtLabel, { color: theme.textSecondary }]}>Spent</Text>
                  <Text style={[styles.amtValue, { color: isOver ? theme.danger : theme.text }]}>
                    {formatCurrency(spent, currency)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.amtLabel, { color: theme.textSecondary }]}>Budget</Text>
                  <Text style={[styles.amtValue, { color: theme.text }]}>
                    {formatCurrency(item.amount, currency)}
                  </Text>
                </View>
              </View>

              {(isOver || isNear) && (
                <View style={[styles.alertBadge, { backgroundColor: isOver ? '#FEE2E2' : '#FEF9C3' }]}>
                  <Ionicons
                    name={isOver ? 'warning' : 'alert-circle'}
                    size={13}
                    color={isOver ? '#DC2626' : '#92400E'}
                  />
                  <Text style={[styles.alertText, { color: isOver ? '#DC2626' : '#92400E' }]}>
                    {isOver ? 'Over budget!' : `${Math.round(pct)}% used`}
                  </Text>
                </View>
              )}
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editing ? 'Edit Budget' : 'New Budget'}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {categories.map((cat) => {
                const selected = form.categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: selected ? theme.primary : theme.background,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                  >
                    <Text style={styles.catChipIcon}>{cat.icon}</Text>
                    <Text style={[styles.catChipText, { color: selected ? '#FFF' : theme.text }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={form.amount}
              onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Period</Text>
            <View style={styles.periodRow}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodChip,
                    {
                      backgroundColor: form.period === p ? theme.primary : theme.background,
                      borderColor: form.period === p ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, period: p }))}
                >
                  <Text style={{ color: form.period === p ? '#FFF' : theme.text, fontSize: 14, fontWeight: '600' }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onPress={handleSave} style={{ flex: 1 }}>
                {editing ? 'Update' : 'Create'}
              </Button>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  budgetCard: { marginBottom: 0 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 24 },
  catName: { fontSize: 15, fontWeight: '600' },
  period: { fontSize: 12, marginTop: 1 },
  iconBtn: { padding: 4 },
  amounts: { flexDirection: 'row', justifyContent: 'space-between' },
  amtLabel: { fontSize: 11 },
  amtValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  alertText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  chipScroll: { marginBottom: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    gap: 6,
  },
  catChipIcon: { fontSize: 16 },
  catChipText: { fontSize: 13, fontWeight: '600' },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 4,
  },
  periodRow: { flexDirection: 'row', gap: 10 },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

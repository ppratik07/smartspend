import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useAppStore } from '../../store/appStore';
import { AmountInput } from '../../components/ui/AmountInput';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { QUICK_CATEGORIES } from '../../constants/data';

type TransactionType = 'EXPENSE' | 'INCOME';

export default function AddTransactionScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { accounts, categories, fetchAccounts, fetchCategories } = useAppStore();

  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  const allCategories = categories.length > 0 ? categories : QUICK_CATEGORIES;
  const selectedCategoryObj = allCategories.find((c) => c.id === selectedCategory);
  const selectedAccountObj = accounts.find((a) => a.id === selectedAccount);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('Account Required', 'Please select an account');
      return;
    }

    setIsLoading(true);
    try {
      await addTransaction({
        type: txType,
        amount: parseFloat(amount),
        currency: user?.currency || 'USD',
        categoryId: selectedCategory,
        accountId: selectedAccount,
        date,
        notes: notes.trim() || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Reset
      setAmount('');
      setSelectedCategory(null);
      setNotes('');
      Alert.alert('Success', 'Transaction saved!');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save'
          : 'Failed to save transaction';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: theme.text }]}>Add Transaction</Text>

        {/* Type Toggle */}
        <View style={[styles.typeToggle, { backgroundColor: theme.border }]}>
          {(['EXPENSE', 'INCOME'] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeTab,
                txType === t && { backgroundColor: theme.card },
              ]}
              onPress={() => setTxType(t)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeTabText,
                  { color: txType === t ? theme.text : theme.textSecondary },
                  txType === t && { fontWeight: '700' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: theme.textMuted }]}>AMOUNT</Text>
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            currency={user?.currency}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
              <Text style={[styles.viewAll, { color: theme.accent }]}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {QUICK_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? theme.primarySurface : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={cat.icon as never}
                      size={24}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipLabel,
                        { color: isSelected ? theme.primary : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {selectedCategoryObj && !QUICK_CATEGORIES.find((q) => q.id === selectedCategoryObj.id) && (
                <View
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.primarySurface, borderColor: theme.primary, borderWidth: 1.5 },
                  ]}
                >
                  <Ionicons name={selectedCategoryObj.icon as never} size={24} color={theme.primary} />
                  <Text style={[styles.categoryChipLabel, { color: theme.primary, fontWeight: '700' }]}>
                    {selectedCategoryObj.name}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Date */}
        <View style={[styles.fieldRow, { borderBottomColor: theme.border }]}>
          <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>DATE</Text>
            <Text style={[styles.fieldValue, { color: theme.text }]}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.fieldRow, { borderBottomColor: theme.border }]}>
          <Ionicons name="pencil-outline" size={20} color={theme.textSecondary} />
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="What was this for?"
            containerStyle={{ flex: 1, marginBottom: 0 }}
            style={{ paddingVertical: 4 }}
          />
        </View>

        {/* Account & Receipt */}
        <View style={styles.bottomRow}>
          {/* Receipt button */}
          <TouchableOpacity
            style={[styles.receiptBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
          >
            <Ionicons name="camera-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>Receipt</Text>
          </TouchableOpacity>

          {/* Account selector */}
          <TouchableOpacity
            style={[styles.accountBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => setShowAccountModal(true)}
          >
            <View>
              <Text style={[styles.accountBtnLabel, { color: theme.textMuted }]}>ACCOUNT</Text>
              <Text style={[styles.accountBtnValue, { color: theme.primary }]}>
                {selectedAccountObj?.name || 'Select Account'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <Button
          title="Save Transaction"
          onPress={handleSave}
          loading={isLoading}
          size="lg"
          style={styles.saveBtn}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color="#FFF" />}
        />
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        />
        <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
          <FlatList
            data={allCategories}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.id;
              const color = (item as { color?: string }).color || theme.primary;
              return (
                <TouchableOpacity
                  style={[
                    styles.modalCatItem,
                    { backgroundColor: isSelected ? color + '20' : theme.surfaceSecondary },
                  ]}
                  onPress={() => {
                    setSelectedCategory(item.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={[styles.modalCatIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={item.icon as never} size={22} color={color} />
                  </View>
                  <Text style={[styles.modalCatLabel, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ padding: 8 }}
          />
        </View>
      </Modal>

      {/* Account Modal */}
      <Modal visible={showAccountModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountModal(false)}
        />
        <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Select Account</Text>
          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.accountRow,
                { borderBottomColor: theme.border },
                selectedAccount === acc.id && { backgroundColor: theme.primarySurface },
              ]}
              onPress={() => {
                setSelectedAccount(acc.id);
                setShowAccountModal(false);
              }}
            >
              <Ionicons name="wallet-outline" size={20} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.accountRowName, { color: theme.text }]}>{acc.name}</Text>
                <Text style={[styles.accountRowBalance, { color: theme.textSecondary }]}>
                  {acc.currency} {acc.balance.toFixed(2)}
                </Text>
              </View>
              {selectedAccount === acc.id && (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', paddingTop: 16, marginBottom: 16 },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  typeTabText: { fontSize: 14, letterSpacing: 0.5 },
  amountSection: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '600', marginBottom: 8 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  viewAll: { fontSize: 13, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  categoryChip: {
    width: 80,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryChipLabel: { fontSize: 12 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  fieldLabel: { fontSize: 11, letterSpacing: 1, fontWeight: '600' },
  fieldValue: { fontSize: 15, marginTop: 2 },
  bottomRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 20 },
  receiptBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  receiptLabel: { fontSize: 13 },
  accountBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  accountBtnLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  accountBtnValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  saveBtn: { borderRadius: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalCatItem: {
    flex: 1,
    margin: 5,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  modalCatIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCatLabel: { fontSize: 11, textAlign: 'center' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 2,
  },
  accountRowName: { fontSize: 15, fontWeight: '600' },
  accountRowBalance: { fontSize: 12, marginTop: 2 },
});

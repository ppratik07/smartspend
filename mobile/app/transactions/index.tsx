import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { TransactionItem } from '../../components/dashboard/TransactionItem';
import { Card } from '../../components/ui/Card';

type Filter = 'ALL' | 'INCOME' | 'EXPENSE';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { transactions, total, isLoading, fetchTransactions } = useTransactionStore();
  const [filter, setFilter] = useState<Filter>('ALL');

  const loadTransactions = (type?: Filter) => {
    const params: Record<string, string | number> = { limit: 30, page: 1 };
    if (type && type !== 'ALL') params.type = type;
    fetchTransactions(params);
  };

  useEffect(() => {
    loadTransactions(filter);
  }, [filter]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={[styles.filterRow, { backgroundColor: theme.background }]}>
        {(['ALL', 'INCOME', 'EXPENSE'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? theme.primary : theme.card,
                borderColor: filter === f ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === f ? '#FFF' : theme.textSecondary },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.totalCount, { color: theme.textSecondary }]}>{total} total</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadTransactions(filter)}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No transactions found
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.txCard} padding={0}>
            <View style={{ paddingHorizontal: 16 }}>
              <TransactionItem transaction={item} />
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  totalCount: { fontSize: 12, marginLeft: 'auto' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  txCard: { marginBottom: 0 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
});

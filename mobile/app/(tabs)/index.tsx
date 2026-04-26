import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useAppStore } from '../../store/appStore';
import { useReportStore } from '../../store/reportStore';
import { TransactionItem } from '../../components/dashboard/TransactionItem';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const { accounts, fetchAccounts } = useAppStore();
  const { summary, fetchAll } = useReportStore();

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchTransactions({ limit: 10 }),
        fetchAccounts(),
        fetchAll('monthly'),
      ]);
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const currency = user?.currency || 'USD';
  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.primary} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Good {getTimeOfDay()},
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.name?.split(' ')[0] || 'there'} 👋
            </Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={[styles.notifBtn, { backgroundColor: theme.card }]}>
              <Ionicons name="notifications-outline" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.primaryDark }]}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance, currency)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Ionicons name="arrow-down-circle-outline" size={16} color="#95D5B2" />
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(summary?.totalIncome ?? 0, currency)}
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: '#52B788' }]} />
            <View style={styles.balanceStat}>
              <Ionicons name="arrow-up-circle-outline" size={16} color="#E07A5F" />
              <View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(summary?.totalExpenses ?? 0, currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'add-circle', label: 'Add', onPress: () => router.push('/(tabs)/add') },
            { icon: 'bar-chart', label: 'Reports', onPress: () => router.push('/(tabs)/reports') },
            { icon: 'wallet', label: 'Budgets', onPress: () => router.push('/budgets') },
            { icon: 'trophy', label: 'Goals', onPress: () => router.push('/goals') },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { backgroundColor: theme.card }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.primarySurface }]}>
                <Ionicons name={action.icon as never} size={22} color={theme.primary} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.textSecondary }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Savings Snapshot */}
        {summary && (
          <Card style={styles.savingsCard}>
            <View style={styles.savingsRow}>
              <View>
                <Text style={[styles.savingsLabel, { color: theme.textSecondary }]}>Monthly Savings</Text>
                <Text style={[styles.savingsAmount, { color: theme.primary }]}>
                  {formatCurrency(summary.totalSavings, currency)}
                </Text>
              </View>
              <View style={[styles.efficiencyBadge, { backgroundColor: theme.accentSurface }]}>
                <Text style={[styles.efficiencyScore, { color: theme.accent }]}>
                  {summary.efficiencyScore}/100
                </Text>
                <Text style={[styles.efficiencyLabel, { color: theme.textSecondary }]}>Efficiency</Text>
              </View>
            </View>
            {summary.savingsChangePercent !== 0 && (
              <View style={styles.changeRow}>
                <Ionicons
                  name={summary.savingsChangePercent > 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={summary.savingsChangePercent > 0 ? theme.income : theme.expense}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: summary.savingsChangePercent > 0 ? theme.income : theme.expense },
                  ]}
                >
                  {Math.abs(summary.savingsChangePercent)}% from last month
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No transactions yet. Add your first one!
            </Text>
          </Card>
        ) : (
          <Card style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onPress={() => {}}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  greeting: { fontSize: 13 },
  userName: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  topBarRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: { color: '#95D5B2', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  statLabel: { color: '#95D5B2', fontSize: 11 },
  statValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  divider: { width: 1, height: 32, opacity: 0.4 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, fontWeight: '600' },
  savingsCard: { marginBottom: 20 },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  savingsLabel: { fontSize: 12, marginBottom: 4 },
  savingsAmount: { fontSize: 22, fontWeight: '800' },
  efficiencyBadge: { padding: 12, borderRadius: 14, alignItems: 'center' },
  efficiencyScore: { fontSize: 18, fontWeight: '800' },
  efficiencyLabel: { fontSize: 10, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  changeText: { fontSize: 12, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', padding: 32, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

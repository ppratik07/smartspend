import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartesianChart, Bar, useChartPressState } from 'victory-native';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useReportStore } from '../../store/reportStore';
import { PeriodToggle } from '../../components/ui/PeriodToggle';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';

export default function ReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary, trend, categoryBreakdown, selectedPeriod, isLoading, setPeriod, fetchAll } =
    useReportStore();

  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchAll(selectedPeriod);
  }, []);

  const { state: pressState, isActive } = useChartPressState({ x: '', y: { amount: 0 } });

  const trendData = trend.map((d) => ({ x: d.label, amount: d.amount }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.pageTitle, { color: theme.text }]}>Reports & Analytics</Text>

        {/* Period Toggle */}
        <PeriodToggle selected={selectedPeriod} onChange={(p) => setPeriod(p)} />

        {isLoading && (
          <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: 32 }} />
        )}

        {!isLoading && summary && (
          <>
            {/* Total Savings Card */}
            <View style={[styles.savingsCard, { backgroundColor: theme.primaryDark }]}>
              <Text style={styles.savingsCardLabel}>TOTAL SAVINGS</Text>
              <Text style={styles.savingsCardAmount}>
                {formatCurrency(summary.totalSavings, currency)}
              </Text>
              {summary.savingsChangePercent !== 0 && (
                <View style={styles.savingsChangeRow}>
                  <Ionicons
                    name={summary.savingsChangePercent > 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color="#95D5B2"
                  />
                  <Text style={styles.savingsChangeText}>
                    {Math.abs(summary.savingsChangePercent)}% from last month
                  </Text>
                </View>
              )}
            </View>

            {/* Efficiency Score Card */}
            <View style={[styles.efficiencyCard, { backgroundColor: theme.accentSurface }]}>
              <Text style={[styles.efficiencyLabel, { color: theme.accent }]}>EFFICIENCY SCORE</Text>
              <Text style={[styles.efficiencyScore, { color: theme.text }]}>
                {summary.efficiencyScore}/100
              </Text>
              <Text style={[styles.efficiencySubtitle, { color: theme.textSecondary }]}>
                {getEfficiencyMessage(summary.efficiencyScore)}
              </Text>
            </View>

            {/* Spending Trend */}
            <Card style={styles.trendCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Spending Trend</Text>
              {trendData.length > 0 ? (
                <View style={{ height: 200 }}>
                  <CartesianChart
                    data={trendData}
                    xKey="x"
                    yKeys={['amount']}
                    chartPressState={pressState}
                    domainPadding={{ left: 20, right: 20, top: 20 }}
                    axisOptions={{
                      font: null,
                      labelColor: theme.textSecondary,
                      lineColor: theme.border,
                    }}
                  >
                    {({ points, chartBounds }) => (
                      <Bar
                        points={points.amount}
                        chartBounds={chartBounds}
                        color={theme.primary}
                        roundedCorners={{ topLeft: 4, topRight: 4 }}
                        animate={{ type: 'spring' }}
                      />
                    )}
                  </CartesianChart>
                  {isActive && (
                    <View
                      style={[
                        styles.tooltip,
                        { backgroundColor: theme.text },
                      ]}
                    >
                      <Text style={[styles.tooltipText, { color: theme.card }]}>
                        {formatCurrency(pressState.y.amount.value, currency)}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={[styles.emptyChartText, { color: theme.textSecondary }]}>
                    No spending data for this period
                  </Text>
                </View>
              )}
            </Card>

            {/* Top Categories */}
            <Card style={styles.categoriesCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Top Categories</Text>
              {categoryBreakdown.slice(0, 3).map((item) => (
                <View key={item.categoryId} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: (item.category?.color || theme.primary) + '25' },
                    ]}
                  >
                    <Ionicons
                      name={(item.category?.icon as never) || 'ellipsis-horizontal'}
                      size={18}
                      color={item.category?.color || theme.primary}
                    />
                  </View>
                  <View style={styles.catDetails}>
                    <View style={styles.catRow}>
                      <Text style={[styles.catName, { color: theme.text }]}>
                        {item.category?.name || 'Uncategorized'}
                      </Text>
                      <Text style={[styles.catAmount, { color: theme.text }]}>
                        {formatCurrency(item.amount, currency)}
                      </Text>
                    </View>
                    <Text style={[styles.catPercent, { color: theme.textSecondary }]}>
                      {item.percentOfTotal}% of total
                    </Text>
                    <ProgressBar
                      percent={item.percentOfTotal}
                      color={item.category?.color || theme.primary}
                      height={5}
                      style={{ marginTop: 6 }}
                    />
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.viewAllBtn, { borderColor: theme.border }]}
                onPress={() => router.push('/categories')}
              >
                <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>
                  View all categories
                </Text>
              </TouchableOpacity>
            </Card>

            {/* Income vs Expense Summary */}
            <View style={styles.summaryRow}>
              <Card style={[styles.summaryCard, { flex: 1 }]}>
                <View style={[styles.summaryIconBg, { backgroundColor: theme.primarySurface }]}>
                  <Ionicons name="arrow-down-circle" size={20} color={theme.income} />
                </View>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Income</Text>
                <Text style={[styles.summaryAmount, { color: theme.income }]}>
                  {formatCurrency(summary.totalIncome, currency)}
                </Text>
              </Card>
              <Card style={[styles.summaryCard, { flex: 1 }]}>
                <View style={[styles.summaryIconBg, { backgroundColor: theme.errorSurface }]}>
                  <Ionicons name="arrow-up-circle" size={20} color={theme.expense} />
                </View>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Expenses</Text>
                <Text style={[styles.summaryAmount, { color: theme.expense }]}>
                  {formatCurrency(summary.totalExpenses, currency)}
                </Text>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getEfficiencyMessage(score: number): string {
  if (score >= 80) return "You're in the top 5% of savers.";
  if (score >= 60) return "You're doing better than average.";
  if (score >= 40) return "There's room to improve your savings.";
  return "Focus on reducing expenses.";
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', paddingTop: 16, marginBottom: 16 },
  savingsCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  savingsCardLabel: {
    color: '#95D5B2',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  savingsCardAmount: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginBottom: 8 },
  savingsChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savingsChangeText: { color: '#95D5B2', fontSize: 12 },
  efficiencyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  efficiencyLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', marginBottom: 6 },
  efficiencyScore: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  efficiencySubtitle: { fontSize: 13 },
  trendCard: { marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  tooltip: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: { fontSize: 12, fontWeight: '700' },
  emptyChart: { height: 120, alignItems: 'center', justifyContent: 'center' },
  emptyChartText: { fontSize: 13 },
  categoriesCard: { marginBottom: 12 },
  categoryItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catDetails: { flex: 1 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  catName: { fontSize: 14, fontWeight: '600' },
  catAmount: { fontSize: 14, fontWeight: '700' },
  catPercent: { fontSize: 12 },
  viewAllBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  viewAllText: { fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { alignItems: 'flex-start', gap: 6 },
  summaryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: { fontSize: 12 },
  summaryAmount: { fontSize: 18, fontWeight: '800' },
});

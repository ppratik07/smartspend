import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDateShort } from '../../utils/format';

export default function GoalDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const currency = user?.currency ?? 'USD';
  const { goals, updateGoal, deleteGoal } = useAppStore();

  const goal = goals.find((g) => g.id === id);
  const [addAmount, setAddAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.text }]}>Goal not found.</Text>
          <Button variant="outline" onPress={() => router.back()} style={{ marginTop: 16 }}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const pct = Math.min(((goal as any).progressPercent ?? ((goal.savedAmount / goal.targetAmount) * 100)), 100);
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

  async function handleAddFunds() {
    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid amount');
      return;
    }
    setIsSaving(true);
    await updateGoal(goal.id, { savedAmount: goal.savedAmount + amt });
    setAddAmount('');
    setIsSaving(false);
  }

  function confirmDelete() {
    Alert.alert('Delete Goal', 'Remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteGoal(goal.id); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header card */}
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.goalHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight ?? '#D1FAE5' }]}>
              <Ionicons name="flag" size={28} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalName, { color: theme.text }]}>{goal.name}</Text>
              {goal.targetDate && (
                <Text style={[styles.goalDate, { color: theme.textSecondary }]}>
                  Due: {formatDateShort(goal.targetDate)}
                </Text>
              )}
            </View>
          </View>

          <ProgressBar percent={pct} style={{ marginVertical: 16 }} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Saved</Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {formatCurrency(goal.savedAmount, currency)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Target</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(goal.targetAmount, currency)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Remaining</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(remaining, currency)}
              </Text>
            </View>
          </View>

          {pct >= 100 && (
            <View style={[styles.achievedBadge, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={{ color: '#059669', fontSize: 14, fontWeight: '700' }}>Goal achieved! 🎉</Text>
            </View>
          )}
        </Card>

        {/* Add Funds */}
        {pct < 100 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Funds</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Record money you've set aside toward this goal
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, marginTop: 12 },
              ]}
              value={addAmount}
              onChangeText={setAddAmount}
              keyboardType="decimal-pad"
              placeholder="Amount to add"
              placeholderTextColor={theme.textMuted}
            />
            <Button onPress={handleAddFunds} isLoading={isSaving} style={{ marginTop: 12 }}>
              Add Funds
            </Button>
          </Card>
        )}

        {/* Danger zone */}
        <Button variant="danger" onPress={confirmDelete}>
          Delete Goal
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: 20, fontWeight: '800' },
  goalDate: { fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  achievedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginTop: 14, alignSelf: 'flex-start' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, marginTop: 2 },
  textInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
});

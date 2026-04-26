import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/theme';
import { formatCurrency, getRelativeDate } from '../../utils/format';
import { Transaction } from '../../store/transactionStore';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const theme = useTheme();
  const isExpense = transaction.type === 'EXPENSE';
  const color = transaction.category?.color || theme.primary;

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: color + '20' }]}>
        <Ionicons
          name={(transaction.category?.icon as never) || 'receipt-outline'}
          size={20}
          color={color}
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
          {transaction.category?.name || 'Uncategorized'}
        </Text>
        {transaction.notes && (
          <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.notes}
          </Text>
        )}
        <Text style={[styles.date, { color: theme.textMuted }]}>
          {getRelativeDate(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          { color: isExpense ? theme.expense : theme.income },
        ]}
      >
        {isExpense ? '-' : '+'}
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});

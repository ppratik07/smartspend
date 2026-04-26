import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../constants/theme';
import { CURRENCY_SYMBOLS } from '../../constants/data';

interface AmountInputProps {
  value: string;
  onChangeText: (v: string) => void;
  currency?: string;
  style?: ViewStyle;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChangeText,
  currency = 'USD',
  style,
  placeholder = '0.00',
}: AmountInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const handleChange = (text: string) => {
    // Allow only numbers and single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChangeText(cleaned);
  };

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[styles.container, style]}>
        <Text style={[styles.symbol, { color: value ? theme.text : theme.textMuted }]}>
          {symbol}
        </Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: value ? theme.text : theme.textMuted }]}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          maxLength={10}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  symbol: {
    fontSize: 36,
    fontWeight: '300',
    marginRight: 4,
  },
  input: {
    fontSize: 48,
    fontWeight: '300',
    minWidth: 120,
    textAlign: 'left',
  },
});

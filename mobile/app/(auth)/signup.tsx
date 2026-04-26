import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CURRENCY_OPTIONS } from '../../constants/data';

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register(name.trim(), email.toLowerCase().trim(), password, currency);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed'
          : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Back + Title */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join SmartSpend and take control of your finances
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.name}
            />
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="name@example.com"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              secure
              error={errors.password}
            />

            {/* Currency Selector */}
            <Text style={[styles.currencyLabel, { color: theme.primary }]}>Base Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
              {CURRENCY_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyChip,
                    {
                      backgroundColor: currency === c.code ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setCurrency(c.code)}
                >
                  <Text
                    style={{
                      color: currency === c.code ? '#FFF' : theme.textSecondary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {c.code} {c.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.submitBtn}
              size="lg"
            />
          </View>

          <TouchableOpacity style={styles.loginRow} onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 16, width: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  currencyLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  currencyRow: { flexDirection: 'row', marginBottom: 20 },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  submitBtn: { marginTop: 4 },
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 14 },
});

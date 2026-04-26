import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed'
          : 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    }
  };

  const handleBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      Alert.alert('Biometric Unavailable', 'No biometrics enrolled on this device.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    if (result.success) {
      // If biometric succeeds and we have stored credentials, auto-login
      try {
        const { restoreSession } = useAuthStore.getState();
        const ok = await restoreSession();
        if (ok) {
          router.replace('/(tabs)');
        } else {
          Alert.alert('Session Expired', 'Please log in with your email and password.');
        }
      } catch {
        Alert.alert('Authentication Error', 'Please log in with your email and password.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoBox, { backgroundColor: '#0D1B2A' }]}>
              <Ionicons name="wallet" size={36} color="#F2CC8F" />
            </View>
            <Text style={[styles.welcome, { color: theme.primary }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Step into your circle of financial serenity.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
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

            <View>
              <View style={styles.passwordHeader}>
                <Text style={[styles.passwordLabel, { color: theme.primary }]}>Password</Text>
                <TouchableOpacity>
                  <Text style={[styles.forgot, { color: theme.accent }]}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secure
                error={errors.password}
              />
            </View>

            <Button title="Login" onPress={handleLogin} loading={isLoading} style={styles.loginBtn} size="lg" />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>Or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Biometric */}
            <TouchableOpacity
              style={[styles.biometricBtn, { borderColor: theme.border }]}
              onPress={handleBiometric}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={22} color={theme.text} />
              <Text style={[styles.biometricText, { color: theme.text }]}>Biometric Login</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity style={styles.signupRow} onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.signupText, { color: theme.textSecondary }]}>
              New to SmartSpend?{' '}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            {['PRIVACY', 'TERMS', 'SUPPORT'].map((item) => (
              <TouchableOpacity key={item}>
                <Text style={[styles.footerItem, { color: theme.textMuted }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcome: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center' },
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  passwordLabel: { fontSize: 14, fontWeight: '600' },
  forgot: { fontSize: 13, fontWeight: '600' },
  loginBtn: { marginTop: 8 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 13 },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  biometricText: { fontSize: 15, fontWeight: '600' },
  signupRow: { alignItems: 'center', marginBottom: 32 },
  signupText: { fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  footerItem: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
});

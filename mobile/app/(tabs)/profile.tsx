import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { CURRENCY_OPTIONS } from '../../constants/data';
import api from '../../services/api';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [isDark, setIsDark] = useState(user?.theme === 'dark');

  const handleThemeToggle = async (val: boolean) => {
    setIsDark(val);
    const newTheme = val ? 'dark' : 'light';
    updateUser({ theme: newTheme });
    await api.put('/api/auth/me', { theme: newTheme }).catch(() => {});
  };

  const handleCurrencyChange = async (code: string) => {
    updateUser({ currency: code });
    await api.put('/api/auth/me', { currency: code }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Profile</Text>

        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Appearance */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={theme.text} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDark ? '#FFF' : '#FFF'}
            />
          </View>
        </Card>

        {/* Currency */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CURRENCY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
            {CURRENCY_OPTIONS.map((c) => {
              const isSelected = user?.currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyChip,
                    { backgroundColor: isSelected ? theme.primary : theme.border },
                  ]}
                  onPress={() => handleCurrencyChange(c.code)}
                >
                  <Text style={[styles.currencyChipText, { color: isSelected ? '#FFF' : theme.textSecondary }]}>
                    {c.code} {c.symbol}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Links */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MANAGE</Text>
          {[
            { icon: 'wallet-outline', label: 'Budgets', route: '/budgets' },
            { icon: 'trophy-outline', label: 'Goals', route: '/goals' },
            { icon: 'list-outline', label: 'All Transactions', route: '/transactions' },
            { icon: 'grid-outline', label: 'Categories', route: '/categories' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
              onPress={() => router.push(item.route as never)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: theme.primarySurface }]}>
                  <Ionicons name={item.icon as never} size={18} color={theme.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.errorSurface, borderColor: theme.error + '40' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.textMuted }]}>SmartSpend v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', paddingTop: 16, marginBottom: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15 },
  menuIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyRow: { marginTop: 4 },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  currencyChipText: { fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12 },
});

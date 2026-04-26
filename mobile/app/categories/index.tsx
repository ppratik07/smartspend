import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { useTransactionStore, Category } from '../../store/transactionStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const EMOJI_OPTIONS = ['🍔', '🚗', '🏠', '💊', '🎬', '✈️', '📚', '💇', '🐾', '🏋️', '🎁', '💼', '💰', '🛒', '☕', '🎮', '📱', '🧾'];

export default function CategoriesScreen() {
  const theme = useTheme();
  const { categories: appCategories, fetchCategories, addCategory, deleteCategory } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '💰', color: '#2D6A4F' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate() {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return;
    }
    setIsLoading(true);
    await addCategory({ name: form.name.trim(), icon: form.icon, color: form.color });
    setIsLoading(false);
    setModalVisible(false);
    setForm({ name: '', icon: '💰', color: '#2D6A4F' });
  }

  function confirmDelete(cat: Category) {
    if (!cat.userId) {
      Alert.alert('System Category', 'Default categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete Category', `Remove "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  }

  const systemCats = appCategories.filter((c) => !c.userId);
  const userCats = appCategories.filter((c) => c.userId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <FlatList
        data={[{ key: 'content', systemCats, userCats }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchCategories} tintColor={theme.primary} />
        }
        renderItem={() => (
          <View>
            {/* Custom categories */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>My Categories</Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={() => { setForm({ name: '', icon: '💰', color: '#2D6A4F' }); setModalVisible(true); }}
              >
                <Ionicons name="add" size={16} color="#FFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {userCats.length === 0 ? (
              <Card style={{ marginBottom: 20 }}>
                <View style={styles.empty}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No custom categories. Add one above!
                  </Text>
                </View>
              </Card>
            ) : (
              <View style={styles.grid}>
                {userCats.map((cat) => (
                  <Card key={cat.id} style={styles.catCard} padding={12}>
                    <TouchableOpacity onLongPress={() => confirmDelete(cat)} style={styles.catCardInner}>
                      <Text style={styles.catIcon}>{cat.icon || '💰'}</Text>
                      <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>{cat.name}</Text>
                      <TouchableOpacity onPress={() => confirmDelete(cat)} style={styles.deleteBtn}>
                        <Ionicons name="close-circle" size={16} color={theme.danger} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Default categories */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Default Categories</Text>
            <View style={styles.grid}>
              {systemCats.map((cat) => (
                <Card key={cat.id} style={styles.catCard} padding={12}>
                  <View style={styles.catCardInner}>
                    <Text style={styles.catIcon}>{cat.icon || '💰'}</Text>
                    <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>{cat.name}</Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Category</Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Category name"
              placeholderTextColor={theme.textMuted}
              maxLength={32}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Icon</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[
                    styles.emojiBtn,
                    { backgroundColor: form.icon === em ? theme.primary + '33' : theme.background, borderColor: form.icon === em ? theme.primary : theme.border },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, icon: em }))}
                >
                  <Text style={styles.emojiText}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button onPress={handleCreate} isLoading={isLoading} style={{ flex: 1 }}>Create</Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: { width: '30%', marginBottom: 0 },
  catCardInner: { alignItems: 'center', gap: 4, position: 'relative' },
  catIcon: { fontSize: 26 },
  catName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  deleteBtn: { position: 'absolute', top: -4, right: -4 },
  empty: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  textInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});

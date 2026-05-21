import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../lib/db';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, radius, shadows, spacing } from '../../lib/theme';

const ROOM_ICONS = [
  '🛋️',
  '🛏️',
  '🍳',
  '🍽️',
  '🚿',
  '🧺',
  '📚',
  '🧰',
  '📦',
  '🚪',
  '🪴',
  '🎮',
];

export default function RoomsScreen() {
  const router = useRouter();
  const { rooms, containers, items, addRoom } = useInventory();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ROOM_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    setName('');
    setIcon(ROOM_ICONS[0]);
    setModalVisible(true);
  };

  const create = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give the room a name.');
      return;
    }
    setSaving(true);
    try {
      await addRoom({ name: name.trim(), icon });
      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Could not add room',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const sortedRooms = [...rooms].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedRooms}
        keyExtractor={(room) => room.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: room }) => {
          const itemCount = items.filter(
            (i) => i.roomId === room.id
          ).length;
          const containerCount = containers.filter(
            (c) => c.roomId === room.id
          ).length;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/room/${room.id}`)}
            >
              <Text style={styles.icon}>{room.icon}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomMeta}>
                  {containerCount} containers · {itemCount} items
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.border}
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="home-outline"
            title="No rooms yet"
            subtitle="Add a room to start organizing your home."
          />
        }
      />

      <Pressable style={styles.fab} onPress={openModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Room</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Room name (e.g. Kitchen)"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.modalLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {ROOM_ICONS.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.iconOption,
                    icon === option && styles.iconOptionActive,
                  ]}
                  onPress={() => setIcon(option)}
                >
                  <Text style={styles.iconText}>{option}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                label="Add Room"
                onPress={create}
                loading={saving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  roomMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chip,
  },
  iconText: {
    fontSize: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});

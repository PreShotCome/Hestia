import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../lib/db';
import { locationLabel } from '../../lib/format';
import ItemCard from '../../components/ItemCard';
import Button from '../../components/Button';
import { colors, radius, shadows, spacing } from '../../lib/theme';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rooms, containers, items, deleteRoom } = useInventory();

  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Room' }} />
        <Text style={styles.missingText}>This room no longer exists.</Text>
      </View>
    );
  }

  const roomContainers = containers
    .filter((c) => c.roomId === room.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const looseItems = items
    .filter((i) => i.roomId === room.id && !i.containerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const confirmDelete = () => {
    Alert.alert(
      'Delete room?',
      `"${room.name}" and all its containers and items will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRoom(room.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen
        options={{
          title: `${room.icon} ${room.name}`,
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={12}>
              <Ionicons
                name="trash-outline"
                size={22}
                color={colors.danger}
              />
            </Pressable>
          ),
        }}
      />

      <View style={styles.actions}>
        <Button
          label="Add Container"
          variant="secondary"
          onPress={() => router.push(`/container/new?roomId=${room.id}`)}
          style={styles.actionButton}
        />
        <Button
          label="Add Item"
          onPress={() => router.push(`/item/new?roomId=${room.id}`)}
          style={styles.actionButton}
        />
      </View>

      <Text style={styles.section}>Containers</Text>
      {roomContainers.length === 0 ? (
        <Text style={styles.hint}>No containers in this room yet.</Text>
      ) : (
        roomContainers.map((container) => {
          const count = items.filter(
            (i) => i.containerId === container.id
          ).length;
          return (
            <Pressable
              key={container.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/container/${container.id}`)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name="file-tray-stacked-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{container.name}</Text>
                <Text style={styles.cardMeta}>
                  {container.type} · {count} items
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.border}
              />
            </Pressable>
          );
        })
      )}

      <Text style={styles.section}>Loose items</Text>
      {looseItems.length === 0 ? (
        <Text style={styles.hint}>No loose items in this room.</Text>
      ) : (
        looseItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            location={locationLabel(item, rooms, containers)}
            onPress={() => router.push(`/item/${item.id}`)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.7,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});

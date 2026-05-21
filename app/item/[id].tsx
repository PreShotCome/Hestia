import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../lib/db';
import { isRemoteUri, locationLabel } from '../../lib/format';
import { deletePhoto, itemPhotoPath, uploadPhoto } from '../../lib/storage';
import ItemForm, { ItemFormValues } from '../../components/ItemForm';
import { colors, radius, spacing } from '../../lib/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    householdId,
    rooms,
    containers,
    items,
    allTags,
    updateItem,
    deleteItem,
  } = useInventory();
  const [editing, setEditing] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Item' }} />
        <Text style={styles.missingText}>This item no longer exists.</Text>
      </View>
    );
  }

  const saveEdit = async (values: ItemFormValues) => {
    let photoUrl = item.photoUrl;
    if (values.photo === null) {
      if (item.photoUrl && householdId) {
        await deletePhoto(itemPhotoPath(householdId, item.id));
      }
      photoUrl = null;
    } else if (!isRemoteUri(values.photo) && householdId) {
      photoUrl = await uploadPhoto(
        values.photo,
        itemPhotoPath(householdId, item.id)
      );
    }
    await updateItem(item.id, {
      name: values.name,
      notes: values.notes,
      quantity: values.quantity,
      roomId: values.roomId,
      containerId: values.containerId,
      tags: values.tags,
      photoUrl,
    });
    setEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete item?', `"${item.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (item.photoUrl && householdId) {
            await deletePhoto(itemPhotoPath(householdId, item.id));
          }
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);
  };

  if (editing) {
    return (
      <>
        <Stack.Screen
          options={{ title: 'Edit Item', headerRight: undefined }}
        />
        <ItemForm
          rooms={rooms}
          containers={containers}
          allTags={allTags}
          submitLabel="Save Changes"
          initial={{
            name: item.name,
            quantity: item.quantity,
            roomId: item.roomId,
            containerId: item.containerId,
            tags: item.tags,
            notes: item.notes,
            photo: item.photoUrl,
          }}
          onSubmit={saveEdit}
        />
      </>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen
        options={{
          title: item.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => setEditing(true)} hitSlop={12}>
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={colors.text}
                />
              </Pressable>
              <Pressable onPress={confirmDelete} hitSlop={12}>
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.danger}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      {item.photoUrl ? (
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.photo}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="cube-outline" size={48} color={colors.border} />
        </View>
      )}

      <View style={styles.titleRow}>
        <Text style={styles.name}>{item.name}</Text>
        {item.quantity > 1 ? (
          <Text style={styles.quantity}>×{item.quantity}</Text>
        ) : null}
      </View>

      <Pressable
        style={styles.locationCard}
        onPress={() => router.push(`/room/${item.roomId}`)}
      >
        <Ionicons name="location-outline" size={20} color={colors.primary} />
        <Text style={styles.locationText}>
          {locationLabel(item, rooms, containers)}
        </Text>
      </Pressable>

      {item.tags.length > 0 ? (
        <>
          <Text style={styles.section}>Tags</Text>
          <View style={styles.tagRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {item.notes ? (
        <>
          <Text style={styles.section}>Notes</Text>
          <Text style={styles.notes}>{item.notes}</Text>
        </>
      ) : null}
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
    gap: spacing.sm,
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  locationText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: colors.text,
  },
  notes: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});

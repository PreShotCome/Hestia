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
import { containerPhotoPath, deletePhoto, uploadPhoto } from '../../lib/storage';
import ContainerForm, {
  ContainerFormValues,
} from '../../components/ContainerForm';
import ItemCard from '../../components/ItemCard';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../lib/theme';

export default function ContainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    householdId,
    rooms,
    containers,
    items,
    updateContainer,
    deleteContainer,
  } = useInventory();
  const [editing, setEditing] = useState(false);

  const container = containers.find((c) => c.id === id);

  if (!container) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Container' }} />
        <Text style={styles.missingText}>
          This container no longer exists.
        </Text>
      </View>
    );
  }

  const room = rooms.find((r) => r.id === container.roomId);
  const containerItems = items
    .filter((i) => i.containerId === container.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const saveEdit = async (values: ContainerFormValues) => {
    let photoUrl = container.photoUrl;
    if (values.photo === null) {
      if (container.photoUrl && householdId) {
        await deletePhoto(containerPhotoPath(householdId, container.id));
      }
      photoUrl = null;
    } else if (!isRemoteUri(values.photo) && householdId) {
      photoUrl = await uploadPhoto(
        values.photo,
        containerPhotoPath(householdId, container.id)
      );
    }
    await updateContainer(container.id, {
      name: values.name,
      type: values.type,
      photoUrl,
    });
    setEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete container?',
      `"${container.name}" will be removed. Items inside it stay in the room as loose items.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContainer(container.id);
            router.back();
          },
        },
      ]
    );
  };

  if (editing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Container', headerRight: undefined }} />
        <ContainerForm
          submitLabel="Save Changes"
          initial={{
            name: container.name,
            type: container.type,
            photo: container.photoUrl,
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
          title: container.name,
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

      {container.photoUrl ? (
        <Image
          source={{ uri: container.photoUrl }}
          style={styles.photo}
          contentFit="cover"
        />
      ) : null}

      <Text style={styles.name}>{container.name}</Text>
      <Text style={styles.meta}>
        {container.type} · {room?.icon} {room?.name ?? 'Unknown room'}
      </Text>

      <Button
        label="Add Item Here"
        onPress={() =>
          router.push(
            `/item/new?roomId=${container.roomId}&containerId=${container.id}`
          )
        }
        style={styles.addButton}
      />

      <Text style={styles.section}>Items ({containerItems.length})</Text>
      {containerItems.length === 0 ? (
        <Text style={styles.hint}>Nothing in this container yet.</Text>
      ) : (
        containerItems.map((item) => (
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
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 15,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  addButton: {
    marginTop: spacing.md,
  },
  section: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

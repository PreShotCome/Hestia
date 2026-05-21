import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Room } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import Button from './Button';
import PhotoPicker from './PhotoPicker';
import TagInput from './TagInput';

export interface ItemFormValues {
  name: string;
  quantity: number;
  roomId: string;
  containerId: string | null;
  tags: string[];
  notes: string;
  photo: string | null;
}

interface Props {
  rooms: Room[];
  containers: Container[];
  allTags: string[];
  submitLabel: string;
  initial?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}

export default function ItemForm({
  rooms,
  containers,
  allTags,
  submitLabel,
  initial,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [roomId, setRoomId] = useState(initial?.roomId ?? '');
  const [containerId, setContainerId] = useState<string | null>(
    initial?.containerId ?? null
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [saving, setSaving] = useState(false);

  const roomContainers = useMemo(
    () => containers.filter((c) => c.roomId === roomId),
    [containers, roomId]
  );

  const selectRoom = (id: string) => {
    setRoomId(id);
    setContainerId(null);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give the item a name.');
      return;
    }
    if (!roomId) {
      Alert.alert('Room required', 'Choose which room the item is in.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        quantity,
        roomId,
        containerId,
        tags,
        notes: notes.trim(),
        photo,
      });
    } catch (error) {
      Alert.alert(
        'Could not save',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Photo</Text>
        <PhotoPicker uri={photo} onChange={setPhoto} />

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Phone charger"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Quantity</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.stepValue}>{quantity}</Text>
          <Pressable
            style={styles.stepButton}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.label}>Room</Text>
        {rooms.length === 0 ? (
          <Text style={styles.hint}>
            Add a room first from the Rooms tab.
          </Text>
        ) : (
          <View style={styles.chipRow}>
            {rooms.map((room) => (
              <Pressable
                key={room.id}
                style={[
                  styles.chip,
                  roomId === room.id && styles.chipActive,
                ]}
                onPress={() => selectRoom(room.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    roomId === room.id && styles.chipTextActive,
                  ]}
                >
                  {room.icon} {room.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {roomId ? (
          <>
            <Text style={styles.label}>Container</Text>
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chip,
                  containerId === null && styles.chipActive,
                ]}
                onPress={() => setContainerId(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    containerId === null && styles.chipTextActive,
                  ]}
                >
                  Loose in room
                </Text>
              </Pressable>
              {roomContainers.map((container) => (
                <Pressable
                  key={container.id}
                  style={[
                    styles.chip,
                    containerId === container.id && styles.chipActive,
                  ]}
                  onPress={() => setContainerId(container.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      containerId === container.id &&
                        styles.chipTextActive,
                    ]}
                  >
                    {container.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.label}>Tags</Text>
        <TagInput tags={tags} onChange={setTags} suggestions={allTags} />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional details"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.notesInput]}
          multiline
        />

        <Button
          label={submitLabel}
          onPress={submit}
          loading={saving}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submit: {
    marginTop: spacing.xl,
  },
});

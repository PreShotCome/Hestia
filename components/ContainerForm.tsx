import { useState } from 'react';
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
import { CONTAINER_TYPES, ContainerType } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import Button from './Button';
import PhotoPicker from './PhotoPicker';

export interface ContainerFormValues {
  name: string;
  type: ContainerType;
  photo: string | null;
}

interface Props {
  submitLabel: string;
  initial?: Partial<ContainerFormValues>;
  onSubmit: (values: ContainerFormValues) => Promise<void>;
}

export default function ContainerForm({
  submitLabel,
  initial,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<ContainerType>(initial?.type ?? 'box');
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give the container a name.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), type, photo });
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
          placeholder="e.g. Top drawer, Blue bin"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {CONTAINER_TYPES.map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, type === option && styles.chipActive]}
              onPress={() => setType(option)}
            >
              <Text
                style={[
                  styles.chipText,
                  type === option && styles.chipTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

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
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submit: {
    marginTop: spacing.xl,
  },
});

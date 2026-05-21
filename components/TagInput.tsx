import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

function normalize(raw: string): string {
  return raw.trim().toLowerCase();
}

export default function TagInput({ tags, onChange, suggestions }: Props) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = normalize(raw);
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const matches = suggestions
    .filter((s) => !tags.includes(s))
    .filter((s) => (draft ? s.includes(normalize(draft)) : true))
    .slice(0, 8);

  return (
    <View style={styles.container}>
      {tags.length > 0 ? (
        <View style={styles.chipRow}>
          {tags.map((tag) => (
            <Pressable
              key={tag}
              style={[styles.chip, styles.activeChip]}
              onPress={() => removeTag(tag)}
            >
              <Text style={styles.activeChipText}>{tag}</Text>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a tag (e.g. tools, winter)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          onSubmitEditing={() => addTag(draft)}
          returnKeyType="done"
        />
        <Pressable
          style={styles.addButton}
          onPress={() => addTag(draft)}
          disabled={!draft.trim()}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {matches.length > 0 ? (
        <View style={styles.chipRow}>
          {matches.map((s) => (
            <Pressable
              key={s}
              style={styles.chip}
              onPress={() => addTag(s)}
            >
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  activeChip: {
    backgroundColor: colors.chipActive,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
  },
  activeChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

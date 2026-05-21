import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../lib/db';
import { locationLabel } from '../../lib/format';
import ItemCard from '../../components/ItemCard';
import EmptyState from '../../components/EmptyState';
import { colors, radius, spacing } from '../../lib/theme';

type SortKey = 'name' | 'updated' | 'tag';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'updated', label: 'Recent' },
  { key: 'tag', label: 'Tag' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { items, rooms, containers, allTags, loading } = useInventory();
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.includes(q));
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) => item.tags.includes(tag));
      return matchesQuery && matchesTags;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'updated') {
        return b.updatedAt - a.updatedAt;
      }
      if (sortBy === 'tag') {
        const aTag = a.tags[0] ?? '~';
        const bTag = b.tags[0] ?? '~';
        if (aTag !== bTag) return aTag.localeCompare(bTag);
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [items, query, activeTags, sortBy]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search items, notes, tags"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.controlLabel}>Sort</Text>
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.sortChip,
              sortBy === option.key && styles.sortChipActive,
            ]}
            onPress={() => setSortBy(option.key)}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === option.key && styles.sortChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {allTags.length > 0 ? (
        <View style={styles.tagFilter}>
          {allTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <Pressable
                key={tag}
                style={[styles.tagChip, active && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    active && styles.tagChipTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            location={locationLabel(item, rooms, containers)}
            onPress={() => router.push(`/item/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          loading ? null : items.length === 0 ? (
            <EmptyState
              icon="cube-outline"
              title="No items yet"
              subtitle="Add your first item from the Add tab."
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No matches"
              subtitle="Try a different search or tag."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  controlLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  sortChipActive: {
    backgroundColor: colors.chipActive,
  },
  sortChipText: {
    fontSize: 13,
    color: colors.text,
  },
  sortChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tagFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActive,
  },
  tagChipText: {
    fontSize: 13,
    color: colors.text,
  },
  tagChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});

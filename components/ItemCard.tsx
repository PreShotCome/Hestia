import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../lib/types';
import { colors, radius, shadows, spacing } from '../lib/theme';

interface Props {
  item: Item;
  location: string;
  onPress: () => void;
}

export default function ItemCard({ item, location, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumb}>
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.thumbImage}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="cube-outline" size={26} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.quantity > 1 ? (
            <Text style={styles.quantity}>×{item.quantity}</Text>
          ) : null}
        </View>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
        {item.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quantity: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  location: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

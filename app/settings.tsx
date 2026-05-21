import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { useInventory } from '../lib/db';
import Button from '../components/Button';
import { colors, radius, spacing } from '../lib/theme';

export default function SettingsScreen() {
  const { user, userDoc, signOut } = useAuth();
  const { household, items, rooms } = useInventory();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Household</Text>
        <Text style={styles.cardValue}>{household?.name ?? '—'}</Text>
        <Text style={styles.cardSub}>
          {household?.memberIds.length ?? 0} member(s) · {rooms.length} rooms ·{' '}
          {items.length} items
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Invite code</Text>
        <Text style={styles.code}>{household?.inviteCode ?? '—'}</Text>
        <Text style={styles.cardSub}>
          Share this code with your partner. On the "Join" screen they enter it
          to access this same shared inventory.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{userDoc?.displayName ?? '—'}</Text>
        <Text style={styles.cardSub}>{user?.email}</Text>
      </View>

      <Button
        label="Sign Out"
        variant="danger"
        onPress={signOut}
        style={styles.signOut}
      />
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardSub: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  code: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 4,
    marginVertical: spacing.xs,
  },
  signOut: {
    marginTop: spacing.md,
  },
});

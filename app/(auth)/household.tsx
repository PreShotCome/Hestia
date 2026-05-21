import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { createHousehold, joinHousehold } from '../../lib/db';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../lib/theme';

type Mode = 'create' | 'join';

export default function HouseholdScreen() {
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('create');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (mode === 'create') {
        if (!householdName.trim()) {
          Alert.alert('Name required', 'Name your household.');
          return;
        }
        await createHousehold(user.uid, householdName);
      } else {
        if (!inviteCode.trim()) {
          Alert.alert('Code required', 'Enter the invite code.');
          return;
        }
        await joinHousehold(user.uid, inviteCode);
      }
    } catch (error) {
      Alert.alert(
        'Something went wrong',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Set up your home</Text>
          <Text style={styles.subtitle}>
            Create a new household, or join your partner's with their invite
            code. Everything you add is shared between both of you.
          </Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === 'create' && styles.tabActive]}
              onPress={() => setMode('create')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'create' && styles.tabTextActive,
                ]}
              >
                Create
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'join' && styles.tabActive]}
              onPress={() => setMode('join')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'join' && styles.tabTextActive,
                ]}
              >
                Join
              </Text>
            </Pressable>
          </View>

          {mode === 'create' ? (
            <TextInput
              value={householdName}
              onChangeText={setHouseholdName}
              placeholder="Household name (e.g. Our Apartment)"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          ) : (
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Invite code"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
            />
          )}

          <Button
            label={mode === 'create' ? 'Create Household' : 'Join Household'}
            onPress={submit}
            loading={loading}
            style={styles.submit}
          />

          <Pressable onPress={signOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
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
  submit: {
    marginTop: spacing.lg,
  },
  signOut: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});

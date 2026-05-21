import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import { InventoryProvider } from '../lib/db';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import { colors, spacing } from '../lib/theme';

function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function ConfigNotice() {
  return (
    <View style={[styles.centered, styles.notice]}>
      <Text style={styles.noticeTitle}>Hestia needs setup</Text>
      <Text style={styles.noticeText}>
        Open lib/firebaseConfig.ts and replace the placeholder values with your
        Firebase project's web config, then reload the app. See README.md for
        step-by-step instructions.
      </Text>
    </View>
  );
}

function RootNavigator() {
  const { user, userDoc, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!userDoc?.householdId) {
      if (segments.join('/') !== '(auth)/household') {
        router.replace('/(auth)/household');
      }
    } else if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, userDoc, initializing, segments, router]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="room/[id]" options={{ title: 'Room' }} />
      <Stack.Screen name="container/[id]" options={{ title: 'Container' }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

export default function RootLayout() {
  if (!isFirebaseConfigured) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ConfigNotice />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <InventoryProvider>
          <RootNavigator />
        </InventoryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notice: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  noticeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  noticeText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

import '../global.css';
import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { hasPin } from '@/lib/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [pinRequired, setPinRequired] = useState(false);
  const [pinPassed, setPinPassed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const pin = await hasPin();
      if (!mounted) return;
      setSession(data.session);
      setPinRequired(pin);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    const inUnlock = segments[0] === 'pin-unlock';

    if (!session && !inAuth) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (session && inAuth) {
      router.replace('/(tabs)');
      return;
    }
    if (session && pinRequired && !pinPassed && !inUnlock) {
      router.replace('/pin-unlock');
      return;
    }
    if (session && (!pinRequired || pinPassed) && inUnlock) {
      router.replace('/(tabs)');
    }
  }, [ready, session, pinRequired, pinPassed, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="pin-unlock" options={{ animation: 'fade' }} />
            <Stack.Screen name="pin-setup" options={{ presentation: 'modal' }} />
            <Stack.Screen name="country/[slug]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="compare" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="policy" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="experts" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="reports" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import '../global.css';
import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { hasPin } from '@/lib/auth';
import { ThemeProvider as AppThemeProvider } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 },
  },
});

type PinGateValue = { markPinPassed: () => void };
const PinGateContext = createContext<PinGateValue>({ markPinPassed: () => undefined });

export function usePinGate() {
  return useContext(PinGateContext);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [pinChecked, setPinChecked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const needsPin = data.session ? await hasPin() : false;
      if (!mounted) return;
      setSession(data.session);
      setPinChecked(!needsPin);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (event === 'SIGNED_OUT') {
        setPinChecked(false);
      } else if (event === 'SIGNED_IN' && s) {
        const needsPin = await hasPin();
        if (!needsPin) setPinChecked(true);
      }
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

    if (!session) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }
    if (inAuth) {
      router.replace('/(tabs)');
      return;
    }
    if (!pinChecked && !inUnlock) {
      router.replace('/pin-unlock');
      return;
    }
    if (pinChecked && inUnlock) {
      router.replace('/(tabs)');
    }
  }, [ready, session, pinChecked, segments, router]);

  const markPinPassed = useCallback(() => setPinChecked(true), []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <PinGateContext.Provider value={{ markPinPassed }}>{children}</PinGateContext.Provider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
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
            <Stack.Screen name="themes" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="insights" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="resources/glossary" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="resources/faq" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="resources/methodology" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="change-password" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

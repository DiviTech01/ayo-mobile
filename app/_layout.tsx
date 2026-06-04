import '../global.css';
import 'react-native-reanimated';

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
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

import { supabase } from '@/lib/supabase';
import { hasPin } from '@/lib/auth';
import { ThemeProvider as AppThemeProvider } from '@/lib/theme';
import { initNotifications } from '@/lib/notifications';
import { initLanguage } from '@/lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 },
  },
});

// App is dark-only. A single dark surface colour reused for the navigation
// theme, every screen's contentStyle, and the boot/splash views so screen
// transitions never flash white.
const APP_BG = 'hsl(224, 40%, 6%)';

const NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: APP_BG,
    card: 'hsl(224, 40%, 9%)',
    border: 'hsl(224, 25%, 18%)',
    text: 'hsl(210, 40%, 96%)',
    primary: 'hsl(142, 65%, 45%)',
  },
};

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: APP_BG,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <PinGateContext.Provider value={{ markPinPassed }}>{children}</PinGateContext.Provider>
  );
}

export default function RootLayout() {
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

  useEffect(() => {
    initLanguage().catch(() => undefined);
    initNotifications().catch(() => undefined);
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: APP_BG,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
      <ThemeProvider value={NAV_THEME}>
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: APP_BG },
              // Instant transitions, no white reveal on back. Both screens
              // share APP_BG so there is never an unpainted frame.
              animation: 'none',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="pin-unlock" />
            <Stack.Screen name="pin-setup" options={{ presentation: 'modal' }} />
            <Stack.Screen name="country/[slug]" />
            <Stack.Screen name="compare" />
            <Stack.Screen name="policy" />
            <Stack.Screen name="experts" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="themes" />
            <Stack.Screen name="insights" />
            <Stack.Screen name="resources/glossary" />
            <Stack.Screen name="resources/faq" />
            <Stack.Screen name="resources/methodology" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="language" />
            <Stack.Screen name="about" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

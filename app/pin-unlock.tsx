import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '@/components/PinPad';
import {
  authenticateWithBiometrics,
  isBiometricEnabled,
  signOut,
  verifyPin,
} from '@/lib/auth';
import { useThemeColors } from '@/lib/theme-colors';
import { usePinGate } from './_layout';

export default function PinUnlockScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { markPinPassed } = usePinGate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bioReady, setBioReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (await isBiometricEnabled()) {
        setBioReady(true);
        const ok = await authenticateWithBiometrics();
        if (ok) {
          markPinPassed();
          router.replace('/(tabs)');
        }
      }
    })();
  }, [router, markPinPassed]);

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin(pin).then((ok) => {
        if (ok) {
          markPinPassed();
          router.replace('/(tabs)');
        } else {
          setError('Wrong PIN');
          setPin('');
        }
      });
    } else {
      setError(null);
    }
  }, [pin, router, markPinPassed]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-12 items-center">
          <Text className="font-display text-3xl font-bold text-primary">AfYO</Text>
          <Text className="mt-3 text-base text-foreground">Enter your PIN</Text>
          {error && <Text className="mt-2 text-sm text-destructive">{error}</Text>}
        </View>

        <PinPad value={pin} onChange={setPin} />

        {bioReady && (
          <Pressable
            onPress={async () => {
              const ok = await authenticateWithBiometrics();
              if (ok) {
                markPinPassed();
                router.replace('/(tabs)');
              }
            }}
            className="mt-6 flex-row items-center gap-2"
          >
            <Ionicons name="finger-print" size={20} color={colors.primary} />
            <Text className="text-sm font-medium text-primary">Use biometrics</Text>
          </Pressable>
        )}

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          }}
          className="mt-12"
        >
          <Text className="text-sm text-muted-foreground">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

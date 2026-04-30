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

export default function PinUnlockScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bioReady, setBioReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (await isBiometricEnabled()) {
        setBioReady(true);
        const ok = await authenticateWithBiometrics();
        if (ok) router.replace('/(tabs)');
      }
    })();
  }, [router]);

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin(pin).then((ok) => {
        if (ok) {
          router.replace('/(tabs)');
        } else {
          setError('Wrong PIN');
          setPin('');
        }
      });
    } else {
      setError(null);
    }
  }, [pin, router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-12 items-center">
          <Text className="text-3xl font-bold text-pan-blue-700">AfYO</Text>
          <Text className="mt-3 text-base text-gray-700">Enter your PIN</Text>
          {error && <Text className="mt-2 text-sm text-pan-red-600">{error}</Text>}
        </View>

        <PinPad value={pin} onChange={setPin} />

        {bioReady && (
          <Pressable
            onPress={async () => {
              const ok = await authenticateWithBiometrics();
              if (ok) router.replace('/(tabs)');
            }}
            className="mt-6 flex-row items-center gap-2"
          >
            <Ionicons name="finger-print" size={20} color="#0369a1" />
            <Text className="text-sm font-medium text-pan-blue-600">Use biometrics</Text>
          </Pressable>
        )}

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          }}
          className="mt-12"
        >
          <Text className="text-sm text-gray-500">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

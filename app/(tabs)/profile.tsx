import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  biometricAvailable,
  clearPin,
  hasPin,
  isBiometricEnabled,
  setBiometricEnabled,
  signOut,
} from '@/lib/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [pinSet, setPinSet] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email ?? null);
    const meta = data.user?.user_metadata as { name?: string } | undefined;
    setName(meta?.name ?? null);
    setPinSet(await hasPin());
    setBioOn(await isBiometricEnabled());
    setBioSupported(await biometricAvailable());
  };

  useEffect(() => {
    refresh();
  }, []);

  const togglePin = async (value: boolean) => {
    if (value) {
      router.push('/pin-setup');
    } else {
      Alert.alert('Remove PIN?', 'You will sign in with your password each time.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await clearPin();
            await refresh();
          },
        },
      ]);
    }
  };

  const toggleBio = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBioOn(value);
  };

  const onSignOut = async () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-2xl font-semibold text-gray-900">Profile</Text>

        <View className="mt-6 rounded-2xl bg-gray-50 p-5">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-pan-blue-100">
            <Text className="text-2xl font-bold text-pan-blue-700">
              {(name ?? email ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="mt-3 text-lg font-semibold text-gray-900">{name ?? 'AfYO user'}</Text>
          <Text className="text-sm text-gray-500">{email ?? '—'}</Text>
        </View>

        <Text className="mt-8 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Security
        </Text>
        <View className="mt-3 rounded-2xl border border-gray-200">
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className="text-base text-gray-900">Require PIN to open app</Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                4-digit code, asked each time you open AfYO.
              </Text>
            </View>
            <Switch value={pinSet} onValueChange={togglePin} />
          </View>
          <View className="h-px bg-gray-100" />
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-1 pr-3">
              <Text
                className={`text-base ${bioSupported ? 'text-gray-900' : 'text-gray-400'}`}
              >
                Use Face ID / fingerprint
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {bioSupported
                  ? 'Faster than typing your PIN.'
                  : 'Not available on this device.'}
              </Text>
            </View>
            <Switch value={bioOn} onValueChange={toggleBio} disabled={!bioSupported || !pinSet} />
          </View>
        </View>

        <Pressable
          onPress={onSignOut}
          className="mt-8 rounded-xl border border-pan-red-200 bg-pan-red-50 py-3"
        >
          <Text className="text-center text-base font-semibold text-pan-red-700">Sign out</Text>
        </Pressable>

        <Text className="mt-8 text-center text-xs text-gray-400">AfYO v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

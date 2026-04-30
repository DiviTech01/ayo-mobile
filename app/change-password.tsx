import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => router.back(), 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
          <Text className="text-sm font-medium text-gray-900">Settings</Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900">Change password</Text>
        <View className="w-12" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-5">
          <View className="rounded-2xl border border-gray-200 bg-white p-5">
            <Text className="text-sm leading-5 text-gray-600">
              Enter a new password. You'll stay signed in on this device — other
              devices will need to sign in again.
            </Text>

            <View className="mt-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                New password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 8 characters"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Confirm new password
              </Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="Type it again"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              />
            </View>
          </View>

          {error ? (
            <View className="mt-3 rounded-lg bg-pan-red-50 px-3 py-2">
              <Text className="text-sm text-pan-red-700">{error}</Text>
            </View>
          ) : null}

          {saved ? (
            <View className="mt-3 rounded-lg bg-pan-green-50 px-3 py-2">
              <Text className="text-sm text-pan-green-700">Password updated.</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={busy || password.length < 8 || password !== confirm}
            className="mt-6 rounded-xl bg-pan-blue-600 py-3.5 disabled:opacity-50"
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Update password
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

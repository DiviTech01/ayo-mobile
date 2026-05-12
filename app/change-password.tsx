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
import { useThemeColors } from '@/lib/theme-colors';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-border bg-card px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text className="text-sm font-medium text-foreground">Settings</Text>
        </Pressable>
        <Text className="font-display text-base font-semibold text-foreground">
          Change password
        </Text>
        <View className="w-12" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-5">
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="text-sm leading-5 text-muted-foreground">
              Enter a new password. You&rsquo;ll stay signed in on this device — other devices
              will need to sign in again.
            </Text>

            <View className="mt-5">
              <Text className="mb-1.5 text-sm font-medium text-foreground">New password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 8 characters"
                placeholderTextColor={colors.mutedForeground}
                className="rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                Confirm new password
              </Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="Type it again"
                placeholderTextColor={colors.mutedForeground}
                className="rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground"
              />
            </View>
          </View>

          {error ? (
            <View className="mt-3 rounded-lg bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}

          {saved ? (
            <View className="mt-3 rounded-lg bg-primary/10 px-3 py-2">
              <Text className="text-sm text-primary">Password updated.</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={busy || password.length < 8 || password !== confirm}
            className="mt-6 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="text-center text-base font-semibold text-primary-foreground">
                Update password
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

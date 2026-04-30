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
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('not verified')) {
        await supabase.auth.resend({ type: 'signup', email }).catch(() => undefined);
        router.push({ pathname: '/(auth)/verify-otp', params: { email } });
        return;
      }
      setError(error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text className="text-3xl font-bold text-pan-blue-700">AfYO</Text>
            <Text className="mt-2 text-base text-gray-500">
              African Youth Observatory
            </Text>
          </View>

          <Text className="text-2xl font-semibold text-gray-900">Welcome back</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Sign in to continue to your dashboard.
          </Text>

          <View className="mt-8 space-y-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              />
            </View>

            {error && (
              <View className="rounded-lg bg-pan-red-50 px-3 py-2">
                <Text className="text-sm text-pan-red-700">{error}</Text>
              </View>
            )}

            <Pressable
              onPress={onSubmit}
              disabled={busy || !email || !password}
              className="mt-2 rounded-xl bg-pan-blue-600 py-3.5 disabled:opacity-50"
            >
              {busy ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">Sign in</Text>
              )}
            </Pressable>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable className="py-2">
                <Text className="text-center text-sm text-pan-blue-600">Forgot password?</Text>
              </Pressable>
            </Link>
          </View>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-sm text-gray-500">Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-pan-blue-600">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

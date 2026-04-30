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
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email },
      });
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
            <Text className="mt-2 text-base text-gray-500">Create your account</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Full name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              />
            </View>

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
                placeholder="At least 8 characters"
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
              disabled={busy || !name || !email || password.length < 8}
              className="mt-2 rounded-xl bg-pan-blue-600 py-3.5 disabled:opacity-50"
            >
              {busy ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  Create account
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="mx-3 text-xs uppercase tracking-wider text-gray-400">or</Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>

          <View className="mt-6">
            <GoogleSignInButton
              label="Sign up with Google"
              onError={(msg) => setError(msg)}
              onSuccess={() => router.replace('/(tabs)')}
            />
          </View>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-sm text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-pan-blue-600">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

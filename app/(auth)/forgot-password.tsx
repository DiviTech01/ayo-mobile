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
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
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
            <Text className="mt-2 text-base text-gray-500">Reset your password</Text>
          </View>

          {sent ? (
            <View className="rounded-xl bg-pan-green-50 p-4">
              <Text className="text-base font-medium text-pan-green-800">
                Check your inbox
              </Text>
              <Text className="mt-1 text-sm text-pan-green-700">
                We sent a reset link to {email}.
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
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
                disabled={busy || !email}
                className="mt-2 rounded-xl bg-pan-blue-600 py-3.5 disabled:opacity-50"
              >
                {busy ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-base font-semibold text-white">
                    Send reset link
                  </Text>
                )}
              </Pressable>
            </View>
          )}

          <View className="mt-10">
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="text-center text-sm text-pan-blue-600">Back to sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

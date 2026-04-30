import { useEffect, useRef, useState } from 'react';
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
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_S = 30;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (token: string) => {
    if (!email) {
      setError('Missing email — go back and try sign-up again.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      setCode('');
      return;
    }
    router.replace('/(tabs)');
  };

  const onChangeCode = (next: string) => {
    const digits = next.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) {
      submit(digits);
    }
  };

  const onResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo('A new code is on its way.');
    setCooldown(RESEND_COOLDOWN_S);
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
            <Text className="text-3xl font-bold text-primary">AfYO</Text>
            <Text className="mt-2 text-base text-gray-500">Verify your email</Text>
          </View>

          <Text className="text-2xl font-semibold text-gray-900">Check your inbox</Text>
          <Text className="mt-2 text-sm text-gray-500">
            We sent a 6-digit code to{'\n'}
            <Text className="font-medium text-gray-800">{email ?? 'your email'}</Text>
          </Text>

          <View className="mt-8">
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#d1d5db"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-3xl font-semibold tracking-[12px] text-gray-900"
            />

            {busy && (
              <View className="mt-3 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#0369a1" />
                <Text className="ml-2 text-sm text-gray-500">Verifying…</Text>
              </View>
            )}

            {error && (
              <View className="mt-3 rounded-lg bg-pan-red-50 px-3 py-2">
                <Text className="text-sm text-pan-red-700">{error}</Text>
              </View>
            )}

            {info && !error && (
              <View className="mt-3 rounded-lg bg-pan-green-50 px-3 py-2">
                <Text className="text-sm text-pan-green-700">{info}</Text>
              </View>
            )}
          </View>

          <View className="mt-8 items-center">
            <Pressable onPress={onResend} disabled={cooldown > 0 || resending}>
              <Text
                className={
                  cooldown > 0 || resending
                    ? 'text-sm text-gray-400'
                    : 'text-sm font-medium text-primary'
                }
              >
                {resending
                  ? 'Sending…'
                  : cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : 'Resend code'}
              </Text>
            </Pressable>
          </View>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-sm text-gray-500">Wrong email? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-primary">Start over</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

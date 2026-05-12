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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { AuthHeader } from '@/components/AuthHeader';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useThemeColors } from '@/lib/theme-colors';
import { notifyError, notifySuccess } from '@/lib/haptics';

const RESEND_COOLDOWN_S = 30;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
      notifyError();
      setError(error.message);
      setCode('');
      return;
    }
    notifySuccess();
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
      notifyError();
      setError(error.message);
      return;
    }
    notifySuccess();
    setInfo('A new code is on its way.');
    setCooldown(RESEND_COOLDOWN_S);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AmbientBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pt-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Verify your email"
            subtitle={`We sent a 6-digit code to ${email ?? 'your email'}. Enter it to finish setting up your account.`}
          />

          <View className="mt-10">
            <Pressable
              onPress={() => inputRef.current?.focus()}
              className="rounded-xl border border-border bg-muted px-4 py-5"
            >
              <Text className="text-center font-display text-3xl font-semibold tracking-[14px] text-foreground tabular-nums">
                {code.padEnd(6, '•')}
              </Text>
            </Pressable>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
            />

            {busy ? (
              <View className="mt-4 flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-sm text-muted-foreground">Verifying…</Text>
              </View>
            ) : null}

            {error ? (
              <View className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            {info && !error ? (
              <View className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5">
                <Text className="text-sm text-primary">{info}</Text>
              </View>
            ) : null}
          </View>

          <View className="mt-8 items-center">
            <Pressable
              onPress={onResend}
              disabled={cooldown > 0 || resending}
              hitSlop={6}
              className="flex-row items-center gap-1.5"
            >
              <Ionicons
                name="refresh-outline"
                size={14}
                color={cooldown > 0 || resending ? colors.mutedForeground : colors.primary}
              />
              <Text
                className={
                  cooldown > 0 || resending
                    ? 'text-sm text-muted-foreground'
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
            <Text className="text-sm text-muted-foreground">Wrong email? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={6}>
                <Text className="text-sm font-semibold text-primary">Start over</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

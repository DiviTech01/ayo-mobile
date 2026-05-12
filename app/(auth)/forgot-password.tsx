import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { AuthHeader } from '@/components/AuthHeader';
import { AuthInput } from '@/components/AuthInput';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useThemeColors } from '@/lib/theme-colors';
import { notifyError, notifySuccess } from '@/lib/haptics';

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
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
      notifyError();
      setError(error.message);
      return;
    }
    notifySuccess();
    setSent(true);
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
            title={sent ? 'Check your inbox' : 'Reset your password'}
            subtitle={
              sent
                ? `We sent a reset link to ${email}. Tap the link to set a new password, then sign back in.`
                : 'Enter your account email. We&rsquo;ll send a link to reset your password.'
            }
          />

          {sent ? (
            <View className="mt-8 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3.5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-open-outline" size={18} color={colors.primary} />
                <Text className="text-sm font-semibold text-primary">Email sent</Text>
              </View>
              <Text className="mt-1.5 text-xs leading-5 text-foreground">
                Didn&rsquo;t arrive? Check spam, or wait a minute and tap below to resend.
              </Text>
              <Pressable
                onPress={() => {
                  setSent(false);
                  onSubmit();
                }}
                className="mt-3 self-start rounded-lg border border-border bg-card px-3 py-1.5 active:bg-muted"
              >
                <Text className="text-xs font-semibold text-foreground">Resend link</Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-8 gap-4">
              <AuthInput
                label="Email"
                leftIcon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                autoCorrect={false}
              />

              {error ? (
                <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                  <Text className="text-sm text-destructive">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={onSubmit}
                disabled={busy || !email}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
              >
                {busy ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Text className="text-base font-semibold text-primary-foreground">
                      Send reset link
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={colors.primaryForeground}
                    />
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View className="mt-10 items-center">
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={6} className="flex-row items-center gap-1">
                <Ionicons name="arrow-back" size={14} color={colors.primary} />
                <Text className="text-sm font-medium text-primary">Back to sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

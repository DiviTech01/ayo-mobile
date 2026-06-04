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
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { AuthHeader } from '@/components/AuthHeader';
import { AuthInput } from '@/components/AuthInput';
import { AmbientBackground } from '@/components/AmbientBackground';
import { LanguagePrompt } from '@/components/LanguagePrompt';
import { useThemeColors } from '@/lib/theme-colors';
import { notifyError, notifySuccess } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

export default function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
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
      notifyError();
      setError(error.message);
      return;
    }
    notifySuccess();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AmbientBackground />
      <LanguagePrompt />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pt-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title={t('auth.signIn')}
            subtitle={t('auth.signInDesc')}
          />

          <View className="mt-8 gap-4">
            <AuthInput
              label={t('auth.email')}
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              autoCorrect={false}
            />

            <AuthInput
              label={t('auth.password')}
              leftIcon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              placeholder={t('auth.passwordPlaceholder')}
              password
              rightAction={{
                label: t('auth.forgotPassword'),
                onPress: () => router.push('/(auth)/forgot-password'),
              }}
            />

            {error ? (
              <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={busy || !email || !password}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
            >
              {busy ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text className="text-base font-semibold text-primary-foreground">
                    {t('auth.signInCta')}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
                </>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('auth.orContinueWith')}
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="mt-4">
            <GoogleSignInButton
              onError={(msg) => {
                notifyError();
                setError(msg);
              }}
              onSuccess={() => {
                notifySuccess();
                router.replace('/(tabs)');
              }}
            />
          </View>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={6}>
                <Text className="text-sm font-semibold text-primary">
                  {t('auth.createAccount')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

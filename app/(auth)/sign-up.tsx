import { useMemo, useState } from 'react';
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
import { useThemeColors } from '@/lib/theme-colors';
import { notifyError, notifySuccess } from '@/lib/haptics';

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requirements = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains a number', met: /\d/.test(password) },
      { label: 'Contains an uppercase letter', met: /[A-Z]/.test(password) },
    ],
    [password],
  );
  const passwordValid = requirements.every((r) => r.met);

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
      notifyError();
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
    notifySuccess();
    router.replace('/(tabs)');
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
            title="Create your account"
            subtitle="Start exploring Africa&rsquo;s youth data today. It&rsquo;s free."
          />

          <View className="mt-6">
            <GoogleSignInButton
              label="Sign up with Google"
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

          <View className="mt-6 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              or continue with email
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="mt-6 gap-4">
            <AuthInput
              label="Full name"
              leftIcon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Jane Doe"
              autoCapitalize="words"
              autoComplete="name"
            />

            <AuthInput
              label="Email"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              autoCorrect={false}
            />

            <View>
              <AuthInput
                label="Password"
                leftIcon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                autoComplete="new-password"
                placeholder="Create a strong password"
                password
              />
              {password.length > 0 ? (
                <View className="mt-2.5 gap-1.5">
                  {requirements.map((r) => (
                    <View key={r.label} className="flex-row items-center gap-2">
                      <View
                        className={`h-4 w-4 items-center justify-center rounded-full ${
                          r.met ? 'bg-primary/15' : 'bg-muted'
                        }`}
                      >
                        {r.met ? (
                          <Ionicons name="checkmark" size={10} color={colors.primary} />
                        ) : null}
                      </View>
                      <Text
                        className={`text-xs ${
                          r.met ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {r.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {error ? (
              <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={busy || !name || !email || !passwordValid}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
            >
              {busy ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text className="text-base font-semibold text-primary-foreground">
                    Create account
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
                </>
              )}
            </Pressable>

            <Text className="mt-1 text-center text-[11px] leading-4 text-muted-foreground">
              By creating an account you agree to our{' '}
              <Text className="text-primary">Terms</Text> and{' '}
              <Text className="text-primary">Privacy Policy</Text>.
            </Text>
          </View>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-sm text-muted-foreground">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={6}>
                <Text className="text-sm font-semibold text-primary">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

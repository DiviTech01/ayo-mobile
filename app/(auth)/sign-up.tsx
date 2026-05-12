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
import { notifyError, notifySuccess, tapLight } from '@/lib/haptics';

const BENEFITS = [
  'Access to 500+ youth indicators',
  'Interactive data visualizations',
  'Export data in multiple formats',
  'Save and share custom reports',
  'Real-time data updates',
];

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requirements = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains a number', met: /\d/.test(password) },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    ],
    [password],
  );
  const passwordValid = requirements.every((r) => r.met);

  const onSubmit = async () => {
    if (!acceptTerms) {
      setError('Please accept the terms and privacy policy to continue.');
      notifyError();
      return;
    }
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
            subtitle="Start exploring Africa's youth data today. It's free!"
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
              label="Full Name"
              leftIcon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
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
                placeholder="Create a password"
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

            <Pressable
              onPress={() => {
                tapLight();
                setAcceptTerms((v) => !v);
              }}
              className="flex-row items-start gap-2.5 pt-1 active:opacity-70"
            >
              <View
                className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                  acceptTerms
                    ? 'border-primary bg-primary'
                    : 'border-border bg-muted'
                }`}
              >
                {acceptTerms ? (
                  <Ionicons name="checkmark" size={14} color={colors.primaryForeground} />
                ) : null}
              </View>
              <Text className="flex-1 text-sm leading-5 text-muted-foreground">
                I agree to the <Text className="text-primary">Terms of Service</Text> and{' '}
                <Text className="text-primary">Privacy Policy</Text>
              </Text>
            </Pressable>

            {error ? (
              <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={busy || !name || !email || !passwordValid || !acceptTerms}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
            >
              {busy ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text className="text-base font-semibold text-primary-foreground">
                    Create Account
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
                </>
              )}
            </Pressable>
          </View>

          <View className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
            <Text className="text-sm font-semibold text-foreground">What you&rsquo;ll get:</Text>
            <View className="mt-3 gap-2.5">
              {BENEFITS.map((item) => (
                <View key={item} className="flex-row items-center gap-2.5">
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Ionicons name="checkmark" size={12} color={colors.primary} />
                  </View>
                  <Text className="flex-1 text-sm text-muted-foreground">{item}</Text>
                </View>
              ))}
            </View>
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

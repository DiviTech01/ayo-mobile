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
import { supabase } from '@/lib/supabase';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) {
      setError(t('changePassword.tooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('changePassword.mismatch'));
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="pb-12">
          <PageHeader
            title={t('changePassword.title')}
            description={t('changePassword.description')}
            icon="key"
            showBack
          />
          <View className="p-5">
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="text-sm leading-5 text-muted-foreground">
              {t('changePassword.intro')}
            </Text>

            <View className="mt-5">
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                {t('changePassword.newPassword')}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t('changePassword.newPwPlaceholder')}
                placeholderTextColor={colors.mutedForeground}
                className="rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-1.5 text-sm font-medium text-foreground">
                {t('changePassword.confirm')}
              </Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder={t('changePassword.confirmPlaceholder')}
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
              <Text className="text-sm text-primary">
                {t('changePassword.updated')}
              </Text>
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
                {t('changePassword.updateBtn')}
              </Text>
            )}
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

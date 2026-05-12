import { useEffect, useState } from 'react';
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
import { api } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as
        | { name?: string; full_name?: string; organization?: string }
        | undefined;
      setName(meta?.name ?? meta?.full_name ?? '');
      setOrganization(meta?.organization ?? '');
      setEmail(data.user?.email ?? '');
    });
  }, []);

  const onSave = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);

    const trimmedName = name.trim();
    const trimmedOrg = organization.trim();

    const { error: metaErr } = await supabase.auth.updateUser({
      data: { name: trimmedName, organization: trimmedOrg },
    });
    if (metaErr) {
      setBusy(false);
      setError(metaErr.message);
      return;
    }

    try {
      await api.auth.updateProfile({
        name: trimmedName,
        organization: trimmedOrg,
      });
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof Error
          ? `Saved on device, but couldn't sync to server: ${err.message}`
          : 'Saved on device, but couldn’t sync to server.',
      );
      return;
    }

    setBusy(false);
    setSaved(true);
    setTimeout(() => router.back(), 600);
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
            title="Edit Profile"
            description="Update your name and organization. These appear on your account."
            showBack
          />
          <View className="p-5">
          <View className="rounded-2xl border border-border bg-card p-5">
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
            <Field
              label="Organization"
              value={organization}
              onChangeText={setOrganization}
              placeholder="(optional)"
            />
            <View className="mt-4">
              <Text className="mb-1.5 text-sm font-medium text-foreground">Email</Text>
              <View className="rounded-xl border border-border bg-muted px-4 py-3">
                <Text className="text-base text-muted-foreground">{email}</Text>
              </View>
              <Text className="mt-1 text-[11px] text-muted-foreground">
                Email changes happen elsewhere.
              </Text>
            </View>
          </View>

          {error ? (
            <View className="mt-3 rounded-lg bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}

          {saved ? (
            <View className="mt-3 rounded-lg bg-primary/10 px-3 py-2">
              <Text className="text-sm text-primary">Saved.</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onSave}
            disabled={busy || !name.trim()}
            className="mt-6 rounded-xl bg-primary py-3.5 disabled:opacity-50 active:opacity-80"
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="text-center text-base font-semibold text-primary-foreground">
                Save changes
              </Text>
            )}
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        className="rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground"
      />
    </View>
  );
}

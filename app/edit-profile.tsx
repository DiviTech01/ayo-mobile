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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
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
    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim(), organization: organization.trim() },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => router.back(), 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
          <Text className="text-sm font-medium text-gray-900">Settings</Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900">Edit profile</Text>
        <View className="w-12" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-5">
          <View className="rounded-2xl border border-gray-200 bg-white p-5">
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
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Email</Text>
              <View className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <Text className="text-base text-gray-500">{email}</Text>
              </View>
              <Text className="mt-1 text-[11px] text-gray-400">
                Email changes happen elsewhere.
              </Text>
            </View>
          </View>

          {error ? (
            <View className="mt-3 rounded-lg bg-pan-red-50 px-3 py-2">
              <Text className="text-sm text-pan-red-700">{error}</Text>
            </View>
          ) : null}

          {saved ? (
            <View className="mt-3 rounded-lg bg-pan-green-50 px-3 py-2">
              <Text className="text-sm text-pan-green-700">Saved.</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onSave}
            disabled={busy || !name.trim()}
            className="mt-6 rounded-xl bg-pan-blue-600 py-3.5 disabled:opacity-50"
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Save changes
              </Text>
            )}
          </Pressable>
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
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
      />
    </View>
  );
}

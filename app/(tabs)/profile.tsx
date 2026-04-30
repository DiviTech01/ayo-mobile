import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import {
  biometricAvailable,
  clearPin,
  hasPin,
  isBiometricEnabled,
  setBiometricEnabled,
  signOut,
} from '@/lib/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);
  const [pinSet, setPinSet] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email ?? null);
    const meta = data.user?.user_metadata as
      | { name?: string; full_name?: string; organization?: string }
      | undefined;
    setName(meta?.name ?? meta?.full_name ?? null);
    setOrganization(meta?.organization ?? null);
    setPinSet(await hasPin());
    setBioOn(await isBiometricEnabled());
    setBioSupported(await biometricAvailable());
  };

  useEffect(() => {
    refresh();
  }, []);

  const togglePin = async (value: boolean) => {
    if (value) {
      router.push('/pin-setup');
    } else {
      Alert.alert('Remove PIN?', 'You will sign in with your password each time.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await clearPin();
            await refresh();
          },
        },
      ]);
    }
  };

  const toggleBio = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBioOn(value);
  };

  const onSignOut = async () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>

        <View className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-pan-blue-100">
              <Text className="text-2xl font-bold text-pan-blue-700">
                {(name ?? email ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {name ?? 'AfYO user'}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {email ?? '—'}
              </Text>
              {organization ? (
                <Text className="mt-0.5 text-[11px] text-gray-400" numberOfLines={1}>
                  {organization}
                </Text>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/edit-profile' as unknown as Href)}
            className="mt-4 rounded-xl bg-gray-50 py-2.5"
          >
            <Text className="text-center text-sm font-semibold text-pan-blue-600">
              Edit profile
            </Text>
          </Pressable>
        </View>

        <SectionLabel>Security</SectionLabel>
        <View className="rounded-2xl border border-gray-200 bg-white">
          <SwitchRow
            label="Require PIN to open app"
            sub="4-digit code, asked each time you open AfYO."
            value={pinSet}
            onValueChange={togglePin}
          />
          <Divider />
          <SwitchRow
            label="Use Face ID / fingerprint"
            sub={
              bioSupported
                ? 'Faster than typing your PIN.'
                : 'Not available on this device.'
            }
            value={bioOn}
            onValueChange={toggleBio}
            disabled={!bioSupported || !pinSet}
          />
          <Divider />
          <NavRow
            icon="key-outline"
            label="Change password"
            onPress={() => router.push('/change-password' as unknown as Href)}
          />
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="rounded-2xl border border-gray-200 bg-white">
          <NavRow icon="language-outline" label="Language" value="English" disabled />
          <Divider />
          <NavRow
            icon="notifications-outline"
            label="Notifications"
            value="Default"
            disabled
          />
          <Divider />
          <NavRow
            icon="contrast-outline"
            label="Appearance"
            value="System"
            disabled
          />
        </View>

        <SectionLabel>About</SectionLabel>
        <View className="rounded-2xl border border-gray-200 bg-white">
          <NavRow
            icon="information-circle-outline"
            label="About AfYO"
            onPress={() => router.push('/about' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="shield-checkmark-outline"
            label="Privacy & terms"
            onPress={() => router.push('/about' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="help-circle-outline"
            label="Help & support"
            onPress={() => router.push('/about' as unknown as Href)}
          />
        </View>

        <Pressable
          onPress={onSignOut}
          className="mt-8 rounded-xl border border-pan-red-200 bg-pan-red-50 py-3"
        >
          <Text className="text-center text-base font-semibold text-pan-red-700">
            Sign out
          </Text>
        </Pressable>

        <Text className="mt-6 text-center text-xs text-gray-400">AfYO v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 mt-7 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </Text>
  );
}

function Divider() {
  return <View className="ml-4 h-px bg-gray-100" />;
}

function SwitchRow({
  label,
  sub,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <View className="flex-1 pr-3">
        <Text className={`text-base ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {label}
        </Text>
        {sub ? <Text className="mt-0.5 text-xs text-gray-500">{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

function NavRow({
  icon,
  label,
  value,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className="flex-row items-center justify-between px-4 py-3.5 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color={disabled ? '#9ca3af' : '#374151'} />
        <Text className={`text-base ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value ? <Text className="text-sm text-gray-500">{value}</Text> : null}
        {!disabled && onPress ? (
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        ) : null}
      </View>
    </Pressable>
  );
}

import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { LEGAL_LINKS } from '@/lib/legal';
import {
  authenticateWithBiometrics,
  biometricAvailable,
  clearPin,
  hasPin,
  isBiometricEnabled,
  setBiometricEnabled,
  signOut,
} from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { useThemeColors } from '@/lib/theme-colors';
import { useNotificationPrefs } from '@/lib/notifications';
import { useTranslation } from '@/lib/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { prefs: notifPrefs } = useNotificationPrefs();
  const { t, languageInfo } = useTranslation();
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

  // Refresh on every focus (not just first mount) so that returning from the
  // /pin-setup modal re-reads hasPin() — otherwise the PIN toggle stays "off"
  // even though the PIN saved, which looked like "setting a PIN doesn't work".
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

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
    // Biometric unlock needs a PIN as its fallback. If the user enables it
    // without a PIN, send them to set one instead of silently doing nothing.
    if (value && !pinSet) {
      Alert.alert(
        'Set an app PIN first',
        'Biometric unlock uses your PIN as a fallback. Set a 4-digit PIN, then turn on Face ID / fingerprint.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set PIN', onPress: () => router.push('/pin-setup') },
        ],
      );
      return;
    }
    // Enabling: prompt the device's Face ID / fingerprint once so the user
    // actually confirms it works before we turn it on. Disabling needs no prompt.
    if (value) {
      const ok = await authenticateWithBiometrics();
      if (!ok) return; // cancelled or failed — leave it off
    }
    await setBiometricEnabled(value);
    setBioOn(value);
  };

  const openLegal = (url: string) => {
    openBrowserAsync(url, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    }).catch(() => undefined);
  };

  const onSignOut = async () => {
    Alert.alert(t('auth.signOutConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title={t('profile.title')}
          description={t('profile.description')}
        />

        <View className="px-5 pt-5">
        <View className="rounded-2xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <Text className="text-2xl font-bold text-primary">
                {(name ?? email ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {name ?? 'AfYO user'}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {email ?? '—'}
              </Text>
              {organization ? (
                <Text className="mt-0.5 text-[11px] text-muted-foreground" numberOfLines={1}>
                  {organization}
                </Text>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/edit-profile' as unknown as Href)}
            className="mt-4 rounded-xl bg-muted py-2.5"
          >
            <Text className="text-center text-sm font-semibold text-primary">
              {t('profile.editProfile')}
            </Text>
          </Pressable>
        </View>

        <SectionLabel>{t('profile.security')}</SectionLabel>
        <View className="rounded-2xl border border-border bg-card">
          <SwitchRow
            label={t('profile.requirePin')}
            sub={t('profile.requirePinSub')}
            value={pinSet}
            onValueChange={togglePin}
          />
          <Divider />
          <SwitchRow
            label={t('profile.biometric')}
            sub={
              !bioSupported
                ? t('profile.biometricUnavailable')
                : !pinSet
                  ? t('profile.biometricNeedPin')
                  : t('profile.biometricFaster')
            }
            value={bioOn}
            onValueChange={toggleBio}
            disabled={!bioSupported}
          />
          <Divider />
          <NavRow
            icon="key-outline"
            label={t('profile.changePassword')}
            onPress={() => router.push('/change-password' as unknown as Href)}
          />
        </View>

        <SectionLabel>{t('profile.preferences')}</SectionLabel>
        <View className="rounded-2xl border border-border bg-card">
          <NavRow
            icon="language-outline"
            label={t('profile.language')}
            value={languageInfo.nativeName}
            onPress={() => router.push('/language' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="notifications-outline"
            label={t('profile.notifications')}
            value={notifPrefs.enabled ? t('profile.on') : t('profile.off')}
            onPress={() => router.push('/notifications' as unknown as Href)}
          />
        </View>

        <SectionLabel>{t('profile.resources')}</SectionLabel>
        <View className="rounded-2xl border border-border bg-card">
          <NavRow
            icon="book-outline"
            label={t('profile.glossary')}
            onPress={() => router.push('/resources/glossary' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="help-circle-outline"
            label={t('profile.faq')}
            onPress={() => router.push('/resources/faq' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="document-text-outline"
            label={t('profile.methodology')}
            onPress={() => router.push('/resources/methodology' as unknown as Href)}
          />
        </View>

        <SectionLabel>{t('profile.about')}</SectionLabel>
        <View className="rounded-2xl border border-border bg-card">
          <NavRow
            icon="information-circle-outline"
            label={t('profile.about')}
            onPress={() => router.push('/about' as unknown as Href)}
          />
          <Divider />
          <NavRow
            icon="shield-checkmark-outline"
            label={t('profile.privacyPolicy')}
            onPress={() => openLegal(LEGAL_LINKS.privacy)}
          />
          <Divider />
          <NavRow
            icon="document-text-outline"
            label={t('profile.termsOfService')}
            onPress={() => openLegal(LEGAL_LINKS.terms)}
          />
          <Divider />
          <NavRow
            icon="ribbon-outline"
            label={t('profile.dataLicensing')}
            onPress={() => openLegal(LEGAL_LINKS.dataLicensing)}
          />
        </View>

        <Pressable
          onPress={onSignOut}
          className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 py-3"
        >
          <Text className="text-center text-base font-semibold text-destructive">
            {t('auth.signOut')}
          </Text>
        </Pressable>

        <Text className="mt-6 text-center text-xs text-muted-foreground">AfYO v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 mt-7 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </Text>
  );
}

function Divider() {
  return <View className="ml-4 h-px bg-border" />;
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
        <Text className={`text-base ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </Text>
        {sub ? <Text className="mt-0.5 text-xs text-muted-foreground">{sub}</Text> : null}
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
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className="flex-row items-center justify-between px-4 py-3.5 active:bg-muted"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color={colors.mutedForeground} />
        <Text className={`text-base ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value ? <Text className="text-sm text-muted-foreground">{value}</Text> : null}
        {!disabled && onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        ) : null}
      </View>
    </Pressable>
  );
}

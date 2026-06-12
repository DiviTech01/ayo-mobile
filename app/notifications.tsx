import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/components/PageHeader';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  CATEGORY_META,
  ensurePushRegistered,
  getPermissionStatus,
  useNotificationPrefs,
} from '@/lib/notifications';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { prefs, setEnabled, setCategory } = useNotificationPrefs();
  const [permission, setPermission] = useState<string>('undetermined');
  const [remoteUnavailable, setRemoteUnavailable] = useState(false);

  const refreshPermission = async () => {
    const status = await getPermissionStatus();
    setPermission(status);
  };

  useEffect(() => {
    refreshPermission();
  }, []);

  const onEnableSystem = async () => {
    tapLight();
    const res = await ensurePushRegistered();
    setRemoteUnavailable(res.remoteUnavailable);
    await refreshPermission();
  };

  const permissionGranted = permission === 'granted';
  const masterOn = prefs.enabled && permissionGranted;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title={t('notif.title')}
          description={t('notif.description')}
          icon="notifications"
          showBack
        />

        <View className="px-5 pt-4">
          {/* Permission banner */}
          {!permissionGranted ? (
            <View
              style={{
                backgroundColor: 'rgba(212,160,23,0.08)',
                borderColor: 'rgba(212,160,23,0.3)',
              }}
              className="mb-4 rounded-2xl border p-4"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="notifications-off-outline" size={16} color="#D4A017" />
                <Text className="text-[13px] font-semibold text-foreground">
                  {t('notif.title')}
                </Text>
              </View>
              <Text className="mt-1 text-[12px] leading-4 text-muted-foreground">
                {t('notif.description')}
              </Text>
              <Pressable
                onPress={onEnableSystem}
                className="mt-3 self-start rounded-xl bg-primary px-4 py-2.5 active:opacity-80"
              >
                <Text className="text-[13px] font-semibold text-primary-foreground">
                  {t('notif.enable')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Master switch */}
          <View className="rounded-2xl border border-border bg-card">
            <Row
              icon="notifications"
              title={t('notif.allow')}
              sub={t('notif.allowSub')}
              value={masterOn}
              disabled={!permissionGranted}
              onValueChange={(v) => {
                tapLight();
                setEnabled(v);
              }}
            />
          </View>

          {/* Categories */}
          <Text className="mb-2 mt-7 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('notif.whatAbout')}
          </Text>
          <View className="rounded-2xl border border-border bg-card">
            {CATEGORY_META.map((cat, i) => (
              <View key={cat.key}>
                {i > 0 ? <View className="ml-14 h-px bg-border" /> : null}
                <Row
                  icon={cat.icon as React.ComponentProps<typeof Ionicons>['name']}
                  title={t(`notif.cat.${cat.key}.title`)}
                  sub={t(`notif.cat.${cat.key}.desc`)}
                  value={masterOn && prefs[cat.key]}
                  disabled={!masterOn}
                  onValueChange={(v) => {
                    tapLight();
                    setCategory(cat.key, v);
                  }}
                />
              </View>
            ))}
          </View>

          {remoteUnavailable ? (
            <Text className="mt-4 px-1 text-[11px] leading-4 text-muted-foreground">
              Live remote alerts (sent while the app is closed) activate once AfYO
              ships as a standalone build. Test and in-app notifications work now.
            </Text>
          ) : null}

          <Text className="mt-6 text-center text-[11px] text-muted-foreground">
            You can also manage AfYO notifications in your phone’s Settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  sub,
  value,
  onValueChange,
  disabled,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  sub?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          disabled ? 'bg-muted' : 'bg-primary/12'
        }`}
        style={!disabled ? { backgroundColor: 'rgba(34,197,94,0.12)' } : undefined}
      >
        <Ionicons
          name={icon}
          size={16}
          color={disabled ? colors.mutedForeground : colors.primary}
        />
      </View>
      <View className="flex-1 pr-2">
        <Text
          className={`text-[15px] ${
            disabled ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {title}
        </Text>
        {sub ? (
          <Text className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {sub}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { PersonalizedCard } from '@/components/dashboard/PersonalizedCard';
import { CountryPickerModal } from '@/components/dashboard/CountryPickerModal';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import { AddEditWidgetModal } from '@/components/dashboard/AddEditWidgetModal';
import { PolicyMonitorWidget } from '@/components/dashboard/PolicyMonitorWidget';
import { GradientHeading } from '@/components/GradientHeading';
import { LiveDataTicker } from '@/components/LiveDataTicker';
import { useWidgets, type Widget, type WidgetDraft } from '@/lib/widgets';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

const GOLD = '#D4A017';
const TAB_BAR_HEIGHT = 58;

export default function DashboardScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { widgets, hydrated, addWidget, updateWidget, removeWidget } = useWidgets();

  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [editing, setEditing] = useState<Widget | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    setRefreshing(false);
  }, [qc]);

  const openAdd = () => {
    tapLight();
    setEditing(null);
    setWidgetModalOpen(true);
  };

  const openEdit = (w: Widget) => {
    setEditing(w);
    setWidgetModalOpen(true);
  };

  const submit = (draft: WidgetDraft) => {
    if (editing) updateWidget(editing.id, draft);
    else addWidget(draft);
  };

  const confirmDelete = (w: Widget) => {
    Alert.alert(
      t('dashboard.removeWidget'),
      t('dashboard.removeWidgetConfirm', { title: w.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => removeWidget(w.id),
        },
      ],
    );
  };

  const onSave = () => {
    tapLight();
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 2200);
  };

  const onShare = async () => {
    tapLight();
    try {
      await Share.share({
        message:
          'My African Youth Observatory dashboard — explore youth data for 54 African countries at africanyouthobservatory.org',
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Live data ticker — real values from /api/platform/stats + youth-index/rankings */}
        <LiveDataTicker />

        {/* Header */}
        <View className="px-5 pt-3">
          <View className="flex-row items-center justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <GradientHeading fontSize={32} align="left">
                {t('dashboard.title')}
              </GradientHeading>
            </View>
            <View className="flex-row gap-1.5">
              <IconButton
                icon={savedHint ? 'checkmark' : 'save-outline'}
                onPress={onSave}
                tint={savedHint ? GOLD : undefined}
                accessibilityLabel="Save dashboard"
              />
              <IconButton
                icon="share-outline"
                onPress={onShare}
                accessibilityLabel="Share dashboard"
              />
            </View>
          </View>
        </View>

        {/* Personalized card */}
        <View className="mt-5 px-5">
          <PersonalizedCard onPersonalize={() => setPickerOpen(true)} />
        </View>

        {/* Widgets */}
        <View className="mt-5 px-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.yourWidgets')}
            </Text>
            {widgets.length > 0 ? (
              <Pressable
                onPress={openAdd}
                hitSlop={6}
                className="flex-row items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 active:opacity-80"
              >
                <Ionicons name="add" size={13} color={colors.primary} />
                <Text className="text-[12px] font-semibold text-primary">
                  {t('dashboard.addWidget')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {!hydrated ? (
            <View className="items-center rounded-2xl border border-border bg-card p-8">
              <Text className="text-sm text-muted-foreground">{t('common.loading')}</Text>
            </View>
          ) : widgets.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-card/40 px-5 py-12">
              <Ionicons name="grid-outline" size={36} color={colors.mutedForeground} />
              <Text className="mt-3 font-display text-base font-semibold text-foreground">
                {t('dashboard.noWidgets')}
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                {t('dashboard.noWidgetsDesc')}
              </Text>
              <Pressable
                onPress={openAdd}
                className="mt-4 flex-row items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 active:opacity-80"
              >
                <Ionicons name="add" size={16} color={colors.primaryForeground} />
                <Text className="text-sm font-semibold text-primary-foreground">
                  {t('dashboard.addFirstWidget')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              {widgets.map((w) => (
                <WidgetCard
                  key={w.id}
                  widget={w}
                  onEdit={() => openEdit(w)}
                  onDelete={() => confirmDelete(w)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Youth Policy Monitor */}
        <View className="mt-7 px-5">
          <PolicyMonitorWidget />
        </View>
      </ScrollView>

      <AddEditWidgetModal
        open={widgetModalOpen}
        editing={editing}
        onClose={() => setWidgetModalOpen(false)}
        onSubmit={submit}
      />
      <CountryPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </SafeAreaView>
  );
}

function IconButton({
  icon,
  onPress,
  tint,
  accessibilityLabel,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  tint?: string;
  accessibilityLabel?: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:bg-muted"
    >
      <Ionicons name={icon} size={18} color={tint ?? colors.foreground} />
    </Pressable>
  );
}

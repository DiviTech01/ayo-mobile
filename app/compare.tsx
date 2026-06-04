import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCountryDirectory, useYouthIndexRankings } from '@/lib/queries';
import type { CountryListItem } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';
import { tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import type { YouthIndexScore } from '@/lib/api';

// Either the overall score or one of the 7 theme dimension slugs.
type DimensionKey = 'overallScore' | string; // 'overallScore' | ThemeSlug

const DIMENSIONS: { key: DimensionKey; labelKey: string }[] = [
  { key: 'overallScore',                       labelKey: 'compare.dim.overall' },
  { key: 'youth-demography-participation',     labelKey: 'compare.dim.demography' },
  { key: 'education',                          labelKey: 'compare.dim.education' },
  { key: 'employment',                         labelKey: 'compare.dim.employment' },
  { key: 'health',                             labelKey: 'compare.dim.health' },
  { key: 'entrepreneurship',                   labelKey: 'compare.dim.entrepreneurship' },
  { key: 'peace-security',                     labelKey: 'compare.dim.peaceSecurity' },
  { key: 'access-to-justice',                  labelKey: 'compare.dim.accessToJustice' },
];

const DEFAULT_COUNTRIES = ['Nigeria', 'Kenya', 'Ghana', 'South Africa'];

export default function CompareScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const directory = useCountryDirectory();
  const rankingsQ = useYouthIndexRankings();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dimension, setDimension] = useState<DimensionKey>('overallScore');
  const [pickerOpen, setPickerOpen] = useState(false);

  const rankings = useMemo<YouthIndexScore[]>(
    () => (Array.isArray(rankingsQ.data) ? rankingsQ.data : []),
    [rankingsQ.data],
  );

  useEffect(() => {
    if (selectedIds.length > 0 || directory.items.length === 0) return;
    const ids = DEFAULT_COUNTRIES
      .map((name) => directory.items.find((c) => c.name === name)?.id)
      .filter((id): id is string => !!id);
    if (ids.length > 0) setSelectedIds(ids);
  }, [directory.items, selectedIds.length]);

  const rows = useMemo(() => {
    const byId = new Map(rankings.map((r) => [r.countryId, r]));
    return selectedIds
      .map((id) => {
        const c = directory.items.find((x) => x.id === id);
        const r = byId.get(id);
        if (!c) return null;
        const value = r
          ? (dimension === 'overallScore'
              ? Number(r.overallScore || 0)
              : Number((r.dimensions as Record<string, number> | undefined)?.[dimension] ?? 0))
          : 0;
        return {
          id,
          name: c.name,
          flag: c.flagEmoji ?? '🏳️',
          region: c.region,
          value: Number.isFinite(value) ? value : 0,
          rank: r?.rank ?? null,
          tier: r?.tier ?? null,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.value - a.value);
  }, [selectedIds, rankings, directory.items, dimension]);

  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.value), 1) : 1;

  const onShare = async () => {
    const dimKey = DIMENSIONS.find((d) => d.key === dimension)?.labelKey;
    const dimLabel = dimKey ? t(dimKey) : 'AYEMI';
    const lines = [
      t('compare.shareTitle', { dim: dimLabel }),
      ...rows.map((r, i) => `${i + 1}. ${r.name}: ${r.value.toFixed(1)}`),
      '',
      'African Youth Observatory · PACSDA',
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      /* ignore */
    }
  };

  const isLoading = directory.isLoading || rankingsQ.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title={t('compare.title')}
          description={t('compare.description')}
          icon="bar-chart"
          showBack
          rightAction={{ icon: 'share-outline', onPress: onShare }}
        />

        <View className="p-5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('compare.dimension')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-2 gap-2 pr-5"
        >
          {DIMENSIONS.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => {
                tapSelection();
                setDimension(d.key);
              }}
              className={`rounded-full px-3 py-1.5 ${
                dimension === d.key ? 'bg-primary' : 'border border-border bg-card'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  dimension === d.key ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {t(d.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('compare.countriesLabel', { n: selectedIds.length })}
          </Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center gap-1 rounded-full border border-border bg-card px-3 py-1"
          >
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text className="text-xs font-semibold text-primary">{t('common.edit')}</Text>
          </Pressable>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-card p-4">
          {isLoading && rows.length === 0 ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : rows.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-sm text-muted-foreground">
                {t('compare.noneSelected')}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {rows.map((r, i) => {
                const widthPct = Math.max(2, (r.value / max) * 100);
                const barColor =
                  r.value >= 67
                    ? 'bg-pan-green-500'
                    : r.value >= 34
                    ? 'bg-pan-gold-500'
                    : 'bg-pan-red-500';
                return (
                  <View key={r.id}>
                    <View className="mb-1.5 flex-row items-baseline justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text className="w-5 text-sm text-muted-foreground">{i + 1}</Text>
                        <Text className="text-base">{r.flag}</Text>
                        <Text className="text-sm font-medium text-foreground">{r.name}</Text>
                      </View>
                      <Text className="text-sm font-bold tabular-nums text-foreground">
                        {r.value.toFixed(1)}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-muted">
                      <View
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <Text className="mt-4 text-[11px] leading-4 text-muted-foreground">
          {t('compare.barsNote', { year: new Date().getFullYear() - 1 })}
        </Text>

        <OpenOnWebLink href={webLinks.compare} />
        </View>
      </ScrollView>

      <CountryPickerModal
        open={pickerOpen}
        countries={directory.items}
        selected={selectedIds}
        onClose={() => setPickerOpen(false)}
        onChange={setSelectedIds}
      />
    </SafeAreaView>
  );
}

function CountryPickerModal({
  open,
  countries,
  selected,
  onClose,
  onChange,
}: {
  open: boolean;
  countries: CountryListItem[];
  selected: string[];
  onClose: () => void;
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (selected.length >= 6) return;
      onChange([...selected, id]);
    }
  };

  const sorted = useMemo(() => [...countries].sort((a, b) => a.name.localeCompare(b.name)), [countries]);

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="font-display text-base font-semibold text-foreground">
            {t('compare.pickTitle')}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm font-semibold text-primary">{t('common.done')}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerClassName="p-4">
          <View className="flex-row flex-wrap gap-2">
            {sorted.map((c) => {
              const active = selected.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggle(c.id)}
                  className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
                    active ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text className="text-base">{c.flagEmoji ?? '🏳️'}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      active ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

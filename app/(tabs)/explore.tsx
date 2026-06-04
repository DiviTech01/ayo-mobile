import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AfricaMap } from '@/components/AfricaMap';
import { GradientHeading } from '@/components/GradientHeading';
import { useCountries } from '@/lib/queries';
import {
  REGIONS,
  REGION_ABBR,
  type Region,
} from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  DataFiltersSheet,
  type ExploreFilters,
} from '@/components/explore/DataFiltersSheet';
import { DataChart } from '@/components/explore/DataChart';
import {
  ALL_COUNTRIES,
  ALL_THEMES,
  SELECT_INDICATOR,
} from '@/lib/explore-data';

type RegionFilter = Region | 'All';

const TAB_BAR_HEIGHT = 58;

export default function ExploreScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const countriesQ = useCountries();
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<ExploreFilters>({
    country: ALL_COUNTRIES,
    theme: ALL_THEMES,
    indicator: SELECT_INDICATOR,
    yearRange: [2021, 2025],
    gender: 'all',
    ageGroup: '15-35',
  });

  const iso3ToCountryName = useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(countriesQ.data) ? countriesQ.data : [];
    list.forEach((c) => {
      const iso3 = c.iso3Code ?? (c as { isoCode3?: string }).isoCode3;
      if (iso3) map.set(iso3, c.name);
    });
    return map;
  }, [countriesQ.data]);

  const countryNameToIso3 = useMemo(() => {
    const map = new Map<string, string>();
    iso3ToCountryName.forEach((name, iso3) => map.set(name, iso3));
    return map;
  }, [iso3ToCountryName]);

  const selectedIso3 = useMemo(() => {
    if (filters.country === ALL_COUNTRIES) return null;
    return countryNameToIso3.get(filters.country) ?? null;
  }, [filters.country, countryNameToIso3]);

  const onMapPress = useCallback(
    (iso3: string) => {
      tapLight();
      const name = iso3ToCountryName.get(iso3);
      if (!name) return;
      setFilters((prev) => ({
        ...prev,
        country: prev.country === name ? ALL_COUNTRIES : name,
      }));
    },
    [iso3ToCountryName],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
        }}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="px-5 pt-3">
          <GradientHeading fontSize={28} align="left">
            {t('explore.title')}
          </GradientHeading>
          <Text className="mt-1 text-[12px] leading-4" style={{ color: '#A89070' }}>
            {t('explore.subtitle')}
          </Text>
        </View>

        {/* Region chips */}
        <View className="mt-4 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-5"
          >
            <RegionChip
              label={t('common.all')}
              active={regionFilter === 'All'}
              onPress={() => {
                tapSelection();
                setRegionFilter('All');
              }}
            />
            {REGIONS.map((r) => (
              <RegionChip
                key={r}
                label={REGION_ABBR[r]}
                active={regionFilter === r}
                onPress={() => {
                  tapSelection();
                  setRegionFilter(r);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Map card */}
        <View className="mt-4 px-5">
          <View
            style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
            className="rounded-2xl border border-border p-4"
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-display text-base font-bold text-foreground">
                  {t('explore.africaMap')}
                </Text>
                <Text className="mt-0.5 text-[11px] text-muted-foreground">
                  {t('explore.mapHelp')}
                </Text>
              </View>
              {filters.country !== ALL_COUNTRIES ? (
                <View className="items-end">
                  <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t('explore.selected')}
                  </Text>
                  <Text className="text-[13px] font-semibold" style={{ color: '#34d399' }} numberOfLines={1}>
                    {filters.country}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-3">
              <AfricaMap
                regionFilter={regionFilter}
                selectedIso3={selectedIso3}
                onCountryPress={onMapPress}
              />
            </View>
          </View>
        </View>

        {/* Filter button between map and chart */}
        <View className="mt-4 px-5">
          <Pressable
            onPress={() => {
              tapLight();
              setFiltersOpen(true);
            }}
            className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 active:bg-muted"
          >
            <View className="flex-row items-center gap-2.5">
              <View
                style={{ backgroundColor: 'rgba(212,160,23,0.15)' }}
                className="h-9 w-9 items-center justify-center rounded-full"
              >
                <Ionicons name="options-outline" size={16} color="#D4A017" />
              </View>
              <View>
                <Text className="text-[13px] font-semibold text-foreground">
                  {t('explore.dataFilters')}
                </Text>
                <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                  {summarizeFilters(filters, t)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Data chart card */}
        <View className="mt-4 px-5">
          <DataChart
            country={filters.country}
            theme={filters.theme}
            indicator={filters.indicator}
            yearRange={filters.yearRange}
          />
        </View>
      </ScrollView>

      <DataFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </SafeAreaView>
  );
}

function RegionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-1.5 ${
        active ? 'bg-primary' : 'border border-border bg-card'
      }`}
    >
      <Text
        className={`text-[12px] font-medium ${
          active ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function summarizeFilters(
  f: {
    country: string;
    theme: string;
    indicator: string;
    yearRange: [number, number];
  },
  t: (key: string) => string,
): string {
  const parts: string[] = [];
  if (f.theme !== ALL_THEMES && f.indicator !== SELECT_INDICATOR) {
    parts.push(f.indicator);
  } else if (f.theme !== ALL_THEMES) {
    parts.push(`${f.theme} · ${t('explore.pickIndicator')}`);
  } else {
    parts.push(t('explore.filtersSummary'));
  }
  parts.push(`${f.yearRange[0]}–${f.yearRange[1]}`);
  return parts.join(' · ');
}


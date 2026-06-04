import { memo, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  ALL_COUNTRIES,
  ALL_THEMES,
  SELECT_INDICATOR,
  computeSummary,
} from '@/lib/explore-data';
import { useCountries, useThemes, useIndicators } from '@/lib/queries';
import { api } from '@/lib/api';
import { ExploreChart, type ExploreChartType } from './ExploreCharts';

const CHART_TYPES: {
  type: ExploreChartType;
  labelKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { type: 'bar', labelKey: 'explore.chart.bar', icon: 'bar-chart-outline' },
  { type: 'lollipop', labelKey: 'explore.chart.lollipop', icon: 'ellipse-outline' },
  { type: 'step-trend', labelKey: 'explore.chart.stepTrend', icon: 'analytics-outline' },
  { type: 'yoy', labelKey: 'explore.chart.yoy', icon: 'swap-horizontal' },
];

const EXPLAINER_KEY: Record<ExploreChartType, string> = {
  bar: 'explore.explainer.bar',
  lollipop: 'explore.explainer.lollipop',
  'step-trend': 'explore.explainer.stepTrend',
  yoy: 'explore.explainer.yoy',
};

function DataChartImpl({
  country,
  theme,
  indicator,
  yearRange,
}: {
  country: string;
  theme: string;
  indicator: string;
  yearRange: [number, number];
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<ExploreChartType>('bar');
  const scope =
    country !== ALL_COUNTRIES ? country : t('explore.allAfricanCountries');

  const hasSelection = theme !== ALL_THEMES && indicator !== SELECT_INDICATOR;
  const hasCountry = country !== ALL_COUNTRIES;

  // Live API-backed time series. Resolves theme/indicator/country NAMES to
  // the real cuids in the database and calls /api/data/timeseries to pull
  // year × value rows. No mock fallback — empty states surfaced directly.
  const themesQ = useThemes();
  const themeRow = useMemo(() => {
    if (!Array.isArray(themesQ.data) || !hasSelection) return null;
    return themesQ.data.find((t: any) => t.name === theme || t.slug === theme) ?? null;
  }, [themesQ.data, theme, hasSelection]);

  const indicatorsQ = useIndicators(themeRow?.id);
  const indicatorRow = useMemo(() => {
    if (!Array.isArray(indicatorsQ.data) || !hasSelection) return null;
    return indicatorsQ.data.find((i: any) => i.name === indicator || i.slug === indicator) ?? null;
  }, [indicatorsQ.data, indicator, hasSelection]);

  const countriesQ = useCountries();
  const countryRow = useMemo(() => {
    if (!Array.isArray(countriesQ.data) || !hasCountry) return null;
    return countriesQ.data.find((c: any) => c.name === country) ?? null;
  }, [countriesQ.data, country, hasCountry]);

  const timeseriesQ = useQuery({
    queryKey: ['data', 'timeseries', countryRow?.id, indicatorRow?.id, yearRange[0], yearRange[1]],
    queryFn: () => api.data.timeseries({
      countryId: countryRow!.id,
      indicatorId: indicatorRow!.id,
      from: yearRange[0],
      to: yearRange[1],
    }),
    enabled: !!countryRow?.id && !!indicatorRow?.id,
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(() => {
    const rows = (timeseriesQ.data as any)?.data ?? [];
    return rows.map((r: any) => ({ year: String(r.year), value: r.value }));
  }, [timeseriesQ.data]);

  // Derive age-band label from the rows the API actually returned (e.g. AU
  // 15-35, 18-30 for trafficking/IDPs, or "national" for policy markers).
  const ageBandLabel = useMemo(() => {
    const rows = (timeseriesQ.data as any)?.data ?? [];
    if (rows.length === 0) return null;
    const bands = Array.from(new Set(rows.map((r: any) => r.ageGroup ?? '').filter(Boolean))) as string[];
    if (bands.length === 0) return 'National';
    if (bands.length === 1) return `Ages ${bands[0]}`;
    return `Mixed (${bands.join(', ')})`;
  }, [timeseriesQ.data]);

  const isLoading = hasSelection && hasCountry && (timeseriesQ.isLoading || themesQ.isLoading || indicatorsQ.isLoading || countriesQ.isLoading);
  const summary = useMemo(() => computeSummary(data), [data]);

  const onShare = async () => {
    tapLight();
    try {
      await Share.share({
        message: `${indicator} · ${scope} · ${yearRange[0]}–${yearRange[1]} (African Youth Observatory)`,
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.025)',
      }}
      className="overflow-hidden rounded-2xl border border-border p-4"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Ionicons name="pulse" size={14} color="#34d399" />
            <Text
              className="min-w-0 flex-1 font-display text-base font-bold text-foreground"
              numberOfLines={1}
            >
              {hasSelection ? indicator : t('explore.noIndicatorSelected')}
            </Text>
          </View>
          {ageBandLabel ? (
            <View
              className="mt-1 self-start rounded-full border px-2 py-0.5"
              style={{ borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.1)' }}
            >
              <Text className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#34d399' }}>
                {ageBandLabel}
              </Text>
            </View>
          ) : null}
          <Text className="mt-0.5 text-[11px] text-muted-foreground" numberOfLines={1}>
            {scope}
            <Text className="text-muted-foreground/60"> · </Text>
            {yearRange[0]}–{yearRange[1]}
          </Text>
        </View>
        <View className="flex-row gap-1">
          <IconBtn icon="download-outline" onPress={() => tapLight()} />
          <IconBtn icon="share-outline" onPress={onShare} />
        </View>
      </View>

      {/* Chart type tabs */}
      {hasSelection ? (
        <View
          style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
          className="mt-4 flex-row gap-0.5 self-start rounded-lg border border-border/60 p-1"
        >
          {CHART_TYPES.map((opt) => {
            const active = opt.type === chartType;
            return (
              <Pressable
                key={opt.type}
                onPress={() => {
                  tapLight();
                  setChartType(opt.type);
                }}
                style={
                  active
                    ? { backgroundColor: 'rgba(34,197,94,0.15)' }
                    : undefined
                }
                className="flex-row items-center gap-1 rounded-md px-2.5 py-1.5 active:opacity-80"
              >
                <Ionicons
                  name={opt.icon}
                  size={12}
                  color={active ? '#34d399' : colors.mutedForeground}
                />
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: active ? '#34d399' : colors.mutedForeground }}
                >
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* Summary stats */}
      {hasSelection && summary ? (
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Stat label={t('explore.summaryLatest')} value={summary.latest.toFixed(1)} />
          <Stat
            label={t('explore.summaryChange')}
            value={`${summary.change >= 0 ? '+' : ''}${summary.change.toFixed(
              1,
            )} (${summary.changePercent >= 0 ? '+' : ''}${summary.changePercent.toFixed(1)}%)`}
            tone={summary.change >= 0 ? 'positive' : 'negative'}
          />
          <Stat label={t('explore.summaryAverage')} value={summary.avg.toFixed(1)} />
          <Stat
            label={t('explore.summaryRange')}
            value={`${summary.min.toFixed(1)} – ${summary.max.toFixed(1)}`}
          />
        </View>
      ) : null}

      {/* Chart area */}
      <View
        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        className="mt-4 rounded-xl border border-border/40 p-3"
      >
        {!hasSelection ? (
          <View className="items-center py-12">
            <View
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="h-14 w-14 items-center justify-center rounded-2xl border border-border/40"
            >
              <Ionicons name="bar-chart-outline" size={26} color={colors.mutedForeground} />
            </View>
            <Text className="mt-3 text-center text-[12px] text-muted-foreground">
              {t('explore.noIndicator')}
            </Text>
          </View>
        ) : !hasCountry ? (
          <View className="items-center px-4 py-10">
            <Ionicons name="globe-outline" size={26} color="#34d399" />
            <Text className="mt-3 text-center text-[12px] font-medium text-foreground">
              Pick a country to chart this indicator
            </Text>
            <Text className="mt-1 text-center text-[11px] text-muted-foreground">
              "{indicator}" has values for every African Union member state — open the filter sheet and choose one.
            </Text>
          </View>
        ) : isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#34d399" />
            <Text className="mt-3 text-[12px] text-muted-foreground">Loading data from the AYO database…</Text>
          </View>
        ) : timeseriesQ.error ? (
          <View className="items-center py-10">
            <Ionicons name="alert-circle-outline" size={26} color="#f87171" />
            <Text className="mt-2 text-[12px] font-medium text-foreground">Couldn't load data</Text>
            <Text className="mt-1 text-center text-[11px] text-muted-foreground">{String((timeseriesQ.error as any)?.message ?? 'Network error')}</Text>
          </View>
        ) : data.length === 0 ? (
          <View className="items-center px-4 py-10">
            <Ionicons name="archive-outline" size={26} color="#fbbf24" />
            <Text className="mt-2 text-[12px] font-medium text-foreground">No values in {yearRange[0]}–{yearRange[1]}</Text>
            <Text className="mt-1 text-center text-[11px] text-muted-foreground">
              {country} has no rows for "{indicator}" in this year range. Try widening the range or picking another country.
            </Text>
          </View>
        ) : (
          <ExploreChart type={chartType} data={data} indicator={indicator} />
        )}
      </View>

      {/* Explainer */}
      {hasSelection ? (
        <View
          style={{
            backgroundColor: 'rgba(34,197,94,0.04)',
            borderColor: 'rgba(34,197,94,0.1)',
          }}
          className="mt-3 rounded-lg border px-3 py-2"
        >
          <Text className="text-[11px] leading-4" style={{ color: 'rgba(110,231,183,0.7)' }}>
            {t(EXPLAINER_KEY[chartType])}
          </Text>
        </View>
      ) : null}

      {/* Source note */}
      <View
        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        className="mt-3 flex-row gap-2 rounded-lg border border-border/40 px-3 py-2.5"
      >
        <View
          style={{ backgroundColor: 'rgba(34,197,94,0.35)' }}
          className="w-[2px] self-stretch rounded-full"
        />
        <Text className="flex-1 text-[11px] leading-4 text-muted-foreground">
          {hasSelection
            ? t('explore.sourceNote', {
                indicator,
                scope,
                start: yearRange[0],
                end: yearRange[1],
              })
            : t('explore.sourceNoteEmpty')}
        </Text>
      </View>
    </View>
  );
}

export const DataChart = memo(DataChartImpl);

function IconBtn({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className="h-8 w-8 items-center justify-center rounded-md active:bg-muted"
    >
      <Ionicons name={icon} size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  const color =
    tone === 'positive'
      ? '#34d399'
      : tone === 'negative'
      ? '#f87171'
      : undefined;
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        width: '48%',
      }}
      className="rounded-lg border border-border/60 px-3 py-2.5"
    >
      <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text
        className="mt-0.5 text-[13px] font-semibold"
        style={color ? { color } : undefined}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

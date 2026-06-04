import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePolicyRankings } from '@/lib/queries';
import { useUserPreferences } from '@/lib/userPreferences';
import { flagFromIso3 } from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import {
  ScoreGauge,
  TIER_ACCENT,
  tierFor,
  type ComplianceTier,
} from '@/components/ScoreGauge';
import {
  ARTICLE_STATUS_COLOR,
  policyDetailFor,
  type AycArticle,
  type TimelineEvent,
} from '@/lib/policy-details';

type TierFilter = 'all' | ComplianceTier;

type Row = {
  countryName: string;
  iso3: string;
  region: string;
  flagEmoji?: string | null;
  complianceScore: number;
  aycRatified: boolean;
  hasNationalPolicy: boolean;
  wpayCompliant: boolean;
  policyName?: string | null;
  policyYear?: number | null;
};

const TIER_CHIPS: { id: TierFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'high', labelKey: 'policy.high' },
  { id: 'medium', labelKey: 'policy.medium' },
  { id: 'low', labelKey: 'policy.low' },
];

export default function PolicyMonitorScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const q = usePolicyRankings();
  const { preferences } = useUserPreferences();

  const rows = useMemo<Row[]>(() => {
    const apiRows = Array.isArray(q.data) ? q.data : [];
    return apiRows
      .map((r) => ({
        countryName: r.countryName ?? r.countryId,
        iso3: r.iso3Code ?? r.isoCode3 ?? '',
        region: r.region ?? '',
        flagEmoji: r.flagEmoji ?? null,
        complianceScore: r.complianceScore,
        aycRatified: r.aycRatified,
        hasNationalPolicy: !!r.policyName,
        wpayCompliant: r.wpayCompliant,
        policyName: r.policyName,
        policyYear: r.yearAdopted ?? null,
      }))
      .sort((a, b) => b.complianceScore - a.complianceScore);
  }, [q.data]);

  const filtered = useMemo(() => {
    const qq = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (qq && !r.countryName.toLowerCase().includes(qq)) return false;
      if (tierFilter !== 'all' && tierFor(r.complianceScore) !== tierFilter) return false;
      return true;
    });
  }, [rows, search, tierFilter]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerClassName="pb-12"
        scrollEventThrottle={16}
      >
        <PageHeader
          title={t('policy.title')}
          description={t('policy.pageSubtitle')}
          icon="shield-checkmark"
          showBack
        />

        <View className="px-5 pt-4">
          {/* Search */}
          <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('policy.searchCountries')}
              placeholderTextColor={colors.mutedForeground}
              className="ml-2 flex-1 text-base text-foreground"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Tier filter chips */}
          <View className="mt-3 flex-row gap-2">
            {TIER_CHIPS.map((chip) => {
              const active = chip.id === tierFilter;
              const accent =
                chip.id === 'all' ? null : TIER_ACCENT[chip.id as ComplianceTier];
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => {
                    tapSelection();
                    setTierFilter(chip.id);
                  }}
                  style={
                    active && accent
                      ? {
                          borderColor: accent.ring,
                          backgroundColor: accent.soft,
                        }
                      : undefined
                  }
                  className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full border px-3 py-2 ${
                    active && !accent
                      ? 'border-primary bg-primary/15'
                      : !active
                      ? 'border-border bg-card'
                      : ''
                  }`}
                >
                  {accent ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: accent.hex,
                      }}
                    />
                  ) : null}
                  <Text
                    className="text-[12px] font-semibold"
                    style={{
                      color: active
                        ? accent
                          ? accent.hex
                          : colors.primary
                        : colors.foreground,
                    }}
                  >
                    {t(chip.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {q.isLoading && rows.length === 0 ? (
            <View className="items-center py-16">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : q.error && rows.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
              <Text className="mt-2 text-sm text-muted-foreground">
                {t('common.error')}
              </Text>
              <Pressable onPress={() => q.refetch()} className="mt-3">
                <Text className="text-sm font-medium text-primary">
                  {t('common.retry')}
                </Text>
              </Pressable>
            </View>
          ) : filtered.length === 0 ? (
            <View className="mt-6 items-center rounded-2xl border border-dashed border-border bg-card/40 py-12">
              <Ionicons name="alert-circle-outline" size={28} color={colors.mutedForeground} />
              <Text className="mt-2 text-sm text-muted-foreground">
                {t('policy.noMatch')}
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-3">
              {filtered.map((r) => (
                <CountryPolicyCard
                  key={r.countryName}
                  row={r}
                  isMyCountry={
                    !!preferences.myCountry &&
                    r.countryName.toLowerCase() === preferences.myCountry.toLowerCase()
                  }
                  expanded={expandedCountry === r.countryName}
                  onToggle={() =>
                    setExpandedCountry((cur) =>
                      cur === r.countryName ? null : r.countryName,
                    )
                  }
                />
              ))}
            </View>
          )}

          <ScoringMethodology />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CountryPolicyCard({
  row,
  isMyCountry,
  expanded,
  onToggle,
}: {
  row: Row;
  isMyCountry: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const tier = tierFor(row.complianceScore);
  const accent = TIER_ACCENT[tier];
  const detail = policyDetailFor(row.countryName);
  const hasDetail =
    !!detail && (detail.aycArticles.length > 0 || detail.timelineEvents.length > 0);

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.025)',
        borderColor: isMyCountry ? 'rgba(212,160,23,0.4)' : undefined,
        borderWidth: isMyCountry ? 1.5 : 1,
      }}
      className="overflow-hidden rounded-2xl border border-border p-4"
    >
      <View className="flex-row items-start gap-3">
        <ScoreGauge score={row.complianceScore} size={56} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xl">{row.flagEmoji ?? flagFromIso3(row.iso3)}</Text>
            <Text
              className="min-w-0 flex-1 font-display text-[15px] font-bold text-foreground"
              numberOfLines={1}
            >
              {row.countryName}
            </Text>
            {isMyCountry ? (
              <View
                style={{
                  backgroundColor: 'rgba(212,160,23,0.15)',
                  borderColor: 'rgba(212,160,23,0.3)',
                  borderWidth: 1,
                }}
                className="rounded-full px-1.5 py-0.5"
              >
                <Text
                  className="text-[9px] font-semibold tracking-wider"
                  style={{ color: '#D4A017' }}
                >
                  {t('policy.you')}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={{
              backgroundColor: accent.soft,
              borderColor: accent.ring,
              borderWidth: 1,
              alignSelf: 'flex-start',
            }}
            className="mt-1.5 rounded-full px-2 py-0.5"
          >
            <Text
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: accent.hex }}
            >
              {t('policy.complianceSuffix', { tier: t(`policy.${tier}`) })}
            </Text>
          </View>

          <View className="mt-2.5 flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <CheckPill ok={row.aycRatified} label="AYC" />
            <CheckPill ok={row.hasNationalPolicy} label="NYP" />
            {row.policyYear ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
                <Text className="text-[11px] text-muted-foreground tabular-nums">
                  {row.policyYear}
                </Text>
              </View>
            ) : null}
            {row.wpayCompliant ? (
              <View
                style={{
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  borderColor: 'rgba(59,130,246,0.3)',
                  borderWidth: 1,
                }}
                className="rounded-full px-1.5 py-0.5"
              >
                <Text
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: '#60A5FA' }}
                >
                  WPAY
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={() => {
            tapLight();
            onToggle();
          }}
          hitSlop={8}
          accessibilityLabel={expanded ? 'Collapse details' : 'Expand details'}
          className="h-8 w-8 -mr-1 items-center justify-center rounded-md active:bg-muted"
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>

      {expanded ? (
        <View className="mt-4 border-t border-border/60 pt-4">
          {hasDetail && detail ? (
            <View className="gap-5">
              {detail.aycArticles.length > 0 ? (
                <ArticlesSection articles={detail.aycArticles} />
              ) : null}
              {detail.timelineEvents.length > 0 ? (
                <TimelineSection events={detail.timelineEvents} />
              ) : null}
            </View>
          ) : (
            <View className="items-center py-2">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.mutedForeground}
              />
              <Text className="mt-1.5 text-center text-[11px] text-muted-foreground">
                {t('policy.noDetail', { country: row.countryName })}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const STATUS_LABEL_KEY: Record<AycArticle['status'], string> = {
  compliant: 'policy.status.compliant',
  partial: 'policy.status.partial',
  'non-compliant': 'policy.status.nonCompliant',
};

function ArticlesSection({ articles }: { articles: AycArticle[] }) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {t('policy.articleCompliance')}
      </Text>
      <View className="gap-1.5">
        {articles.map((art) => {
          const color = ARTICLE_STATUS_COLOR[art.status];
          const label = t(STATUS_LABEL_KEY[art.status]);
          return (
            <View
              key={art.article}
              style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="flex-row items-center justify-between rounded-md border border-border/60 px-2.5 py-2"
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-2">
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: color,
                  }}
                />
                <Text className="text-xs text-foreground" numberOfLines={1}>
                  {art.article}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: `${color}26`,
                  borderColor: `${color}4D`,
                  borderWidth: 1,
                }}
                className="rounded-full px-2 py-0.5"
              >
                <Text
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color }}
                >
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TimelineSection({ events }: { events: TimelineEvent[] }) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {t('policy.policyTimeline')}
      </Text>
      <View
        style={{ borderLeftWidth: 2, borderLeftColor: 'rgba(212,160,23,0.3)' }}
        className="pl-4"
      >
        {events.map((evt, idx) => (
          <View
            key={`${evt.year}-${idx}`}
            style={idx > 0 ? { marginTop: 12 } : undefined}
          >
            <View
              style={{
                position: 'absolute',
                left: -22,
                top: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#D4A017',
                borderWidth: 3,
                borderColor: 'rgb(8,12,20)',
              }}
            />
            <Text
              className="font-display text-xs font-bold tabular-nums"
              style={{ color: '#D4A017' }}
            >
              {evt.year}
            </Text>
            <Text className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              {evt.event}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CheckPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons
        name={ok ? 'checkmark-circle' : 'close-circle'}
        size={12}
        color={ok ? '#22C55E' : '#EF4444'}
      />
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}

function ScoringMethodology() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  return (
    <View
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      className="mt-6 rounded-xl border border-border p-4"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name="shield-checkmark" size={14} color="#D4A017" />
        <Text className="text-[13px] font-semibold text-foreground">
          {t('policy.methodology')}
        </Text>
      </View>
      <Text className="mt-2 text-[11px] leading-4 text-muted-foreground">
        {t('policy.methodologyBody')}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-4">
        <ThresholdChip color={TIER_ACCENT.high.hex} label=">70%" />
        <ThresholdChip color={TIER_ACCENT.medium.hex} label="50–70%" />
        <ThresholdChip color={TIER_ACCENT.low.hex} label="<50%" />
      </View>
    </View>
  );
}

function ThresholdChip({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
      />
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
    </View>
  );
}

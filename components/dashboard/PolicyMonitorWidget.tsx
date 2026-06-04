import { memo, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePolicyRankings } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { flagFromIso3 } from '@/lib/country-helpers';
import { ScoreGauge, tierFor } from '@/components/ScoreGauge';
import { GradientHeading } from '@/components/GradientHeading';

const GREEN = '#22C55E';
const BLUE = '#3B82F6';
const GOLD = '#F59E0B';
const PURPLE = '#A855F7';
const RED = '#EF4444';

function PolicyMonitorWidgetImpl() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const q = usePolicyRankings();

  const summary = useMemo(() => {
    const rows = Array.isArray(q.data) ? q.data : [];
    const total = rows.length;
    if (total === 0) {
      return {
        total: 0,
        ratifiedCount: 0,
        withPolicyCount: 0,
        avgScore: 0,
        wpayCount: 0,
        high: 0,
        medium: 0,
        low: 0,
        topPerformer: null as null | typeof rows[number],
      };
    }
    const ratifiedCount = rows.filter((r) => r.aycRatified).length;
    const withPolicyCount = rows.filter((r) => !!r.policyName).length;
    const avgScore = Math.round(
      rows.reduce((sum, r) => sum + (r.complianceScore ?? 0), 0) / total,
    );
    const wpayCount = rows.filter((r) => r.wpayCompliant).length;
    const high = rows.filter((r) => tierFor(r.complianceScore) === 'high').length;
    const medium = rows.filter((r) => tierFor(r.complianceScore) === 'medium').length;
    const low = rows.filter((r) => tierFor(r.complianceScore) === 'low').length;
    const topPerformer = [...rows].sort((a, b) => b.complianceScore - a.complianceScore)[0];
    return { total, ratifiedCount, withPolicyCount, avgScore, wpayCount, high, medium, low, topPerformer };
  }, [q.data]);

  if (q.isLoading && !q.data) {
    return (
      <View
        style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
        className="items-center rounded-2xl border border-border p-8"
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (q.error || summary.total === 0) {
    return null;
  }

  const total = Math.max(summary.total, 1);
  const highPct = (summary.high / total) * 100;
  const medPct = (summary.medium / total) * 100;
  const lowPct = (summary.low / total) * 100;

  const goToFull = () => {
    tapLight();
    router.push('/policy' as unknown as Href);
  };

  return (
    <View className="gap-3">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <GradientHeading fontSize={22} align="left">
            {t('policy.title')}
          </GradientHeading>
          <Text className="mt-0.5 text-[12px] leading-4 text-muted-foreground">
            {t('policy.subtitle')}
          </Text>
        </View>
        <Pressable
          onPress={() => tapLight()}
          className="flex-row items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 active:bg-muted"
        >
          <Ionicons name="download-outline" size={12} color={colors.foreground} />
          <Text className="text-[11px] font-semibold text-foreground">
            {t('common.export')}
          </Text>
        </Pressable>
      </View>

      {/* 4 stat cards in a 2x2 grid */}
      <View className="flex-row flex-wrap gap-2.5">
        <StatTile
          icon="checkmark-done"
          accent={GREEN}
          label={t('policy.aycRatified')}
          value={summary.ratifiedCount}
          of={summary.total}
          sub={t('policy.aycRatifiedSub')}
        />
        <StatTile
          icon="book"
          accent={BLUE}
          label={t('policy.nationalPolicy')}
          value={summary.withPolicyCount}
          of={summary.total}
          sub={t('policy.nationalPolicySub')}
        />
        <StatTile
          icon="trophy"
          accent={summary.avgScore > 70 ? GREEN : summary.avgScore >= 50 ? GOLD : RED}
          label={t('policy.avgCompliance')}
          value={summary.avgScore}
          of={100}
          isPercent
          sub={t('policy.avgComplianceSub')}
        />
        <StatTile
          icon="star"
          accent={PURPLE}
          label={t('policy.wpayAligned')}
          value={summary.wpayCount}
          of={summary.total}
          sub={t('policy.wpaySub')}
        />
      </View>

      {/* Distribution */}
      <View
        style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
        className="rounded-2xl border border-border p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 pr-2">
            <Text className="text-[13px] font-semibold text-foreground">
              {t('policy.distribution')}
            </Text>
            <Text className="mt-0.5 text-[11px] text-muted-foreground">
              {t('policy.distributionDesc')}
            </Text>
          </View>
          <Text className="text-[11px] text-muted-foreground tabular-nums">
            {t('policy.countriesCount', { n: summary.total })}
          </Text>
        </View>

        <View
          className="mt-3 flex-row overflow-hidden rounded-lg"
          style={{
            height: 32,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {summary.high > 0 ? (
            <View
              style={{ width: `${highPct}%`, backgroundColor: GREEN }}
              className="items-center justify-center overflow-hidden"
            >
              <Text className="text-[11px] font-semibold text-white" numberOfLines={1}>
                {highPct > 18 ? `${summary.high} ${t('policy.high')}` : summary.high}
              </Text>
            </View>
          ) : null}
          {summary.medium > 0 ? (
            <View
              style={{ width: `${medPct}%`, backgroundColor: GOLD }}
              className="items-center justify-center overflow-hidden"
            >
              <Text className="text-[11px] font-semibold text-white" numberOfLines={1}>
                {medPct > 22 ? `${summary.medium} ${t('policy.medium')}` : summary.medium}
              </Text>
            </View>
          ) : null}
          {summary.low > 0 ? (
            <View
              style={{ width: `${lowPct}%`, backgroundColor: RED }}
              className="items-center justify-center overflow-hidden"
            >
              <Text className="text-[11px] font-semibold text-white" numberOfLines={1}>
                {lowPct > 16 ? `${summary.low} ${t('policy.low')}` : summary.low}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-3 flex-row gap-2">
          <TierChip color={GREEN} label={t('policy.high')} count={summary.high} pct={highPct} />
          <TierChip color={GOLD} label={t('policy.medium')} count={summary.medium} pct={medPct} />
          <TierChip color={RED} label={t('policy.low')} count={summary.low} pct={lowPct} />
        </View>
      </View>

      {/* Top performer */}
      {summary.topPerformer ? (
        <View
          style={{
            borderColor: 'rgba(34,197,94,0.25)',
            backgroundColor: 'rgba(34,197,94,0.07)',
          }}
          className="rounded-2xl border p-4"
        >
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="trophy" size={12} color={GREEN} />
            <Text
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: GREEN }}
            >
              {t('policy.topPerformer')}
            </Text>
          </View>
          <View className="mt-3 flex-row items-center gap-3">
            <ScoreGauge score={summary.topPerformer.complianceScore} size={64} />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">
                  {summary.topPerformer.flagEmoji ??
                    flagFromIso3(summary.topPerformer.iso3Code ?? summary.topPerformer.isoCode3 ?? '')}
                </Text>
                <Text
                  className="min-w-0 flex-1 font-display text-base font-bold text-foreground"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {summary.topPerformer.countryName}
                </Text>
              </View>
              <Text
                className="mt-0.5 text-[11px] leading-[15px] text-muted-foreground"
                numberOfLines={2}
              >
                {t('policy.policyAdopted', {
                  year: summary.topPerformer.yearAdopted ?? '—',
                  ayc: summary.topPerformer.aycRatified
                    ? t('policy.aycRatifiedShort')
                    : t('policy.aycNotRatified'),
                })}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* View full */}
      <Pressable
        onPress={goToFull}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 active:bg-muted"
      >
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text className="text-[14px] font-semibold text-primary">
          {t('policy.viewFull')}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export const PolicyMonitorWidget = memo(PolicyMonitorWidgetImpl);

function StatTile({
  icon,
  accent,
  label,
  value,
  of,
  sub,
  isPercent,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  label: string;
  value: number;
  of: number;
  sub: string;
  isPercent?: boolean;
}) {
  const pct = Math.min(100, (value / Math.max(of, 1)) * 100);
  return (
    <View
      style={{ backgroundColor: 'rgba(255,255,255,0.025)', width: '48.5%' }}
      className="rounded-2xl border border-border p-3"
    >
      <View
        style={{ backgroundColor: accent + '20' }}
        className="h-7 w-7 items-center justify-center rounded-lg"
      >
        <Ionicons name={icon} size={14} color={accent} />
      </View>
      <Text
        className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        numberOfLines={2}
      >
        {label}
      </Text>
      <View className="mt-1.5 flex-row items-baseline gap-1">
        <Text
          className="font-display text-2xl font-bold tabular-nums"
          style={{ color: accent }}
        >
          {value}
          {isPercent ? '%' : ''}
        </Text>
        {!isPercent ? (
          <Text className="text-[11px] font-medium text-muted-foreground tabular-nums">
            / {of}
          </Text>
        ) : null}
      </View>
      <Text
        className="mt-1 text-[10px] leading-[14px] text-muted-foreground"
        numberOfLines={2}
      >
        {sub}
      </Text>
      <View
        className="mt-2 h-1 overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: accent }} />
      </View>
    </View>
  );
}

function TierChip({
  color,
  label,
  count,
  pct,
}: {
  color: string;
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.025)',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
      className="flex-1 flex-row items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
    >
      <View
        style={{ backgroundColor: color, width: 8, height: 8, borderRadius: 4 }}
      />
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-semibold leading-tight text-foreground">
          {label}
        </Text>
        <Text className="text-[10px] text-muted-foreground tabular-nums">
          {count} · {pct.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}


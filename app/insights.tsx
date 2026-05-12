import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnomalies, useCorrelations } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import type { Anomaly, Correlation } from '@/lib/api';

type Tab = 'anomalies' | 'correlations';

export default function InsightsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>('anomalies');
  const [year, setYear] = useState(2024);

  const anomaliesQ = useAnomalies(year);
  const correlationsQ = useCorrelations();

  const anomalies = useMemo(
    () => (Array.isArray(anomaliesQ.data) ? anomaliesQ.data : []),
    [anomaliesQ.data],
  );
  const correlations = useMemo(
    () => (Array.isArray(correlationsQ.data) ? correlationsQ.data : []),
    [correlationsQ.data],
  );

  const summary = {
    total: anomalies.length + correlations.length,
    critical: anomalies.filter((a) => a.severity === 'critical').length,
    positive: anomalies.filter((a) => a.severity === 'positive').length,
    correlations: correlations.length,
  };

  const isLoading = anomaliesQ.isLoading || correlationsQ.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <View className="ml-2 flex-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text className="font-display text-lg font-bold text-foreground">AI Insights</Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            Anomalies and correlations across all countries
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-10">
        <View className="flex-row gap-2 mb-4">
          <SummaryStat label="Signals" value={summary.total} icon="sparkles" tint="primary" />
          <SummaryStat label="Critical" value={summary.critical} icon="warning" tint="red" />
          <SummaryStat label="Positive" value={summary.positive} icon="trophy" tint="green" />
          <SummaryStat
            label="Correlations"
            value={summary.correlations}
            icon="link"
            tint="gold"
          />
        </View>

        <View className="mb-3 flex-row gap-2">
          <TabPill label="Anomalies" active={tab === 'anomalies'} onPress={() => setTab('anomalies')} />
          <TabPill
            label="Correlations"
            active={tab === 'correlations'}
            onPress={() => setTab('correlations')}
          />
        </View>

        {tab === 'anomalies' && (
          <View className="mb-3 flex-row gap-2">
            {[2024, 2023, 2022].map((y) => (
              <Pressable
                key={y}
                onPress={() => setYear(y)}
                className={`rounded-full px-3 py-1 border ${
                  year === y ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    year === y ? 'text-background' : 'text-foreground'
                  }`}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {isLoading ? (
          <View className="rounded-2xl border border-border bg-card p-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : tab === 'anomalies' ? (
          anomalies.length === 0 ? (
            <EmptyState text={`No anomalies recorded for ${year}.`} />
          ) : (
            <View className="gap-3">
              {anomalies.map((a, i) => (
                <AnomalyCard key={`${a.countryId}-${a.indicatorId}-${i}`} anomaly={a} />
              ))}
            </View>
          )
        ) : correlations.length === 0 ? (
          <EmptyState text="No strong correlations detected yet." />
        ) : (
          <View className="gap-3">
            {correlations.map((c, i) => (
              <CorrelationCard key={i} correlation={c} />
            ))}
          </View>
        )}

        <OpenOnWebLink href={webLinks.insights} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TabPill({
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
      className={`flex-1 rounded-full px-3 py-2 border ${
        active ? 'bg-primary border-primary' : 'bg-card border-border'
      }`}
    >
      <Text
        className={`text-center text-xs font-semibold ${
          active ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: 'primary' | 'red' | 'green' | 'gold';
}) {
  const colors = useThemeColors();
  const map = {
    primary: { bg: 'bg-primary/15', fg: colors.primary },
    red: { bg: 'bg-destructive/15', fg: colors.destructive },
    green: { bg: 'bg-primary/15', fg: colors.aydGreen },
    gold: { bg: 'bg-secondary/15', fg: colors.aydGold },
  } as const;
  const t = map[tint];
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
      <View className={`h-7 w-7 items-center justify-center rounded-lg ${t.bg}`}>
        <Ionicons name={icon} size={15} color={t.fg} />
      </View>
      <Text className="mt-2 text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
    </View>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const colors = useThemeColors();
  const sev =
    anomaly.severity === 'critical'
      ? { bgClass: 'bg-destructive/10', borderClass: 'border-destructive', textClass: 'text-destructive', icon: 'warning' as const, color: colors.destructive }
      : anomaly.severity === 'warning'
      ? { bgClass: 'bg-secondary/15', borderClass: 'border-secondary', textClass: 'text-secondary', icon: 'alert-circle' as const, color: colors.aydGold }
      : { bgClass: 'bg-primary/15', borderClass: 'border-primary', textClass: 'text-primary', icon: 'trophy' as const, color: colors.aydGreen };
  const arrow = anomaly.direction === 'above' ? 'arrow-up' : 'arrow-down';

  return (
    <View className={`rounded-2xl border border-border bg-card border-l-4 ${sev.borderClass}`}>
      <View className="p-4">
        <View className="flex-row gap-3">
          <View className={`h-10 w-10 items-center justify-center rounded-xl ${sev.bgClass}`}>
            <Ionicons name={sev.icon} size={18} color={sev.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap mb-1.5">
              <View className={`rounded-full px-2 py-0.5 ${sev.bgClass}`}>
                <Text className={`text-[10px] font-semibold uppercase ${sev.textClass}`}>
                  {anomaly.severity}
                </Text>
              </View>
              <Text className="text-[10px] text-muted-foreground">
                {anomaly.year} · {anomaly.deviations.toFixed(2)}σ
              </Text>
            </View>
            <Text className="font-display text-base font-bold text-foreground">
              {anomaly.countryName}
            </Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {anomaly.indicatorName}
            </Text>

            <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-muted px-3 py-1.5 self-start">
              <Ionicons name={arrow} size={14} color={sev.color} />
              <Text className={`text-sm font-bold ${sev.textClass}`}>
                {anomaly.value.toFixed(2)}
              </Text>
              <Text className="text-[10px] text-muted-foreground">
                vs mean {anomaly.mean.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function CorrelationCard({ correlation }: { correlation: Correlation }) {
  const colors = useThemeColors();
  const isPositive = correlation.direction === 'positive';
  const tint = isPositive ? colors.aydGreen : colors.destructive;
  return (
    <View
      className="rounded-2xl border border-border bg-card border-l-4"
      style={{ borderLeftColor: tint }}
    >
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="rounded-full bg-muted px-2 py-0.5">
            <Text className="text-[10px] font-semibold uppercase text-muted-foreground">
              {correlation.strength}
            </Text>
          </View>
          <Text className="text-xs font-semibold" style={{ color: tint }}>
            r = {correlation.correlation.toFixed(2)}
          </Text>
        </View>
        <Text className="font-display text-sm font-bold text-foreground">
          {correlation.indicator1.name} ↔ {correlation.indicator2.name}
        </Text>
        <Text className="mt-1.5 text-xs text-muted-foreground">
          {correlation.interpretation}
        </Text>
        <Text className="mt-2 text-[10px] text-muted-foreground">
          n = {correlation.sampleSize}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <View className="rounded-2xl border border-border bg-card p-8 items-center">
      <Ionicons name="sparkles-outline" size={36} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-muted-foreground">{text}</Text>
    </View>
  );
}

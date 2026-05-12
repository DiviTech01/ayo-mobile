import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnomalies } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import type { Anomaly } from '@/lib/api';

type Tone = 'critical' | 'warning' | 'positive' | 'info';

const TONE_TINT: Record<
  Tone,
  { iconBg: string; iconColor: (c: ReturnType<typeof useThemeColors>) => string; ionName: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  critical: {
    iconBg: 'bg-pan-red-500/15',
    iconColor: (c) => c.aydRed,
    ionName: 'alert-circle',
  },
  warning: {
    iconBg: 'bg-pan-gold-500/15',
    iconColor: (c) => c.aydGold,
    ionName: 'warning',
  },
  positive: {
    iconBg: 'bg-pan-green-500/15',
    iconColor: (c) => c.aydGreen,
    ionName: 'trending-up',
  },
  info: {
    iconBg: 'bg-pan-blue-500/15',
    iconColor: (c) => c.aydBlue,
    ionName: 'information-circle',
  },
};

function toneFor(a: Anomaly): Tone {
  if (a.severity === 'critical') return 'critical';
  if (a.severity === 'warning') return 'warning';
  if (a.severity === 'positive') return 'positive';
  return 'info';
}

function describe(a: Anomaly): { title: string; body: string } {
  const direction = a.direction === 'above' ? 'above' : 'below';
  const stdev = Math.abs(a.deviations).toFixed(1);
  return {
    title: `${a.countryName}: ${a.indicatorName}`,
    body: `${stdev}σ ${direction} regional mean (${a.value.toFixed(1)} vs ${a.mean.toFixed(1)}, ${a.year})`,
  };
}

export function QuickInsights({ limit = 3, year = 2024 }: { limit?: number; year?: number }) {
  const router = useRouter();
  const colors = useThemeColors();
  const { data, isLoading } = useAnomalies(year);

  const insights = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    const rank = (a: Anomaly) =>
      a.severity === 'critical' ? 0 : a.severity === 'warning' ? 1 : a.severity === 'positive' ? 2 : 3;
    return [...arr]
      .sort((x, y) => rank(x) - rank(y) || Math.abs(y.deviations) - Math.abs(x.deviations))
      .slice(0, limit);
  }, [data, limit]);

  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text className="font-display text-lg font-bold text-foreground">AI Insights</Text>
      </View>
      <Text className="mt-1 text-sm text-muted-foreground">
        Key findings from youth development data
      </Text>

      <View className="mt-4 gap-3">
        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : insights.length === 0 ? (
          <Text className="py-4 text-center text-sm text-muted-foreground">
            No flagged anomalies for {year} yet.
          </Text>
        ) : (
          insights.map((a, i) => {
            const tone = toneFor(a);
            const tint = TONE_TINT[tone];
            const meta = describe(a);
            return (
              <View
                key={`${a.countryId}-${a.indicatorId}-${i}`}
                className="flex-row items-start gap-3 rounded-xl border border-border bg-muted/40 p-3"
              >
                <View
                  className={`h-9 w-9 items-center justify-center rounded-lg ${tint.iconBg}`}
                >
                  <Ionicons
                    name={tint.ionName}
                    size={16}
                    color={tint.iconColor(colors)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                    {meta.title}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4 text-muted-foreground">
                    {meta.body}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <Pressable
        onPress={() => {
          tapLight();
          router.push('/insights' as unknown as Href);
        }}
        className="mt-4 flex-row items-center justify-center gap-1.5 rounded-md py-2.5 active:bg-muted"
      >
        <Text className="text-sm font-semibold text-foreground">View All Insights</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

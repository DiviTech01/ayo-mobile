import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useYouthIndexRankings } from '@/lib/queries';
import { WidgetCard } from './WidgetCard';
import type { YouthIndexScore } from '@/lib/api';

const REGIONS: Array<YouthIndexScore['country']['region']> = [
  'North Africa',
  'West Africa',
  'East Africa',
  'Central Africa',
  'Southern Africa',
];

const REGION_TINT: Record<string, string> = {
  'North Africa': 'bg-pan-gold-500',
  'West Africa': 'bg-pan-green-500',
  'East Africa': 'bg-pan-blue-500',
  'Central Africa': 'bg-pan-red-500',
  'Southern Africa': 'bg-purple-500',
};

export function RegionalBreakdown() {
  const q = useYouthIndexRankings();

  const averages = useMemo(() => {
    const rows = Array.isArray(q.data) ? q.data : [];
    return REGIONS.map((region) => {
      const slice = rows.filter((r) => r.country.region === region);
      const avg =
        slice.length > 0
          ? slice.reduce((sum, r) => sum + r.overallScore, 0) / slice.length
          : 0;
      return { region, score: avg, count: slice.length };
    });
  }, [q.data]);

  return (
    <WidgetCard
      title="Regional Breakdown"
      subtitle="Average index score by region"
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
    >
      <View className="gap-3">
        {averages.map((row) => {
          const widthPct = Math.max(2, Math.min(100, row.score));
          return (
            <View key={row.region}>
              <View className="mb-1 flex-row items-baseline justify-between">
                <Text className="text-sm font-medium text-gray-900">{row.region}</Text>
                <Text className="text-xs text-gray-500">
                  <Text className="font-semibold text-gray-900">{row.score.toFixed(1)}</Text>
                  {' · '}
                  {row.count} countries
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                <View
                  className={`h-full rounded-full ${REGION_TINT[row.region] ?? 'bg-gray-400'}`}
                  style={{ width: `${widthPct}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </WidgetCard>
  );
}

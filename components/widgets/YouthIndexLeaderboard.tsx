import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useYouthIndexRankings } from '@/lib/queries';
import { WidgetCard } from './WidgetCard';
import type { YouthIndexScore } from '@/lib/api';

const TIER_COLOR: Record<YouthIndexScore['tier'], string> = {
  high: 'bg-pan-green-500',
  medium: 'bg-pan-gold-500',
  low: 'bg-pan-red-500',
};

export function YouthIndexLeaderboard() {
  const router = useRouter();
  const q = useYouthIndexRankings();

  const top5 = Array.isArray(q.data) ? q.data.slice(0, 5) : [];

  return (
    <WidgetCard
      title="Youth Empowerment Index"
      subtitle="Top performers across all dimensions"
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
      onPressMore={() => router.push('/(tabs)/countries')}
    >
      <View className="gap-2.5">
        {top5.map((row) => (
          <Row key={row.countryId} row={row} />
        ))}
        {top5.length === 0 && !q.isLoading && (
          <Text className="py-2 text-sm text-gray-500">No rankings yet.</Text>
        )}
      </View>
    </WidgetCard>
  );
}

function Row({ row }: { row: YouthIndexScore }) {
  const score = Math.round(row.overallScore * 10) / 10;
  const widthPct = Math.max(2, Math.min(100, row.overallScore));

  return (
    <View className="flex-row items-center gap-3">
      <Text className="w-5 text-sm font-semibold text-gray-400">{row.rank}</Text>
      <Text className="text-xl">{row.country.flagEmoji}</Text>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {row.country.name}
        </Text>
        <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <View
            className={`h-full rounded-full ${TIER_COLOR[row.tier]}`}
            style={{ width: `${widthPct}%` }}
          />
        </View>
      </View>
      <Text className="w-12 text-right text-sm font-semibold tabular-nums text-gray-900">
        {score.toFixed(1)}
      </Text>
    </View>
  );
}

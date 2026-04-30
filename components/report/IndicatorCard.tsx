import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Indicator } from '@/data/countryReports';

const SEV_BORDER: Record<Indicator['severity'], string> = {
  red: 'border-pan-red-200',
  gold: 'border-pan-gold-200',
  green: 'border-pan-green-200',
  navy: 'border-pan-blue-200',
};

const SEV_BAR: Record<Indicator['severity'], string> = {
  red: 'bg-pan-red-500',
  gold: 'bg-pan-gold-500',
  green: 'bg-pan-green-500',
  navy: 'bg-pan-blue-500',
};

const TREND_ICON: Record<Indicator['trend'], { name: 'trending-up' | 'trending-down' | 'remove'; color: string }> = {
  'up-good': { name: 'trending-up', color: '#15803d' },
  'up-bad': { name: 'trending-up', color: '#b91c1c' },
  'down-good': { name: 'trending-down', color: '#15803d' },
  'down-bad': { name: 'trending-down', color: '#b91c1c' },
  flat: { name: 'remove', color: '#6b7280' },
};

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const trend = TREND_ICON[indicator.trend];
  const widthPct = Math.max(2, Math.min(100, indicator.barPct));

  return (
    <View className={`rounded-xl border bg-white p-4 ${SEV_BORDER[indicator.severity]}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {indicator.topic}
          </Text>
          <Text className="mt-0.5 text-2xl font-bold text-gray-900 tabular-nums">
            {indicator.value}
          </Text>
        </View>
        <Ionicons name={trend.name} size={18} color={trend.color} />
      </View>

      <Text className="mt-2 text-xs leading-4 text-gray-700">{indicator.label}</Text>

      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <View
          className={`h-full rounded-full ${SEV_BAR[indicator.severity]}`}
          style={{ width: `${widthPct}%` }}
        />
      </View>

      <Text className="mt-2 text-[11px] italic text-gray-500" numberOfLines={2}>
        {indicator.compare}
      </Text>
    </View>
  );
}

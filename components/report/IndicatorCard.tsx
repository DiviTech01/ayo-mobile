import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Indicator } from '@/data/countryReports';
import { useThemeColors } from '@/lib/theme-colors';

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

type TrendKey = Indicator['trend'];

const TREND_ICON: Record<TrendKey, 'trending-up' | 'trending-down' | 'remove'> = {
  'up-good': 'trending-up',
  'up-bad': 'trending-up',
  'down-good': 'trending-down',
  'down-bad': 'trending-down',
  flat: 'remove',
};

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const colors = useThemeColors();
  const trendName = TREND_ICON[indicator.trend];
  const trendColor =
    indicator.trend === 'up-good' || indicator.trend === 'down-good'
      ? colors.aydGreen
      : indicator.trend === 'up-bad' || indicator.trend === 'down-bad'
      ? colors.aydRed
      : colors.mutedForeground;
  const widthPct = Math.max(2, Math.min(100, indicator.barPct));

  return (
    <View className={`rounded-xl border bg-card p-4 ${SEV_BORDER[indicator.severity]}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {indicator.topic}
          </Text>
          <Text className="mt-0.5 font-display text-2xl font-bold text-foreground tabular-nums">
            {indicator.value}
          </Text>
        </View>
        <Ionicons name={trendName} size={18} color={trendColor} />
      </View>

      <Text className="mt-2 text-xs leading-4 text-foreground">{indicator.label}</Text>

      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <View
          className={`h-full rounded-full ${SEV_BAR[indicator.severity]}`}
          style={{ width: `${widthPct}%` }}
        />
      </View>

      <Text className="mt-2 text-[11px] italic text-muted-foreground" numberOfLines={2}>
        {indicator.compare}
      </Text>
    </View>
  );
}

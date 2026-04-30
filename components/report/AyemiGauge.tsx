import { Text, View } from 'react-native';
import type { AyemiTier } from '@/data/countryReports';

const TIER_RING: Record<AyemiTier, string> = {
  Critical: 'border-pan-red-500',
  Developing: 'border-pan-gold-500',
  Fulfilling: 'border-pan-green-500',
};

const TIER_BG: Record<AyemiTier, string> = {
  Critical: 'bg-pan-red-50',
  Developing: 'bg-pan-gold-50',
  Fulfilling: 'bg-pan-green-50',
};

const TIER_TEXT: Record<AyemiTier, string> = {
  Critical: 'text-pan-red-700',
  Developing: 'text-pan-gold-700',
  Fulfilling: 'text-pan-green-700',
};

type Props = { score: number; tier: AyemiTier; size?: number };

export function AyemiGauge({ score, tier, size = 140 }: Props) {
  return (
    <View className="items-center">
      <View
        className={`items-center justify-center rounded-full border-[6px] ${TIER_RING[tier]} ${TIER_BG[tier]}`}
        style={{ width: size, height: size }}
      >
        <Text className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          AYEMI Score
        </Text>
        <Text className="text-5xl font-bold text-gray-900 tabular-nums">{score}</Text>
        <Text className="text-xs text-gray-500">out of 100</Text>
      </View>
      <View className={`mt-3 rounded-full px-3 py-1 ${TIER_BG[tier]}`}>
        <Text className={`text-xs font-semibold uppercase tracking-wide ${TIER_TEXT[tier]}`}>
          {tier}
        </Text>
      </View>
    </View>
  );
}

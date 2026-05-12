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

const TIER_INNER_LABEL: Record<AyemiTier, string> = {
  Critical: 'text-pan-red-700',
  Developing: 'text-pan-gold-800',
  Fulfilling: 'text-pan-green-700',
};

const TIER_INNER_NUMBER: Record<AyemiTier, string> = {
  Critical: 'text-pan-red-900',
  Developing: 'text-pan-gold-900',
  Fulfilling: 'text-pan-green-900',
};

type Props = { score: number; tier: AyemiTier; size?: number };

export function AyemiGauge({ score, tier, size = 140 }: Props) {
  return (
    <View className="items-center">
      <View
        className={`items-center justify-center rounded-full border-[6px] ${TIER_RING[tier]} ${TIER_BG[tier]}`}
        style={{ width: size, height: size }}
      >
        <Text
          className={`text-[10px] font-medium uppercase tracking-wider ${TIER_INNER_LABEL[tier]}`}
        >
          AYEMI Score
        </Text>
        <Text className={`font-display text-5xl font-bold tabular-nums ${TIER_INNER_NUMBER[tier]}`}>
          {score}
        </Text>
        <Text className={`text-xs ${TIER_INNER_LABEL[tier]}`}>out of 100</Text>
      </View>
      <View className={`mt-3 rounded-full px-3 py-1 ${TIER_BG[tier]}`}>
        <Text className={`text-xs font-semibold uppercase tracking-wide ${TIER_TEXT[tier]}`}>
          {tier}
        </Text>
      </View>
    </View>
  );
}

import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type ComplianceTier = 'high' | 'medium' | 'low';

export const TIER_ACCENT: Record<
  ComplianceTier,
  { hex: string; soft: string; ring: string; label: string }
> = {
  high: { hex: '#22C55E', soft: 'rgba(34,197,94,0.12)', ring: 'rgba(34,197,94,0.35)', label: 'High' },
  medium: { hex: '#F59E0B', soft: 'rgba(245,158,11,0.12)', ring: 'rgba(245,158,11,0.35)', label: 'Medium' },
  low: { hex: '#EF4444', soft: 'rgba(239,68,68,0.12)', ring: 'rgba(239,68,68,0.35)', label: 'Low' },
};

export function tierFor(score: number): ComplianceTier {
  if (score > 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export function ScoreGauge({ score, size = 56 }: { score: number; size?: number }) {
  const accent = TIER_ACCENT[tierFor(score)].hex;
  const strokeWidth = Math.max(3, size * 0.07);
  const r = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          className="font-display font-bold tabular-nums"
          style={{ color: accent, fontSize: size * 0.32 }}
        >
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
}

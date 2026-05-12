import { Text, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useChartPalette } from './colors';
import { useThemeColors } from '@/lib/theme-colors';

type Datum = { year: string } & Record<string, string | number>;

type Props = {
  data: Datum[];
  series: string[];
  width?: number;
  height?: number;
};

export function BarChart({ data, series, width = 320, height = 180 }: Props) {
  const palette = useChartPalette();
  const colors = useThemeColors();
  const padding = { top: 12, right: 8, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    100,
    ...data.flatMap((d) => series.map((s) => Number(d[s] ?? 0))),
  );
  const yStep = maxValue / 4;

  const groupCount = data.length;
  const groupWidth = chartW / groupCount;
  const innerPad = 6;
  const barWidth = (groupWidth - innerPad * 2) / series.length;

  return (
    <View>
      <Svg width={width} height={height}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding.top + (chartH * i) / 4;
          const value = Math.round(maxValue - yStep * i);
          return (
            <G key={i}>
              <Line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 4}
                y={y + 3}
                fontSize={9}
                fill={colors.mutedForeground}
                textAnchor="end"
              >
                {value}
              </SvgText>
            </G>
          );
        })}

        {data.map((d, i) => {
          const groupX = padding.left + i * groupWidth + innerPad;
          return (
            <G key={i}>
              {series.map((s, si) => {
                const value = Number(d[s] ?? 0);
                const h = (value / maxValue) * chartH;
                const x = groupX + si * barWidth;
                const y = padding.top + chartH - h;
                return (
                  <Rect
                    key={s}
                    x={x}
                    y={y}
                    width={Math.max(2, barWidth - 1)}
                    height={Math.max(0, h)}
                    fill={palette[si % palette.length]}
                    rx={1.5}
                  />
                );
              })}
              <SvgText
                x={groupX + (groupWidth - innerPad * 2) / 2}
                y={height - 6}
                fontSize={9}
                fill={colors.mutedForeground}
                textAnchor="middle"
              >
                {d.year}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      <Legend series={series} />
    </View>
  );
}

export function Legend({ series }: { series: string[] }) {
  const palette = useChartPalette();
  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      {series.map((s, i) => (
        <View key={s} className="flex-row items-center gap-1.5">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: palette[i % palette.length],
            }}
          />
          <Text className="text-[10px] text-muted-foreground">{s}</Text>
        </View>
      ))}
    </View>
  );
}

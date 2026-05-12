import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useChartPalette } from './colors';
import { Legend } from './BarChart';
import { useThemeColors } from '@/lib/theme-colors';

type Datum = { year: string } & Record<string, string | number>;

type Props = {
  data: Datum[];
  series: string[];
  fill?: boolean;
  width?: number;
  height?: number;
};

export function LineChart({ data, series, fill = false, width = 320, height = 180 }: Props) {
  const palette = useChartPalette();
  const colors = useThemeColors();
  const padding = { top: 12, right: 12, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    100,
    ...data.flatMap((d) => series.map((s) => Number(d[s] ?? 0))),
  );

  const xFor = (i: number) =>
    padding.left + (data.length === 1 ? chartW / 2 : (chartW * i) / (data.length - 1));
  const yFor = (v: number) => padding.top + chartH - (v / maxValue) * chartH;

  return (
    <View>
      <Svg width={width} height={height}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding.top + (chartH * i) / 4;
          const value = Math.round(maxValue - (maxValue / 4) * i);
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

        {series.map((s, si) => {
          const points = data.map((d, i) => ({
            x: xFor(i),
            y: yFor(Number(d[s] ?? 0)),
          }));
          const linePath = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
          const fillPath =
            points.length > 0
              ? `${linePath} L ${points[points.length - 1].x} ${
                  padding.top + chartH
                } L ${points[0].x} ${padding.top + chartH} Z`
              : '';

          const seriesColor = palette[si % palette.length];
          return (
            <G key={s}>
              {fill && (
                <Path d={fillPath} fill={seriesColor} fillOpacity={0.12} />
              )}
              <Path
                d={linePath}
                stroke={seriesColor}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={seriesColor} />
              ))}
            </G>
          );
        })}

        {data.map((d, i) => (
          <SvgText
            key={i}
            x={xFor(i)}
            y={height - 6}
            fontSize={9}
            fill={colors.mutedForeground}
            textAnchor="middle"
          >
            {d.year}
          </SvgText>
        ))}
      </Svg>

      <Legend series={series} />
    </View>
  );
}

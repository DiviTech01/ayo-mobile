import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { colorFor } from './colors';
import { Legend } from './BarChart';

type Datum = { dimension: string } & Record<string, string | number>;

type Props = {
  data: Datum[];
  series: string[];
  width?: number;
  height?: number;
};

export function RadarChart({ data, series, width = 320, height = 240 }: Props) {
  const cx = width / 2;
  const cy = height / 2 - 6;
  const radius = Math.min(width, height) / 2 - 32;
  const axisCount = data.length;
  const maxValue = 100;

  const angleFor = (i: number) => (Math.PI * 2 * i) / axisCount - Math.PI / 2;

  const pointFor = (axisIdx: number, value: number) => {
    const r = (value / maxValue) * radius;
    const a = angleFor(axisIdx);
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
    };
  };

  return (
    <View>
      <Svg width={width} height={height}>
        {[0.25, 0.5, 0.75, 1].map((scale, i) => {
          const points = data
            .map((_, axisIdx) => {
              const a = angleFor(axisIdx);
              return `${cx + Math.cos(a) * radius * scale},${
                cy + Math.sin(a) * radius * scale
              }`;
            })
            .join(' ');
          return (
            <G key={i}>
              <Path
                d={`M ${points.split(' ').join(' L ')} Z`}
                stroke="#e5e7eb"
                strokeWidth={1}
                fill="none"
              />
            </G>
          );
        })}

        {data.map((_, i) => {
          const a = angleFor(i);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * radius}
              y2={cy + Math.sin(a) * radius}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {series.map((s, si) => {
          const points = data.map((d, axisIdx) => pointFor(axisIdx, Number(d[s] ?? 0)));
          const path =
            points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ') + ' Z';
          return (
            <G key={s}>
              <Path
                d={path}
                fill={colorFor(si)}
                fillOpacity={0.15}
                stroke={colorFor(si)}
                strokeWidth={1.5}
              />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={2} fill={colorFor(si)} />
              ))}
            </G>
          );
        })}

        {data.map((d, i) => {
          const a = angleFor(i);
          const labelR = radius + 12;
          const x = cx + Math.cos(a) * labelR;
          const y = cy + Math.sin(a) * labelR + 3;
          return (
            <SvgText
              key={i}
              x={x}
              y={y}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.dimension}
            </SvgText>
          );
        })}
      </Svg>

      <Legend series={series} />
    </View>
  );
}

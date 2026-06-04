import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import type { ChartType, SeriesPoint, Widget } from '@/lib/widgets';

const CHART_COLORS = [
  '#22C55E',
  '#F59E0B',
  '#3B82F6',
  '#A855F7',
  '#F43F5E',
];

const AXIS_COLOR = 'rgba(255,255,255,0.45)';
const GRID_COLOR = 'rgba(255,255,255,0.06)';

export function WidgetChart({ widget, height = 200 }: { widget: Widget; height?: number }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (widget.chartType === 'stat') {
    const stat = widget.data[0] as { value: number; change: number };
    const positive = (stat.change ?? 0) >= 0;
    return (
      <View style={{ height }} className="items-center justify-center">
        <Text className="font-display text-5xl font-bold text-foreground tabular-nums">
          {stat.value}%
        </Text>
        <Text
          className="mt-2 text-sm font-medium"
          style={{ color: positive ? '#34d399' : '#f87171' }}
        >
          {positive ? '+' : ''}
          {stat.change}% from last year
        </Text>
      </View>
    );
  }

  return (
    <View onLayout={onLayout}>
      <View style={{ height }}>
        {width > 0 ? (
          widget.chartType === 'radar' ? (
            <RadarChart data={widget.data} countries={widget.countries} width={width} height={height} />
          ) : (
            <CartesianChart
              data={widget.data}
              countries={widget.countries}
              chartType={widget.chartType}
              width={width}
              height={height}
            />
          )
        ) : null}
      </View>
      <Legend countries={widget.countries} />
    </View>
  );
}

function Legend({ countries }: { countries: string[] }) {
  return (
    <View className="mt-2 flex-row flex-wrap justify-center gap-x-3 gap-y-1">
      {countries.map((c, i) => (
        <View key={c} className="flex-row items-center gap-1">
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
            }}
          />
          <Text className="text-[10px] text-muted-foreground">{c}</Text>
        </View>
      ))}
    </View>
  );
}

function CartesianChart({
  data,
  countries,
  chartType,
  width,
  height,
}: {
  data: SeriesPoint[];
  countries: string[];
  chartType: Exclude<ChartType, 'stat' | 'radar'>;
  width: number;
  height: number;
}) {
  const paddingLeft = 28;
  const paddingRight = 8;
  const paddingTop = 8;
  const paddingBottom = 22;
  const innerW = Math.max(1, width - paddingLeft - paddingRight);
  const innerH = Math.max(1, height - paddingTop - paddingBottom - 18);

  const values = data.flatMap((d) =>
    countries.map((c) => (typeof d[c] === 'number' ? (d[c] as number) : 0)),
  );
  const max = Math.max(100, Math.ceil(Math.max(...values, 1) / 10) * 10);
  const yTicks = 4;

  const xLabels = data.map((d) => String(d.year ?? ''));
  const stepX = innerW / Math.max(1, data.length - 1);
  const groupW = innerW / data.length;
  const barW = Math.max(3, (groupW * 0.7) / countries.length);

  return (
    <Svg width={width} height={height}>
      {/* Y axis grid lines */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = paddingTop + (innerH * i) / yTicks;
        const v = Math.round(max - (max * i) / yTicks);
        return (
          <G key={i}>
            <Line
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + innerW}
              y2={y}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
            <SvgText
              x={paddingLeft - 4}
              y={y + 3}
              fill={AXIS_COLOR}
              fontSize={9}
              textAnchor="end"
            >
              {v}
            </SvgText>
          </G>
        );
      })}

      {/* X axis labels */}
      {xLabels.map((label, i) => {
        const x =
          chartType === 'bar'
            ? paddingLeft + groupW * i + groupW / 2
            : paddingLeft + stepX * i;
        return (
          <SvgText
            key={`x-${i}`}
            x={x}
            y={paddingTop + innerH + 14}
            fill={AXIS_COLOR}
            fontSize={9}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}

      {/* Series */}
      {countries.map((c, ci) => {
        const color = CHART_COLORS[ci % CHART_COLORS.length];

        if (chartType === 'bar') {
          return (
            <G key={c}>
              {data.map((d, di) => {
                const v = typeof d[c] === 'number' ? (d[c] as number) : 0;
                const h = (innerH * v) / max;
                const x = paddingLeft + groupW * di + (groupW - barW * countries.length) / 2 + barW * ci;
                const y = paddingTop + innerH - h;
                return (
                  <Rect
                    key={`b-${ci}-${di}`}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(1, h)}
                    fill={color}
                    rx={2}
                  />
                );
              })}
            </G>
          );
        }

        const points = data
          .map((d, di) => {
            const v = typeof d[c] === 'number' ? (d[c] as number) : 0;
            const x = paddingLeft + stepX * di;
            const y = paddingTop + innerH - (innerH * v) / max;
            return `${x},${y}`;
          })
          .join(' ');

        if (chartType === 'area') {
          const areaPath = `M ${paddingLeft},${paddingTop + innerH} L ${points
            .split(' ')
            .join(' L ')} L ${paddingLeft + innerW},${paddingTop + innerH} Z`;
          return (
            <G key={c}>
              <Path d={areaPath} fill={color} opacity={0.2} />
              <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </G>
          );
        }

        return (
          <G key={c}>
            <Polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {data.map((d, di) => {
              const v = typeof d[c] === 'number' ? (d[c] as number) : 0;
              const x = paddingLeft + stepX * di;
              const y = paddingTop + innerH - (innerH * v) / max;
              return <Circle key={`dot-${ci}-${di}`} cx={x} cy={y} r={2.5} fill={color} />;
            })}
          </G>
        );
      })}
    </Svg>
  );
}

function RadarChart({
  data,
  countries,
  width,
  height,
}: {
  data: SeriesPoint[];
  countries: string[];
  width: number;
  height: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 26;
  const dims = data.length;
  const rings = 4;
  const max = 100;

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / dims;
  const pointFor = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (radius * v) / max;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };

  return (
    <Svg width={width} height={height}>
      {/* Concentric rings */}
      {Array.from({ length: rings }).map((_, ri) => {
        const r = (radius * (ri + 1)) / rings;
        const pts = data
          .map((_, di) => {
            const a = angleFor(di);
            return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
          })
          .join(' ');
        return (
          <Polygon
            key={ri}
            points={pts}
            fill="none"
            stroke={GRID_COLOR}
            strokeWidth={1}
          />
        );
      })}

      {/* Spokes */}
      {data.map((_, di) => {
        const a = angleFor(di);
        return (
          <Line
            key={`s-${di}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * radius}
            y2={cy + Math.sin(a) * radius}
            stroke={GRID_COLOR}
          />
        );
      })}

      {/* Dimension labels */}
      {data.map((d, di) => {
        const a = angleFor(di);
        const x = cx + Math.cos(a) * (radius + 14);
        const y = cy + Math.sin(a) * (radius + 14) + 3;
        return (
          <SvgText
            key={`lbl-${di}`}
            x={x}
            y={y}
            fill={AXIS_COLOR}
            fontSize={9}
            textAnchor={Math.cos(a) > 0.2 ? 'start' : Math.cos(a) < -0.2 ? 'end' : 'middle'}
          >
            {String(d.dimension ?? '')}
          </SvgText>
        );
      })}

      {/* Series */}
      {countries.map((c, ci) => {
        const color = CHART_COLORS[ci % CHART_COLORS.length];
        const pts = data
          .map((d, di) => {
            const v = typeof d[c] === 'number' ? (d[c] as number) : 0;
            const [x, y] = pointFor(di, v);
            return `${x},${y}`;
          })
          .join(' ');
        return (
          <Polygon
            key={c}
            points={pts}
            fill={color}
            fillOpacity={0.18}
            stroke={color}
            strokeWidth={1.8}
          />
        );
      })}
    </Svg>
  );
}

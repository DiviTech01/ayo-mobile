import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View, type LayoutChangeEvent } from 'react-native';
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
import { useQueries } from '@tanstack/react-query';
import { api, type ThemeSlug } from '@/lib/api';
import { useCountries, useIndicators, useYouthIndexRankings } from '@/lib/queries';
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

// Radar dimensions map 1:1 to the seven youth-index theme slugs returned by
// /youth-index/rankings — same set the web dashboard uses.
const RADAR_DIMENSIONS: [string, ThemeSlug][] = [
  ['Education', 'education'],
  ['Health', 'health'],
  ['Employment', 'employment'],
  ['Entrepreneurship', 'entrepreneurship'],
  ['Demography', 'youth-demography-participation'],
  ['Peace', 'peace-security'],
  ['Justice', 'access-to-justice'],
];

// Resolves a widget's config to live chart data — straight from the API, no
// fabrication. Cartesian charts pull one real timeseries per country; radar and
// stat read youth-index dimension/overall scores. Missing values are simply
// absent, so the UI can show an honest "No data yet" state.
function useWidgetData(widget: Widget) {
  const isCartesian =
    widget.chartType === 'bar' || widget.chartType === 'line' || widget.chartType === 'area';
  const needsRankings = widget.chartType === 'radar' || widget.chartType === 'stat';

  const countriesQ = useCountries();
  const indicatorsQ = useIndicators();
  const rankingsQ = useYouthIndexRankings();

  const countries = countriesQ.data ?? [];
  const indicators = indicatorsQ.data ?? [];
  const rankings = rankingsQ.data ?? [];

  const indicatorId = useMemo(() => {
    if (!isCartesian) return undefined;
    return indicators.find((i) => i.slug === widget.indicator || i.name === widget.indicator)?.id;
  }, [indicators, widget.indicator, isCartesian]);

  const resolved = useMemo(
    () =>
      widget.countries
        .map((name) => {
          const c = countries.find((x) => x.name === name);
          return c ? { name, id: c.id } : null;
        })
        .filter((x): x is { name: string; id: string } => x !== null),
    [countries, widget.countries],
  );

  // One timeseries query per country — only fires for cartesian charts with a
  // resolved indicator (others stay disabled, so this is cheap).
  const tsQueries = useQueries({
    queries: resolved.map((r) => ({
      queryKey: ['widget-ts', indicatorId, r.id] as const,
      queryFn: () => api.data.timeseries({ indicatorId: indicatorId as string, countryId: r.id }),
      enabled: isCartesian && !!indicatorId,
      staleTime: 5 * 60_000,
    })),
  });

  const cartesian = useMemo(() => {
    const byYear = new Map<number, SeriesPoint>();
    const present: string[] = [];
    resolved.forEach((r, idx) => {
      const points = (tsQueries[idx]?.data ?? []) as Array<{ year: number; value: number | null }>;
      const real = points.filter((p) => typeof p.value === 'number');
      if (real.length > 0) present.push(r.name);
      real.forEach((p) => {
        const row = byYear.get(p.year) ?? { year: String(p.year) };
        row[r.name] = p.value as number;
        byYear.set(p.year, row);
      });
    });
    const rows = [...byYear.values()].sort((a, b) => Number(a.year) - Number(b.year));
    return { rows, present };
  }, [resolved, tsQueries]);

  const radar = useMemo(() => {
    const present: string[] = [];
    const dimsByName = new Map<string, Record<string, number>>();
    widget.countries.forEach((name) => {
      const c = countries.find((x) => x.name === name);
      if (!c) return;
      const row = rankings.find((r) => r.countryId === c.id);
      if (!row || !row.dimensions) return;
      dimsByName.set(name, row.dimensions as unknown as Record<string, number>);
      present.push(name);
    });
    const rows: SeriesPoint[] = RADAR_DIMENSIONS.map(([label, slug]) => {
      const entry: SeriesPoint = { dimension: label };
      present.forEach((name) => {
        const dims = dimsByName.get(name);
        if (dims && typeof dims[slug] === 'number') entry[name] = dims[slug];
      });
      return entry;
    });
    return { rows, present };
  }, [countries, rankings, widget.countries]);

  const stat = useMemo(() => {
    const name = widget.countries[0];
    if (!name) return null;
    const c = countries.find((x) => x.name === name);
    if (!c) return null;
    const row = rankings.find((r) => r.countryId === c.id);
    if (!row || typeof row.overallScore !== 'number') return null;
    return {
      value: Math.round(row.overallScore),
      change: typeof row.rankChange === 'number' ? row.rankChange : null,
    };
  }, [countries, rankings, widget.countries]);

  const isLoading =
    countriesQ.isLoading ||
    (isCartesian && indicatorsQ.isLoading) ||
    (needsRankings && rankingsQ.isLoading) ||
    (isCartesian && !!indicatorId && tsQueries.some((q) => q.isLoading));

  if (widget.chartType === 'radar') {
    return {
      kind: 'radar' as const,
      isLoading,
      isEmpty: !isLoading && radar.present.length === 0,
      data: radar.rows,
      countries: radar.present,
      stat: null,
    };
  }
  if (widget.chartType === 'stat') {
    return {
      kind: 'stat' as const,
      isLoading,
      isEmpty: !isLoading && stat === null,
      data: [] as SeriesPoint[],
      countries: [] as string[],
      stat,
    };
  }
  return {
    kind: 'cartesian' as const,
    isLoading,
    isEmpty: !isLoading && (cartesian.rows.length === 0 || cartesian.present.length === 0),
    data: cartesian.rows,
    countries: cartesian.present,
    stat: null,
  };
}

function ChartState({ height, loading = false }: { height: number; loading?: boolean }) {
  return (
    <View style={{ height }} className="items-center justify-center gap-2">
      {loading ? (
        <>
          <ActivityIndicator color="#22C55E" />
          <Text className="text-xs text-muted-foreground">Loading data…</Text>
        </>
      ) : (
        <>
          <Text className="text-sm font-medium text-muted-foreground">No data yet</Text>
          <Text className="px-6 text-center text-[11px] text-muted-foreground/70">
            No values uploaded for this selection.
          </Text>
        </>
      )}
    </View>
  );
}

export function WidgetChart({ widget, height = 200 }: { widget: Widget; height?: number }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const result = useWidgetData(widget);

  if (result.isLoading) return <ChartState height={height} loading />;
  if (result.isEmpty) return <ChartState height={height} />;

  if (result.kind === 'stat') {
    const stat = result.stat!;
    const positive = (stat.change ?? 0) >= 0;
    return (
      <View style={{ height }} className="items-center justify-center">
        <Text className="font-display text-5xl font-bold text-foreground tabular-nums">{stat.value}</Text>
        {stat.change != null ? (
          <Text className="mt-2 text-sm font-medium" style={{ color: positive ? '#34d399' : '#f87171' }}>
            {positive ? '+' : ''}
            {stat.change} rank change
          </Text>
        ) : (
          <Text className="mt-2 text-sm font-medium text-muted-foreground">AYEMI score</Text>
        )}
      </View>
    );
  }

  return (
    <View onLayout={onLayout}>
      <View style={{ height }}>
        {width > 0 ? (
          result.kind === 'radar' ? (
            <RadarChart data={result.data} countries={result.countries} width={width} height={height} />
          ) : (
            <CartesianChart
              data={result.data}
              countries={result.countries}
              chartType={widget.chartType as Exclude<ChartType, 'stat' | 'radar'>}
              width={width}
              height={height}
            />
          )
        ) : null}
      </View>
      <Legend countries={result.countries} />
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

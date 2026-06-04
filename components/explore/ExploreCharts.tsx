import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polyline,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import {
  EXPLORE_COLORS,
  linearRegression,
  type ChartPoint,
} from '@/lib/explore-data';

export type ExploreChartType = 'bar' | 'lollipop' | 'step-trend' | 'yoy';

const AXIS = 'rgba(255,255,255,0.4)';
const AXIS_DIM = 'rgba(255,255,255,0.3)';
const GRID = 'rgba(255,255,255,0.05)';
const REF = 'rgba(255,255,255,0.1)';

const HEIGHT = 280;

export function ExploreChart({
  type,
  data,
  indicator,
}: {
  type: ExploreChartType;
  data: ChartPoint[];
  indicator: string;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      {width > 0 && data.length > 0 ? (
        type === 'bar' ? (
          <BarChart data={data} width={width} indicator={indicator} />
        ) : type === 'lollipop' ? (
          <LollipopChart data={data} width={width} indicator={indicator} />
        ) : type === 'step-trend' ? (
          <StepTrendChart data={data} width={width} indicator={indicator} />
        ) : (
          <YoYChart data={data} width={width} indicator={indicator} />
        )
      ) : (
        <View style={{ height: HEIGHT }} />
      )}
    </View>
  );
}

type ChartProps = {
  data: ChartPoint[];
  width: number;
  indicator: string;
};

function useGeom(width: number, padLeft = 38) {
  const padRight = 16;
  const padTop = 16;
  const padBottom = 24;
  const innerW = Math.max(1, width - padLeft - padRight);
  const innerH = Math.max(1, HEIGHT - padTop - padBottom);
  return { padLeft, padRight, padTop, padBottom, innerW, innerH };
}

function yTicks(max: number, min = 0, count = 4) {
  return Array.from({ length: count + 1 }).map((_, i) => {
    const v = min + ((max - min) * (count - i)) / count;
    return Math.round(v);
  });
}

function renderXAxisLabels(
  data: ChartPoint[],
  innerW: number,
  padLeft: number,
  padTop: number,
  innerH: number,
  groupX: (i: number) => number,
) {
  // Skip labels if too many — keep first/last and a sampled middle.
  const n = data.length;
  const showEvery = n > 12 ? Math.ceil(n / 6) : 1;
  return data.map((d, i) => {
    const show = i === 0 || i === n - 1 || i % showEvery === 0;
    if (!show) return null;
    return (
      <SvgText
        key={`x-${i}`}
        x={groupX(i)}
        y={padTop + innerH + 14}
        fill={AXIS}
        fontSize={10}
        fontWeight="500"
        textAnchor="middle"
      >
        {d.year}
      </SvgText>
    );
  });
}

function YAxisGrid({
  innerW,
  innerH,
  padLeft,
  padTop,
  max,
  min,
  showZeroLine = false,
}: {
  innerW: number;
  innerH: number;
  padLeft: number;
  padTop: number;
  max: number;
  min: number;
  showZeroLine?: boolean;
}) {
  const ticks = yTicks(max, min);
  return (
    <G>
      {ticks.map((v, i) => {
        const y = padTop + (innerH * i) / (ticks.length - 1);
        return (
          <G key={`y-${i}`}>
            <Line
              x1={padLeft}
              y1={y}
              x2={padLeft + innerW}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
            />
            <SvgText
              x={padLeft - 4}
              y={y + 3}
              fill={AXIS_DIM}
              fontSize={9}
              textAnchor="end"
            >
              {v}
            </SvgText>
          </G>
        );
      })}
      {showZeroLine ? (
        <Line
          x1={padLeft}
          y1={padTop + innerH * (max / (max - min))}
          x2={padLeft + innerW}
          y2={padTop + innerH * (max / (max - min))}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      ) : null}
    </G>
  );
}

/* ───────────────────── 1. BAR ───────────────────── */

function BarChart({ data, width }: ChartProps) {
  const { padLeft, padTop, innerW, innerH } = useGeom(width);
  const max = Math.max(...data.map((d) => d.value));
  const yMax = Math.ceil(max / 10) * 10 || 10;
  const groupW = innerW / data.length;
  const barW = Math.min(40, groupW * 0.62);
  const groupX = (i: number) => padLeft + groupW * i + groupW / 2;
  const avg = data.reduce((a, b) => a + b.value, 0) / data.length;
  const avgY = padTop + innerH - (innerH * avg) / yMax;

  return (
    <Svg width={width} height={HEIGHT}>
      <Defs>
        <LinearGradient id="bar-green" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.green} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={EXPLORE_COLORS.teal} stopOpacity={0.7} />
        </LinearGradient>
        <LinearGradient id="bar-gold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.gold} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={EXPLORE_COLORS.goldLight} stopOpacity={0.6} />
        </LinearGradient>
      </Defs>

      <YAxisGrid innerW={innerW} innerH={innerH} padLeft={padLeft} padTop={padTop} max={yMax} min={0} />

      {/* Average reference */}
      <Line
        x1={padLeft}
        y1={avgY}
        x2={padLeft + innerW}
        y2={avgY}
        stroke={REF}
        strokeDasharray="4 4"
      />
      <SvgText x={padLeft + innerW - 4} y={avgY - 4} fill={AXIS_DIM} fontSize={9} textAnchor="end">
        avg {avg.toFixed(1)}
      </SvgText>

      {/* Bars */}
      {data.map((d, i) => {
        const h = (innerH * d.value) / yMax;
        const x = groupX(i) - barW / 2;
        const y = padTop + innerH - h;
        const isMax = d.value === max;
        return (
          <Rect
            key={`b-${i}`}
            x={x}
            y={y}
            width={barW}
            height={Math.max(1, h)}
            fill={isMax ? 'url(#bar-gold)' : 'url(#bar-green)'}
            rx={5}
          />
        );
      })}

      {renderXAxisLabels(data, innerW, padLeft, padTop, innerH, groupX)}
    </Svg>
  );
}

/* ─────────────────── 2. LOLLIPOP ─────────────────── */

function LollipopChart({ data, width }: ChartProps) {
  const { padLeft, padTop, innerW, innerH } = useGeom(width);
  const max = Math.max(...data.map((d) => d.value));
  const yMax = Math.ceil(max / 10) * 10 || 10;
  const groupW = innerW / data.length;
  const groupX = (i: number) => padLeft + groupW * i + groupW / 2;
  const avg = data.reduce((a, b) => a + b.value, 0) / data.length;
  const avgY = padTop + innerH - (innerH * avg) / yMax;
  const baseY = padTop + innerH;

  return (
    <Svg width={width} height={HEIGHT}>
      <Defs>
        <LinearGradient id="lolli-stem" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.green} stopOpacity={0.6} />
          <Stop offset="100%" stopColor={EXPLORE_COLORS.green} stopOpacity={0.15} />
        </LinearGradient>
      </Defs>

      <YAxisGrid innerW={innerW} innerH={innerH} padLeft={padLeft} padTop={padTop} max={yMax} min={0} />

      <Line x1={padLeft} y1={avgY} x2={padLeft + innerW} y2={avgY} stroke={REF} strokeDasharray="4 4" />
      <SvgText x={padLeft + innerW - 4} y={avgY - 4} fill={AXIS_DIM} fontSize={9} textAnchor="end">
        avg {avg.toFixed(1)}
      </SvgText>

      {/* Stems */}
      {data.map((d, i) => {
        const cx = groupX(i);
        const cy = padTop + innerH - (innerH * d.value) / yMax;
        return (
          <Rect
            key={`stem-${i}`}
            x={cx - 1.5}
            y={cy}
            width={3}
            height={baseY - cy}
            fill="url(#lolli-stem)"
            rx={1.5}
          />
        );
      })}

      {/* Heads */}
      {data.map((d, i) => {
        const cx = groupX(i);
        const cy = padTop + innerH - (innerH * d.value) / yMax;
        const isMax = d.value === max;
        return (
          <G key={`head-${i}`}>
            <Circle
              cx={cx}
              cy={cy}
              r={8}
              fill={isMax ? EXPLORE_COLORS.gold : EXPLORE_COLORS.greenLight}
              stroke="#0a0e14"
              strokeWidth={2}
            />
            <Circle cx={cx} cy={cy} r={3} fill="white" fillOpacity={0.85} />
          </G>
        );
      })}

      {renderXAxisLabels(data, innerW, padLeft, padTop, innerH, groupX)}
    </Svg>
  );
}

/* ────────────────── 3. STEP + TREND ────────────────── */

function StepTrendChart({ data, width }: ChartProps) {
  const { padLeft, padTop, innerW, innerH } = useGeom(width);
  const reg = linearRegression(data);
  const trendData = data.map((d, i) => ({ ...d, trend: reg.intercept + reg.slope * i }));
  const allVals = [...data.map((d) => d.value), ...trendData.map((d) => d.trend)];
  const max = Math.max(...allVals);
  const yMax = Math.ceil(max / 10) * 10 || 10;
  const groupW = innerW / data.length;
  const groupX = (i: number) => padLeft + groupW * i + groupW / 2;
  const baseY = padTop + innerH;

  const yFor = (v: number) => padTop + innerH - (innerH * v) / yMax;

  // Step-after area path
  let stepD = '';
  data.forEach((d, i) => {
    const x = groupX(i);
    const y = yFor(d.value);
    if (i === 0) {
      stepD += `M ${padLeft},${baseY} L ${padLeft},${y} L ${x},${y}`;
    } else {
      const prevX = groupX(i - 1);
      stepD += ` L ${x},${yFor(data[i - 1].value)} L ${x},${y}`;
    }
  });
  const lastX = groupX(data.length - 1);
  stepD += ` L ${lastX},${baseY} Z`;

  // Step-after stroke (no fill)
  const strokePts = data
    .map((d, i) => {
      const x = groupX(i);
      const y = yFor(d.value);
      if (i === 0) return `${x},${y}`;
      const prevY = yFor(data[i - 1].value);
      return `${x},${prevY} ${x},${y}`;
    })
    .join(' ');

  // Trend line
  const trendPts = trendData
    .map((d, i) => `${groupX(i)},${yFor(d.trend)}`)
    .join(' ');

  const slopeLabel = reg.slope > 0 ? `↑ +${reg.slope.toFixed(2)}/yr` : `↓ ${reg.slope.toFixed(2)}/yr`;

  return (
    <Svg width={width} height={HEIGHT}>
      <Defs>
        <LinearGradient id="step-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.green} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={EXPLORE_COLORS.green} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <YAxisGrid innerW={innerW} innerH={innerH} padLeft={padLeft} padTop={padTop} max={yMax} min={0} />

      <Path d={stepD} fill="url(#step-fill)" stroke="none" />
      <Polyline
        points={strokePts}
        fill="none"
        stroke={EXPLORE_COLORS.green}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {data.map((d, i) => {
        const cx = groupX(i);
        const cy = yFor(d.value);
        return (
          <Circle
            key={`dot-${i}`}
            cx={cx}
            cy={cy}
            r={4}
            fill="#0a0e14"
            stroke={EXPLORE_COLORS.green}
            strokeWidth={2}
          />
        );
      })}

      <Polyline
        points={trendPts}
        fill="none"
        stroke={EXPLORE_COLORS.gold}
        strokeWidth={2}
        strokeDasharray="6 4"
      />

      <SvgText
        x={padLeft + innerW - 4}
        y={padTop + 14}
        fill={EXPLORE_COLORS.gold}
        fontSize={11}
        fontWeight="600"
        textAnchor="end"
      >
        {slopeLabel} · R² {reg.r2.toFixed(2)}
      </SvgText>

      {renderXAxisLabels(data, innerW, padLeft, padTop, innerH, groupX)}
    </Svg>
  );
}

/* ────────────────── 4. YEAR-OVER-YEAR ────────────────── */

function YoYChart({ data, width }: ChartProps) {
  const { padLeft, padTop, innerW, innerH } = useGeom(width);
  const yoy =
    data.length < 2
      ? []
      : data.slice(1).map((d, i) => ({
          year: d.year,
          delta: +(d.value - data[i].value).toFixed(2),
        }));

  if (yoy.length === 0) {
    return (
      <Svg width={width} height={HEIGHT}>
        <SvgText x={width / 2} y={HEIGHT / 2} fill={AXIS_DIM} fontSize={11} textAnchor="middle">
          Not enough data for year-over-year change
        </SvgText>
      </Svg>
    );
  }

  const maxAbs = Math.max(...yoy.map((d) => Math.abs(d.delta))) || 1;
  const yMax = maxAbs * 1.2;
  const zeroY = padTop + innerH / 2;
  const halfH = innerH / 2;

  const groupW = innerW / yoy.length;
  const barW = Math.min(40, groupW * 0.62);
  const groupX = (i: number) => padLeft + groupW * i + groupW / 2;

  return (
    <Svg width={width} height={HEIGHT}>
      <Defs>
        <LinearGradient id="yoy-pos" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.green} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={EXPLORE_COLORS.greenDark} stopOpacity={0.6} />
        </LinearGradient>
        <LinearGradient id="yoy-neg" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor={EXPLORE_COLORS.red} stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#7F1D1D" stopOpacity={0.6} />
        </LinearGradient>
      </Defs>

      {/* Y grid: 4 marks above zero, 4 below */}
      {[1, 0.5, 0, -0.5, -1].map((frac, i) => {
        const y = zeroY - frac * halfH;
        const v = (frac * yMax).toFixed(1);
        return (
          <G key={`yg-${i}`}>
            <Line
              x1={padLeft}
              y1={y}
              x2={padLeft + innerW}
              y2={y}
              stroke={frac === 0 ? 'rgba(255,255,255,0.18)' : GRID}
              strokeWidth={frac === 0 ? 1 : 1}
            />
            <SvgText
              x={padLeft - 4}
              y={y + 3}
              fill={AXIS_DIM}
              fontSize={9}
              textAnchor="end"
            >
              {frac > 0 ? '+' : ''}
              {v}
            </SvgText>
          </G>
        );
      })}

      {yoy.map((d, i) => {
        const x = groupX(i) - barW / 2;
        const h = (halfH * Math.abs(d.delta)) / yMax;
        const y = d.delta >= 0 ? zeroY - h : zeroY;
        return (
          <Rect
            key={`yoy-${i}`}
            x={x}
            y={y}
            width={barW}
            height={Math.max(1, h)}
            fill={d.delta >= 0 ? 'url(#yoy-pos)' : 'url(#yoy-neg)'}
            rx={3}
          />
        );
      })}

      {yoy.map((d, i) => (
        <SvgText
          key={`xlbl-${i}`}
          x={groupX(i)}
          y={padTop + innerH + 14}
          fill={AXIS}
          fontSize={10}
          fontWeight="500"
          textAnchor="middle"
        >
          {d.year}
        </SvgText>
      ))}
    </Svg>
  );
}

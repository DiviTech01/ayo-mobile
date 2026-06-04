import { memo, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import africaGeo from '@/data/africa-geojson.json';
import { geometryToPath, MAP_VIEW, project } from '@/lib/projection';
import { useCountries } from '@/lib/queries';
import type { Region } from '@/lib/country-helpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ShortRegion = 'North' | 'West' | 'East' | 'Central' | 'Southern';

const REGION_FULL_TO_SHORT: Record<Region, ShortRegion> = {
  'North Africa': 'North',
  'West Africa': 'West',
  'East Africa': 'East',
  'Central Africa': 'Central',
  'Southern Africa': 'Southern',
};

const REGION_HEX: Record<ShortRegion, string> = {
  North: '#60A5FA',
  West: '#22C55E',
  East: '#A855F7',
  Central: '#F59E0B',
  Southern: '#F43F5E',
};

const REGION_TINT: Record<ShortRegion, string> = {
  North: 'rgba(96, 165, 250, 0.10)',
  West: 'rgba(34, 197, 94, 0.10)',
  East: 'rgba(168, 85, 247, 0.10)',
  Central: 'rgba(245, 158, 11, 0.10)',
  Southern: 'rgba(244, 63, 94, 0.10)',
};

// Capital coordinates [lon, lat] per ISO3 — matches the web map's dots
const CAPITAL_BY_ISO3: Record<string, [number, number]> = {
  DZA: [3.05, 36.75], AGO: [13.23, -8.84], BEN: [2.42, 6.5],
  BWA: [25.91, -24.66], BFA: [-1.52, 12.37], BDI: [29.36, -3.38],
  CPV: [-23.51, 14.93], CMR: [11.5, 3.85], CAF: [18.55, 4.39],
  TCD: [15.04, 12.13], COM: [43.25, -11.7], COG: [15.27, -4.27],
  CIV: [-4.03, 5.32], COD: [15.3, -4.32], DJI: [43.15, 11.59],
  EGY: [31.24, 30.04], GNQ: [8.78, 3.75], ERI: [38.93, 15.32],
  SWZ: [31.13, -26.32], ETH: [38.74, 9.03], GAB: [9.45, 0.42],
  GMB: [-16.57, 13.45], GHA: [-0.2, 5.6], GIN: [-13.71, 9.64],
  GNB: [-15.59, 11.86], KEN: [36.82, -1.29], LSO: [27.49, -29.31],
  LBR: [-10.8, 6.31], LBY: [13.19, 32.89], MDG: [47.52, -18.88],
  MWI: [33.79, -13.96], MLI: [-8.0, 12.65], MRT: [-15.98, 18.08],
  MUS: [57.5, -20.16], MAR: [-6.84, 34.02], MOZ: [32.58, -25.97],
  NAM: [17.08, -22.55], NER: [2.11, 13.51], NGA: [7.49, 9.05],
  RWA: [30.06, -1.95], STP: [6.73, 0.34], SEN: [-17.45, 14.69],
  SYC: [55.45, -4.62], SLE: [-13.23, 8.48], SOM: [45.34, 2.04],
  ZAF: [28.19, -25.75], SSD: [31.58, 4.85], SDN: [32.53, 15.5],
  TZA: [35.74, -6.16], TGO: [1.21, 6.13], TUN: [10.17, 36.81],
  UGA: [32.58, 0.35], ZMB: [28.29, -15.42], ZWE: [31.05, -17.83],
};

// Country centroids (approx lon/lat) for label placement — only large countries
const CENTROID_BY_ISO3: Record<string, [number, number]> = {
  NGA: [8.0, 9.5], EGY: [30.0, 27.0], ETH: [40.5, 9.5], KEN: [38.0, 0.5],
  ZAF: [25.0, -29.0], COD: [23.5, -2.5], DZA: [2.5, 28.0], TZA: [34.5, -6.5],
  MAR: [-7.5, 31.5], AGO: [17.5, -12.5], MLI: [-3.0, 17.5], NER: [9.0, 17.0],
  TCD: [18.5, 15.0], SDN: [30.0, 16.0], LBY: [17.0, 27.0], MDG: [46.5, -19.0],
  MOZ: [35.5, -18.0], ZMB: [27.5, -14.0], ZWE: [29.5, -19.0], GHA: [-1.0, 7.5],
  CMR: [12.5, 6.0], NAM: [17.0, -22.0], BWA: [24.0, -22.5], UGA: [32.5, 1.5],
  TUN: [9.5, 34.0], SEN: [-14.5, 14.5], SSD: [30.0, 7.0], MRT: [-10.5, 20.0],
};

const LABEL_OVERRIDE: Record<string, string> = {
  ZAF: 'S. Africa',
  COD: 'DRC',
  CAF: 'CAR',
  SSD: 'S. Sudan',
};

type Feature = {
  type: 'Feature';
  id: string;
  properties: { iso3: string; name?: string };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
};

type Props = {
  selectedIso3?: string | null;
  regionFilter?: Region | 'All';
  onCountryPress?: (iso3: string) => void;
};

function AfricaMapImpl({
  selectedIso3,
  regionFilter = 'All',
  onCountryPress,
}: Props) {
  const countriesQ = useCountries();

  const iso3ToRegion = useMemo(() => {
    const map = new Map<string, ShortRegion>();
    const list = Array.isArray(countriesQ.data) ? countriesQ.data : [];
    list.forEach((c) => {
      const iso3 = c.iso3Code ?? (c as { isoCode3?: string }).isoCode3;
      if (iso3) {
        const short = REGION_FULL_TO_SHORT[c.region as Region];
        if (short) map.set(iso3, short);
      }
    });
    return map;
  }, [countriesQ.data]);

  const iso3ToName = useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(countriesQ.data) ? countriesQ.data : [];
    list.forEach((c) => {
      const iso3 = c.iso3Code ?? (c as { isoCode3?: string }).isoCode3;
      if (iso3) map.set(iso3, c.name);
    });
    return map;
  }, [countriesQ.data]);

  const paths = useMemo(() => {
    const features = (africaGeo as { features: Feature[] }).features;
    return features.map((f) => ({
      iso3: f.properties.iso3,
      d: geometryToPath(f.geometry as never),
      region: iso3ToRegion.get(f.properties.iso3),
    }));
  }, [iso3ToRegion]);

  const selectedRegion = selectedIso3 ? iso3ToRegion.get(selectedIso3) ?? null : null;
  const activeRegion: ShortRegion | null =
    regionFilter !== 'All'
      ? REGION_FULL_TO_SHORT[regionFilter as Region]
      : selectedRegion;

  // Pulse value used by all capital city dots (0 → 1 → 0)
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  return (
    <View
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, backgroundColor: '#04070d' }}
    >
      <Svg
        width="100%"
        height={MAP_VIEW.height}
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
      >
        <Defs>
          <RadialGradient
            id="map-glow"
            cx="50%"
            cy="45%"
            r="55%"
            fx="50%"
            fy="45%"
          >
            <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#04070d" stopOpacity={0} />
          </RadialGradient>
          <SvgLinearGradient id="map-bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#04070d" />
            <Stop offset="50%" stopColor="#0a1019" />
            <Stop offset="100%" stopColor="#04070d" />
          </SvgLinearGradient>
          <Pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <Path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          </Pattern>
        </Defs>

        {/* Layered backdrop */}
        <Rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#map-bg)" />
        <Rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#map-grid)" opacity={0.6} />
        <Rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#map-glow)" />

        {/* Country geographies */}
        {paths.map(({ iso3, d, region }) => {
          if (!region) return null;
          const isSelected = iso3 === selectedIso3;
          const isRegionMate = !!activeRegion && region === activeRegion && !isSelected;

          const fill = isSelected
            ? 'rgba(34, 197, 94, 0.45)'
            : isRegionMate
            ? REGION_TINT[region]
            : 'rgba(255, 255, 255, 0.06)';
          const stroke = isSelected
            ? '#22C55E'
            : isRegionMate
            ? `${REGION_HEX[region]}66`
            : 'rgba(255, 255, 255, 0.18)';
          const strokeWidth = isSelected ? 1.4 : 0.6;
          return (
            <Path
              key={iso3}
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              onPress={() => onCountryPress?.(iso3)}
            />
          );
        })}

        {/* Country labels — only large countries */}
        {Object.entries(CENTROID_BY_ISO3).map(([iso3, [lon, lat]]) => {
          const region = iso3ToRegion.get(iso3);
          if (!region) return null;
          const isSelected = iso3 === selectedIso3;
          const isRegionMate = !!activeRegion && region === activeRegion;
          const isActive = isSelected || isRegionMate;
          const [x, y] = project(lon, lat);
          const name = iso3ToName.get(iso3) ?? '';
          const label = LABEL_OVERRIDE[iso3] ?? name;
          return (
            <SvgText
              key={`lbl-${iso3}`}
              x={x}
              y={y}
              fontSize={isActive ? 8 : 7}
              fontWeight={isActive ? '700' : '500'}
              fill={isActive ? '#ffffff' : 'rgba(255,255,255,0.45)'}
              textAnchor="middle"
              opacity={isActive ? 1 : 0.85}
            >
              {label}
            </SvgText>
          );
        })}

        {/* Capital city dots — only the selected dot animates */}
        {Object.entries(CAPITAL_BY_ISO3).map(([iso3, [lon, lat]]) => {
          const region = iso3ToRegion.get(iso3);
          if (!region) return null;
          const isSelected = iso3 === selectedIso3;
          const [cx, cy] = project(lon, lat);
          const color = REGION_HEX[region];

          if (isSelected) {
            return (
              <SelectedPulseDot
                key={`dot-${iso3}`}
                cx={cx}
                cy={cy}
                color={color}
                pulse={pulse}
              />
            );
          }
          return (
            <G key={`dot-${iso3}`}>
              <Circle cx={cx} cy={cy} r={2.4} fill={color} opacity={0.25} />
              <Circle
                cx={cx}
                cy={cy}
                r={1.2}
                fill={color}
                stroke="#0a0e14"
                strokeWidth={0.4}
              />
            </G>
          );
        })}
      </Svg>

      {/* Scale indicator — top left */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 8, left: 10 }}
      >
        <Text
          style={{
            fontSize: 8,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 1.5,
            fontVariant: ['tabular-nums'],
          }}
        >
          EQUIRECTANGULAR
        </Text>
      </View>

      {/* Compass rose — top right */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 8, right: 8, opacity: 0.55 }}
      >
        <Svg width={42} height={42} viewBox="0 0 56 56">
          <Circle cx={28} cy={28} r={26} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Path d="M28 6 L25 28 L28 24 L31 28 Z" fill="#22C55E" />
          <Path d="M28 50 L25 28 L28 32 L31 28 Z" fill="rgba(255,255,255,0.3)" />
          <SvgText x={28} y={13} textAnchor="middle" fontSize={9} fill="#22C55E" fontWeight="700">N</SvgText>
          <SvgText x={28} y={48} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)" fontWeight="600">S</SvgText>
          <SvgText x={48} y={31} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)" fontWeight="600">E</SvgText>
          <SvgText x={8} y={31} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)" fontWeight="600">W</SvgText>
        </Svg>
      </View>

      {/* Region legend — bottom left */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontSize: 8,
            fontWeight: '700',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 1.5,
            marginBottom: 4,
          }}
        >
          5 REGIONS · 54 COUNTRIES
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 2, width: 130 }}>
          {(['North', 'West', 'Central', 'East', 'Southern'] as ShortRegion[]).map((r) => (
            <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: 56 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: REGION_HEX[r],
                }}
              />
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Continent snapshot — bottom right */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 6,
          minWidth: 130,
        }}
      >
        <Text
          style={{
            fontSize: 8,
            fontWeight: '700',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 1.5,
            marginBottom: 4,
          }}
        >
          CONTINENT SNAPSHOT
        </Text>
        <StatRow label="Youth 15–35" value="~226M" valueColor="#34d399" />
        <StatRow label="Indicators" value="500+" />
        <StatRow label="Median age" value="19.7" />
      </View>
    </View>
  );
}

export const AfricaMap = memo(AfricaMapImpl);

function SelectedPulseDot({
  cx,
  cy,
  color,
  pulse,
}: {
  cx: number;
  cy: number;
  color: string;
  pulse: SharedValue<number>;
}) {
  const haloProps = useAnimatedProps(() => ({
    r: 3.5 + pulse.value * 3.5,
    opacity: 0.55 - pulse.value * 0.5,
  }));

  return (
    <G>
      <AnimatedCircle cx={cx} cy={cy} fill={color} animatedProps={haloProps} />
      <Circle cx={cx} cy={cy} r={2.4} fill={color} stroke="#0a0e14" strokeWidth={0.5} />
    </G>
  );
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 1,
      }}
    >
      <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          color: valueColor ?? 'rgba(255,255,255,0.92)',
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import africaGeo from '@/data/africa-geojson.json';
import { geometryToPath, MAP_VIEW } from '@/lib/projection';
import { useCountries } from '@/lib/queries';
import type { Region } from '@/lib/country-helpers';

const REGION_FILL: Record<Region, string> = {
  'North Africa': '#fcd34d',
  'West Africa': '#86efac',
  'East Africa': '#7dd3fc',
  'Central Africa': '#fca5a5',
  'Southern Africa': '#d8b4fe',
};

const REGION_FILL_DIM: Record<Region, string> = {
  'North Africa': '#fef3c7',
  'West Africa': '#dcfce7',
  'East Africa': '#e0f2fe',
  'Central Africa': '#fee2e2',
  'Southern Africa': '#f3e8ff',
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

export function AfricaMap({ selectedIso3, regionFilter = 'All', onCountryPress }: Props) {
  const countriesQ = useCountries();

  const iso3ToRegion = useMemo(() => {
    const map = new Map<string, Region>();
    const list = Array.isArray(countriesQ.data) ? countriesQ.data : [];
    list.forEach((c) => {
      const iso3 = c.iso3Code ?? (c as { isoCode3?: string }).isoCode3;
      if (iso3) map.set(iso3, c.region as Region);
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

  return (
    <View className="overflow-hidden rounded-2xl bg-pan-blue-50">
      <Svg
        width="100%"
        height={MAP_VIEW.height}
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
      >
        <Rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="#f0f9ff" />
        {paths.map(({ iso3, d, region }) => {
          if (!region) return null;
          const isSelected = iso3 === selectedIso3;
          const isDimmed = regionFilter !== 'All' && region !== regionFilter;
          const fill = isDimmed
            ? REGION_FILL_DIM[region]
            : isSelected
            ? '#0369a1'
            : REGION_FILL[region];
          return (
            <Path
              key={iso3}
              d={d}
              fill={fill}
              stroke={isSelected ? '#ffffff' : '#ffffffdd'}
              strokeWidth={isSelected ? 1.5 : 0.5}
              onPress={() => onCountryPress?.(iso3)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

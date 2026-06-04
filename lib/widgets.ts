import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// v2 bump: adds Cross-Dimensional Profile widget at position #1 and reorders
// the existing defaults to mirror the web dashboard. Existing users on v1
// get migrated to the new defaults on next load.
const STORAGE_KEY = 'afyo.user_widgets.v2';
const LEGACY_STORAGE_KEYS = ['afyo.user_widgets.v1'];

export type ChartType = 'bar' | 'line' | 'area' | 'radar' | 'stat';

export type Widget = {
  id: string;
  title: string;
  chartType: ChartType;
  indicator: string;
  countries: string[];
  data: SeriesPoint[];
};

export type SeriesPoint = Record<string, string | number>;

export const COUNTRIES = [
  'Nigeria',
  'Kenya',
  'South Africa',
  'Ghana',
  'Ethiopia',
  'Tanzania',
  'Rwanda',
  'Senegal',
  'Egypt',
  'Morocco',
];

export const INDICATORS = [
  'Youth Literacy Rate',
  'Youth Unemployment Rate',
  'Health Access Index',
  'Digital Inclusion Score',
  'Secondary Enrollment Rate',
  'NEET Rate',
  'Skilled Employment Share',
  'Civic Participation Index',
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateTimeSeries(countries: string[], seed = Date.now()): SeriesPoint[] {
  const r = rng(seed);
  const years = [2019, 2020, 2021, 2022, 2023];
  return years.map((year) => {
    const entry: SeriesPoint = { year: year.toString() };
    countries.forEach((c) => {
      entry[c] = Math.round(40 + r() * 50);
    });
    return entry;
  });
}

export function generateRadar(countries: string[], seed = Date.now()): SeriesPoint[] {
  const r = rng(seed);
  const dimensions = ['Education', 'Health', 'Employment', 'Digital', 'Civic'];
  return dimensions.map((dim) => {
    const entry: SeriesPoint = { dimension: dim };
    countries.forEach((c) => {
      entry[c] = Math.round(30 + r() * 70);
    });
    return entry;
  });
}

export function generateStat(seed = Date.now()): SeriesPoint[] {
  const r = rng(seed);
  return [{ value: Math.round(40 + r() * 55), change: Number((r() * 10 - 3).toFixed(1)) }];
}

export function generateData(chartType: ChartType, countries: string[]): SeriesPoint[] {
  if (chartType === 'stat') return generateStat();
  if (chartType === 'radar') return generateRadar(countries);
  return generateTimeSeries(countries);
}

// Default widget order mirrors the web dashboard exactly per the
// "mobile-web parity mandate":
//   1. Cross-Dimensional Profile (radar)
//   2. Employment Trends (line)
//   3. Youth Literacy Rates (bar)
const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'w1',
    title: 'Cross-Dimensional Profile',
    chartType: 'radar',
    indicator: 'Multi-dimension comparison',
    countries: ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana'],
    data: generateRadar(['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana']),
  },
  {
    id: 'w2',
    title: 'Employment Trends',
    chartType: 'line',
    indicator: 'Youth Unemployment Rate',
    countries: ['Ghana', 'Rwanda', 'Senegal', 'Kenya'],
    data: generateTimeSeries(['Ghana', 'Rwanda', 'Senegal', 'Kenya'], 22),
  },
  {
    id: 'w3',
    title: 'Youth Literacy Rates',
    chartType: 'bar',
    indicator: 'Youth Literacy Rate',
    countries: ['Nigeria', 'Kenya', 'South Africa'],
    data: generateTimeSeries(['Nigeria', 'Kenya', 'South Africa'], 11),
  },
];

async function read(): Promise<Widget[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Sweep legacy storage so v1 users get the new default order on next load.
      for (const k of LEGACY_STORAGE_KEYS) {
        try { await AsyncStorage.removeItem(k); } catch {}
      }
      return DEFAULT_WIDGETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WIDGETS;
  } catch {
    return DEFAULT_WIDGETS;
  }
}

async function write(widgets: Widget[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export type WidgetDraft = {
  title: string;
  chartType: ChartType;
  indicator: string;
  countries: string[];
};

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    read().then((w) => {
      setWidgets(w);
      setHydrated(true);
    });
  }, []);

  const persist = useCallback((next: Widget[]) => {
    setWidgets(next);
    write(next).catch(() => undefined);
  }, []);

  const addWidget = useCallback(
    (draft: WidgetDraft) => {
      const countries = draft.countries.length > 0 ? draft.countries : ['Nigeria'];
      const widget: Widget = {
        id: `w-${Date.now()}`,
        title: draft.title.trim(),
        chartType: draft.chartType,
        indicator: draft.indicator,
        countries,
        data: generateData(draft.chartType, countries),
      };
      persist([...widgets, widget]);
      return widget;
    },
    [widgets, persist],
  );

  const updateWidget = useCallback(
    (id: string, draft: WidgetDraft) => {
      const countries = draft.countries.length > 0 ? draft.countries : ['Nigeria'];
      persist(
        widgets.map((w) => {
          if (w.id !== id) return w;
          const shapeChanged =
            w.chartType !== draft.chartType ||
            JSON.stringify(w.countries) !== JSON.stringify(countries);
          return {
            ...w,
            title: draft.title.trim(),
            chartType: draft.chartType,
            indicator: draft.indicator,
            countries,
            data: shapeChanged ? generateData(draft.chartType, countries) : w.data,
          };
        }),
      );
    },
    [widgets, persist],
  );

  const removeWidget = useCallback(
    (id: string) => {
      persist(widgets.filter((w) => w.id !== id));
    },
    [widgets, persist],
  );

  const resetDefaults = useCallback(() => {
    persist(DEFAULT_WIDGETS);
  }, [persist]);

  return {
    widgets,
    hydrated,
    addWidget,
    updateWidget,
    removeWidget,
    resetDefaults,
  };
}

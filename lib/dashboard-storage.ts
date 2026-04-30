import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChartType = 'bar' | 'line' | 'area' | 'radar' | 'stat';

export interface Widget {
  id: string;
  title: string;
  chartType: ChartType;
  indicator: string;
  countries: string[];
  data: Array<Record<string, string | number>>;
}

const STORAGE_VERSION = 'v4';
const keyFor = (userId: string) => `afyo.widgets.${STORAGE_VERSION}.${userId}`;
const LEGACY_KEYS = ['afyo.widgets.v1', 'afyo.widgets.v2', 'afyo.widgets.v3'];

export const COUNTRIES_LIST = [
  'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Ethiopia',
  'Tanzania', 'Rwanda', 'Senegal', 'Egypt', 'Morocco',
];

export const INDICATORS_LIST = [
  'Youth Literacy Rate',
  'Youth Unemployment Rate',
  'Health Access Index',
  'Digital Inclusion Score',
  'Secondary Enrollment Rate',
  'NEET Rate',
  'Skilled Employment Share',
  'Civic Participation Index',
];

const RADAR_DIMENSIONS = ['Education', 'Health', 'Employment', 'Digital', 'Civic', 'Environment'];
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023];

function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000) / 10_000;
  };
}

export function generateTimeSeriesData(countries: string[], indicator: string) {
  const rand = seededRand(`${indicator}|${countries.join(',')}`);
  return YEARS.map((year) => {
    const entry: Record<string, string | number> = { year: year.toString() };
    countries.forEach((c) => {
      entry[c] = Math.round(40 + rand() * 50);
    });
    return entry;
  });
}

export function generateRadarData(countries: string[]) {
  const rand = seededRand(`radar|${countries.join(',')}`);
  return RADAR_DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim };
    countries.forEach((c) => {
      entry[c] = Math.round(30 + rand() * 70);
    });
    return entry;
  });
}

export function generateData(
  chartType: ChartType,
  countries: string[],
  indicator: string,
): Array<Record<string, string | number>> {
  if (chartType === 'radar') return generateRadarData(countries);
  return generateTimeSeriesData(countries, indicator);
}

export function defaultWidgets(): Widget[] {
  const w1 = ['Nigeria', 'Kenya', 'South Africa'];
  const w2 = ['Ghana', 'Rwanda', 'Senegal', 'Kenya', 'Morocco'];
  const w3 = ['Ethiopia', 'Tanzania', 'Egypt', 'Nigeria'];
  const w4 = ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana'];

  return [
    {
      id: 'w1',
      title: 'Youth Literacy Rates',
      chartType: 'bar',
      indicator: 'Youth Literacy Rate',
      countries: w1,
      data: generateTimeSeriesData(w1, 'Youth Literacy Rate'),
    },
    {
      id: 'w2',
      title: 'Employment Trends',
      chartType: 'line',
      indicator: 'Youth Unemployment Rate',
      countries: w2,
      data: generateTimeSeriesData(w2, 'Youth Unemployment Rate'),
    },
    {
      id: 'w3',
      title: 'Health Access Overview',
      chartType: 'area',
      indicator: 'Health Access Index',
      countries: w3,
      data: generateTimeSeriesData(w3, 'Health Access Index'),
    },
    {
      id: 'w4',
      title: 'Cross-Dimensional Profile',
      chartType: 'radar',
      indicator: 'Multi-dimension comparison',
      countries: w4,
      data: generateRadarData(w4),
    },
  ];
}

export async function loadWidgets(userId: string): Promise<Widget[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    if (!raw) {
      await Promise.all(
        LEGACY_KEYS.map((k) => AsyncStorage.removeItem(`${k}.${userId}`).catch(() => undefined)),
      );
      return defaultWidgets();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultWidgets();
    return parsed;
  } catch {
    return defaultWidgets();
  }
}

export async function saveWidgets(userId: string, widgets: Widget[]) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(widgets));
}

export function newWidgetId() {
  return `w${Date.now()}`;
}

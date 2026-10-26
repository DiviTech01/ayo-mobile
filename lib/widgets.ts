import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// v4 bump: widgets are now pure configuration — their chart data is fetched
// live from the API at render time (see WidgetChart), never generated. The old
// `data` field and the random generators are gone. Existing users on v1–v3 are
// migrated to the new defaults on next load.
const STORAGE_KEY = 'afyo.user_widgets.v4';
const LEGACY_STORAGE_KEYS = ['afyo.user_widgets.v1', 'afyo.user_widgets.v2', 'afyo.user_widgets.v3'];

export type ChartType = 'bar' | 'line' | 'area' | 'radar' | 'stat';

export type Widget = {
  id: string;
  title: string;
  chartType: ChartType;
  // For bar/line/area this is an indicator slug (or name) resolved against the
  // live /indicators list. For radar/stat it's a display label only — those
  // charts read youth-index dimension scores, not a single indicator.
  indicator: string;
  countries: string[];
};

// Chart-ready row shape consumed by WidgetChart. Cartesian rows are keyed by
// `year` + one entry per country; radar rows are keyed by `dimension`.
export type SeriesPoint = Record<string, string | number>;

// Default widget set mirrors the web dashboard exactly per the
// "mobile-web parity mandate" (no country repeated across widgets), and every
// widget points at an indicator with real, broad coverage in the database:
//   1. Cross-Dimensional Profile (radar) — Nigeria/Kenya/South Africa/Egypt/Ghana
//   2. Entrepreneurship & Digital Access (line) — Rwanda/Senegal/Morocco/Botswana
//   3. Access to Justice (bar) — Tunisia/Uganda/Côte d'Ivoire
//   4. Youth Health Access (area) — Ethiopia/Algeria/Cameroon/Zambia/Mali
const RADAR_COUNTRIES = ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana'];
const ENTREPRENEURSHIP_COUNTRIES = ['Rwanda', 'Senegal', 'Morocco', 'Botswana'];
const JUSTICE_COUNTRIES = ['Tunisia', 'Uganda', "Cote d'Ivoire"];
const HEALTH_COUNTRIES = ['Ethiopia', 'Algeria', 'Cameroon', 'Zambia', 'Mali'];

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'w1',
    title: 'Cross-Dimensional Profile',
    chartType: 'radar',
    indicator: 'AYEMI dimensions',
    countries: RADAR_COUNTRIES,
  },
  {
    id: 'w2',
    title: 'Entrepreneurship & Digital Access',
    chartType: 'line',
    indicator: 'internet-access-households',
    countries: ENTREPRENEURSHIP_COUNTRIES,
  },
  {
    id: 'w3',
    title: 'Access to Justice',
    chartType: 'bar',
    indicator: 'juvenile-detentions',
    countries: JUSTICE_COUNTRIES,
  },
  {
    id: 'w4',
    title: 'Youth Health Access',
    chartType: 'area',
    indicator: 'births-by-skilled-staff',
    countries: HEALTH_COUNTRIES,
  },
];

async function read(): Promise<Widget[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Sweep legacy storage so older users get the new default order on next load.
      for (const k of LEGACY_STORAGE_KEYS) {
        try { await AsyncStorage.removeItem(k); } catch {}
      }
      return DEFAULT_WIDGETS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WIDGETS;
    // Strip any legacy precomputed `data` field so persisted widgets become
    // pure config — the chart now always fetches live values.
    return parsed.map(({ data: _legacy, ...w }: Widget & { data?: unknown }) => w);
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
      const widget: Widget = {
        id: `w-${Date.now()}`,
        title: draft.title.trim(),
        chartType: draft.chartType,
        indicator: draft.indicator,
        countries: draft.countries,
      };
      persist([...widgets, widget]);
      return widget;
    },
    [widgets, persist],
  );

  const updateWidget = useCallback(
    (id: string, draft: WidgetDraft) => {
      persist(
        widgets.map((w) =>
          w.id === id
            ? {
                ...w,
                title: draft.title.trim(),
                chartType: draft.chartType,
                indicator: draft.indicator,
                countries: draft.countries,
              }
            : w,
        ),
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

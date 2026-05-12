// Country report card type definitions.
// Runtime data has been removed — all country data is fetched live from
// `/country-reports/:ref` and `/countries` on the API. Imports of these
// types remain so the report card components stay type-safe.

export type AyemiTier = 'Critical' | 'Developing' | 'Fulfilling';
export type IndicatorSeverity = 'red' | 'gold' | 'green' | 'navy';
export type IndicatorTrend = 'up-good' | 'up-bad' | 'down-good' | 'down-bad' | 'flat';
export type LegStatus = 'active' | 'partial' | 'weak' | 'new';

export interface PromiseItem {
  title: string;
  desc: string;
  stat: string;
}

export interface Indicator {
  topic: string;
  value: string;
  label: string;
  compare: string;
  trend: IndicatorTrend;
  severity: IndicatorSeverity;
  barPct: number;
}

export interface Legislation {
  name: string;
  year: string;
  status: LegStatus;
  reality: string;
}

export interface Recommendation {
  num: string;
  title: string;
  desc: string;
}

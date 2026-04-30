import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await supabase.auth.refreshSession().catch(() => undefined);
    }
    return Promise.reject(err);
  },
);

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  iso3Code: string;
  flagEmoji: string;
  capital: string;
  region: 'North Africa' | 'West Africa' | 'East Africa' | 'Central Africa' | 'Southern Africa';
  population: number;
  youthPopulation: number;
  currency: string;
  languages: string[];
  economicBlocs: string[];
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  indicatorCount: number;
  color: string;
}

export interface Indicator {
  id: string;
  name: string;
  slug: string;
  description: string;
  unit: string;
  themeId: string;
  source: string;
  methodology: string;
}

export interface IndicatorValue {
  id: string;
  indicatorId: string;
  countryId: string;
  year: number;
  value: number;
  gender?: 'male' | 'female' | 'total';
  ageGroup?: string;
  source: string;
}

export interface YouthIndexScore {
  countryId: string;
  country: Country;
  overallScore: number;
  rank: number;
  previousRank?: number;
  dimensions: {
    education: number;
    employment: number;
    health: number;
    civic: number;
    innovation: number;
  };
  tier: 'high' | 'medium' | 'low';
  year: number;
}

export interface PolicyMonitorEntry {
  countryId: string;
  country: Country;
  aycRatified: boolean;
  aycRatificationDate?: string;
  nationalYouthPolicy: boolean;
  policyName?: string;
  policyYear?: number;
  complianceScore: number;
  wpayCompliance: boolean;
  agenda2063Score: number;
}

export interface InsightCard {
  id: string;
  countryId?: string;
  type: 'trend' | 'anomaly' | 'comparison' | 'recommendation';
  severity: 'info' | 'warning' | 'critical' | 'positive';
  title: string;
  summary: string;
  detail: string;
  indicator?: string;
  direction?: 'up' | 'down' | 'stable';
  generatedAt: string;
}

const get = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
  const res = await http.get<T>(path, { params });
  return res.data;
};

export const api = {
  countries: {
    list: (params?: { region?: string; search?: string }) => get<Country[]>('/countries', params),
    get: (id: string) => get<Country>(`/countries/${id}`),
  },

  themes: {
    list: () => get<Theme[]>('/themes'),
    get: (id: string) => get<Theme>(`/themes/${id}`),
  },

  indicators: {
    list: (params?: { themeId?: string }) => get<Indicator[]>('/indicators', params),
    get: (id: string) => get<Indicator>(`/indicators/${id}`),
    values: (id: string, params?: Record<string, unknown>) =>
      get<IndicatorValue[]>(`/indicators/${id}/values`, params),
  },

  data: {
    regionalAverages: (indicatorId: string) =>
      get<Array<{ region: string; value: number }>>('/data/regional-averages', { indicatorId }),
    map: (indicatorId: string, year?: number) =>
      get<Array<{ countryId: string; value: number }>>('/data/map', { indicatorId, year }),
  },

  youthIndex: {
    rankings: (year?: number) => get<YouthIndexScore[]>('/youth-index/rankings', { year }),
    get: (countryId: string) => get<YouthIndexScore>(`/youth-index/${countryId}`),
  },

  policyMonitor: {
    rankings: () => get<PolicyMonitorEntry[]>('/policy-monitor/rankings'),
    get: (countryId: string) => get<PolicyMonitorEntry>(`/policy-monitor/${countryId}`),
  },

  insights: {
    forCountry: (countryId: string) => get<InsightCard[]>(`/insights/${countryId}`),
    anomalies: () => get<InsightCard[]>('/insights/anomalies'),
    correlations: () => get<InsightCard[]>('/insights/correlations'),
  },
};

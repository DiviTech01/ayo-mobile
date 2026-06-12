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

// 7-theme dimension keys, matching the API. Stable slugs — used everywhere across mobile.
export type ThemeSlug =
  | 'youth-demography-participation'
  | 'education'
  | 'employment'
  | 'health'
  | 'entrepreneurship'
  | 'peace-security'
  | 'access-to-justice';

export type DimensionScores = Record<ThemeSlug, number>;

export interface YouthIndexScore {
  rank: number;
  countryId: string;
  countryName: string;
  isoCode3: string;
  iso3Code: string;
  flagEmoji?: string | null;
  region: string;
  overallScore: number;
  // Canonical 7-theme dimension scores (slug-keyed)
  dimensions: DimensionScores;
  // Legacy flat fields kept for back-compat with screens not yet migrated to .dimensions.
  // Mapping: civicScore ← demography & participation; innovationScore ← entrepreneurship.
  educationScore?: number;
  employmentScore?: number;
  healthScore?: number;
  civicScore?: number;
  innovationScore?: number;
  previousRank?: number;
  rankChange?: number;
  percentile?: number;
  tier: 'high' | 'medium' | 'low';
}

export interface YouthIndexRankingsResponse {
  data: YouthIndexScore[];
  meta: { year: number; totalCountries: number; averageScore: number; methodology: string };
}

// Normalizes whatever shape the API returns into the 7-theme YouthIndexScore.
// Populates both the canonical `dimensions` map and the legacy flat fields so
// screens written for the old 5-dim shape keep working during migration.
export function normalizeYouthIndexScore(r: any): YouthIndexScore {
  const d: Record<string, number> = (r && r.dimensions && typeof r.dimensions === 'object') ? r.dimensions : {};
  const demography = d['youth-demography-participation'] ?? 50;
  const education = d['education'] ?? r?.educationScore ?? 50;
  const employment = d['employment'] ?? r?.employmentScore ?? 50;
  const health = d['health'] ?? r?.healthScore ?? 50;
  const entrepreneurship = d['entrepreneurship'] ?? 50;
  const peaceSecurity = d['peace-security'] ?? 50;
  const accessToJustice = d['access-to-justice'] ?? 50;
  return {
    ...r,
    dimensions: {
      'youth-demography-participation': demography,
      'education':                       education,
      'employment':                      employment,
      'health':                          health,
      'entrepreneurship':                entrepreneurship,
      'peace-security':                  peaceSecurity,
      'access-to-justice':               accessToJustice,
    },
    educationScore: education,
    employmentScore: employment,
    healthScore: health,
    civicScore: demography,         // legacy: civic folded into demography & participation
    innovationScore: entrepreneurship, // legacy: innovation folded into entrepreneurship
  };
}

export interface PolicyMonitorEntry {
  rank: number;
  countryId: string;
  countryName: string;
  isoCode3: string;
  isoCode: string;
  iso3Code: string;
  region: string;
  flagEmoji?: string | null;
  policyName?: string | null;
  aycRatified: boolean;
  aycRatifiedYear?: number | null;
  wpayCompliant: boolean;
  yearAdopted?: number | null;
  yearRevised?: number | null;
  status?: 'active' | 'partial' | 'weak' | 'new' | string | null;
  complianceScore: number;
  tier?: 'EXEMPLARY' | 'STRONG' | 'MODERATE' | 'WEAK' | string | null;
  components?: {
    aycRatification?: number;
    nationalYouthPolicy?: number;
    policyCurrency?: number;
    wpayCompliance?: number;
    policyStatus?: number;
    youthIndexPerformance?: number;
    dataAvailability?: number;
    aycPolicyIndex?: number;
  };
}

export interface InsightCard {
  id: string;
  countryId?: string;
  type: 'trend' | 'anomaly' | 'comparison' | 'recommendation' | 'achievement' | 'concern' | 'opportunity';
  severity: 'info' | 'warning' | 'critical' | 'positive';
  title: string;
  description: string;
  confidence: number;
  relatedCountryId?: string;
  relatedCountryName?: string;
  relatedIndicatorId?: string;
  relatedIndicatorName?: string;
  recommendations?: string[];
  generatedAt: string;
  source: 'ai' | 'rule-based';
}

export interface Anomaly {
  countryId: string;
  countryName: string;
  indicatorId: string;
  indicatorName: string;
  value: number;
  mean: number;
  stdDev: number;
  deviations: number;
  direction: 'above' | 'below';
  severity: 'positive' | 'warning' | 'critical';
  year: number;
}

export interface Correlation {
  indicator1: { id: string; name: string; theme: string };
  indicator2: { id: string; name: string; theme: string };
  correlation: number;
  strength: 'strong' | 'moderate';
  direction: 'positive' | 'negative';
  sampleSize: number;
  interpretation: string;
}

export interface Expert {
  id: string;
  name: string;
  email?: string | null;
  title: string;
  organization: string;
  country: {
    id: string;
    name: string;
    isoCode3?: string | null;
    region?: string | null;
    flagEmoji?: string | null;
  };
  specializations: string[];
  languages: string[];
  bio?: string | null;
  photoUrl?: string | null;
  verified: boolean;
  createdAt?: string;
}

export interface AiChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  answer: string;
  visualization?: Record<string, unknown>;
  visualizations?: Array<Record<string, unknown>>;
  followUpQuestions?: string[];
  source: 'ai' | 'rule-based';
}

export interface PlatformStats {
  totalCountries: number;
  totalIndicators: number;
  totalDataPoints: number;
  totalThemes: number;
  dataYearRange: { earliest: number | null; latest: number | null };
  countriesWithData: number;
  lastUpdated: string;
  dataCompleteness: number;
  topDataCountries: Array<{ name: string; dataPoints: number }>;
}

export const DOCUMENT_TYPES = [
  'PKPB_REPORT',
  'POLICY_BRIEF',
  'RESEARCH_PAPER',
  'PRESENTATION',
  'OTHER',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface DocumentSummary {
  id: string;
  title: string;
  type: DocumentType;
  description?: string | null;
  countryId?: string | null;
  country?: { id: string; name: string; isoCode3?: string | null; flagEmoji?: string | null } | null;
  source?: string | null;
  edition?: string | null;
  year?: number | null;
  fileSize?: number | null;
  mimeType?: string | null;
  originalFilename?: string | null;
  status?: string | null;
  createdAt: string;
}

export interface InsightReportSection {
  heading: string;
  body: string;
}

export interface InsightReport {
  id: string;
  scope: 'continental' | 'country' | 'theme';
  title: string;
  summary: string;
  sections: InsightReportSection[];
  html: string;
  source: 'ai' | 'rule-based' | string;
  createdAt: string;
}

export interface GenerateInsightReportPayload {
  scope: 'continental' | 'country' | 'theme';
  countryId?: string;
  themeId?: string;
  year?: number;
}

export interface CountryReportOverlay {
  ayemiScore?: number | null;
  ayemiTier?: 'Critical' | 'Developing' | 'Fulfilling' | null;
  totalYouthMillions?: number | null;
  totalPopMillions?: number | null;
  literacyPct?: number | null;
  internetAccessPct?: number | null;
  [key: string]: unknown;
}

export interface AuthProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organization: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
  dashboardCount: number;
}

export interface UpdateAuthProfilePayload {
  name?: string;
  organization?: string;
  avatar?: string;
}

const get = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
  const res = await http.get<T>(path, { params });
  return res.data;
};

async function getList<T>(path: string, params?: Record<string, unknown>): Promise<T[]> {
  const raw = await get<T[] | { data: T[] }>(path, params);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: T[] }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}

export const api = {
  countries: {
    list: (params?: { region?: string; search?: string }) => getList<Country>('/countries', params),
    get: (id: string) => get<Country>(`/countries/${id}`),
  },

  themes: {
    list: () => getList<Theme>('/themes'),
    get: (id: string) => get<Theme>(`/themes/${id}`),
  },

  indicators: {
    list: (params?: { themeId?: string }) => getList<Indicator>('/indicators', params),
    get: (id: string) => get<Indicator>(`/indicators/${id}`),
    values: (id: string, params?: Record<string, unknown>) =>
      getList<IndicatorValue>(`/indicators/${id}/values`, params),
  },

  data: {
    regionalAverages: (indicatorId: string) =>
      getList<{ region: string; value: number }>('/data/regional-averages', { indicatorId }),
    map: (indicatorId: string, year?: number) =>
      getList<{ countryId: string; value: number }>('/data/map', { indicatorId, year }),
    timeseries: (params: { indicatorId: string; countryId?: string; from?: number; to?: number }) =>
      getList<{ year: number; value: number; countryId: string; countryName?: string }>(
        '/data/timeseries',
        params,
      ),
    comparison: (params: { indicatorId: string; countryIds?: string[]; year?: number }) =>
      getList<{ countryId: string; countryName?: string; value: number; year: number }>(
        '/data/comparison',
        params,
      ),
  },

  youthIndex: {
    rankings: async (year?: number): Promise<YouthIndexScore[]> => {
      const res = await get<YouthIndexRankingsResponse>('/youth-index/rankings', { year });
      const raw = Array.isArray(res?.data) ? res.data : [];
      return raw.map(normalizeYouthIndexScore);
    },
    get: async (countryId: string): Promise<YouthIndexScore> => {
      const r = await get<YouthIndexScore>(`/youth-index/${countryId}`);
      return normalizeYouthIndexScore(r);
    },
  },

  policyMonitor: {
    rankings: () => getList<PolicyMonitorEntry>('/policy-monitor/rankings'),
    get: (countryId: string) => get<PolicyMonitorEntry>(`/policy-monitor/${countryId}`),
  },

  insights: {
    forCountry: (countryId: string) => getList<InsightCard>(`/insights/${countryId}`),
    anomalies: (year?: number) => getList<Anomaly>('/insights/anomalies', { year }),
    correlations: (themeId?: string) => getList<Correlation>('/insights/correlations', { themeId }),
    narrative: (countryId: string) =>
      get<{ summary: string; sections: Array<{ title: string; body: string }> }>(
        `/insights/narrative/${countryId}`,
      ),
  },

  insightReports: {
    generate: async (payload: GenerateInsightReportPayload): Promise<InsightReport> => {
      const res = await http.post<InsightReport>('/insight-reports/generate', payload);
      return res.data;
    },
  },

  experts: {
    list: (params?: { country?: string; specialization?: string; search?: string }) =>
      getList<Expert>('/experts', params),
    get: (id: string) => get<Expert>(`/experts/${id}`),
  },

  documents: {
    list: (params?: { countryId?: string; type?: DocumentType; limit?: number }) =>
      get<DocumentSummary[]>('/documents', params),
    pkpbForCountry: (countryRef: string) =>
      get<{
        htmlDocument?: DocumentSummary;
        pdfDocument?: DocumentSummary;
        document?: DocumentSummary;
      } | null>(`/documents/by-country/${countryRef}/pkpb`),
  },

  countryReports: {
    get: (countryRef: string) =>
      get<CountryReportOverlay>(`/country-reports/${countryRef}`),
  },

  platform: {
    stats: () => get<PlatformStats>('/platform/stats'),
  },

  ai: {
    chat: async (payload: {
      message: string;
      context?: string;
      history?: AiChatHistoryItem[];
    }) => {
      const res = await http.post<AiChatResponse>('/ai/chat', payload);
      return res.data;
    },
  },

  auth: {
    getProfile: () => get<AuthProfile>('/auth/profile'),
    updateProfile: async (payload: UpdateAuthProfilePayload) => {
      const res = await http.put<AuthProfile>('/auth/profile', payload);
      return res.data;
    },
  },
};

export function documentDownloadUrl(id: string, disposition: 'attachment' | 'inline' = 'inline') {
  return `${API_URL}/documents/${id}/download?disposition=${disposition}`;
}

export function insightReportDownloadUrl(id: string) {
  return `${API_URL}/insight-reports/${id}/download`;
}

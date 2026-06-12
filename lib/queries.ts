import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Country, GenerateInsightReportPayload, InsightReport, YouthIndexScore } from './api';
import { slugify } from './country-helpers';

export interface CountryListItem extends Country {
  slug: string;
  ayemiScore: number;
  ayemiRank: number | null;
  ayemiTier: 'high' | 'medium' | 'low' | null;
}

export const qk = {
  countries: (params?: { region?: string; search?: string }) =>
    ['countries', params ?? {}] as const,
  country: (id: string) => ['country', id] as const,
  themes: ['themes'] as const,
  indicators: (themeId?: string) => ['indicators', themeId] as const,
  youthIndexRankings: (year?: number) => ['youth-index', 'rankings', year] as const,
  youthIndexCountry: (countryId: string) => ['youth-index', countryId] as const,
  regionalAverages: (indicatorId: string) =>
    ['data', 'regional-averages', indicatorId] as const,
  policyRankings: ['policy', 'rankings'] as const,
};

export function useCountries(params?: { region?: string; search?: string }) {
  return useQuery({
    queryKey: qk.countries(params),
    queryFn: () => api.countries.list(params),
    staleTime: 5 * 60_000,
  });
}

export function useCountry(id: string | undefined) {
  return useQuery({
    queryKey: qk.country(id ?? ''),
    queryFn: () => api.countries.get(id!),
    enabled: !!id,
  });
}

export function useThemes() {
  return useQuery({
    queryKey: qk.themes,
    queryFn: () => api.themes.list(),
    staleTime: 10 * 60_000,
  });
}

export function useYouthIndexRankings(year: number = 2025) {
  return useQuery({
    queryKey: qk.youthIndexRankings(year),
    queryFn: () => api.youthIndex.rankings(year),
    staleTime: 5 * 60_000,
  });
}

export function useYouthIndexCountry(countryId: string | undefined) {
  return useQuery({
    queryKey: qk.youthIndexCountry(countryId ?? ''),
    queryFn: () => api.youthIndex.get(countryId!),
    enabled: !!countryId,
  });
}

export function useRegionalAverages(indicatorId: string | undefined) {
  return useQuery({
    queryKey: qk.regionalAverages(indicatorId ?? ''),
    queryFn: () => api.data.regionalAverages(indicatorId!),
    enabled: !!indicatorId,
  });
}

export function usePolicyRankings() {
  return useQuery({
    queryKey: qk.policyRankings,
    queryFn: () => api.policyMonitor.rankings(),
    staleTime: 10 * 60_000,
  });
}

export function useExperts(params?: { search?: string; specialization?: string; country?: string }) {
  return useQuery({
    queryKey: ['experts', params ?? {}] as const,
    queryFn: () => api.experts.list(params),
    staleTime: 5 * 60_000,
  });
}

// Reports & Publications list — mirrors the web page: latest reports, thematic
// briefs, data publications. PKPB country reports are excluded (they have their
// own pages); the screen filters them out, so the piping is identical for every
// other type as soon as one is uploaded.
export function useReports() {
  return useQuery({
    queryKey: ['documents', { limit: 500 }] as const,
    queryFn: () => api.documents.list({ limit: 500 }),
    staleTime: 5 * 60_000,
  });
}

export function useDocuments(params?: { countryId?: string; type?: 'PKPB_REPORT' | 'POLICY_BRIEF' | 'RESEARCH_PAPER' | 'PRESENTATION' | 'OTHER'; limit?: number }) {
  return useQuery({
    queryKey: ['documents', params ?? {}] as const,
    queryFn: () => api.documents.list(params),
    staleTime: 5 * 60_000,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform', 'stats'] as const,
    queryFn: () => api.platform.stats(),
    staleTime: 5 * 60_000,
  });
}

export function useAnomalies(year?: number) {
  return useQuery({
    queryKey: ['insights', 'anomalies', year] as const,
    queryFn: () => api.insights.anomalies(year),
    staleTime: 10 * 60_000,
  });
}

export function useCorrelations(themeId?: string) {
  return useQuery({
    queryKey: ['insights', 'correlations', themeId] as const,
    queryFn: () => api.insights.correlations(themeId),
    staleTime: 10 * 60_000,
  });
}

export function useGenerateInsightReport() {
  return useMutation<InsightReport, Error, GenerateInsightReportPayload>({
    mutationFn: (payload) => api.insightReports.generate(payload),
  });
}

export function useCountryReportOverlay(countryRef: string | undefined) {
  return useQuery({
    queryKey: ['country-report', countryRef] as const,
    queryFn: () => api.countryReports.get(countryRef!),
    enabled: !!countryRef,
    staleTime: 10 * 60_000,
  });
}

export function usePkpbForCountry(countryRef: string | undefined) {
  return useQuery({
    queryKey: ['pkpb', countryRef] as const,
    queryFn: () => api.documents.pkpbForCountry(countryRef!),
    enabled: !!countryRef,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useCountryDirectory(year: number = 2025) {
  const countriesQ = useCountries();
  const rankingsQ = useYouthIndexRankings(year);

  const items = useMemo<CountryListItem[]>(() => {
    const countries = Array.isArray(countriesQ.data) ? countriesQ.data : [];
    const rankings = Array.isArray(rankingsQ.data) ? rankingsQ.data : [];
    const byId = new Map<string, YouthIndexScore>(rankings.map((r) => [r.countryId, r]));
    return countries.map((c) => {
      const r = byId.get(c.id);
      return {
        ...c,
        slug: slugify(c.name),
        ayemiScore: r ? Math.round(r.overallScore) : 0,
        ayemiRank: r?.rank ?? null,
        ayemiTier: r?.tier ?? null,
      };
    });
  }, [countriesQ.data, rankingsQ.data]);

  return {
    items,
    isLoading: countriesQ.isLoading || rankingsQ.isLoading,
    error: countriesQ.error ?? rankingsQ.error,
    refetch: () => {
      countriesQ.refetch();
      rankingsQ.refetch();
    },
  };
}

export function useIndicators(themeId?: string) {
  return useQuery({
    queryKey: qk.indicators(themeId),
    queryFn: () => api.indicators.list({ themeId }),
    staleTime: 10 * 60_000,
  });
}

export function useIndicatorValues(indicatorId: string | undefined) {
  return useQuery({
    queryKey: ['indicator-values', indicatorId] as const,
    queryFn: () => api.indicators.values(indicatorId!),
    enabled: !!indicatorId,
    staleTime: 5 * 60_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { api } from './api';

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

export function useYouthIndexRankings(year?: number) {
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

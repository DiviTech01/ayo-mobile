import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useCountries } from '@/lib/queries';
import { WidgetCard } from './WidgetCard';

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function formatPop(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function CountrySpotlight() {
  const q = useCountries();

  const country = useMemo(() => {
    const list = q.data ?? [];
    if (list.length === 0) return null;
    return list[dayOfYear() % list.length];
  }, [q.data]);

  return (
    <WidgetCard
      title="Country Spotlight"
      subtitle="Featured today"
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
    >
      {country ? (
        <View>
          <View className="flex-row items-center gap-3">
            <Text className="text-4xl">{country.flagEmoji}</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{country.name}</Text>
              <Text className="text-xs text-gray-500">
                {country.region} · {country.capital}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-lg bg-gray-50 p-3">
              <Text className="text-[10px] uppercase tracking-wide text-gray-500">
                Population
              </Text>
              <Text className="mt-0.5 text-base font-semibold text-gray-900">
                {formatPop(country.population)}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-gray-50 p-3">
              <Text className="text-[10px] uppercase tracking-wide text-gray-500">
                Youth (15–35)
              </Text>
              <Text className="mt-0.5 text-base font-semibold text-gray-900">
                {formatPop(country.youthPopulation)}
              </Text>
            </View>
          </View>

          {country.languages.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {country.languages.slice(0, 4).map((lang) => (
                <View key={lang} className="rounded-full bg-pan-blue-50 px-2.5 py-0.5">
                  <Text className="text-[11px] font-medium text-pan-blue-700">{lang}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <Text className="py-2 text-sm text-gray-500">No countries loaded yet.</Text>
      )}
    </WidgetCard>
  );
}

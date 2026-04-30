import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { listCountries, getCountryReport } from '@/data/countryReports';
import { flagFromIso3, REGIONS, REGION_ABBR, tierColor, type Region } from '@/lib/country-helpers';

type RegionFilter = Region | 'All';

export default function CountriesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');

  const allCountries = useMemo(() => listCountries(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCountries
      .filter((c) => region === 'All' || c.region === region)
      .filter((c) => !q || c.country.toLowerCase().includes(q))
      .map((c) => {
        const report = getCountryReport(c.slug);
        return {
          ...c,
          flag: flagFromIso3(c.iso3),
          score: report?.ayemiScore ?? 0,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [allCountries, region, search]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">Countries</Text>
        <Text className="mt-0.5 text-sm text-gray-500">
          {filtered.length} of 54 · sorted by AYEMI score
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl bg-white px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search 54 countries"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-base text-gray-900"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-3 gap-2 pr-5"
        >
          <FilterChip
            label="All"
            active={region === 'All'}
            onPress={() => setRegion('All')}
          />
          {REGIONS.map((r) => (
            <FilterChip
              key={r}
              label={REGION_ABBR[r]}
              active={region === r}
              onPress={() => setRegion(r)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10">
        <View className="flex-row flex-wrap justify-between">
          {filtered.map((c) => {
            const tier = tierColor(c.score);
            return (
              <Pressable
                key={c.slug}
                onPress={() =>
                  router.push(
                    { pathname: '/country/[slug]', params: { slug: c.slug } } as unknown as Href,
                  )
                }
                className="mb-3 w-[48%] rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
              >
                <Text className="text-3xl">{c.flag}</Text>
                <Text
                  className="mt-2 text-sm font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {c.country}
                </Text>
                <Text className="text-xs text-gray-500">{REGION_ABBR[c.region as Region]}</Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <View className={`rounded-full px-2 py-0.5 ${tier.bg}`}>
                    <Text className={`text-[11px] font-semibold ${tier.text}`}>
                      {tier.label}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-gray-900 tabular-nums">
                    {c.score}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {filtered.length === 0 && (
            <View className="w-full items-center py-10">
              <Ionicons name="search-outline" size={32} color="#d1d5db" />
              <Text className="mt-2 text-sm text-gray-500">
                No matches for "{search}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-1.5 ${
        active ? 'bg-pan-blue-600' : 'bg-white border border-gray-200'
      }`}
    >
      <Text
        className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-700'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

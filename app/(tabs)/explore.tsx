import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AfricaMap } from '@/components/AfricaMap';
import { listCountries, getCountryReport } from '@/data/countryReports';
import {
  flagFromIso3,
  REGIONS,
  REGION_ABBR,
  tierColor,
  type Region,
} from '@/lib/country-helpers';

type RegionFilter = Region | 'All';

export default function ExploreScreen() {
  const router = useRouter();
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);

  const byIso3 = useMemo(() => {
    const m = new Map<
      string,
      { country: string; slug: string; iso3: string; region: Region; score: number }
    >();
    listCountries().forEach((c) => {
      const r = getCountryReport(c.slug);
      m.set(c.iso3, {
        country: c.country,
        slug: c.slug,
        iso3: c.iso3,
        region: c.region as Region,
        score: r?.ayemiScore ?? 0,
      });
    });
    return m;
  }, []);

  const selected = selectedIso3 ? byIso3.get(selectedIso3) : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pb-2 pt-4">
        <Text className="text-2xl font-bold text-gray-900">Explore Africa</Text>
        <Text className="mt-0.5 text-sm text-gray-500">
          Tap any country to see its AYEMI score
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-4 gap-2 pr-5"
        >
          <FilterChip
            label="All"
            active={regionFilter === 'All'}
            onPress={() => setRegionFilter('All')}
          />
          {REGIONS.map((r) => (
            <FilterChip
              key={r}
              label={REGION_ABBR[r]}
              active={regionFilter === r}
              onPress={() => setRegionFilter(r)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="px-5 pt-2">
        <AfricaMap
          regionFilter={regionFilter}
          selectedIso3={selectedIso3}
          onCountryPress={setSelectedIso3}
        />

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Legend dot="#fcd34d" label="North" />
          <Legend dot="#86efac" label="West" />
          <Legend dot="#7dd3fc" label="East" />
          <Legend dot="#fca5a5" label="Central" />
          <Legend dot="#d8b4fe" label="Southern" />
        </View>
      </View>

      {selected ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-gray-200 bg-white px-5 pb-6 pt-4 shadow-2xl">
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-gray-200" />
          </View>
          <View className="flex-row items-start">
            <Text className="text-5xl">{flagFromIso3(selected.iso3)}</Text>
            <View className="ml-3 flex-1">
              <Text className="text-xl font-bold text-gray-900">{selected.country}</Text>
              <Text className="text-xs text-gray-500">{selected.region}</Text>
              <View className="mt-2 flex-row items-center gap-2">
                <View
                  className={`rounded-full px-2 py-0.5 ${tierColor(selected.score).bg}`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${tierColor(selected.score).text}`}
                  >
                    {tierColor(selected.score).label}
                  </Text>
                </View>
                <Text className="text-base font-bold tabular-nums text-gray-900">
                  AYEMI {selected.score}
                </Text>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => setSelectedIso3(null)}
              className="p-1"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </Pressable>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                {
                  pathname: '/country/[slug]',
                  params: { slug: selected.slug },
                } as unknown as Href,
              )
            }
            className="mt-4 flex-row items-center justify-center gap-1.5 rounded-xl bg-pan-blue-600 py-3"
          >
            <Text className="text-base font-semibold text-white">View report card</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </Pressable>
        </View>
      ) : null}
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

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dot }} />
      <Text className="text-[11px] text-gray-600">{label}</Text>
    </View>
  );
}

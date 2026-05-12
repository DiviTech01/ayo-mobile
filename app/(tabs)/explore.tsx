import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AfricaMap } from '@/components/AfricaMap';
import { useCountryDirectory } from '@/lib/queries';
import {
  flagFromIso3,
  REGIONS,
  REGION_ABBR,
  tierColor,
  type Region,
} from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';

type RegionFilter = Region | 'All';

const REGION_DOTS: Record<string, string> = {
  North: 'hsl(36, 100%, 65%)',
  West: 'hsl(142, 76%, 66%)',
  East: 'hsl(199, 93%, 67%)',
  Central: 'hsl(0, 90%, 71%)',
  Southern: 'hsl(280, 65%, 70%)',
};

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);

  const directory = useCountryDirectory();

  const byIso3 = useMemo(() => {
    const m = new Map<
      string,
      { country: string; slug: string; iso3: string; region: Region; score: number }
    >();
    directory.items.forEach((c) => {
      const iso3 = c.iso3Code;
      if (!iso3) return;
      m.set(iso3, {
        country: c.name,
        slug: c.slug,
        iso3,
        region: c.region as Region,
        score: c.ayemiScore,
      });
    });
    return m;
  }, [directory.items]);

  const selected = selectedIso3 ? byIso3.get(selectedIso3) : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pb-2 pt-4">
        <Text className="font-display text-2xl font-bold text-foreground">Explore Africa</Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">
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
            onPress={() => {
              tapSelection();
              setRegionFilter('All');
            }}
          />
          {REGIONS.map((r) => (
            <FilterChip
              key={r}
              label={REGION_ABBR[r]}
              active={regionFilter === r}
              onPress={() => {
                tapSelection();
                setRegionFilter(r);
              }}
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
          <Legend dot={REGION_DOTS.North} label="North" />
          <Legend dot={REGION_DOTS.West} label="West" />
          <Legend dot={REGION_DOTS.East} label="East" />
          <Legend dot={REGION_DOTS.Central} label="Central" />
          <Legend dot={REGION_DOTS.Southern} label="Southern" />
        </View>
      </View>

      {selected ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border bg-card px-5 pb-6 pt-4 shadow-2xl">
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>
          <View className="flex-row items-start">
            <Text className="text-5xl">{flagFromIso3(selected.iso3)}</Text>
            <View className="ml-3 flex-1">
              <Text className="font-display text-xl font-bold text-foreground">
                {selected.country}
              </Text>
              <Text className="text-xs text-muted-foreground">{selected.region}</Text>
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
                <Text className="text-base font-bold tabular-nums text-foreground">
                  AYEMI {selected.score || '—'}
                </Text>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => setSelectedIso3(null)}
              className="p-1"
            >
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              tapLight();
              router.push(
                {
                  pathname: '/country/[slug]',
                  params: { slug: selected.slug },
                } as unknown as Href,
              );
            }}
            className="mt-4 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              View report card
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
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
        active ? 'bg-primary' : 'border border-border bg-card'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? 'text-primary-foreground' : 'text-foreground'
        }`}
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
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}

import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCountryDirectory } from '@/lib/queries';
import { REGIONS, REGION_ABBR, tierColor, type Region } from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';

type RegionFilter = Region | 'All';

export default function CountriesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');

  const directory = useCountryDirectory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.resolve(directory.refetch());
    setRefreshing(false);
  }, [directory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return directory.items
      .filter((c) => region === 'All' || c.region === region)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => b.ayemiScore - a.ayemiScore);
  }, [directory.items, region, search]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pb-3 pt-4">
        <Text className="font-display text-2xl font-bold text-foreground">Countries</Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">
          {filtered.length} of {directory.items.length || 54} · sorted by AYEMI score
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search 54 countries"
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-base text-foreground"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
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
            onPress={() => {
              tapSelection();
              setRegion('All');
            }}
          />
          {REGIONS.map((r) => (
            <FilterChip
              key={r}
              label={REGION_ABBR[r]}
              active={region === r}
              onPress={() => {
                tapSelection();
                setRegion(r);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {directory.isLoading && directory.items.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
            <Text className="mt-3 text-sm text-muted-foreground">Loading countries…</Text>
          </View>
        ) : directory.error && directory.items.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">Couldn&rsquo;t load countries.</Text>
            <Pressable onPress={directory.refetch} className="mt-3">
              <Text className="text-sm font-medium text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filtered.map((c) => {
              const tier = tierColor(c.ayemiScore);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    tapLight();
                    router.push(
                      { pathname: '/country/[slug]', params: { slug: c.slug } } as unknown as Href,
                    );
                  }}
                  className="mb-3 w-[48%] rounded-2xl border border-border bg-card p-4 active:bg-muted"
                >
                  <Text className="text-3xl">{c.flagEmoji ?? '🏳️'}</Text>
                  <Text
                    className="mt-2 text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {REGION_ABBR[c.region as Region] ?? c.region}
                  </Text>

                  <View className="mt-3 flex-row items-center justify-between">
                    <View className={`rounded-full px-2 py-0.5 ${tier.bg}`}>
                      <Text className={`text-[11px] font-semibold ${tier.text}`}>
                        {tier.label}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-foreground tabular-nums">
                      {c.ayemiScore || '—'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {filtered.length === 0 && !directory.isLoading && (
              <View className="w-full items-center py-10">
                <Ionicons name="search-outline" size={32} color={colors.mutedForeground} />
                <Text className="mt-2 text-sm text-muted-foreground">
                  No matches for &ldquo;{search}&rdquo;
                </Text>
              </View>
            )}
          </View>
        )}
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

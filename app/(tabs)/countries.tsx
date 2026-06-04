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
import { PageHeader } from '@/components/PageHeader';
import { useCountryDirectory, type CountryListItem } from '@/lib/queries';
import { REGIONS, tierColor, type Region } from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

export default function CountriesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const directory = useCountryDirectory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.resolve(directory.refetch());
    setRefreshing(false);
  }, [directory]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filter = (c: CountryListItem) => !q || c.name.toLowerCase().includes(q);
    const byRegion = new Map<Region, CountryListItem[]>();
    REGIONS.forEach((r) => byRegion.set(r, []));
    directory.items.filter(filter).forEach((c) => {
      const list = byRegion.get(c.region as Region);
      if (list) list.push(c);
    });
    byRegion.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return byRegion;
  }, [directory.items, search]);

  const totalFiltered = Array.from(grouped.values()).reduce((s, l) => s + l.length, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="pb-12"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <PageHeader
          title={t('countries.title')}
          description={t('countries.subtitle')}
        />

        <View className="px-5 pt-4">
          <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('countries.search')}
              placeholderTextColor={colors.mutedForeground}
              className="ml-2 flex-1 text-base text-foreground"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
          <Text className="mt-2 text-xs text-muted-foreground">
            {totalFiltered} of {directory.items.length || 54} countries
          </Text>
        </View>

        {directory.isLoading && directory.items.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
            <Text className="mt-3 text-sm text-muted-foreground">{t('common.loading')}</Text>
          </View>
        ) : directory.error && directory.items.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">
              {t('common.error')}
            </Text>
            <Pressable onPress={directory.refetch} className="mt-3">
              <Text className="text-sm font-medium text-primary">{t('common.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <View className="px-5 pt-6">
            {REGIONS.map((region) => {
              const list = grouped.get(region) ?? [];
              if (list.length === 0) return null;
              return (
                <View key={region} className="mb-8">
                  <Text className="mb-3 font-display text-lg font-bold text-foreground">
                    {region}
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {list.map((c) => {
                      const tier = tierColor(c.ayemiScore);
                      return (
                        <Pressable
                          key={c.id}
                          onPress={() => {
                            tapLight();
                            router.push(
                              {
                                pathname: '/country/[slug]',
                                params: { slug: c.slug },
                              } as unknown as Href,
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
                          <Text className="text-[11px] text-muted-foreground">
                            Click to view
                          </Text>

                          <View className="mt-3 flex-row items-center justify-between">
                            <View className={`rounded-full px-2 py-0.5 ${tier.bg}`}>
                              <Text className={`text-[10px] font-semibold ${tier.text}`}>
                                {tier.label}
                              </Text>
                            </View>
                            <Text className="text-sm font-bold tabular-nums text-foreground">
                              {c.ayemiScore || '—'}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {totalFiltered === 0 && !directory.isLoading ? (
              <View className="items-center py-10">
                <Ionicons name="search-outline" size={32} color={colors.mutedForeground} />
                <Text className="mt-2 text-sm text-muted-foreground">
                  No matches for &ldquo;{search}&rdquo;
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

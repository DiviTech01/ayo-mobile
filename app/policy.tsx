import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePolicyRankings } from '@/lib/queries';
import { flagFromIso3, slugify, tierColor } from '@/lib/country-helpers';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

type Row = {
  slug: string;
  country: string;
  iso3: string;
  region: string;
  flagEmoji?: string | null;
  complianceScore: number;
  aycRatified: boolean;
  hasNationalPolicy: boolean;
  wpayCompliant: boolean;
  policyName?: string | null;
  policyYear?: number | null;
  tier?: string | null;
};

export default function PolicyMonitorScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const q = usePolicyRankings();

  const rows = useMemo<Row[]>(() => {
    const apiRows = Array.isArray(q.data) ? q.data : [];
    return apiRows
      .map((r) => ({
        slug: r.countryName ? slugify(r.countryName) : r.countryId,
        country: r.countryName ?? r.countryId,
        iso3: r.iso3Code ?? r.isoCode3 ?? '',
        region: r.region ?? '',
        flagEmoji: r.flagEmoji ?? null,
        complianceScore: r.complianceScore,
        aycRatified: r.aycRatified,
        hasNationalPolicy: !!r.policyName,
        wpayCompliant: r.wpayCompliant,
        policyName: r.policyName,
        policyYear: r.yearAdopted ?? null,
        tier: r.tier ?? null,
      }))
      .sort((a, b) => b.complianceScore - a.complianceScore);
  }, [q.data]);

  const filtered = useMemo(() => {
    const qq = search.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => r.country.toLowerCase().includes(qq));
  }, [rows, search]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title="Policy Monitor"
          description="AYC ratification, National Youth Policy status, WPAY + Agenda 2063 alignment across 54 countries."
          icon="shield-checkmark"
          showBack
        />

        <View className="px-5 pt-4">
          <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search countries"
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-base text-foreground"
            autoCorrect={false}
            autoCapitalize="none"
          />
          </View>

        {q.isLoading && rows.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : q.error && rows.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">Couldn&rsquo;t load rankings.</Text>
            <Pressable onPress={() => q.refetch()} className="mt-3">
              <Text className="text-sm font-medium text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : rows.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="document-text-outline" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">
              No policy rankings published yet.
            </Text>
          </View>
        ) : null}

        <View className="mt-4 gap-2">
          {filtered.map((r, i) => {
            const tier = tierColor(r.complianceScore);
            return (
              <Pressable
                key={r.slug}
                onPress={() =>
                  router.push(
                    {
                      pathname: '/country/[slug]',
                      params: { slug: r.slug },
                    } as unknown as Href,
                  )
                }
                className="rounded-2xl border border-border bg-card p-4 active:bg-muted"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="w-6 text-sm font-semibold text-muted-foreground tabular-nums">
                    {i + 1}
                  </Text>
                  <Text className="text-2xl">{r.flagEmoji ?? flagFromIso3(r.iso3)}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{r.country}</Text>
                    <Text className="text-[11px] text-muted-foreground">{r.region}</Text>
                  </View>
                  <View className={`rounded-full px-2 py-0.5 ${tier.bg}`}>
                    <Text className={`text-[11px] font-semibold ${tier.text}`}>
                      {r.complianceScore.toFixed(0)}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  <Badge ok={r.aycRatified} label="AYC" />
                  <Badge ok={r.hasNationalPolicy} label="NYP" />
                  <Badge ok={r.wpayCompliant} label="WPAY" />
                </View>

                {r.policyName ? (
                  <Text className="mt-2 text-[11px] text-muted-foreground" numberOfLines={1}>
                    {r.policyName}
                    {r.policyYear ? ` · ${r.policyYear}` : ''}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  const colors = useThemeColors();
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
        ok ? 'bg-pan-green-100' : 'bg-muted'
      }`}
    >
      <Ionicons
        name={ok ? 'checkmark' : 'close'}
        size={11}
        color={ok ? colors.aydGreen : colors.mutedForeground}
      />
      <Text
        className={`text-[10px] font-semibold ${
          ok ? 'text-pan-green-800' : 'text-muted-foreground'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

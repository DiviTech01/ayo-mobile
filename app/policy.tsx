import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePolicyRankings } from '@/lib/queries';
import { listCountries, getCountryReport } from '@/data/countryReports';
import { flagFromIso3, tierColor } from '@/lib/country-helpers';

type Row = {
  slug: string;
  country: string;
  iso3: string;
  region: string;
  complianceScore: number;
  aycRatified: boolean;
  nationalYouthPolicy: boolean;
  wpayCompliance: boolean;
  agenda2063Score: number;
};

function syntheticPolicyRows(): Row[] {
  return listCountries()
    .map((c) => {
      const report = getCountryReport(c.slug);
      if (!report) return null;
      const score = report.ayemiScore;
      const aycLeg = report.legislation.find((l) =>
        l.name.toLowerCase().includes('youth charter'),
      );
      const nypLeg = report.legislation.find((l) =>
        l.name.toLowerCase().includes('national youth policy'),
      );
      return {
        slug: c.slug,
        country: c.country,
        iso3: c.iso3,
        region: c.region,
        complianceScore: score,
        aycRatified: !!aycLeg && aycLeg.status !== 'weak',
        nationalYouthPolicy: !!nypLeg && nypLeg.status !== 'weak',
        wpayCompliance: score >= 50,
        agenda2063Score: Math.round(score * 0.9),
      } satisfies Row;
    })
    .filter((r): r is Row => r !== null)
    .sort((a, b) => b.complianceScore - a.complianceScore);
}

export default function PolicyMonitorScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const q = usePolicyRankings();

  const rows = useMemo<Row[]>(() => {
    const apiRows = Array.isArray(q.data) ? q.data : [];
    if (apiRows.length > 0) {
      return apiRows
        .map((r) => ({
          slug: r.country?.name ? r.country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : r.countryId,
          country: r.country?.name ?? r.countryId,
          iso3: r.country?.iso3Code ?? '',
          region: r.country?.region ?? '',
          complianceScore: r.complianceScore,
          aycRatified: r.aycRatified,
          nationalYouthPolicy: r.nationalYouthPolicy,
          wpayCompliance: r.wpayCompliance,
          agenda2063Score: r.agenda2063Score,
        }))
        .sort((a, b) => b.complianceScore - a.complianceScore);
    }
    return syntheticPolicyRows();
  }, [q.data]);

  const filtered = useMemo(() => {
    const qq = search.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => r.country.toLowerCase().includes(qq));
  }, [rows, search]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
          <Text className="text-sm font-medium text-gray-900">Back</Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900">Policy Monitor</Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        <View className="pt-4">
          <Text className="text-xs uppercase tracking-wider text-gray-500">
            Africa Youth Charter compliance
          </Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            54 countries ranked
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            AYC ratification, National Youth Policy status, WPAY + Agenda 2063 alignment.
          </Text>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl bg-white px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search countries"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-base text-gray-900"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

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
                className="rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="w-6 text-sm font-semibold text-gray-400 tabular-nums">
                    {i + 1}
                  </Text>
                  <Text className="text-2xl">{flagFromIso3(r.iso3)}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {r.country}
                    </Text>
                    <Text className="text-[11px] text-gray-500">{r.region}</Text>
                  </View>
                  <View className={`rounded-full px-2 py-0.5 ${tier.bg}`}>
                    <Text className={`text-[11px] font-semibold ${tier.text}`}>
                      {r.complianceScore}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  <Badge ok={r.aycRatified} label="AYC" />
                  <Badge ok={r.nationalYouthPolicy} label="NYP" />
                  <Badge ok={r.wpayCompliance} label="WPAY" />
                </View>

                <View className="mt-3">
                  <View className="mb-1 flex-row items-baseline justify-between">
                    <Text className="text-[11px] uppercase tracking-wider text-gray-500">
                      Agenda 2063 alignment
                    </Text>
                    <Text className="text-[11px] font-semibold text-gray-700">
                      {r.agenda2063Score}/100
                    </Text>
                  </View>
                  <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <View
                      className="h-full rounded-full bg-pan-blue-500"
                      style={{ width: `${r.agenda2063Score}%` }}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
        ok ? 'bg-pan-green-100' : 'bg-gray-100'
      }`}
    >
      <Ionicons
        name={ok ? 'checkmark' : 'close'}
        size={11}
        color={ok ? '#15803d' : '#6b7280'}
      />
      <Text
        className={`text-[10px] font-semibold ${
          ok ? 'text-pan-green-800' : 'text-gray-500'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listCountries, getCountryReport } from '@/data/countryReports';
import { flagFromIso3, type Region } from '@/lib/country-helpers';

const TOPIC_LIST = [
  'Youth Poverty',
  'Female Unemployment',
  'Informality',
  'Literacy',
  'Tertiary GER',
  'Internet Access',
  'Political Seats',
  'Digital Identity',
  'Brain Drain',
  'GYDI Rank',
  'HIV Youth Share',
  'Mental Health',
] as const;

type Topic = (typeof TOPIC_LIST)[number];

const SEED_COUNTRIES = ['nigeria', 'kenya', 'ghana', 'south-africa'];

export default function CompareScreen() {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(SEED_COUNTRIES);
  const [topic, setTopic] = useState<Topic>('Youth Poverty');
  const [pickerOpen, setPickerOpen] = useState(false);

  const allCountries = useMemo(() => listCountries(), []);

  const rows = useMemo(() => {
    return selectedSlugs
      .map((slug) => {
        const meta = allCountries.find((c) => c.slug === slug);
        const report = getCountryReport(slug);
        if (!meta || !report) return null;
        const ind = report.indicators.find((i) => i.topic === topic);
        if (!ind) return null;
        return {
          slug,
          country: meta.country,
          iso3: meta.iso3,
          region: meta.region as Region,
          value: ind.value,
          numeric: ind.barPct,
          severity: ind.severity,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.numeric - a.numeric);
  }, [allCountries, selectedSlugs, topic]);

  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.numeric), 1) : 1;

  const onShare = async () => {
    const lines = [
      `${topic} — comparison via AfYO`,
      ...rows.map((r, i) => `${i + 1}. ${r.country}: ${r.value}`),
      '',
      'African Youth Observatory · PACSDA',
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      /* ignore */
    }
  };

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
        <Text className="text-base font-semibold text-gray-900">Compare</Text>
        <Pressable onPress={onShare} hitSlop={8} className="px-3 py-1.5">
          <Ionicons name="share-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-12">
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Indicator
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-2 gap-2 pr-5"
        >
          {TOPIC_LIST.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTopic(t)}
              className={`rounded-full px-3 py-1.5 ${
                topic === t ? 'bg-pan-blue-600' : 'bg-white border border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  topic === t ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Countries · {selectedSlugs.length}
          </Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1 border border-gray-200"
          >
            <Ionicons name="add" size={14} color="#0369a1" />
            <Text className="text-xs font-semibold text-pan-blue-700">Edit</Text>
          </Pressable>
        </View>

        <View className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
          {rows.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-sm text-gray-500">No countries selected.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {rows.map((r, i) => {
                const widthPct = Math.max(2, (r.numeric / max) * 100);
                const barColor =
                  r.severity === 'red'
                    ? 'bg-pan-red-500'
                    : r.severity === 'gold'
                    ? 'bg-pan-gold-500'
                    : r.severity === 'green'
                    ? 'bg-pan-green-500'
                    : 'bg-pan-blue-500';
                return (
                  <View key={r.slug}>
                    <View className="mb-1.5 flex-row items-baseline justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text className="w-5 text-sm text-gray-400">{i + 1}</Text>
                        <Text className="text-base">{flagFromIso3(r.iso3)}</Text>
                        <Text className="text-sm font-medium text-gray-900">
                          {r.country}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold tabular-nums text-gray-900">
                        {r.value}
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <View
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <Text className="mt-4 text-[11px] leading-4 text-gray-500">
          Bars sized relative to the highest value among selected countries. Color
          reflects severity tier from each country's most recent report.
        </Text>
      </ScrollView>

      <CountryPickerModal
        open={pickerOpen}
        selected={selectedSlugs}
        onClose={() => setPickerOpen(false)}
        onChange={setSelectedSlugs}
      />
    </SafeAreaView>
  );
}

function CountryPickerModal({
  open,
  selected,
  onClose,
  onChange,
}: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onChange: (next: string[]) => void;
}) {
  const all = useMemo(() => listCountries(), []);

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      if (selected.length >= 6) return;
      onChange([...selected, slug]);
    }
  };

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <Text className="text-base font-semibold text-gray-900">
            Pick countries · max 6
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm font-semibold text-pan-blue-600">Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerClassName="p-4">
          <View className="flex-row flex-wrap gap-2">
            {all.map((c) => {
              const active = selected.includes(c.slug);
              return (
                <Pressable
                  key={c.slug}
                  onPress={() => toggle(c.slug)}
                  className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
                    active ? 'bg-pan-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className="text-base">{flagFromIso3(c.iso3)}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      active ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {c.country}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

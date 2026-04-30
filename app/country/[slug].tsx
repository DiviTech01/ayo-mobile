import { useMemo } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCountryReport } from '@/data/countryReports';
import { flagFromIso3 } from '@/lib/country-helpers';
import { AyemiGauge } from '@/components/report/AyemiGauge';
import { PromiseList } from '@/components/report/PromiseList';
import { IndicatorCard } from '@/components/report/IndicatorCard';
import { LegislationTable } from '@/components/report/LegislationTable';

export default function CountryReportScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const report = useMemo(() => (slug ? getCountryReport(slug) : null), [slug]);

  if (!report) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={40} color="#9ca3af" />
        <Text className="mt-2 text-base text-gray-700">Country not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-medium text-pan-blue-600">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const flag = flagFromIso3(report.iso3);
  const isNigeria = report.slug === 'nigeria';

  const onShare = async () => {
    try {
      await Share.share({
        message: `${report.country} · AYEMI ${report.ayemiScore}/100 (${report.ayemiTier})\nPromise Kept · Promise Broken — African Youth Observatory`,
      });
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
          <Text className="text-sm font-medium text-gray-900">Countries</Text>
        </Pressable>
        <Pressable onPress={onShare} hitSlop={8} className="px-3 py-1.5">
          <Ionicons name="share-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="pb-12">
        <View className="bg-white px-5 pb-6 pt-4">
          <Text className="text-7xl">{flag}</Text>
          <Text className="mt-1 text-3xl font-bold text-gray-900">{report.country}</Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            {report.region} · {report.edition}
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            <Tag>Promise Kept</Tag>
            <Tag accent="red">Promise Broken</Tag>
            {isNigeria ? <Tag accent="blue">Real data · PACSDA</Tag> : null}
          </View>

          <View className="mt-6 items-center">
            <AyemiGauge score={report.ayemiScore} tier={report.ayemiTier} />
          </View>

          <View className="mt-6 flex-row flex-wrap gap-2.5">
            <HeadlineStat
              label="Youth (15–35)"
              value={`${report.totalYouthMillions}M`}
              sub={`of ${report.totalPopMillions}M total`}
            />
            <HeadlineStat
              label="Median age"
              value={`${report.medianAge}`}
              sub="years"
            />
            <HeadlineStat
              label="GYDI rank"
              value={`${report.globalYouthDevRank}`}
              sub={`of ${report.globalYouthDevTotal}`}
            />
            <HeadlineStat
              label="Youth bulge"
              value={`${report.youthBulgePct}%`}
              sub="aged 15–29"
            />
          </View>
        </View>

        <View className="mt-3 gap-4 px-5">
          <SectionCard title="Executive brief">
            <Text className="text-sm leading-6 text-gray-700">{report.executiveBrief}</Text>
            <View className="mt-4 rounded-xl bg-gray-50 p-4">
              <Text className="text-base italic leading-6 text-gray-900">
                "{report.pullQuote}"
              </Text>
            </View>
            <Text className="mt-3 text-xs leading-5 text-gray-500">{report.postQuote}</Text>
          </SectionCard>

          <SectionCard title="Poverty & livelihoods">
            <View className="flex-row flex-wrap gap-2">
              <MiniStat label="Overall poverty" value={`${report.overallPovertyPct.toFixed(0)}%`} tone="red" />
              <MiniStat label="Below nat. line" value={`${report.belowNatPovertyPct.toFixed(0)}%`} tone="red" />
              <MiniStat label="Food insecurity" value={`${report.foodInsecurityPct.toFixed(0)}%`} tone="gold" />
              <MiniStat label="Informal" value={`${report.informalEmploymentPct.toFixed(0)}%`} tone="gold" />
            </View>
            <Text className="mt-3 text-xs leading-5 text-gray-600">{report.povertyInsight}</Text>
          </SectionCard>

          <PromiseList kind="kept" items={report.promiseKept} />
          <PromiseList kind="broken" items={report.promiseBroken} />

          <View>
            <Text className="mb-3 text-base font-bold text-gray-900">Indicators</Text>
            <View className="flex-row flex-wrap gap-3">
              {report.indicators.map((ind, i) => (
                <View key={i} className="w-[48%]">
                  <IndicatorCard indicator={ind} />
                </View>
              ))}
            </View>
          </View>

          <SectionCard title="Governance & civic">
            <View className="flex-row flex-wrap gap-2">
              <MiniStat
                label="Youth seats"
                value={`${report.youthSeats}/${report.parliamentSeats}`}
                tone="red"
              />
              <MiniStat
                label="Press freedom"
                value={`${report.pressFreedomRank}/${report.pressFreedomTotal}`}
                tone="gold"
              />
              <MiniStat
                label="Youth voter reg"
                value={`${report.voterRegYouthPct}%`}
                tone="green"
              />
              <MiniStat
                label="Civic digital"
                value={`${report.civicDigEngagement}/100K`}
                tone="navy"
              />
            </View>
            <Text className="mt-3 text-xs leading-5 text-gray-600">{report.govNarrative}</Text>
          </SectionCard>

          <SectionCard title="Education & mobility">
            <View className="flex-row flex-wrap gap-2">
              <MiniStat label="Literacy" value={`${report.literacyPct}%`} tone="navy" />
              <MiniStat label="Tertiary GER" value={`${report.tertiaryGerPct}%`} tone="red" />
              <MiniStat label="Internet (youth)" value={`${report.internetAccessPct}%`} tone="gold" />
              <MiniStat label="Brain drain" value={`~${report.brainDrainPct}%/yr`} tone="red" />
            </View>
          </SectionCard>

          <SectionCard title="Digital identity">
            <View className="flex-row flex-wrap gap-2">
              <MiniStat
                label="ID coverage"
                value={`${report.digitalIdMillions}M`}
                tone="green"
              />
              <MiniStat
                label="Target"
                value={`${report.digitalIdTargetMillions}M`}
                tone="navy"
              />
              <MiniStat label="No formal ID" value={`${report.noFormalIdPct}%`} tone="red" />
              <MiniStat label="Banked" value={`${report.bankedPct}%`} tone="gold" />
            </View>
          </SectionCard>

          <View>
            <Text className="mb-3 text-base font-bold text-gray-900">Legislation & treaties</Text>
            <LegislationTable items={report.legislation} />
          </View>

          <View>
            <Text className="mb-3 text-base font-bold text-gray-900">Recommendations</Text>
            <View className="gap-2.5">
              {report.recommendations.map((rec) => (
                <View
                  key={rec.num}
                  className="rounded-xl border border-pan-blue-100 bg-white p-4"
                >
                  <View className="flex-row items-start gap-3">
                    <Text className="text-2xl font-bold text-pan-blue-300 tabular-nums">
                      {rec.num}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900">{rec.title}</Text>
                      <Text className="mt-1 text-xs leading-5 text-gray-600">{rec.desc}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-2 items-center py-4">
            <Text className="text-[11px] text-gray-400">
              Reviewed {report.reviewedDate} · Next review {report.nextReview}
            </Text>
            <Text className="mt-0.5 text-[11px] text-gray-400">
              African Youth Observatory · PACSDA
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tag({
  children,
  accent = 'green',
}: {
  children: React.ReactNode;
  accent?: 'green' | 'red' | 'blue';
}) {
  const styles =
    accent === 'red'
      ? 'bg-pan-red-100 text-pan-red-800'
      : accent === 'blue'
      ? 'bg-pan-blue-100 text-pan-blue-800'
      : 'bg-pan-green-100 text-pan-green-800';
  const [bg, text] = styles.split(' ');
  return (
    <View className={`rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-[11px] font-semibold uppercase tracking-wide ${text}`}>
        {children}
      </Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-5">
      <Text className="mb-3 text-base font-bold text-gray-900">{title}</Text>
      {children}
    </View>
  );
}

function HeadlineStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View className="min-w-[45%] flex-1 rounded-xl bg-gray-50 p-3">
      <Text className="text-[10px] uppercase tracking-wider text-gray-500">{label}</Text>
      <Text className="mt-0.5 text-xl font-bold text-gray-900 tabular-nums">{value}</Text>
      {sub ? <Text className="text-[11px] text-gray-500">{sub}</Text> : null}
    </View>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'red' | 'gold' | 'green' | 'navy';
}) {
  const TONE = {
    red: { bg: 'bg-pan-red-50', text: 'text-pan-red-700' },
    gold: { bg: 'bg-pan-gold-50', text: 'text-pan-gold-700' },
    green: { bg: 'bg-pan-green-50', text: 'text-pan-green-700' },
    navy: { bg: 'bg-pan-blue-50', text: 'text-pan-blue-700' },
  } as const;
  const t = TONE[tone];
  return (
    <View className={`min-w-[47%] flex-1 rounded-lg p-3 ${t.bg}`}>
      <Text className="text-[10px] uppercase tracking-wider text-gray-500">{label}</Text>
      <Text className={`mt-0.5 text-base font-bold tabular-nums ${t.text}`}>{value}</Text>
    </View>
  );
}

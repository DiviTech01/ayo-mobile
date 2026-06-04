import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useCountryDirectory,
  useCountryReportOverlay,
  usePkpbForCountry,
} from '@/lib/queries';
import { documentDownloadUrl } from '@/lib/api';
import { AyemiGauge } from '@/components/report/AyemiGauge';
import { IndicatorCard } from '@/components/report/IndicatorCard';
import { GradientHero } from '@/components/GradientHero';
import { useThemeColors } from '@/lib/theme-colors';
import { pkpbWebLink } from '@/lib/web-links';
import { flagDominantColor } from '@/lib/flag-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import type { AyemiTier, Indicator as IndicatorShape } from '@/data/countryReports';

function tierFromScore(score: number): AyemiTier {
  if (score >= 67) return 'Fulfilling';
  if (score >= 34) return 'Developing';
  return 'Critical';
}

interface OverlayShape {
  country?: string;
  iso3?: string;
  slug?: string;
  lastDataYear?: number;
  indicatorCount?: number;
  hasRealData?: boolean;
  real?: {
    totalYouthMillions?: number | null;
    youthBulgePct?: number | null;
    urbanPopPct?: number | null;
    literacyPct?: number | null;
    tertiaryGerPct?: number | null;
    secondaryCompletionPct?: number | null;
    internetAccessPct?: number | null;
    ayemiScore?: number | null;
    ayemiTier?: AyemiTier | null;
  };
  indicators?: IndicatorShape[];
}

export default function CountryReportScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const directory = useCountryDirectory();
  const overlayQ = useCountryReportOverlay(slug);

  const pkpbQ = usePkpbForCountry(slug);

  const country = useMemo(
    () => (slug ? directory.items.find((c) => c.slug === slug) : undefined),
    [directory.items, slug],
  );

  const overlay = overlayQ.data as OverlayShape | undefined;

  const flagColor = flagDominantColor(country?.name);

  const pkpbDoc =
    pkpbQ.data?.pdfDocument ??
    pkpbQ.data?.htmlDocument ??
    pkpbQ.data?.document ??
    null;

  const onDownloadPkpb = async () => {
    tapLight();
    if (!pkpbDoc) {
      Alert.alert(
        t('common.comingSoon'),
        t('country.comingSoonBody', {
          country: country?.name ?? t('country.thisCountry'),
        }),
      );
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(
        documentDownloadUrl(pkpbDoc.id, 'attachment'),
      );
    } catch {
      Alert.alert(
        t('country.couldNotOpenReport'),
        t('country.couldNotOpenReportBody'),
      );
    }
  };

  const openWebPkpb = async () => {
    tapLight();
    if (!slug) return;
    try {
      await WebBrowser.openBrowserAsync(pkpbWebLink(slug));
    } catch {
      Alert.alert(
        t('country.couldNotOpenPage'),
        t('country.couldNotOpenPageBody'),
      );
    }
  };

  const realScore =
    overlay?.real?.ayemiScore ?? country?.ayemiScore ?? null;
  const tier: AyemiTier =
    overlay?.real?.ayemiTier ?? (realScore != null ? tierFromScore(realScore) : 'Developing');

  const indicators = useMemo<IndicatorShape[]>(
    () => (Array.isArray(overlay?.indicators) ? overlay!.indicators! : []),
    [overlay],
  );

  const isLoading = directory.isLoading || (overlayQ.isLoading && !overlay);

  if (!isLoading && !country) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={40} color={colors.mutedForeground} />
        <Text className="mt-2 text-base text-foreground">{t('country.notFound')}</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-medium text-primary">{t('country.goBack')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <GradientHero className="px-5 pt-3 pb-7" tint={flagColor}>
          <View className="flex-row items-center justify-between gap-2">
            <Pressable
              onPress={() => {
                tapLight();
                router.back();
              }}
              hitSlop={8}
              className="-ml-1 flex-row items-center gap-1 p-1 active:opacity-60"
            >
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
              <Text className="text-sm font-medium text-foreground">
                {t('tabs.countries')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDownloadPkpb}
              hitSlop={8}
              style={{
                borderColor: `${flagColor}66`,
                backgroundColor: `${flagColor}1F`,
              }}
              className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-80"
            >
              <Ionicons
                name={pkpbDoc ? 'download-outline' : 'time-outline'}
                size={14}
                color={colors.foreground}
              />
              <Text className="text-xs font-semibold text-foreground">
                {t('country.downloadPkpb')}
              </Text>
            </Pressable>
          </View>

          {!country ? (
            <View className="mt-8 items-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View className="mt-5">
              <Text className="text-7xl">{country.flagEmoji ?? '🏳️'}</Text>
              <Text className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
                {country.name}
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {country.region}
                {country.capital ? ` · ${country.capital}` : ''}
                {overlay?.lastDataYear
                  ? ` · ${t('country.latestData', { year: overlay.lastDataYear })}`
                  : ''}
              </Text>

              <View className="mt-3 flex-row flex-wrap gap-1.5">
                {overlay?.hasRealData ? (
                  <Tag accent="blue">{t('country.realData')}</Tag>
                ) : null}
                {country.ayemiRank != null ? (
                  <Tag>{`Rank #${country.ayemiRank}`}</Tag>
                ) : null}
              </View>
            </View>
          )}
        </GradientHero>

        {!country ? null : (
          <>
            <View className="px-5 pt-2">
              <View className="rounded-2xl border border-border bg-card p-5 items-center">
                <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('country.ayemiScore')}
                </Text>
                <AyemiGauge score={realScore ?? 0} tier={tier} />
              </View>
            </View>

            {overlay?.real ? (
              <View className="px-5 pt-4">
                <Text className="mb-2 font-display text-base font-bold text-foreground">
                  {t('country.headlineIndicators')}
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {overlay.real.totalYouthMillions != null && (
                    <HeadlineStat
                      label={t('country.stat.youth')}
                      value={`${overlay.real.totalYouthMillions}M`}
                    />
                  )}
                  {overlay.real.youthBulgePct != null && (
                    <HeadlineStat
                      label={t('country.stat.youthBulge')}
                      value={`${overlay.real.youthBulgePct}%`}
                    />
                  )}
                  {overlay.real.literacyPct != null && (
                    <HeadlineStat
                      label={t('country.stat.literacy')}
                      value={`${overlay.real.literacyPct}%`}
                    />
                  )}
                  {overlay.real.internetAccessPct != null && (
                    <HeadlineStat
                      label={t('country.stat.internet')}
                      value={`${overlay.real.internetAccessPct}%`}
                    />
                  )}
                  {overlay.real.tertiaryGerPct != null && (
                    <HeadlineStat
                      label={t('country.stat.tertiary')}
                      value={`${overlay.real.tertiaryGerPct}%`}
                    />
                  )}
                  {overlay.real.urbanPopPct != null && (
                    <HeadlineStat
                      label={t('country.stat.urban')}
                      value={`${overlay.real.urbanPopPct}%`}
                    />
                  )}
                </View>
              </View>
            ) : null}

            <View className="mt-5 gap-4 px-5">
              {indicators.length > 0 ? (
                <View>
                  <Text className="mb-3 font-display text-base font-bold text-foreground">
                    {t('country.indicators')}
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {indicators.map((ind, i) => (
                      <View key={i} className="w-[48%]">
                        <IndicatorCard indicator={ind} />
                      </View>
                    ))}
                  </View>
                </View>
              ) : !overlayQ.isLoading ? (
                <View className="rounded-2xl border border-border bg-card p-6 items-center">
                  <Ionicons name="document-text-outline" size={28} color={colors.mutedForeground} />
                  <Text className="mt-2 text-sm text-muted-foreground text-center">
                    {t('country.noPublishedIndicators', { country: country.name })}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={openWebPkpb}
                style={{
                  borderColor: `${flagColor}59`,
                  backgroundColor: `${flagColor}14`,
                }}
                className="mt-2 flex-row items-center justify-between rounded-2xl border px-5 py-4 active:opacity-80"
              >
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="font-display text-[15px] font-bold text-foreground">
                    {t('country.openFullReport')}
                  </Text>
                  <Text className="mt-0.5 text-[12px] leading-4 text-muted-foreground">
                    {t('country.openFullReportDesc', { country: country.name })}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.foreground} />
              </Pressable>
            </View>
          </>
        )}
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
  const bg =
    accent === 'red'
      ? 'bg-pan-red-100'
      : accent === 'blue'
      ? 'bg-pan-blue-100'
      : 'bg-pan-green-100';
  const text =
    accent === 'red'
      ? 'text-pan-red-800'
      : accent === 'blue'
      ? 'text-pan-blue-800'
      : 'text-pan-green-800';
  return (
    <View className={`rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-[11px] font-semibold uppercase tracking-wide ${text}`}>
        {children}
      </Text>
    </View>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 rounded-xl border border-border bg-card p-3">
      <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 font-display text-xl font-bold text-foreground tabular-nums">
        {value}
      </Text>
    </View>
  );
}

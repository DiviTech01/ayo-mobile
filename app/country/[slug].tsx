import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useCountryDirectory,
  useCountryReportOverlay,
} from '@/lib/queries';
import { AyemiGauge } from '@/components/report/AyemiGauge';
import { IndicatorCard } from '@/components/report/IndicatorCard';
import { GradientHero } from '@/components/GradientHero';
import { useThemeColors } from '@/lib/theme-colors';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import { tapLight } from '@/lib/haptics';
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
  const directory = useCountryDirectory();
  const overlayQ = useCountryReportOverlay(slug);

  const country = useMemo(
    () => (slug ? directory.items.find((c) => c.slug === slug) : undefined),
    [directory.items, slug],
  );

  const overlay = overlayQ.data as OverlayShape | undefined;

  const realScore =
    overlay?.real?.ayemiScore ?? country?.ayemiScore ?? null;
  const tier: AyemiTier =
    overlay?.real?.ayemiTier ?? (realScore != null ? tierFromScore(realScore) : 'Developing');

  const indicators = useMemo<IndicatorShape[]>(
    () => (Array.isArray(overlay?.indicators) ? overlay!.indicators! : []),
    [overlay],
  );

  const onShare = async () => {
    if (!country) return;
    tapLight();
    try {
      await Share.share({
        message: `${country.name} · AYEMI ${realScore ?? '—'}/100 (${tier})\nAfrican Youth Observatory`,
      });
    } catch {
      /* ignore */
    }
  };

  const isLoading = directory.isLoading || (overlayQ.isLoading && !overlay);

  if (!isLoading && !country) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={40} color={colors.mutedForeground} />
        <Text className="mt-2 text-base text-foreground">Country not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-medium text-primary">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <GradientHero className="px-5 pt-3 pb-7">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                tapLight();
                router.back();
              }}
              hitSlop={8}
              className="-ml-1 flex-row items-center gap-1 p-1 active:opacity-60"
            >
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
              <Text className="text-sm font-medium text-foreground">Countries</Text>
            </Pressable>
            <Pressable
              onPress={onShare}
              hitSlop={8}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 active:bg-muted"
            >
              <Ionicons name="share-outline" size={14} color={colors.foreground} />
              <Text className="text-xs font-semibold text-foreground">Share</Text>
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
                {overlay?.lastDataYear ? ` · Latest data ${overlay.lastDataYear}` : ''}
              </Text>

              <View className="mt-3 flex-row flex-wrap gap-1.5">
                {overlay?.hasRealData ? <Tag accent="blue">Real data</Tag> : null}
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
                  AYEMI Score
                </Text>
                <AyemiGauge score={realScore ?? 0} tier={tier} />
              </View>
            </View>

            {overlay?.real ? (
              <View className="px-5 pt-4">
                <Text className="mb-2 font-display text-base font-bold text-foreground">
                  Headline indicators
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {overlay.real.totalYouthMillions != null && (
                    <HeadlineStat
                      label="Youth (15–35)"
                      value={`${overlay.real.totalYouthMillions}M`}
                    />
                  )}
                  {overlay.real.youthBulgePct != null && (
                    <HeadlineStat
                      label="Youth bulge"
                      value={`${overlay.real.youthBulgePct}%`}
                    />
                  )}
                  {overlay.real.literacyPct != null && (
                    <HeadlineStat
                      label="Literacy"
                      value={`${overlay.real.literacyPct}%`}
                    />
                  )}
                  {overlay.real.internetAccessPct != null && (
                    <HeadlineStat
                      label="Internet access"
                      value={`${overlay.real.internetAccessPct}%`}
                    />
                  )}
                  {overlay.real.tertiaryGerPct != null && (
                    <HeadlineStat
                      label="Tertiary GER"
                      value={`${overlay.real.tertiaryGerPct}%`}
                    />
                  )}
                  {overlay.real.urbanPopPct != null && (
                    <HeadlineStat
                      label="Urban pop"
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
                    Indicators
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
                    No published indicators for {country.name} yet.
                  </Text>
                </View>
              ) : null}

              <OpenOnWebLink
                href={webLinks.countries}
                label="For the full PKPB report (with charts and narrative), open africanyouthobservatory.org"
              />
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

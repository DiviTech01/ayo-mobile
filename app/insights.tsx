import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {
  useAnomalies,
  useCorrelations,
  useCountries,
  useGenerateInsightReport,
  useThemes,
} from '@/lib/queries';
import { insightReportDownloadUrl } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Markdown } from '@/components/Markdown';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import type { Anomaly, Correlation } from '@/lib/api';

type Tab = 'anomalies' | 'correlations';

export default function InsightsScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('anomalies');
  const [year, setYear] = useState(2024);

  const anomaliesQ = useAnomalies(year);
  const correlationsQ = useCorrelations();

  const anomalies = useMemo(
    () => (Array.isArray(anomaliesQ.data) ? anomaliesQ.data : []),
    [anomaliesQ.data],
  );
  const correlations = useMemo(
    () => (Array.isArray(correlationsQ.data) ? correlationsQ.data : []),
    [correlationsQ.data],
  );

  const summary = {
    total: anomalies.length + correlations.length,
    critical: anomalies.filter((a) => a.severity === 'critical').length,
    positive: anomalies.filter((a) => a.severity === 'positive').length,
    correlations: correlations.length,
  };

  const isLoading = anomaliesQ.isLoading || correlationsQ.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-10">
        <PageHeader
          title={t('insights.title')}
          description={t('insights.description')}
          icon="sparkles"
          showBack
        />

        <View className="p-4">
        <View className="flex-row gap-2 mb-4">
          <SummaryStat label={t('insights.signals')} value={summary.total} icon="sparkles" tint="primary" />
          <SummaryStat label={t('insights.critical')} value={summary.critical} icon="warning" tint="red" />
          <SummaryStat label={t('insights.positive')} value={summary.positive} icon="trophy" tint="green" />
          <SummaryStat
            label={t('insights.correlations')}
            value={summary.correlations}
            icon="link"
            tint="gold"
          />
        </View>

        <View className="mb-3 flex-row gap-2">
          <TabPill label={t('insights.anomalies')} active={tab === 'anomalies'} onPress={() => setTab('anomalies')} />
          <TabPill
            label={t('insights.correlations')}
            active={tab === 'correlations'}
            onPress={() => setTab('correlations')}
          />
        </View>

        {tab === 'anomalies' && (
          <View className="mb-3 flex-row gap-2">
            {[2024, 2023, 2022].map((y) => (
              <Pressable
                key={y}
                onPress={() => setYear(y)}
                className={`rounded-full px-3 py-1 border ${
                  year === y ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    year === y ? 'text-background' : 'text-foreground'
                  }`}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {isLoading ? (
          <View className="rounded-2xl border border-border bg-card p-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : tab === 'anomalies' ? (
          anomalies.length === 0 ? (
            <EmptyState text={t('insights.noAnomalies', { year })} />
          ) : (
            <View className="gap-3">
              {anomalies.map((a, i) => (
                <AnomalyCard key={`${a.countryId}-${a.indicatorId}-${i}`} anomaly={a} t={t} />
              ))}
            </View>
          )
        ) : correlations.length === 0 ? (
          <EmptyState text={t('insights.noCorrelations')} />
        ) : (
          <View className="gap-3">
            {correlations.map((c, i) => (
              <CorrelationCard key={i} correlation={c} />
            ))}
          </View>
        )}

        <ReportGenerator />

        <OpenOnWebLink href={webLinks.insights} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Scope = 'continental' | 'country' | 'theme';

function ReportGenerator() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [scope, setScope] = useState<Scope>('continental');
  const [countryId, setCountryId] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const countriesQ = useCountries();
  const themesQ = useThemes();
  const gen = useGenerateInsightReport();
  const report = gen.data;

  const countries = useMemo(
    () => (Array.isArray(countriesQ.data) ? [...countriesQ.data].sort((a, b) => a.name.localeCompare(b.name)) : []),
    [countriesQ.data],
  );
  const themes = useMemo(
    () => (Array.isArray(themesQ.data) ? themesQ.data : []),
    [themesQ.data],
  );

  const selectedCountry = countries.find((c) => c.id === countryId) ?? null;
  const selectedTheme = themes.find((t2) => t2.id === themeId) ?? null;

  const needsCountry = scope === 'country';
  const needsTheme = scope === 'theme';
  const canGenerate =
    !gen.isPending &&
    (!needsCountry || !!countryId) &&
    (!needsTheme || !!themeId);

  const SCOPES: { id: Scope; labelKey: string }[] = [
    { id: 'continental', labelKey: 'insights.report.scope.continental' },
    { id: 'country', labelKey: 'insights.report.scope.country' },
    { id: 'theme', labelKey: 'insights.report.scope.theme' },
  ];

  const onGenerate = () => {
    if (!canGenerate) return;
    tapLight();
    gen.mutate({
      scope,
      countryId: needsCountry ? countryId ?? undefined : undefined,
      themeId: needsTheme ? themeId ?? undefined : undefined,
    });
  };

  const onDownload = async () => {
    if (!report) return;
    tapLight();
    try {
      await WebBrowser.openBrowserAsync(insightReportDownloadUrl(report.id));
    } catch {
      /* ignore */
    }
  };

  return (
    <View className="mt-8 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Ionicons name="document-text" size={16} color={colors.primary} />
        </View>
        <Text className="flex-1 font-display text-base font-bold text-foreground">
          {t('insights.report.title')}
        </Text>
      </View>
      <Text className="mt-2 text-[12px] leading-4 text-muted-foreground">
        {t('insights.report.subtitle')}
      </Text>

      {/* Scope picker */}
      <View className="mt-4 flex-row gap-2">
        {SCOPES.map((s) => {
          const active = scope === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                tapSelection();
                setScope(s.id);
              }}
              className={`flex-1 rounded-full border px-3 py-2 ${
                active ? 'border-primary bg-primary/15' : 'border-border bg-card'
              }`}
            >
              <Text
                className="text-center text-[12px] font-semibold"
                style={{ color: active ? colors.primary : colors.foreground }}
              >
                {t(s.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Country / theme selector */}
      {needsCountry || needsTheme ? (
        <Pressable
          onPress={() => {
            tapLight();
            setPickerOpen(true);
          }}
          className="mt-3 flex-row items-center justify-between rounded-xl border border-border bg-card px-3 py-3 active:bg-muted"
        >
          <Text className="text-sm text-foreground" numberOfLines={1}>
            {needsCountry
              ? selectedCountry
                ? `${selectedCountry.flagEmoji ?? ''} ${selectedCountry.name}`.trim()
                : t('insights.report.pickCountry')
              : selectedTheme
              ? selectedTheme.name
              : t('insights.report.pickTheme')}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
        </Pressable>
      ) : null}

      {/* Generate button */}
      <Pressable
        onPress={onGenerate}
        disabled={!canGenerate}
        className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${
          canGenerate ? 'bg-primary active:opacity-80' : 'bg-muted'
        }`}
      >
        {gen.isPending ? (
          <ActivityIndicator color={colors.primaryForeground} size="small" />
        ) : (
          <Ionicons
            name="sparkles"
            size={15}
            color={canGenerate ? colors.primaryForeground : colors.mutedForeground}
          />
        )}
        <Text
          className="text-sm font-semibold"
          style={{ color: canGenerate ? colors.primaryForeground : colors.mutedForeground }}
        >
          {gen.isPending ? t('insights.report.generating') : t('insights.report.generate')}
        </Text>
      </Pressable>

      {gen.isError ? (
        <Text className="mt-3 text-center text-[12px] text-destructive">
          {t('insights.report.error')}
        </Text>
      ) : null}

      {/* Rendered report */}
      {report ? (
        <View className="mt-5 border-t border-border/60 pt-4">
          <Text className="font-display text-lg font-bold text-foreground">
            {report.title}
          </Text>
          {report.summary ? (
            <View className="mt-2">
              <Markdown text={report.summary} />
            </View>
          ) : null}

          {Array.isArray(report.sections)
            ? report.sections.map((section, i) => (
                <View key={i} className="mt-4">
                  {section.heading ? (
                    <Text className="mb-1 font-display text-base font-bold text-foreground">
                      {section.heading}
                    </Text>
                  ) : null}
                  <Markdown text={section.body ?? ''} />
                </View>
              ))
            : null}

          {report.source ? (
            <Text className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('insights.report.sourceLabel')}: {report.source}
            </Text>
          ) : null}

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={onDownload}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 active:opacity-80"
            >
              <Ionicons name="open-outline" size={15} color={colors.primary} />
              <Text className="text-sm font-semibold text-primary">
                {t('insights.report.download')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                tapLight();
                gen.reset();
              }}
              className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 active:bg-muted"
            >
              <Ionicons name="refresh" size={15} color={colors.foreground} />
              <Text className="text-sm font-semibold text-foreground">
                {t('insights.report.regenerate')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <ReportPickerModal
        open={pickerOpen}
        mode={needsCountry ? 'country' : 'theme'}
        items={
          needsCountry
            ? countries.map((c) => ({ id: c.id, label: `${c.flagEmoji ?? ''} ${c.name}`.trim() }))
            : themes.map((th) => ({ id: th.id, label: th.name }))
        }
        selectedId={needsCountry ? countryId : themeId}
        onSelect={(id) => {
          if (needsCountry) setCountryId(id);
          else setThemeId(id);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

function ReportPickerModal({
  open,
  mode,
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean;
  mode: 'country' | 'theme';
  items: { id: string; label: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="font-display text-base font-semibold text-foreground">
            {mode === 'country'
              ? t('insights.report.pickCountry')
              : t('insights.report.pickTheme')}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm font-semibold text-primary">{t('common.done')}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerClassName="p-4 gap-1.5">
          {items.map((item) => {
            const active = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  tapSelection();
                  onSelect(item.id);
                }}
                className={`flex-row items-center justify-between rounded-xl px-3 py-3 ${
                  active ? 'bg-primary/15' : 'bg-card'
                }`}
              >
                <Text
                  className="flex-1 text-sm font-medium"
                  style={{ color: active ? colors.primary : colors.foreground }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {active ? (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function TabPill({
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
      className={`flex-1 rounded-full px-3 py-2 border ${
        active ? 'bg-primary border-primary' : 'bg-card border-border'
      }`}
    >
      <Text
        className={`text-center text-xs font-semibold ${
          active ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: 'primary' | 'red' | 'green' | 'gold';
}) {
  const colors = useThemeColors();
  const map = {
    primary: { bg: 'bg-primary/15', fg: colors.primary },
    red: { bg: 'bg-destructive/15', fg: colors.destructive },
    green: { bg: 'bg-primary/15', fg: colors.aydGreen },
    gold: { bg: 'bg-secondary/15', fg: colors.aydGold },
  } as const;
  const t = map[tint];
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
      <View className={`h-7 w-7 items-center justify-center rounded-lg ${t.bg}`}>
        <Ionicons name={icon} size={15} color={t.fg} />
      </View>
      <Text className="mt-2 text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
    </View>
  );
}

function AnomalyCard({
  anomaly,
  t,
}: {
  anomaly: Anomaly;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const colors = useThemeColors();
  const sev =
    anomaly.severity === 'critical'
      ? { bgClass: 'bg-destructive/10', borderClass: 'border-destructive', textClass: 'text-destructive', icon: 'warning' as const, color: colors.destructive }
      : anomaly.severity === 'warning'
      ? { bgClass: 'bg-secondary/15', borderClass: 'border-secondary', textClass: 'text-secondary', icon: 'alert-circle' as const, color: colors.aydGold }
      : { bgClass: 'bg-primary/15', borderClass: 'border-primary', textClass: 'text-primary', icon: 'trophy' as const, color: colors.aydGreen };
  const arrow = anomaly.direction === 'above' ? 'arrow-up' : 'arrow-down';

  return (
    <View className={`rounded-2xl border border-border bg-card border-l-4 ${sev.borderClass}`}>
      <View className="p-4">
        <View className="flex-row gap-3">
          <View className={`h-10 w-10 items-center justify-center rounded-xl ${sev.bgClass}`}>
            <Ionicons name={sev.icon} size={18} color={sev.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap mb-1.5">
              <View className={`rounded-full px-2 py-0.5 ${sev.bgClass}`}>
                <Text className={`text-[10px] font-semibold uppercase ${sev.textClass}`}>
                  {t(`insights.sev.${anomaly.severity}`)}
                </Text>
              </View>
              <Text className="text-[10px] text-muted-foreground">
                {anomaly.year} · {anomaly.deviations.toFixed(2)}σ
              </Text>
            </View>
            <Text className="font-display text-base font-bold text-foreground">
              {anomaly.countryName}
            </Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {anomaly.indicatorName}
            </Text>

            <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-muted px-3 py-1.5 self-start">
              <Ionicons name={arrow} size={14} color={sev.color} />
              <Text className={`text-sm font-bold ${sev.textClass}`}>
                {anomaly.value.toFixed(2)}
              </Text>
              <Text className="text-[10px] text-muted-foreground">
                {t('insights.vsMean', { mean: anomaly.mean.toFixed(2) })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function CorrelationCard({ correlation }: { correlation: Correlation }) {
  const colors = useThemeColors();
  const isPositive = correlation.direction === 'positive';
  const tint = isPositive ? colors.aydGreen : colors.destructive;
  return (
    <View
      className="rounded-2xl border border-border bg-card border-l-4"
      style={{ borderLeftColor: tint }}
    >
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="rounded-full bg-muted px-2 py-0.5">
            <Text className="text-[10px] font-semibold uppercase text-muted-foreground">
              {correlation.strength}
            </Text>
          </View>
          <Text className="text-xs font-semibold" style={{ color: tint }}>
            r = {correlation.correlation.toFixed(2)}
          </Text>
        </View>
        <Text className="font-display text-sm font-bold text-foreground">
          {correlation.indicator1.name} ↔ {correlation.indicator2.name}
        </Text>
        <Text className="mt-1.5 text-xs text-muted-foreground">
          {correlation.interpretation}
        </Text>
        <Text className="mt-2 text-[10px] text-muted-foreground">
          n = {correlation.sampleSize}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <View className="rounded-2xl border border-border bg-card p-8 items-center">
      <Ionicons name="sparkles-outline" size={36} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-muted-foreground">{text}</Text>
    </View>
  );
}

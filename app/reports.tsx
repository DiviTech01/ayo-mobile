import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/lib/queries';
import { documentDownloadUrl } from '@/lib/api';
import type { DocumentSummary } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import { tapLight } from '@/lib/haptics';

const TYPE_TINT: Record<string, { bg: string; text: string; labelKey: string }> = {
  PKPB_REPORT: { bg: 'bg-pan-green-50', text: 'text-pan-green-700', labelKey: 'reports.type.pkpb' },
  POLICY_BRIEF: { bg: 'bg-pan-red-50', text: 'text-pan-red-700', labelKey: 'reports.type.policy' },
  RESEARCH_PAPER: { bg: 'bg-pan-blue-50', text: 'text-pan-blue-700', labelKey: 'reports.type.research' },
  PRESENTATION: { bg: 'bg-pan-gold-50', text: 'text-pan-gold-700', labelKey: 'reports.type.slides' },
  OTHER: { bg: 'bg-muted', text: 'text-muted-foreground', labelKey: 'reports.type.doc' },
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ReportsScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const q = useReports();

  const filtered = useMemo(() => {
    // Exclude PKPB country reports — they live on their own pages. This screen
    // mirrors the web "Reports & Publications": briefs, research, data pubs.
    const list = (Array.isArray(q.data) ? q.data : []).filter((r) => r.type !== 'PKPB_REPORT');
    const qq = search.trim().toLowerCase();
    if (!qq) return list;
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(qq) ||
        (r.country?.name?.toLowerCase().includes(qq) ?? false) ||
        r.type.toLowerCase().includes(qq),
    );
  }, [q.data, search]);

  const onOpen = (r: DocumentSummary) => {
    tapLight();
    Linking.openURL(documentDownloadUrl(r.id)).catch(() => undefined);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title={t('reports.title')}
          description={t('reports.description')}
          showBack
        />

        <View className="px-5 pt-4">
          <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('reports.search')}
              placeholderTextColor={colors.mutedForeground}
              className="ml-2 flex-1 text-base text-foreground"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

        {q.isLoading ? (
          <SkeletonList />
        ) : q.error ? (
          <ErrorState onRetry={() => q.refetch()} t={t} />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} t={t} />
        ) : (
          <>
          <View className="mt-4 gap-2.5">
            {filtered.map((r) => {
              const tint = TYPE_TINT[r.type] ?? TYPE_TINT.OTHER;
              const subtitle = [
                r.country?.name,
                r.year != null ? `${r.year}` : null,
                formatDate(r.createdAt),
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <Pressable
                  key={r.id}
                  onPress={() => onOpen(r)}
                  className="rounded-2xl border border-border bg-card p-4 active:bg-muted"
                >
                  <View className="flex-row items-start gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
                      <Ionicons name="document-text" size={22} color={colors.accent} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                        {r.title}
                      </Text>
                      <View className="mt-1.5 flex-row items-center gap-2 flex-wrap">
                        <View className={`rounded-full px-2 py-0.5 ${tint.bg}`}>
                          <Text className={`text-[10px] font-semibold uppercase ${tint.text}`}>
                            {t(tint.labelKey)}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                          {subtitle}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="open-outline" size={18} color={colors.mutedForeground} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          <OpenOnWebLink href={webLinks.reports} />
          </>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SkeletonList() {
  return (
    <View className="mt-4 gap-2.5">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 rounded-xl bg-muted" />
            <View className="flex-1">
              <View className="h-3 w-3/4 rounded-full bg-muted" />
              <View className="mt-2 h-2.5 w-1/3 rounded-full bg-muted opacity-60" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ErrorState({
  onRetry,
  t,
}: {
  onRetry: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const colors = useThemeColors();
  return (
    <View className="mt-8 items-center rounded-2xl border border-border bg-card p-6">
      <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-foreground">{t('reports.loadError')}</Text>
      <Pressable onPress={onRetry} className="mt-3 rounded-lg bg-primary px-4 py-2">
        <Text className="text-sm font-medium text-primary-foreground">
          {t('common.retry')}
        </Text>
      </Pressable>
    </View>
  );
}

function EmptyState({
  search,
  t,
}: {
  search: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const colors = useThemeColors();
  return (
    <View className="mt-8 items-center py-10">
      <Ionicons name="folder-open-outline" size={32} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-muted-foreground">
        {search ? t('reports.noMatch', { search }) : t('reports.empty')}
      </Text>
    </View>
  );
}

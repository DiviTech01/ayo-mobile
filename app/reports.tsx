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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/lib/queries';
import { documentDownloadUrl } from '@/lib/api';
import type { DocumentSummary } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';
import { tapLight } from '@/lib/haptics';

const TYPE_TINT: Record<string, { bg: string; text: string; label: string }> = {
  PKPB_REPORT: { bg: 'bg-pan-green-50', text: 'text-pan-green-700', label: 'PKPB' },
  POLICY_BRIEF: { bg: 'bg-pan-red-50', text: 'text-pan-red-700', label: 'Policy' },
  RESEARCH_PAPER: { bg: 'bg-pan-blue-50', text: 'text-pan-blue-700', label: 'Research' },
  PRESENTATION: { bg: 'bg-pan-gold-50', text: 'text-pan-gold-700', label: 'Slides' },
  OTHER: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Doc' },
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
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const q = useReports();

  const filtered = useMemo(() => {
    const list = Array.isArray(q.data) ? q.data : [];
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

      <View className="flex-row items-center justify-between border-b border-border bg-card px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text className="text-sm font-medium text-foreground">Back</Text>
        </Pressable>
        <Text className="font-display text-base font-semibold text-foreground">Reports</Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        <View className="pt-4">
          <Text className="text-xs uppercase tracking-wider text-muted-foreground">Library</Text>
          <Text className="mt-1 font-display text-2xl font-bold text-foreground">
            Reports & policy briefs
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Continental and country-level outputs from PACSDA and partner organisations.
          </Text>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports"
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-base text-foreground"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {q.isLoading ? (
          <SkeletonList />
        ) : q.error ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
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
                            {tint.label}
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="mt-8 items-center rounded-2xl border border-border bg-card p-6">
      <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-foreground">Couldn&rsquo;t load reports</Text>
      <Pressable onPress={onRetry} className="mt-3 rounded-lg bg-primary px-4 py-2">
        <Text className="text-sm font-medium text-primary-foreground">Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ search }: { search: string }) {
  const colors = useThemeColors();
  return (
    <View className="mt-8 items-center py-10">
      <Ionicons name="folder-open-outline" size={32} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-muted-foreground">
        {search ? `No reports match "${search}"` : 'No reports in the library yet.'}
      </Text>
    </View>
  );
}

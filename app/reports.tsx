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
import { reportPdfUrl } from '@/lib/api';
import type { ReportSummary } from '@/lib/api';

const TYPE_TINT: Record<string, { bg: string; text: string }> = {
  brief: { bg: 'bg-pan-blue-50', text: 'text-pan-blue-700' },
  report: { bg: 'bg-pan-green-50', text: 'text-pan-green-700' },
  analysis: { bg: 'bg-pan-gold-50', text: 'text-pan-gold-700' },
  policy: { bg: 'bg-pan-red-50', text: 'text-pan-red-700' },
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
  const [search, setSearch] = useState('');
  const q = useReports();

  const filtered = useMemo(() => {
    const list = q.data ?? [];
    const qq = search.trim().toLowerCase();
    if (!qq) return list;
    return list.filter(
      (r) => r.title.toLowerCase().includes(qq) || r.type.toLowerCase().includes(qq),
    );
  }, [q.data, search]);

  const onOpen = (r: ReportSummary) => {
    Linking.openURL(reportPdfUrl(r.id)).catch(() => undefined);
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
        <Text className="text-base font-semibold text-gray-900">Reports</Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        <View className="pt-4">
          <Text className="text-xs uppercase tracking-wider text-gray-500">
            Library
          </Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            Reports & policy briefs
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Continental and country-level outputs from PACSDA and partner organisations.
          </Text>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl bg-white px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-base text-gray-900"
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
          <View className="mt-4 gap-2.5">
            {filtered.map((r) => {
              const tint = TYPE_TINT[r.type.toLowerCase()] ?? TYPE_TINT.report;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => onOpen(r)}
                  className="rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
                >
                  <View className="flex-row items-start gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-pan-blue-50">
                      <Ionicons name="document-text" size={22} color="#0369a1" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                        {r.title}
                      </Text>
                      <View className="mt-1.5 flex-row items-center gap-2">
                        <View className={`rounded-full px-2 py-0.5 ${tint.bg}`}>
                          <Text className={`text-[10px] font-semibold uppercase ${tint.text}`}>
                            {r.type}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-gray-500">
                          {formatDate(r.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="open-outline" size={18} color="#9ca3af" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SkeletonList() {
  return (
    <View className="mt-4 gap-2.5">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 rounded-xl bg-gray-100" />
            <View className="flex-1">
              <View className="h-3 w-3/4 rounded-full bg-gray-100" />
              <View className="mt-2 h-2.5 w-1/3 rounded-full bg-gray-50" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="mt-8 items-center rounded-2xl border border-gray-200 bg-white p-6">
      <Ionicons name="cloud-offline-outline" size={32} color="#9ca3af" />
      <Text className="mt-2 text-sm text-gray-700">Couldn't load reports</Text>
      <Pressable onPress={onRetry} className="mt-3 rounded-lg bg-pan-blue-600 px-4 py-2">
        <Text className="text-sm font-medium text-white">Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <View className="mt-8 items-center py-10">
      <Ionicons name="folder-open-outline" size={32} color="#d1d5db" />
      <Text className="mt-2 text-sm text-gray-500">
        {search ? `No reports match "${search}"` : 'No reports in the library yet.'}
      </Text>
    </View>
  );
}

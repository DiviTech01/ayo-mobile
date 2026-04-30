import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExperts } from '@/lib/queries';
import type { Expert } from '@/lib/api';

export default function ExpertsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const q = useExperts();

  const filtered = useMemo(() => {
    const list = Array.isArray(q.data) ? q.data : [];
    const qq = search.trim().toLowerCase();
    if (!qq) return list;
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(qq) ||
        e.organization.toLowerCase().includes(qq) ||
        e.country.toLowerCase().includes(qq) ||
        e.specialization.some((s) => s.toLowerCase().includes(qq)),
    );
  }, [q.data, search]);

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
        <Text className="text-base font-semibold text-gray-900">Experts</Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        <View className="pt-4">
          <Text className="text-xs uppercase tracking-wider text-gray-500">
            Network
          </Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            Expert directory
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Researchers, policy advocates, and youth-development practitioners across the continent.
          </Text>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl bg-white px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, org, or specialization"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-base text-gray-900"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {q.isLoading ? (
          <SkeletonList />
        ) : q.error ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <View className="mt-4 gap-2.5">
            {filtered.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-start gap-3">
        <Avatar uri={expert.photoUrl} name={expert.name} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-base font-semibold text-gray-900">{expert.name}</Text>
            {expert.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0284c7" />
            )}
          </View>
          <Text className="text-xs text-gray-700">{expert.title}</Text>
          <Text className="mt-0.5 text-[11px] text-gray-500">
            {expert.organization} · {expert.country}
          </Text>
        </View>
      </View>

      {expert.bio ? (
        <Text className="mt-3 text-xs leading-5 text-gray-600" numberOfLines={3}>
          {expert.bio}
        </Text>
      ) : null}

      {expert.specialization.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {expert.specialization.slice(0, 5).map((s) => (
            <View key={s} className="rounded-full bg-pan-blue-50 px-2 py-0.5">
              <Text className="text-[10px] font-medium text-pan-blue-700">{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Avatar({ uri, name }: { uri?: string; name: string }) {
  if (uri) {
    return <Image source={{ uri }} className="h-12 w-12 rounded-full bg-gray-100" />;
  }
  const initial = name.charAt(0).toUpperCase();
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-pan-blue-100">
      <Text className="text-base font-bold text-pan-blue-700">{initial}</Text>
    </View>
  );
}

function SkeletonList() {
  return (
    <View className="mt-4 gap-2.5">
      {[1, 2, 3].map((i) => (
        <View key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 rounded-full bg-gray-100" />
            <View className="flex-1">
              <View className="h-3 w-32 rounded-full bg-gray-100" />
              <View className="mt-2 h-2.5 w-24 rounded-full bg-gray-50" />
              <View className="mt-1.5 h-2.5 w-40 rounded-full bg-gray-50" />
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
      <Text className="mt-2 text-sm text-gray-700">Couldn't load experts</Text>
      <Pressable onPress={onRetry} className="mt-3 rounded-lg bg-pan-blue-600 px-4 py-2">
        <Text className="text-sm font-medium text-white">Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <View className="mt-8 items-center py-10">
      <Ionicons name="people-outline" size={32} color="#d1d5db" />
      <Text className="mt-2 text-sm text-gray-500">
        {search ? `No experts match "${search}"` : 'No experts in the directory yet.'}
      </Text>
    </View>
  );
}

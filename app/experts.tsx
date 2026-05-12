import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExperts } from '@/lib/queries';
import type { Expert } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

export default function ExpertsScreen() {
  const colors = useThemeColors();
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
        (e.country?.name?.toLowerCase().includes(qq) ?? false) ||
        (e.specializations ?? []).some((s) => s.toLowerCase().includes(qq)),
    );
  }, [q.data, search]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title="Expert Directory"
          description="Researchers, policy advocates, and youth-development practitioners across the continent."
          icon="people"
          showBack
        />

        <View className="px-5 pt-4">
        <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, org, or specialization"
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-base text-foreground"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  const colors = useThemeColors();
  const countryLabel = expert.country?.name ?? '';
  const specializations = expert.specializations ?? [];
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-start gap-3">
        <Avatar uri={expert.photoUrl} name={expert.name} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-base font-semibold text-foreground">{expert.name}</Text>
            {expert.verified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
            )}
          </View>
          <Text className="text-xs text-foreground">{expert.title}</Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">
            {[expert.organization, countryLabel].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      {expert.bio ? (
        <Text className="mt-3 text-xs leading-5 text-muted-foreground" numberOfLines={3}>
          {expert.bio}
        </Text>
      ) : null}

      {specializations.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {specializations.slice(0, 5).map((s) => (
            <View key={s} className="rounded-full bg-accent/15 px-2 py-0.5">
              <Text className="text-[10px] font-medium text-accent">{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Avatar({ uri, name }: { uri?: string | null; name: string }) {
  if (uri) {
    return <Image source={{ uri }} className="h-12 w-12 rounded-full bg-muted" />;
  }
  const initial = name.charAt(0).toUpperCase();
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/15">
      <Text className="text-base font-bold text-accent">{initial}</Text>
    </View>
  );
}

function SkeletonList() {
  return (
    <View className="mt-4 gap-2.5">
      {[1, 2, 3].map((i) => (
        <View key={i} className="rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 rounded-full bg-muted" />
            <View className="flex-1">
              <View className="h-3 w-32 rounded-full bg-muted" />
              <View className="mt-2 h-2.5 w-24 rounded-full bg-muted opacity-60" />
              <View className="mt-1.5 h-2.5 w-40 rounded-full bg-muted opacity-60" />
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
      <Text className="mt-2 text-sm text-foreground">Couldn&rsquo;t load experts</Text>
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
      <Ionicons name="people-outline" size={32} color={colors.mutedForeground} />
      <Text className="mt-2 text-sm text-muted-foreground">
        {search ? `No experts match "${search}"` : 'No experts in the directory yet.'}
      </Text>
    </View>
  );
}

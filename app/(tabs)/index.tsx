import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StatsStrip } from '@/components/widgets/StatsStrip';
import { YouthIndexLeaderboard } from '@/components/widgets/YouthIndexLeaderboard';
import { RegionalBreakdown } from '@/components/widgets/RegionalBreakdown';
import { CountrySpotlight } from '@/components/widgets/CountrySpotlight';

export default function HomeScreen() {
  const [name, setName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { name?: string; full_name?: string } | undefined;
      const display =
        meta?.name ?? meta?.full_name ?? data.user?.email?.split('@')[0] ?? null;
      setName(display);
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    setRefreshing(false);
  }, [qc]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0369a1" />
        }
      >
        <View className="pt-4">
          <Text className="text-xs uppercase tracking-wider text-gray-500">Welcome back</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            {name ? `${name} 👋` : 'Hello 👋'}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            African Youth Observatory · Continental insights
          </Text>
        </View>

        <View className="mt-6 gap-4">
          <StatsStrip />
          <YouthIndexLeaderboard />
          <RegionalBreakdown />
          <CountrySpotlight />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

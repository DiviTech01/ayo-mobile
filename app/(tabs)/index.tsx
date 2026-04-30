import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StatsStrip } from '@/components/widgets/StatsStrip';
import { YouthIndexLeaderboard } from '@/components/widgets/YouthIndexLeaderboard';
import { RegionalBreakdown } from '@/components/widgets/RegionalBreakdown';
import { CountrySpotlight } from '@/components/widgets/CountrySpotlight';
import { ToolsGrid } from '@/components/widgets/ToolsGrid';
import { DashboardWidgets } from '@/components/widgets/DashboardWidgets';

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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#15803d" />
        }
      >
        <View className="pt-4">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Welcome back
          </Text>
          <Text className="mt-1 font-display text-3xl font-bold text-foreground">
            {name ? `${name} 👋` : 'Hello 👋'}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            African Youth Observatory · Continental insights
          </Text>
        </View>

        <View className="mt-6 gap-4">
          <StatsStrip />
          <DashboardWidgets />
          <ToolsGrid />
          <YouthIndexLeaderboard />
          <RegionalBreakdown />
          <CountrySpotlight />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Hero } from '@/components/Hero';
import { StatsStrip } from '@/components/widgets/StatsStrip';
import { FeaturedData } from '@/components/widgets/FeaturedData';
import { QuickInsights } from '@/components/widgets/QuickInsights';
import { Partners } from '@/components/widgets/Partners';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const qc = useQueryClient();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    setRefreshing(false);
  }, [qc]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-4 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Hero />

        <View className="py-8">
          <View className="items-center gap-3">
            <Text className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
              Key Statistics
            </Text>
            <Text className="max-w-[600px] text-center text-sm text-muted-foreground">
              Explore essential data points on African youth across our five core thematic areas.
            </Text>
          </View>
          <View className="mt-6">
            <StatsStrip />
          </View>
        </View>

        <View className="-mx-4 bg-muted/40 px-4 py-8">
          <View className="items-center gap-3">
            <Text className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
              Featured Insights
            </Text>
            <Text className="max-w-[600px] text-center text-sm text-muted-foreground">
              Explore our latest visualizations and reports on African youth development.
            </Text>
          </View>
          <View className="mt-6">
            <FeaturedData />
          </View>
          <View className="mt-8 items-center">
            <Pressable
              onPress={() => {
                tapLight();
                router.push('/reports' as unknown as Href);
              }}
              className="rounded-md border border-border bg-card px-5 py-3 active:bg-muted"
            >
              <Text className="text-sm font-semibold text-foreground">View All Reports</Text>
            </Pressable>
          </View>
        </View>

        <View className="-mx-4 bg-muted/30 px-4 py-10">
          <QuickInsights limit={3} year={2024} />
        </View>

        <Partners />
      </ScrollView>
    </SafeAreaView>
  );
}

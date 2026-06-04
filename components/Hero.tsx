import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeading } from '@/components/GradientHeading';
import { GridBackground } from '@/components/GridBackground';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

export function Hero() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="-mx-4 overflow-hidden px-4 pb-12 pt-8">
      <GridBackground opacity={0.4} />

      <View className="items-center gap-6">
        <View className="flex-row items-center gap-2 rounded-full border border-pan-gold-500/20 bg-pan-gold-500/10 px-3 py-1.5">
          <Ionicons name="trending-up" size={12} color={colors.aydGold} />
          <Text
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: colors.aydGold }}
          >
            Africa&apos;s Youth Data Platform
          </Text>
        </View>

        <GradientHeading fontSize={34} weight="700" align="center">
          African Youth Observatory
        </GradientHeading>

        <Text
          className="max-w-[600px] text-center text-sm leading-5"
          style={{ color: '#A89070' }}
        >
          Powering policy, research, innovation, and investment decisions with trusted,
          accessible youth data across all 54 African countries.
        </Text>

        <Pressable
          onPress={() => {
            tapLight();
            router.push('/(tabs)/countries' as unknown as Href);
          }}
          className="w-full max-w-md flex-row items-center rounded-full border border-border bg-card/70 px-4 py-3"
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            editable={false}
            placeholder="Search countries, indicators, themes..."
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-sm text-foreground"
            pointerEvents="none"
          />
        </Pressable>

        <View className="w-full gap-3">
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/(tabs)/explore' as unknown as Href);
            }}
            className="w-full flex-row items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 active:opacity-80"
          >
            <Ionicons name="server" size={16} color={colors.primaryForeground} />
            <Text className="text-base font-semibold text-primary-foreground">Explore Data</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/themes' as unknown as Href);
            }}
            className="w-full flex-row items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3.5 active:bg-muted"
          >
            <Ionicons name="trending-up" size={16} color={colors.foreground} />
            <Text className="text-base font-semibold text-foreground">Youth Index</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/compare' as unknown as Href);
            }}
            className="w-full flex-row items-center justify-center gap-2 rounded-md px-6 py-3 active:bg-muted"
          >
            <Text className="text-base font-semibold text-foreground">Compare Countries</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
          </Pressable>
        </View>

        <View className="mt-2 w-full flex-row gap-4">
          <View className="flex-1 items-center">
            <Text
              className="font-display text-3xl font-bold tabular-nums"
              style={{ color: colors.aydGold }}
            >
              54
            </Text>
            <Text className="text-xs text-muted-foreground">Countries</Text>
          </View>
          <View className="flex-1 items-center">
            <Text
              className="font-display text-3xl font-bold tabular-nums"
              style={{ color: colors.aydGold }}
            >
              500+
            </Text>
            <Text className="text-xs text-muted-foreground">Indicators</Text>
          </View>
          <View className="flex-1 items-center">
            <Text
              className="font-display text-3xl font-bold tabular-nums"
              style={{ color: colors.aydGold }}
            >
              226M
            </Text>
            <Text className="text-xs text-muted-foreground">Youth Covered</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

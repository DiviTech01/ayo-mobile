import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

export function Hero() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="py-10">
      <View className="items-center gap-6">
        <View className="flex-row items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <Ionicons name="trending-up" size={14} color={colors.primary} />
          <Text className="text-xs font-medium text-primary">
            Africa&rsquo;s Youth Data Intelligence Platform
          </Text>
        </View>

        <Text className="text-center font-display text-3xl font-bold tracking-tight text-foreground">
          African Youth Observatory
        </Text>

        <Text className="max-w-[600px] text-center text-base leading-6 text-muted-foreground">
          Powering policy, research, innovation, and investment decisions with trusted,
          accessible youth data across all 54 African countries.
        </Text>

        <Pressable
          onPress={() => {
            tapLight();
            router.push('/(tabs)/countries' as unknown as Href);
          }}
          className="w-full max-w-md flex-row items-center rounded-full border-2 border-border bg-card px-3 py-3"
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            editable={false}
            placeholder="Search countries, indicators, themes..."
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-base text-foreground"
            pointerEvents="none"
          />
        </Pressable>

        <View className="w-full flex-col gap-3">
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
              router.push('/(tabs)/countries' as unknown as Href);
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
            className="w-full flex-row items-center justify-center gap-2 rounded-md px-6 py-3.5 active:bg-muted"
          >
            <Text className="text-base font-semibold text-foreground">Compare Countries</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
          </Pressable>
        </View>

        <View className="mt-2 w-full flex-row gap-4">
          <View className="flex-1 items-center">
            <Text className="font-display text-3xl font-bold text-primary">54</Text>
            <Text className="text-xs text-muted-foreground">Countries</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-display text-3xl font-bold text-primary">500+</Text>
            <Text className="text-xs text-muted-foreground">Indicators</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-display text-3xl font-bold text-primary">226M</Text>
            <Text className="text-xs text-muted-foreground">Youth Covered</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

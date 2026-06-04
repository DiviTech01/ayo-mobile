import { Image, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeading } from '@/components/GradientHeading';
import { GridBackground } from '@/components/GridBackground';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

export function SaaSHero() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="-mx-4 overflow-hidden bg-black px-4 py-12">
      <GridBackground opacity={0.35} />

      <View className="items-center">
        <GradientHeading
          fontSize={28}
          weight="700"
          align="center"
        >{`Data-driven insights for\nAfrica's next generation`}</GradientHeading>

        <Text className="mt-4 max-w-[600px] text-center text-sm leading-5" style={{ color: '#A89070' }}>
          Comprehensive youth statistics across all 54 African nations.
          Explore, compare, and export trusted data for policy, research, and impact.
        </Text>

        <View className="mt-7 w-full gap-3">
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/(tabs)/explore' as unknown as Href);
            }}
            className="flex-row items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 active:opacity-80"
          >
            <Text className="text-base font-semibold text-primary-foreground">Start Exploring</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
          </Pressable>
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/themes' as unknown as Href);
            }}
            className="flex-row items-center justify-center gap-2 rounded-md border border-border bg-card/40 px-6 py-3.5 active:bg-muted"
          >
            <Text className="text-base font-semibold text-foreground">View Youth Index</Text>
          </Pressable>
        </View>

        <View className="mt-10 w-full overflow-hidden rounded-xl border border-border">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop&q=80',
            }}
            style={{ width: '100%', aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

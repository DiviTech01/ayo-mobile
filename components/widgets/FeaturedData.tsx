import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type FeatureColor = 'green' | 'blue' | 'orange';

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: FeatureColor;
  href: string;
};

const FEATURES: Feature[] = [
  {
    title: 'Youth Unemployment Trends',
    description:
      'Analysis of youth unemployment rates across African regions from 2010–2023.',
    icon: 'bar-chart',
    color: 'green',
    href: '/(tabs)/explore?theme=employment',
  },
  {
    title: 'Education Access by Gender',
    description:
      'Comparative analysis of education access and completion rates by gender.',
    icon: 'pie-chart',
    color: 'blue',
    href: '/(tabs)/explore?theme=education',
  },
  {
    title: 'Youth-led Entrepreneurship',
    description:
      'Emerging trends in youth entrepreneurship and business formation across Africa.',
    icon: 'trending-up',
    color: 'orange',
    href: '/(tabs)/explore?theme=entrepreneurship',
  },
];

const COLOR_RGB: Record<FeatureColor, string> = {
  green: '34, 197, 94',
  blue: '59, 130, 246',
  orange: '249, 115, 22',
};

export function FeaturedData() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="gap-5">
      {FEATURES.map((f) => {
        const rgb = COLOR_RGB[f.color];
        return (
          <Pressable
            key={f.title}
            onPress={() => {
              tapLight();
              router.push(f.href as unknown as Href);
            }}
            style={{
              borderColor: `rgba(${rgb}, 0.2)`,
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
            className="overflow-hidden rounded-2xl border p-5 active:opacity-90"
          >
            <View
              style={{ backgroundColor: `rgba(${rgb}, 1)`, opacity: 0.6 }}
              className="absolute left-0 right-0 top-0 h-px"
            />

            <View
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="mb-4 h-12 w-12 items-center justify-center rounded-xl"
            >
              <Ionicons
                name={f.icon}
                size={22}
                color={`rgb(${rgb})`}
              />
            </View>

            <Text className="font-display text-lg font-semibold text-foreground" style={{ letterSpacing: -0.2 }}>
              {f.title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              {f.description}
            </Text>

            <View className="mt-5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm text-muted-foreground">Explore</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.mutedForeground} />
              </View>
              <Pressable
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation();
                  tapLight();
                  router.push('/reports' as unknown as Href);
                }}
                className="h-8 w-8 items-center justify-center rounded-md active:bg-muted"
              >
                <Ionicons name="download-outline" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

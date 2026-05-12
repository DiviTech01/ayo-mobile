import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type FeatureColor = 'green' | 'blue' | 'gold';

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
      'Emerging trends in youth entrepreneurship and business formation.',
    icon: 'bar-chart',
    color: 'gold',
    href: '/(tabs)/explore?theme=entrepreneurship',
  },
];

const COLOR_MAP: Record<
  FeatureColor,
  { heroBg: string; iconColor: (c: ReturnType<typeof useThemeColors>) => string }
> = {
  green: { heroBg: 'bg-pan-green-500/15', iconColor: (c) => c.aydGreen },
  blue: { heroBg: 'bg-pan-blue-500/15', iconColor: (c) => c.aydBlue },
  gold: { heroBg: 'bg-pan-gold-500/15', iconColor: (c) => c.aydGold },
};

export function FeaturedData() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="gap-4">
      {FEATURES.map((f) => {
        const tint = COLOR_MAP[f.color];
        return (
          <View key={f.title} className="overflow-hidden rounded-lg border border-border bg-card">
            <View className={`aspect-video items-center justify-center ${tint.heroBg}`}>
              <Ionicons name={f.icon} size={40} color={tint.iconColor(colors)} />
            </View>
            <View className="p-5">
              <Text className="font-display text-lg font-bold text-foreground">{f.title}</Text>
              <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                {f.description}
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => {
                    tapLight();
                    router.push('/reports' as unknown as Href);
                  }}
                  className="flex-row items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 active:bg-muted"
                >
                  <Ionicons name="download-outline" size={14} color={colors.foreground} />
                  <Text className="text-xs font-medium text-foreground">Download</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    tapLight();
                    router.push(f.href as unknown as Href);
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-primary-foreground">View Data</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

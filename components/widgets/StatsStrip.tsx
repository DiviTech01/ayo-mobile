import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type StatColor = 'green' | 'blue' | 'purple' | 'gold' | 'orange';

type StatDef = {
  title: string;
  value: string;
  description: string;
  color: StatColor;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  href: string;
};

const STATS: StatDef[] = [
  {
    title: 'Coverage',
    value: '54',
    description: 'Countries with live data · 500+ indicators · 226M youth covered',
    color: 'green',
    icon: 'people',
    href: '/(tabs)/explore?theme=population',
  },
  {
    title: 'Education',
    value: '63.4',
    description: 'Avg education dimension score',
    color: 'blue',
    icon: 'school',
    href: '/(tabs)/explore?theme=education',
  },
  {
    title: 'Health',
    value: '71.8',
    description: 'Avg health dimension score',
    color: 'purple',
    icon: 'heart',
    href: '/(tabs)/explore?theme=health',
  },
  {
    title: 'Employment',
    value: '42.6',
    description: 'Avg employment dimension score',
    color: 'orange',
    icon: 'briefcase',
    href: '/(tabs)/explore?theme=employment',
  },
  {
    title: 'Innovation',
    value: '38.2',
    description: 'Avg innovation dimension score',
    color: 'green',
    icon: 'rocket',
    href: '/(tabs)/explore?theme=entrepreneurship',
  },
];

const GLOW_RGB: Record<StatColor, string> = {
  green: '34, 197, 94',
  blue: '59, 130, 246',
  purple: '168, 85, 247',
  gold: '212, 160, 23',
  orange: '249, 115, 22',
};

function Sparkline({ rgb, seed }: { rgb: string; seed: number }) {
  const heights = Array.from({ length: 12 }).map((_, i) => {
    const x = Math.sin(seed * 0.8 + i) * 30 + 30;
    return Math.max(15, 20 + x);
  });
  return (
    <View className="mt-3 h-8 flex-row items-end gap-[2px]">
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            backgroundColor: `rgba(${rgb}, 0.22)`,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

export function StatsStrip() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="gap-4">
      {STATS.map((stat, i) => {
        const rgb = GLOW_RGB[stat.color];
        return (
          <Pressable
            key={stat.title}
            onPress={() => {
              tapLight();
              router.push(stat.href as unknown as Href);
            }}
            style={{
              borderColor: `rgba(${rgb}, 0.25)`,
              shadowColor: `rgba(${rgb}, 1)`,
              shadowOpacity: 0.15,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            }}
            className="overflow-hidden rounded-2xl border bg-card p-5 active:opacity-90"
          >
            <View className="flex-row items-start justify-between">
              <View className="min-w-0 flex-1 pr-3">
                <Text className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </Text>
                <Text className="mt-1 font-display text-4xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </Text>
              </View>
              <View
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                className="h-10 w-10 items-center justify-center rounded-xl"
              >
                <Ionicons
                  name={stat.icon}
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </View>

            <Text
              className="mt-3 text-xs leading-4 text-muted-foreground"
              numberOfLines={2}
            >
              {stat.description}
            </Text>

            <View className="mt-3 flex-row">
              <View
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                }}
                className="rounded-full px-2 py-0.5"
              >
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: 'rgb(110, 231, 183)' }}
                >
                  Live · 2025
                </Text>
              </View>
            </View>

            <Sparkline rgb={rgb} seed={i + 1} />
          </Pressable>
        );
      })}
    </View>
  );
}

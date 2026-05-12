import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type StatColor = 'green' | 'blue' | 'purple' | 'gold' | 'red';

type StatDef = {
  title: string;
  value: string;
  description: string;
  trend: string;
  color: StatColor;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  href: string;
};

const STATS: StatDef[] = [
  {
    title: 'Population',
    value: '226M',
    description: 'African youth aged 15–24',
    trend: '+2.3%',
    color: 'green',
    icon: 'people',
    href: '/(tabs)/explore?theme=population',
  },
  {
    title: 'Education',
    value: '63%',
    description: 'Secondary enrollment rate',
    trend: '+5.7%',
    color: 'blue',
    icon: 'school',
    href: '/(tabs)/explore?theme=education',
  },
  {
    title: 'Health',
    value: '72%',
    description: 'Access to healthcare',
    trend: '+3.1%',
    color: 'purple',
    icon: 'heart',
    href: '/(tabs)/explore?theme=health',
  },
  {
    title: 'Employment',
    value: '42%',
    description: 'Youth labor participation',
    trend: '-1.2%',
    color: 'gold',
    icon: 'briefcase',
    href: '/(tabs)/explore?theme=employment',
  },
  {
    title: 'Entrepreneurship',
    value: '18%',
    description: 'Youth-led businesses',
    trend: '+4.5%',
    color: 'green',
    icon: 'rocket',
    href: '/(tabs)/explore?theme=entrepreneurship',
  },
];

const COLOR_TINT: Record<StatColor, { border: string; iconBg: string; iconFg: (c: ReturnType<typeof useThemeColors>) => string; barRGB: string }> = {
  green: {
    border: 'border-l-pan-green-500',
    iconBg: 'bg-pan-green-500/15',
    iconFg: (c) => c.aydGreen,
    barRGB: '34, 197, 94',
  },
  blue: {
    border: 'border-l-pan-blue-500',
    iconBg: 'bg-pan-blue-500/15',
    iconFg: (c) => c.aydBlue,
    barRGB: '59, 130, 246',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-500/15',
    iconFg: () => 'rgb(168, 85, 247)',
    barRGB: '168, 85, 247',
  },
  gold: {
    border: 'border-l-pan-gold-500',
    iconBg: 'bg-pan-gold-500/15',
    iconFg: (c) => c.aydGold,
    barRGB: '234, 179, 8',
  },
  red: {
    border: 'border-l-pan-red-500',
    iconBg: 'bg-pan-red-500/15',
    iconFg: (c) => c.aydRed,
    barRGB: '239, 68, 68',
  },
};

function MiniBarChart({ rgb, seed }: { rgb: string; seed: number }) {
  const heights = Array.from({ length: 10 }).map((_, i) => {
    const x = Math.sin(seed * 7919 + i * 31) * 0.5 + 0.5;
    return 20 + x * 80;
  });
  return (
    <View className="mt-3 h-10 flex-row items-end gap-0.5">
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            backgroundColor: `rgba(${rgb}, ${0.25 + (i / 10) * 0.6})`,
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
        const tint = COLOR_TINT[stat.color];
        const positive = stat.trend.startsWith('+');
        return (
          <Pressable
            key={stat.title}
            onPress={() => {
              tapLight();
              router.push(stat.href as unknown as Href);
            }}
            className={`overflow-hidden rounded-lg border border-border border-l-4 bg-card p-5 active:opacity-90 ${tint.border}`}
          >
            <View className="flex-row items-start justify-between">
              <View className="min-w-0 flex-1 pr-3">
                <Text className="text-xs font-medium text-muted-foreground">{stat.title}</Text>
                <Text className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stat.value}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                  {stat.description}
                </Text>
              </View>
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${tint.iconBg}`}
              >
                <Ionicons name={stat.icon} size={18} color={tint.iconFg(colors)} />
              </View>
            </View>

            <View className="mt-3 flex-row">
              <View
                className={`rounded-full px-2 py-1 ${
                  positive ? 'bg-pan-green-500/15' : 'bg-pan-red-500/15'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    positive ? 'text-pan-green-700' : 'text-pan-red-700'
                  }`}
                  style={positive ? undefined : { color: '#dc2626' }}
                >
                  {stat.trend} since 2020
                </Text>
              </View>
            </View>

            <MiniBarChart rgb={tint.barRGB} seed={i + 1} />
          </Pressable>
        );
      })}
    </View>
  );
}

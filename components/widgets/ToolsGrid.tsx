import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ToolKey = 'compare' | 'policy' | 'experts' | 'reports';

const TOOLS: Array<{
  key: ToolKey;
  label: string;
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  bg: string;
  iconColor: string;
  href: string;
}> = [
  {
    key: 'compare',
    label: 'Compare',
    sub: 'Side-by-side',
    icon: 'bar-chart',
    bg: 'bg-pan-blue-50',
    iconColor: '#0369a1',
    href: '/compare',
  },
  {
    key: 'policy',
    label: 'Policy Monitor',
    sub: 'AYC compliance',
    icon: 'shield-checkmark',
    bg: 'bg-pan-green-50',
    iconColor: '#15803d',
    href: '/policy',
  },
  {
    key: 'experts',
    label: 'Experts',
    sub: 'Directory',
    icon: 'people',
    bg: 'bg-pan-gold-50',
    iconColor: '#b45309',
    href: '/experts',
  },
  {
    key: 'reports',
    label: 'Reports',
    sub: 'Library',
    icon: 'document-text',
    bg: 'bg-pan-red-50',
    iconColor: '#b91c1c',
    href: '/reports',
  },
];

export function ToolsGrid() {
  const router = useRouter();

  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-gray-900">Tools</Text>
      <View className="flex-row flex-wrap gap-3">
        {TOOLS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => router.push(t.href as unknown as Href)}
            className="min-w-[47%] flex-1 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-xl ${t.bg}`}
            >
              <Ionicons name={t.icon} size={20} color={t.iconColor} />
            </View>
            <Text className="mt-3 text-sm font-semibold text-gray-900">{t.label}</Text>
            <Text className="text-[11px] text-gray-500">{t.sub}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

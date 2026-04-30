import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PromiseItem } from '@/data/countryReports';

const STYLES = {
  kept: {
    panel: 'rounded-2xl border border-pan-green-200 bg-pan-green-50 p-5',
    title: 'text-base font-bold uppercase tracking-wide text-pan-green-800',
    sub: 'mt-1 text-xs text-pan-green-700',
    chip: 'mt-3 self-start rounded-md bg-pan-green-100 px-2.5 py-1',
    chipText: 'text-[11px] font-semibold text-pan-green-800',
    icon: '#15803d' as const,
    iconName: 'checkmark-circle' as const,
    label: 'Promise Kept',
    sublabel: 'Genuine, youth-specific wins',
  },
  broken: {
    panel: 'rounded-2xl border border-pan-red-200 bg-pan-red-50 p-5',
    title: 'text-base font-bold uppercase tracking-wide text-pan-red-800',
    sub: 'mt-1 text-xs text-pan-red-700',
    chip: 'mt-3 self-start rounded-md bg-pan-red-100 px-2.5 py-1',
    chipText: 'text-[11px] font-semibold text-pan-red-800',
    icon: '#b91c1c' as const,
    iconName: 'alert-circle' as const,
    label: 'Promise Broken',
    sublabel: 'Failures named with data',
  },
};

type Props = { kind: 'kept' | 'broken'; items: PromiseItem[] };

export function PromiseList({ kind, items }: Props) {
  const s = STYLES[kind];

  return (
    <View className={s.panel}>
      <View className="flex-row items-center gap-2">
        <Ionicons name={s.iconName} size={22} color={s.icon} />
        <Text className={s.title}>{s.label}</Text>
      </View>
      <Text className={s.sub}>{s.sublabel}</Text>

      <View className="mt-4 gap-3">
        {items.map((item, i) => (
          <View key={i} className="rounded-xl border border-white/60 bg-white p-4">
            <Text className="text-sm font-semibold text-gray-900">{item.title}</Text>
            <Text className="mt-1.5 text-xs leading-5 text-gray-600">{item.desc}</Text>
            <View className={s.chip}>
              <Text className={s.chipText}>{item.stat}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

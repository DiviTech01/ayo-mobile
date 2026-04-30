import { Text, View } from 'react-native';
import type { Legislation } from '@/data/countryReports';

const STATUS_STYLE: Record<Legislation['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-pan-green-100', text: 'text-pan-green-800', label: 'Active' },
  partial: { bg: 'bg-pan-gold-100', text: 'text-pan-gold-800', label: 'Partial' },
  weak: { bg: 'bg-pan-red-100', text: 'text-pan-red-800', label: 'Weak' },
  new: { bg: 'bg-pan-blue-100', text: 'text-pan-blue-800', label: 'New' },
};

export function LegislationTable({ items }: { items: Legislation[] }) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white">
      {items.map((item, i) => {
        const status = STATUS_STYLE[item.status];
        return (
          <View
            key={i}
            className={`p-4 ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                <Text className="mt-0.5 text-xs text-gray-500">{item.year}</Text>
              </View>
              <View className={`rounded-full px-2.5 py-0.5 ${status.bg}`}>
                <Text className={`text-[11px] font-semibold ${status.text}`}>
                  {status.label}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-xs leading-5 text-gray-700">{item.reality}</Text>
          </View>
        );
      })}
    </View>
  );
}

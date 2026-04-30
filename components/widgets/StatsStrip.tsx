import { Text, View } from 'react-native';

const STATS = [
  { label: 'Countries', value: '54' },
  { label: 'Indicators', value: '120+' },
  { label: 'Youth (15–35)', value: '450M+' },
  { label: 'Themes', value: '5' },
];

export function StatsStrip() {
  return (
    <View className="flex-row flex-wrap gap-3">
      {STATS.map((s) => (
        <View
          key={s.label}
          className="min-w-[45%] flex-1 rounded-xl border border-gray-200 bg-white p-4"
        >
          <Text className="text-xs text-gray-500">{s.label}</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">{s.value}</Text>
        </View>
      ))}
    </View>
  );
}

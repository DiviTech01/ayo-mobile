import { Text, View } from 'react-native';

const PARTNERS = ['AU', 'UNDP', 'UNICEF', 'WHO', 'ILO', 'AfDB'] as const;

export function Partners() {
  return (
    <View className="-mx-4 px-4 py-10">
      <View className="items-center gap-2">
        <Text className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
          Our Partners
        </Text>
        <Text className="max-w-[600px] text-center text-sm text-muted-foreground">
          We collaborate with leading organizations to provide accurate and comprehensive data.
        </Text>
      </View>

      <View className="mt-6 flex-row flex-wrap justify-center gap-3 opacity-75">
        {PARTNERS.map((p) => (
          <View
            key={p}
            className="h-12 w-24 items-center justify-center rounded-md bg-muted"
          >
            <Text className="text-sm font-semibold text-muted-foreground">{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

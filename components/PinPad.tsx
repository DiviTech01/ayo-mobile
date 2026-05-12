import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';

type Props = {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export function PinPad({ value, onChange, maxLength = 4 }: Props) {
  const colors = useThemeColors();

  const press = (k: string) => {
    if (k === 'back') {
      onChange(value.slice(0, -1));
    } else if (k && value.length < maxLength) {
      onChange(value + k);
    }
  };

  return (
    <View className="w-full max-w-[280px] self-center">
      <View className="mb-8 flex-row justify-center gap-4">
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            className={`h-4 w-4 rounded-full ${
              i < value.length ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </View>
      <View className="flex-row flex-wrap justify-between">
        {KEYS.map((k, i) => (
          <Pressable
            key={i}
            onPress={() => press(k)}
            disabled={!k}
            className="mb-3 h-16 w-[30%] items-center justify-center rounded-full bg-muted active:opacity-80 disabled:opacity-0"
          >
            {k === 'back' ? (
              <Ionicons name="backspace-outline" size={22} color={colors.foreground} />
            ) : (
              <Text className="text-2xl font-medium text-foreground">{k}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

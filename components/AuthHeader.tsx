import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function AuthHeader({ title, subtitle, onBack }: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const back = onBack ?? (() => router.back());

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Text className="font-display text-[11px] font-extrabold text-primary-foreground tracking-wider">
              AYO
            </Text>
          </View>
          <Text className="font-display text-base font-bold text-foreground">
            African Youth Observatory
          </Text>
        </View>
        {router.canGoBack() ? (
          <Pressable onPress={back} hitSlop={6} className="p-1 active:opacity-60">
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
        ) : null}
      </View>

      <View className="mt-10">
        <Text className="font-display text-3xl font-bold text-foreground">{title}</Text>
        {subtitle ? (
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

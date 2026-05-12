import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from './BrandLogo';
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
        <BrandLogo />
        {router.canGoBack() ? (
          <Pressable onPress={back} hitSlop={6} className="p-1 active:opacity-60">
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
        ) : null}
      </View>

      <View className="mt-8">
        <Text className="font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

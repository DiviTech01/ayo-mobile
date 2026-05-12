import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GradientHero } from './GradientHero';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type Props = {
  title: string;
  description?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  showBack?: boolean;
  rightAction?: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    label?: string;
  };
};

export function PageHeader({
  title,
  description,
  icon,
  showBack = false,
  rightAction,
}: Props) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <GradientHero>
      {showBack || rightAction ? (
        <View className="mb-3 flex-row items-center justify-between">
          {showBack && router.canGoBack() ? (
            <Pressable
              onPress={() => {
                tapLight();
                router.back();
              }}
              hitSlop={8}
              className="flex-row items-center gap-1 -ml-1 p-1 active:opacity-60"
            >
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
              <Text className="text-sm font-medium text-foreground">Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {rightAction ? (
            <Pressable
              onPress={() => {
                tapLight();
                rightAction.onPress();
              }}
              hitSlop={8}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 active:bg-muted"
            >
              <Ionicons name={rightAction.icon} size={14} color={colors.foreground} />
              {rightAction.label ? (
                <Text className="text-xs font-semibold text-foreground">
                  {rightAction.label}
                </Text>
              ) : null}
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row items-center gap-3">
        {icon ? (
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
        ) : null}
        <Text className="flex-1 font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </Text>
      </View>
      {description ? (
        <Text className="mt-2 max-w-[42ch] text-sm leading-5 text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </GradientHero>
  );
}

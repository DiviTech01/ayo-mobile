import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';

type Props = {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onPressMore?: () => void;
  moreLabel?: string;
  children: React.ReactNode;
};

export function WidgetCard({
  title,
  subtitle,
  loading,
  error,
  onRetry,
  onPressMore,
  moreLabel = 'View all',
  children,
}: Props) {
  const colors = useThemeColors();
  const showHeader = !!(title || subtitle || onPressMore);

  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      {showHeader ? (
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            {title ? (
              <Text className="font-display text-base font-semibold text-foreground">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">{subtitle}</Text>
            ) : null}
          </View>
          {onPressMore && !loading && !error ? (
            <Pressable onPress={onPressMore} className="flex-row items-center gap-1">
              <Text className="text-xs font-medium text-primary">{moreLabel}</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View className="items-center py-6">
          <Ionicons name="cloud-offline-outline" size={28} color={colors.mutedForeground} />
          <Text className="mt-2 text-sm text-muted-foreground">Couldn&rsquo;t load this widget</Text>
          {onRetry ? (
            <Pressable onPress={onRetry} className="mt-2">
              <Text className="text-xs font-medium text-primary">Try again</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

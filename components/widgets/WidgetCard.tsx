import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
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
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-5">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold text-gray-900">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text> : null}
        </View>
        {onPressMore && !loading && !error ? (
          <Pressable onPress={onPressMore} className="flex-row items-center gap-1">
            <Text className="text-xs font-medium text-pan-blue-600">{moreLabel}</Text>
            <Ionicons name="chevron-forward" size={12} color="#0284c7" />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#0369a1" />
        </View>
      ) : error ? (
        <View className="items-center py-6">
          <Ionicons name="cloud-offline-outline" size={28} color="#9ca3af" />
          <Text className="mt-2 text-sm text-gray-500">Couldn't load this widget</Text>
          {onRetry ? (
            <Pressable onPress={onRetry} className="mt-2">
              <Text className="text-xs font-medium text-pan-blue-600">Try again</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

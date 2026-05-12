import { useEffect } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  className,
  style,
}: Props) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={`bg-muted ${className ?? ''}`}
      style={[{ width, height, borderRadius: radius }, animated, style]}
    />
  );
}

export function SkeletonRow({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Skeleton width={28} height={28} radius={14} />
          <Skeleton height={10} width={`${60 + ((i * 13) % 30)}%`} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      <Skeleton height={14} width="40%" />
      <View className="mt-4">
        <SkeletonRow lines={lines} />
      </View>
    </View>
  );
}

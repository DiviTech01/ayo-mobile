import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '@/lib/theme-colors';

function Orb({
  color,
  size,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  color: string;
  size: number;
  top?: number | `${number}%`;
  left?: number | `${number}%`;
  right?: number | `${number}%`;
  bottom?: number | `${number}%`;
  delay?: number;
}) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, delay]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          bottom,
        },
        animated,
      ]}
    />
  );
}

export function AmbientBackground() {
  const colors = useThemeColors();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      <Orb color={colors.primary + '14'} size={360} top={-120} left={-80} delay={0} />
      <Orb color={colors.aydGold + '12'} size={420} top={'30%'} right={-160} delay={1500} />
      <Orb color={colors.accent + '10'} size={320} bottom={-100} left={'30%'} delay={2800} />
    </View>
  );
}

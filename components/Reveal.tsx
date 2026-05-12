import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export function Reveal({ children, delay = 0, duration = 850 }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(duration).easing(EASE).delay(delay)}
    >
      {children}
    </Animated.View>
  );
}

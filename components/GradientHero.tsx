import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useThemeColors } from '@/lib/theme-colors';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Optional accent colour (hex). Defaults to the brand green. */
  tint?: string;
};

export function GradientHero({ children, className, tint }: Props) {
  const colors = useThemeColors();
  const accentStop = tint ? `${tint}26` : `${colors.primary}0D`;
  return (
    <LinearGradient
      colors={[colors.background, colors.muted, accentStop]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.5, 1]}
    >
      <View className={className ?? 'px-5 py-7'}>{children}</View>
    </LinearGradient>
  );
}

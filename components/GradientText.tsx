import { Text, type TextProps } from 'react-native';
import { useThemeColors } from '@/lib/theme-colors';

type Props = TextProps & {
  children: React.ReactNode;
};

export function GradientText({ children, style, ...rest }: Props) {
  const colors = useThemeColors();
  return (
    <Text {...rest} style={[{ color: colors.aydGold }, style]}>
      {children}
    </Text>
  );
}

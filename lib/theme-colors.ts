import { useColorScheme } from 'nativewind';

type Palette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  aydGreen: string;
  aydGold: string;
  aydBlue: string;
  aydRed: string;
  surfaceElevated: string;
  surfaceSunken: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
};

const LIGHT: Palette = {
  background: 'hsl(40, 33%, 99%)',
  foreground: 'hsl(220, 20%, 14%)',
  card: 'hsl(0, 0%, 100%)',
  cardForeground: 'hsl(220, 20%, 14%)',
  popover: 'hsl(0, 0%, 100%)',
  popoverForeground: 'hsl(220, 20%, 14%)',
  primary: 'hsl(142, 71%, 35%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(36, 100%, 50%)',
  secondaryForeground: 'hsl(220, 20%, 14%)',
  muted: 'hsl(220, 14%, 96%)',
  mutedForeground: 'hsl(220, 13%, 46%)',
  accent: 'hsl(199, 89%, 48%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  destructive: 'hsl(0, 84%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  border: 'hsl(220, 13%, 91%)',
  input: 'hsl(220, 13%, 91%)',
  ring: 'hsl(142, 71%, 35%)',
  aydGreen: 'hsl(142, 71%, 35%)',
  aydGold: 'hsl(36, 100%, 50%)',
  aydBlue: 'hsl(199, 89%, 48%)',
  aydRed: 'hsl(0, 72%, 51%)',
  surfaceElevated: 'hsl(0, 0%, 100%)',
  surfaceSunken: 'hsl(220, 14%, 96%)',
  textPrimary: 'hsl(220, 20%, 14%)',
  textSecondary: 'hsl(220, 13%, 46%)',
  textMuted: 'hsl(220, 10%, 60%)',
};

const DARK: Palette = {
  background: 'hsl(224, 40%, 6%)',
  foreground: 'hsl(210, 40%, 96%)',
  card: 'hsl(224, 40%, 9%)',
  cardForeground: 'hsl(210, 40%, 96%)',
  popover: 'hsl(224, 40%, 9%)',
  popoverForeground: 'hsl(210, 40%, 96%)',
  primary: 'hsl(142, 65%, 45%)',
  primaryForeground: 'hsl(220, 20%, 10%)',
  secondary: 'hsl(36, 95%, 55%)',
  secondaryForeground: 'hsl(220, 20%, 10%)',
  muted: 'hsl(224, 30%, 15%)',
  mutedForeground: 'hsl(215, 20%, 65%)',
  accent: 'hsl(199, 85%, 55%)',
  accentForeground: 'hsl(220, 20%, 10%)',
  destructive: 'hsl(0, 72%, 50%)',
  destructiveForeground: 'hsl(210, 40%, 98%)',
  border: 'hsl(224, 25%, 18%)',
  input: 'hsl(224, 25%, 18%)',
  ring: 'hsl(142, 65%, 45%)',
  aydGreen: 'hsl(142, 65%, 45%)',
  aydGold: 'hsl(36, 95%, 55%)',
  aydBlue: 'hsl(199, 85%, 55%)',
  aydRed: 'hsl(0, 72%, 55%)',
  surfaceElevated: 'hsl(224, 40%, 12%)',
  surfaceSunken: 'hsl(224, 40%, 4%)',
  textPrimary: 'hsl(210, 40%, 96%)',
  textSecondary: 'hsl(215, 20%, 65%)',
  textMuted: 'hsl(215, 15%, 50%)',
};

export type ThemeColors = Palette;
export type ThemeColorKey = keyof Palette;

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK : LIGHT;
}

export function useThemeColor(key: ThemeColorKey): string {
  return useThemeColors()[key];
}

import { useColorScheme } from 'nativewind';

const LIGHT_PALETTE = [
  'hsl(142, 71%, 35%)',
  'hsl(36, 100%, 50%)',
  'hsl(199, 89%, 48%)',
  'hsl(0, 72%, 51%)',
  'hsl(280, 65%, 60%)',
] as const;

const DARK_PALETTE = [
  'hsl(142, 65%, 45%)',
  'hsl(36, 95%, 55%)',
  'hsl(199, 85%, 55%)',
  'hsl(0, 72%, 55%)',
  'hsl(280, 60%, 65%)',
] as const;

export const CHART_COLORS = LIGHT_PALETTE;

export function useChartPalette(): readonly string[] {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}

export const colorFor = (index: number) =>
  LIGHT_PALETTE[index % LIGHT_PALETTE.length];

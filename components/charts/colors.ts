export const CHART_COLORS = [
  '#22C55E', // green
  '#F59E0B', // gold
  '#3B82F6', // blue
  '#A855F7', // purple
  '#F43F5E', // rose
];

export const colorFor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

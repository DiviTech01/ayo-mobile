import { useEffect } from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export type AppearancePreference = 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativewindColorScheme();

  useEffect(() => {
    setColorScheme('dark');
  }, [setColorScheme]);

  return <>{children}</>;
}

export function useAppTheme() {
  return {
    preference: 'dark' as const,
    setPreference: () => {},
    resolved: 'dark' as const,
  };
}

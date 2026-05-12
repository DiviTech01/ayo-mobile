import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export type AppearancePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'afyo.appearance.v1';

type Ctx = {
  preference: AppearancePreference;
  setPreference: (next: AppearancePreference) => void;
  resolved: 'light' | 'dark';
};

const ThemeContext = createContext<Ctx | null>(null);

const DEFAULT_PREFERENCE: AppearancePreference = 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>(DEFAULT_PREFERENCE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as AppearancePreference | null;
        if (stored === 'system' || stored === 'light' || stored === 'dark') {
          setPreferenceState(stored);
          setColorScheme(stored);
        } else {
          setPreferenceState(DEFAULT_PREFERENCE);
          setColorScheme(DEFAULT_PREFERENCE);
        }
      } catch {
        setColorScheme(DEFAULT_PREFERENCE);
      } finally {
        setHydrated(true);
      }
    })();
  }, [setColorScheme]);

  const setPreference = (next: AppearancePreference) => {
    setPreferenceState(next);
    setColorScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const resolved: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';

  if (!hydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      preference: DEFAULT_PREFERENCE,
      setPreference: () => {},
      resolved: 'dark' as const,
    };
  }
  return ctx;
}

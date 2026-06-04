import { useCallback, useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'afyo.user_preferences.v1';
const MAX_FAVORITES = 8;
const MAX_RECENT = 6;

export type UserPreferences = {
  myCountry: string | null;
  favoriteCountries: string[];
  recentlyViewed: string[];
};

const EMPTY: UserPreferences = {
  myCountry: null,
  favoriteCountries: [],
  recentlyViewed: [],
};

let current: UserPreferences = EMPTY;
let hydrated = false;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function loadFromDisk(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      myCountry: typeof parsed.myCountry === 'string' ? parsed.myCountry : null,
      favoriteCountries: Array.isArray(parsed.favoriteCountries)
        ? parsed.favoriteCountries.slice(0, MAX_FAVORITES)
        : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed)
        ? parsed.recentlyViewed.slice(0, MAX_RECENT)
        : [],
    };
  } catch {
    return EMPTY;
  }
}

function ensureHydrated() {
  if (hydrated || hydrating) return;
  hydrating = loadFromDisk().then((p) => {
    current = p;
    hydrated = true;
    hydrating = null;
    notify();
  });
}

function write(next: UserPreferences) {
  current = next;
  notify();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureHydrated();
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): UserPreferences {
  return current;
}

export function useUserPreferences() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ensureHydrated();
  }, []);

  const setMyCountry = useCallback((country: string | null) => {
    write({ ...current, myCountry: country });
  }, []);

  const toggleFavorite = useCallback((country: string) => {
    const exists = current.favoriteCountries.includes(country);
    const favoriteCountries = exists
      ? current.favoriteCountries.filter((c) => c !== country)
      : [country, ...current.favoriteCountries].slice(0, MAX_FAVORITES);
    write({ ...current, favoriteCountries });
  }, []);

  const recordVisit = useCallback((country: string) => {
    const recentlyViewed = [
      country,
      ...current.recentlyViewed.filter((c) => c !== country),
    ].slice(0, MAX_RECENT);
    write({ ...current, recentlyViewed });
  }, []);

  const isPersonalized = !!prefs.myCountry || prefs.favoriteCountries.length > 0;

  return {
    preferences: prefs,
    hydrated,
    isPersonalized,
    setMyCountry,
    toggleFavorite,
    recordVisit,
  };
}

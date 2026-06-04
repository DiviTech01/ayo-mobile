import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, TRANSLATIONS, type Language } from './locales';
import { detectDefaultLanguage } from './geo';

export { LANGUAGES };
export type { Language };

const STORAGE_KEY = 'afyo.language.v1';
const SOURCE_KEY = 'afyo.language.source.v1';
const EN = TRANSLATIONS.en;

/* ── Shared reactive store (same pattern as userPreferences) ──────────── */

let current: Language = 'en';
// 'user'  = the visitor explicitly picked this language (sticky forever).
// 'auto'  = a default we chose (geo / fallback) and may still refine.
let source: 'user' | 'auto' = 'auto';
let hydrated = false;
let hydrating: Promise<void> | null = null;
let geoChecked = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function isLanguage(v: unknown): v is Language {
  return typeof v === 'string' && LANGUAGES.some((l) => l.code === v);
}

async function loadFromDisk(): Promise<{ lang: Language; source: 'user' | 'auto' }> {
  try {
    const [raw, src] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(SOURCE_KEY),
    ]);
    return {
      lang: isLanguage(raw) ? raw : 'en',
      source: src === 'user' ? 'user' : 'auto',
    };
  } catch {
    return { lang: 'en', source: 'auto' };
  }
}

function persist(lang: Language, src: 'user' | 'auto') {
  AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => undefined);
  AsyncStorage.setItem(SOURCE_KEY, src).catch(() => undefined);
}

function applyDirection(lang: Language) {
  const rtl = LANGUAGES.find((l) => l.code === lang)?.dir === 'rtl';
  // Keep the native layout direction in sync. forceRTL only takes effect on
  // the next app launch — the picker screen tells the user when a reload is
  // needed, so we never flip layout mid-session.
  if (I18nManager.isRTL !== rtl) {
    try {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    } catch {
      /* no-op on platforms that don't support it */
    }
  }
}

/**
 * Once per app session, if the visitor has NOT explicitly chosen a language,
 * default to the main language of the country they opened the app from.
 * A manual choice (source === 'user') is never overridden.
 */
function maybeAutoDetect() {
  if (geoChecked || source === 'user') return;
  geoChecked = true;
  detectDefaultLanguage()
    .then((lang) => {
      if (!lang || source === 'user' || lang === current) return;
      current = lang;
      applyDirection(lang);
      persist(lang, 'auto');
      notify();
    })
    .catch(() => undefined);
}

function ensureHydrated() {
  if (hydrated || hydrating) return;
  hydrating = loadFromDisk().then(({ lang, source: src }) => {
    current = lang;
    source = src;
    hydrated = true;
    hydrating = null;
    applyDirection(lang);
    notify();
    maybeAutoDetect();
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureHydrated();
  return () => {
    listeners.delete(cb);
  };
}

// Composite so the hook re-renders when EITHER the language or its source
// changes. Object.is compares primitive strings by value, so returning a
// freshly built string of the same content is still a stable snapshot.
function getSnapshot() {
  return `${current}|${source}`;
}

/* ── Translation lookup ──────────────────────────────────────────────── */

type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

/** Resolve a key for a language, falling back to English, then the key. */
export function translate(
  lang: Language,
  key: string,
  params?: Params,
): string {
  const dict = TRANSLATIONS[lang] ?? EN;
  const raw = dict[key] ?? EN[key] ?? key;
  return interpolate(raw, params);
}

/** Imperative accessor for non-React modules. */
export function getLanguage(): Language {
  return current;
}

export function t(key: string, params?: Params): string {
  return translate(current, key, params);
}

/* ── Hook ────────────────────────────────────────────────────────────── */

export function useTranslation() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [language, languageSource] = snap.split('|') as [Language, 'user' | 'auto'];

  useEffect(() => {
    ensureHydrated();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (!isLanguage(lang)) return;
    // An explicit pick is sticky — record it as the user's choice so geo
    // detection never overrides it again.
    source = 'user';
    if (lang === current) {
      persist(lang, 'user');
      notify();
      return;
    }
    current = lang;
    notify();
    applyDirection(lang);
    persist(lang, 'user');
  }, []);

  // Lock in the current (auto-detected) language as the user's explicit,
  // sticky choice without changing it — used by the "keep this language"
  // action on the sign-in language prompt.
  const confirmLanguage = useCallback(() => {
    source = 'user';
    persist(current, 'user');
    notify();
  }, []);

  const tt = useCallback(
    (key: string, params?: Params) => translate(language, key, params),
    [language],
  );

  const info = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return {
    t: tt,
    language,
    languageSource,
    setLanguage,
    confirmLanguage,
    dir: info.dir,
    languageInfo: info,
    languages: LANGUAGES,
    hydrated,
  };
}

/** Call once on app start to apply persisted direction before first paint. */
export async function initLanguage(): Promise<void> {
  const { lang, source: src } = await loadFromDisk();
  current = lang;
  source = src;
  hydrated = true;
  applyDirection(lang);
  notify();
  maybeAutoDetect();
}

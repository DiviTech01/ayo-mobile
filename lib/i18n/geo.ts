// Geo → default-language resolution.
//
// When a visitor has never explicitly picked a language, we default to the
// main language of the country they open the app from:
//   Francophone country  → fr   (Senegal, Côte d'Ivoire, Mali, ...)
//   Arabic-speaking       → ar   (Egypt, Morocco, Algeria, Tunisia, Sudan, ...)
//   Lusophone             → pt   (Angola, Mozambique, Cabo Verde, ...)
//   Swahili-speaking      → sw   (Kenya, Tanzania)
//   anything else/unknown → en   (default fallback)
//
// A manual choice always wins and is never overridden by this (see index.ts).

import type { Language } from './locales';

// ISO 3166-1 alpha-2 country code → default UI language.
// Only non-English mappings are listed; everything else falls back to 'en'.
const COUNTRY_LANGUAGE: Record<string, Language> = {
  // ── Arabic ──────────────────────────────────────────────────────────────
  DZ: 'ar', // Algeria
  EG: 'ar', // Egypt
  LY: 'ar', // Libya
  MA: 'ar', // Morocco
  TN: 'ar', // Tunisia
  SD: 'ar', // Sudan
  MR: 'ar', // Mauritania
  DJ: 'ar', // Djibouti
  SO: 'ar', // Somalia
  KM: 'ar', // Comoros
  EH: 'ar', // Western Sahara
  // Broader Arab world (non-African) for travellers / diaspora
  SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar',
  YE: 'ar', JO: 'ar', LB: 'ar', SY: 'ar', IQ: 'ar', PS: 'ar',

  // ── French (Francophone Africa) ─────────────────────────────────────────
  SN: 'fr', // Senegal
  CI: 'fr', // Côte d'Ivoire
  ML: 'fr', // Mali
  BF: 'fr', // Burkina Faso
  NE: 'fr', // Niger
  GN: 'fr', // Guinea
  TG: 'fr', // Togo
  BJ: 'fr', // Benin
  GA: 'fr', // Gabon
  CG: 'fr', // Republic of the Congo
  CD: 'fr', // DR Congo
  CM: 'fr', // Cameroon
  CF: 'fr', // Central African Republic
  TD: 'fr', // Chad
  MG: 'fr', // Madagascar
  BI: 'fr', // Burundi
  // Francophone Europe (diaspora)
  FR: 'fr', BE: 'fr', MC: 'fr', LU: 'fr',

  // ── Portuguese (Lusophone) ──────────────────────────────────────────────
  AO: 'pt', // Angola
  MZ: 'pt', // Mozambique
  CV: 'pt', // Cabo Verde
  GW: 'pt', // Guinea-Bissau
  ST: 'pt', // São Tomé and Príncipe
  GQ: 'pt', // Equatorial Guinea (Portuguese is co-official)
  PT: 'pt', BR: 'pt',

  // ── Swahili ─────────────────────────────────────────────────────────────
  TZ: 'sw', // Tanzania
  KE: 'sw', // Kenya
};

/** Map an ISO alpha-2 country code to our default language ('en' if none). */
export function mapCountryToLanguage(code?: string | null): Language {
  if (!code) return 'en';
  return COUNTRY_LANGUAGE[code.trim().toUpperCase()] ?? 'en';
}

/**
 * Best-effort IP geolocation of the visitor's country.
 * Non-blocking, short timeout, never throws — returns null on any failure.
 */
export async function detectCountryCode(timeoutMs = 3500): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('https://ipwho.is/?fields=country_code', {
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { country_code?: string };
    const cc = json?.country_code;
    return cc && /^[A-Za-z]{2}$/.test(cc) ? cc.toUpperCase() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Detect the visitor's country and resolve it to a default language. */
export async function detectDefaultLanguage(): Promise<Language | null> {
  const cc = await detectCountryCode();
  if (!cc) return null;
  return mapCountryToLanguage(cc);
}

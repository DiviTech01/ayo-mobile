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

const SUPPORTED: readonly Language[] = ['en', 'fr', 'ar', 'pt', 'sw'];

/**
 * The device's own locale, e.g. "fr-SN". Never throws.
 *
 * This replaced a call that sent the device's IP to https://ipwho.is on first
 * launch. That was a transfer of personal data to a processor named in no
 * privacy policy, before the user had agreed to anything — a Play Data Safety
 * disclosure problem as well as a GDPR one — and it was guessing at something
 * the operating system already knows. Do not reintroduce a network call here.
 */
function deviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || null;
  } catch {
    return null;
  }
}

/**
 * The region subtag of the device locale, if it carries one ("fr-SN" -> "SN").
 * Kept exported because it is the honest replacement for the old IP lookup at
 * every call site that wanted a country.
 */
export function detectCountryCode(): string | null {
  const tag = deviceLocale();
  const region = tag?.split(/[-_]/).find((part) => /^[A-Za-z]{2}$/.test(part) && part === part.toUpperCase());
  return region ? region.toUpperCase() : null;
}

/**
 * Resolve the device's default language.
 *
 * The device's chosen language wins when we support it — someone who set their
 * phone to French means it, wherever they are. Only when the language is one we
 * do not carry does the region decide, so a Senegalese phone set to Wolof still
 * opens in French rather than English.
 */
export async function detectDefaultLanguage(): Promise<Language | null> {
  const tag = deviceLocale();
  const primary = tag?.split(/[-_]/)[0]?.toLowerCase() as Language | undefined;
  if (primary && SUPPORTED.includes(primary)) return primary;

  const cc = detectCountryCode();
  return cc ? mapCountryToLanguage(cc) : null;
}

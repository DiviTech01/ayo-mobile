// Single source of truth for the app's legal-document links (Privacy Policy,
// Terms of Service, Data Licensing). These are surfaced in the Profile screen.
//
// PLACEHOLDER URLs — replace with the real legal document links when provided.
// You can override any of them without touching this file by setting the
// matching EXPO_PUBLIC_* env var (e.g. EXPO_PUBLIC_PRIVACY_URL).

export const LEGAL_LINKS = {
  privacy:
    process.env.EXPO_PUBLIC_PRIVACY_URL ??
    'https://africanyouthobservatory.org/privacy',
  terms:
    process.env.EXPO_PUBLIC_TERMS_URL ??
    'https://africanyouthobservatory.org/terms',
  dataLicensing:
    process.env.EXPO_PUBLIC_DATA_LICENSING_URL ??
    'https://africanyouthobservatory.org/data-licensing',
} as const;

export type LegalLinkKey = keyof typeof LEGAL_LINKS;

const BASE = 'https://africanyouthobservatory.org';

// Every path here must be a route in the web app's src/App.tsx — an unknown
// path falls through to the web 404 page. (`/ask-ai` was one, until 2026-10.)

export const webLinks = {
  countries: `${BASE}/countries`,
  compare: `${BASE}/compare`,
  reports: `${BASE}/reports`,
  askAi: `${BASE}/ask`,
  insights: `${BASE}/insights`,
  themes: `${BASE}/themes`,
  explore: `${BASE}/explore`,
} as const;

export type WebLinkKey = keyof typeof webLinks;

/** Public PKPB report page for a single country on the web app. */
export function pkpbWebLink(countryRef: string): string {
  return `${BASE}/pkpb/${encodeURIComponent(countryRef)}`;
}

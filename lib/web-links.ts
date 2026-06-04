const BASE = 'https://africanyouthobservatory.org';

export const webLinks = {
  countries: `${BASE}/countries`,
  compare: `${BASE}/compare`,
  reports: `${BASE}/reports`,
  askAi: `${BASE}/ask-ai`,
  insights: `${BASE}/insights`,
  themes: `${BASE}/themes`,
  explore: `${BASE}/explore`,
} as const;

export type WebLinkKey = keyof typeof webLinks;

/** Public PKPB report page for a single country on the web app. */
export function pkpbWebLink(countryRef: string): string {
  return `${BASE}/pkpb/${encodeURIComponent(countryRef)}`;
}

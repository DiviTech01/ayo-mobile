const ISO3_TO_ISO2: Record<string, string> = {
  DZA: 'DZ', AGO: 'AO', BEN: 'BJ', BWA: 'BW', BFA: 'BF', BDI: 'BI', CMR: 'CM',
  CPV: 'CV', CAF: 'CF', TCD: 'TD', COM: 'KM', CIV: 'CI', COD: 'CD', DJI: 'DJ',
  EGY: 'EG', GNQ: 'GQ', ERI: 'ER', SWZ: 'SZ', ETH: 'ET', GAB: 'GA', GMB: 'GM',
  GHA: 'GH', GIN: 'GN', GNB: 'GW', KEN: 'KE', LSO: 'LS', LBR: 'LR', LBY: 'LY',
  MDG: 'MG', MWI: 'MW', MLI: 'ML', MRT: 'MR', MUS: 'MU', MAR: 'MA', MOZ: 'MZ',
  NAM: 'NA', NER: 'NE', NGA: 'NG', COG: 'CG', RWA: 'RW', STP: 'ST', SEN: 'SN',
  SYC: 'SC', SLE: 'SL', SOM: 'SO', ZAF: 'ZA', SSD: 'SS', SDN: 'SD', TZA: 'TZ',
  TGO: 'TG', TUN: 'TN', UGA: 'UG', ZMB: 'ZM', ZWE: 'ZW',
};

export function flagFromIso3(iso3: string): string {
  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) return '🏳️';
  const codes = iso2
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codes);
}

export type Region =
  | 'North Africa'
  | 'West Africa'
  | 'East Africa'
  | 'Central Africa'
  | 'Southern Africa';

export const REGIONS: Region[] = [
  'North Africa',
  'West Africa',
  'East Africa',
  'Central Africa',
  'Southern Africa',
];

export const REGION_ABBR: Record<Region, string> = {
  'North Africa': 'North',
  'West Africa': 'West',
  'East Africa': 'East',
  'Central Africa': 'Central',
  'Southern Africa': 'Southern',
};

export function tierColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 67) return { bg: 'bg-pan-green-100', text: 'text-pan-green-800', label: 'Fulfilling' };
  if (score >= 34) return { bg: 'bg-pan-gold-100', text: 'text-pan-gold-800', label: 'Developing' };
  return { bg: 'bg-pan-red-100', text: 'text-pan-red-800', label: 'Critical' };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

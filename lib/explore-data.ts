/**
 * Constants for the Explore page (country/theme/indicator/year-range pickers)
 * plus pure stat helpers (linearRegression, computeSummary) used to summarise
 * the LIVE /api/data/timeseries rows that DataChart fetches. No mock data is
 * generated or rendered anywhere — charts are backed by the real API.
 */

export const ALL_COUNTRIES = 'All Countries';
export const ALL_THEMES = 'All Themes';
export const SELECT_INDICATOR = 'Select an indicator';

export const EXPLORE_COUNTRIES: string[] = [
  ALL_COUNTRIES,
  'Algeria',
  'Angola',
  'Benin',
  'Botswana',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cameroon',
  'Central African Republic',
  'Chad',
  'Comoros',
  'Congo',
  "Côte d'Ivoire",
  'DRC',
  'Djibouti',
  'Egypt',
  'Equatorial Guinea',
  'Eritrea',
  'Eswatini',
  'Ethiopia',
  'Gabon',
  'Gambia',
  'Ghana',
  'Guinea',
  'Guinea-Bissau',
  'Kenya',
  'Lesotho',
  'Liberia',
  'Libya',
  'Madagascar',
  'Malawi',
  'Mali',
  'Mauritania',
  'Mauritius',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Niger',
  'Nigeria',
  'Rwanda',
  'São Tomé and Príncipe',
  'Senegal',
  'Seychelles',
  'Sierra Leone',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Sudan',
  'Tanzania',
  'Togo',
  'Tunisia',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];

// The seven AYO themes — labels shown in filter dropdowns, slugs sent to the API.
export const THEMES: string[] = [
  ALL_THEMES,
  'Youth Demography & Participation',
  'Education',
  'Employment',
  'Health',
  'Entrepreneurship',
  'Peace & Security',
  'Access to Justice',
];

// Slug ↔ label map for sending the right query param when filtering by theme.
export const THEME_SLUG_BY_LABEL: Record<string, string> = {
  'Youth Demography & Participation': 'youth-demography-participation',
  'Education':                        'education',
  'Employment':                       'employment',
  'Health':                           'health',
  'Entrepreneurship':                 'entrepreneurship',
  'Peace & Security':                 'peace-security',
  'Access to Justice':                'access-to-justice',
};

// Indicators grouped by theme label — used as the picker list. These are
// the human-readable names; the real slugs come from the /api/indicators endpoint.
export const INDICATORS_BY_THEME: Record<string, string[]> = {
  'Youth Demography & Participation': [
    'Total population',
    'Youth population (15–35)',
    'Youth share of population',
    'Youth voter turnout',
    'Youth political participation index',
    'Youth seats in parliament',
    'Youth trust in government',
    'Freedom of association score',
    'Youth with disabilities (%)',
    'Youth in urban / rural areas',
  ],
  'Education': [
    'Youth literacy rate',
    'Primary enrollment rate',
    'Secondary net enrollment rate',
    'Tertiary gross enrollment rate',
    'School dropout rate',
    'Teacher–student ratio',
    'Education budget (% of GDP)',
  ],
  'Employment': [
    'Youth unemployment rate',
    'Youth labour-force participation',
    'Employment-to-population ratio',
    'Youth / adult unemployment ratio',
    'Informal employment rate',
    'Sectoral split (agri / industry / services)',
  ],
  'Health': [
    'Births attended by skilled staff',
    'Physician density',
    'Contraceptive prevalence (youth)',
    'HIV prevalence rate (youth)',
    'YPLWHA treatment rate',
    'Youth suicide rate',
    'Maternal mortality ratio',
    'Health budget share',
    'AIDS / substance / accident deaths',
  ],
  'Entrepreneurship': [
    'Youth startup survival rate',
    'Youth microcredit recipients',
    'Internet access (households)',
    'Getting Credit rank (WB)',
    'Protecting Investors rank (WB)',
    'Youth IP registrations',
    'Youth entrepreneurship rate',
    'Mobile money penetration',
    'Financial literacy rate',
  ],
  'Peace & Security': [
    'Internally displaced youth',
    'Trafficking victims (18–30)',
    'Deaths from violent extremism (18–35)',
  ],
  'Access to Justice': [
    'Youth awaiting trial',
    'Youth imprisoned',
    'Juvenile detentions',
  ],
};

export const YEAR_RANGES: { label: string; range: [number, number] }[] = [
  { label: '2000-2005', range: [2000, 2005] },
  { label: '2006-2010', range: [2006, 2010] },
  { label: '2011-2015', range: [2011, 2015] },
  { label: '2016-2020', range: [2016, 2020] },
  { label: '2021-2025', range: [2021, 2025] },
  { label: 'All Years', range: [2000, 2025] },
];

export const AGE_GROUPS: string[] = [
  '15-35',
  '15-24',
  '15-19',
  '20-24',
  '25-29',
  '30-35',
  'All ages',
];

export const GENDERS: { id: 'all' | 'male' | 'female'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

export type ChartPoint = { year: string; value: number };

export function linearRegression(data: ChartPoint[]) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.value);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    denX = 0,
    denY = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    denX += (xs[i] - meanX) ** 2;
    denY += (ys[i] - meanY) ** 2;
  }
  const slope = denX === 0 ? 0 : num / denX;
  const intercept = meanY - slope * meanX;
  const r2 = denX === 0 || denY === 0 ? 0 : (num * num) / (denX * denY);
  return { slope, intercept, r2 };
}

export function computeSummary(data: ChartPoint[]) {
  if (!data.length) {
    return null;
  }
  const values = data.map((d) => d.value);
  const latest = values[values.length - 1];
  const earliest = values[0];
  const change = latest - earliest;
  const changePercent = earliest !== 0 ? (change / earliest) * 100 : 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  return { latest, earliest, change, changePercent, avg, max, min };
}

export const EXPLORE_COLORS = {
  green: '#22C55E',
  greenLight: '#4ADE80',
  greenDark: '#15803D',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  blue: '#3B82F6',
  red: '#EF4444',
  teal: '#14B8A6',
};

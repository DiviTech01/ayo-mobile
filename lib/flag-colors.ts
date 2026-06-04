/**
 * Dominant brand colour for each African country flag — used for ambient tints
 * (glows, accent highlights). Matches the most recognisable colour of the flag,
 * picked from official spec values where available.
 */
export const FLAG_DOMINANT_COLOR: Record<string, string> = {
  Algeria: '#006233',
  Angola: '#CE1126',
  Benin: '#008751',
  Botswana: '#75AADB',
  'Burkina Faso': '#EF2B2D',
  Burundi: '#CE1126',
  'Cabo Verde': '#003893',
  'Cape Verde': '#003893',
  Cameroon: '#007A5E',
  'Central African Republic': '#003082',
  Chad: '#002664',
  Comoros: '#3B7728',
  "Côte d'Ivoire": '#F77F00',
  'Cote d Ivoire': '#F77F00',
  'Ivory Coast': '#F77F00',
  'Democratic Republic of the Congo': '#007FFF',
  'DR Congo': '#007FFF',
  Djibouti: '#6AB2E7',
  Egypt: '#CE1126',
  'Equatorial Guinea': '#3E9A00',
  Eritrea: '#EA0437',
  Eswatini: '#3E5EB9',
  Swaziland: '#3E5EB9',
  Ethiopia: '#078930',
  Gabon: '#3A75C4',
  Gambia: '#CE1126',
  'The Gambia': '#CE1126',
  Ghana: '#FCD116',
  Guinea: '#CE1126',
  'Guinea-Bissau': '#CE1126',
  Kenya: '#BB0000',
  Lesotho: '#00209F',
  Liberia: '#BF0A30',
  Libya: '#239E46',
  Madagascar: '#FC3D32',
  Malawi: '#CE1126',
  Mali: '#14B53A',
  Mauritania: '#00A95C',
  Mauritius: '#EA2839',
  Morocco: '#C1272D',
  Mozambique: '#007A33',
  Namibia: '#003580',
  Niger: '#E05206',
  Nigeria: '#008751',
  'Republic of the Congo': '#009639',
  Congo: '#009639',
  Rwanda: '#00A1DE',
  'São Tomé and Príncipe': '#12AD2B',
  'Sao Tome and Principe': '#12AD2B',
  Senegal: '#00853F',
  Seychelles: '#003F87',
  'Sierra Leone': '#1EB53A',
  Somalia: '#4189DD',
  'South Africa': '#007749',
  'South Sudan': '#078930',
  Sudan: '#D21034',
  Tanzania: '#1EB53A',
  Togo: '#006A4E',
  Tunisia: '#E70013',
  Uganda: '#FCDC04',
  Zambia: '#198A00',
  Zimbabwe: '#319208',
};

const FALLBACK = '#D4A017'; // AfYO gold — used when the country isn't in the map

export function flagDominantColor(countryName: string | null | undefined): string {
  if (!countryName) return FALLBACK;
  return FLAG_DOMINANT_COLOR[countryName] ?? FALLBACK;
}

/**
 * Append an 8-bit hex alpha to a 6-digit hex colour. Accepts 0-255 or 0-1.
 * Useful for inline RGBA-style fills on `View.style.backgroundColor`.
 */
export function withAlpha(hex: string, alpha: number): string {
  const a = alpha <= 1 ? Math.round(alpha * 255) : Math.round(alpha);
  const clamped = Math.max(0, Math.min(255, a));
  const hexA = clamped.toString(16).padStart(2, '0');
  return `${hex}${hexA}`;
}

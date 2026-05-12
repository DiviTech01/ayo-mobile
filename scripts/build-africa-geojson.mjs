import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as topojson from 'topojson-client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const countriesPath = path.join(root, 'node_modules/world-atlas/countries-110m.json');
const raw = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

const ISO_NUMERIC_TO_ISO3 = {
  12: 'DZA', 24: 'AGO', 204: 'BEN', 72: 'BWA', 854: 'BFA', 108: 'BDI', 120: 'CMR',
  132: 'CPV', 140: 'CAF', 148: 'TCD', 174: 'COM', 384: 'CIV', 180: 'COD', 262: 'DJI',
  818: 'EGY', 226: 'GNQ', 232: 'ERI', 748: 'SWZ', 231: 'ETH', 266: 'GAB', 270: 'GMB',
  288: 'GHA', 324: 'GIN', 624: 'GNB', 404: 'KEN', 426: 'LSO', 430: 'LBR', 434: 'LBY',
  450: 'MDG', 454: 'MWI', 466: 'MLI', 478: 'MRT', 480: 'MUS', 504: 'MAR', 508: 'MOZ',
  516: 'NAM', 562: 'NER', 566: 'NGA', 178: 'COG', 646: 'RWA', 678: 'STP', 686: 'SEN',
  690: 'SYC', 694: 'SLE', 706: 'SOM', 710: 'ZAF', 728: 'SSD', 729: 'SDN', 834: 'TZA',
  768: 'TGO', 788: 'TUN', 800: 'UGA', 894: 'ZMB', 716: 'ZWE',
};

const all = topojson.feature(raw, raw.objects.countries);

const africa = {
  type: 'FeatureCollection',
  features: all.features
    .filter((f) => ISO_NUMERIC_TO_ISO3[+f.id])
    .map((f) => ({
      type: 'Feature',
      id: ISO_NUMERIC_TO_ISO3[+f.id],
      properties: { iso3: ISO_NUMERIC_TO_ISO3[+f.id], name: f.properties?.name },
      geometry: f.geometry,
    })),
};

const outPath = path.join(root, 'data/africa-geojson.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(africa));

const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`Wrote ${africa.features.length} features (${sizeKb} KB) to ${path.relative(root, outPath)}`);

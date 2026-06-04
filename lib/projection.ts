type LonLat = [number, number];
type Ring = LonLat[];
type Polygon = Ring[];
type GeometryCoords = Polygon | Polygon[];

export const AFRICA_BBOX = { minLon: -19, maxLon: 53, minLat: -36, maxLat: 38 };
export const MAP_VIEW = { width: 360, height: 480 };

export function project(lon: number, lat: number) {
  const { minLon, maxLon, minLat, maxLat } = AFRICA_BBOX;
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;

  const aspectMap = lonSpan / latSpan;
  const aspectView = MAP_VIEW.width / MAP_VIEW.height;

  let scaleX: number, scaleY: number, offsetX: number, offsetY: number;
  if (aspectMap > aspectView) {
    scaleX = MAP_VIEW.width / lonSpan;
    scaleY = scaleX;
    offsetX = 0;
    offsetY = (MAP_VIEW.height - latSpan * scaleY) / 2;
  } else {
    scaleY = MAP_VIEW.height / latSpan;
    scaleX = scaleY;
    offsetY = 0;
    offsetX = (MAP_VIEW.width - lonSpan * scaleX) / 2;
  }

  const x = (lon - minLon) * scaleX + offsetX;
  const y = (maxLat - lat) * scaleY + offsetY;
  return [x, y];
}

export function geometryToPath(
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: GeometryCoords },
): string {
  const polygons: Polygon[] =
    geometry.type === 'MultiPolygon'
      ? (geometry.coordinates as Polygon[])
      : [geometry.coordinates as Polygon];

  const segments: string[] = [];

  for (const polygon of polygons) {
    for (const ring of polygon) {
      let d = '';
      for (let i = 0; i < ring.length; i++) {
        const [lon, lat] = ring[i];
        const [x, y] = project(lon, lat);
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
      }
      d += 'Z';
      segments.push(d);
    }
  }
  return segments.join(' ');
}

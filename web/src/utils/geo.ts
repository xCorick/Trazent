export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Distancia en metros entre dos puntos (fórmula de Haversine).
 * En producción la calcula el backend; aquí se usa para la vista previa.
 */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Desplaza un punto cierta cantidad de metros al norte y al este. */
export function offsetCoordinates(origin: Coordinates, northMeters: number, eastMeters: number): Coordinates {
  const dLat = northMeters / EARTH_RADIUS_M;
  const dLon = eastMeters / (EARTH_RADIUS_M * Math.cos(toRad(origin.latitude)));
  return {
    latitude: origin.latitude + (dLat * 180) / Math.PI,
    longitude: origin.longitude + (dLon * 180) / Math.PI,
  };
}

/** Enlace para ver un punto en OpenStreetMap (sin depender de una librería de mapas). */
export const mapUrl = ({ latitude, longitude }: Coordinates) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

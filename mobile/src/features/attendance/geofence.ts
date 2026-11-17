import { GeofenceStatus } from '@/types';
import type { Site } from '@/types';
import type { Coordinates } from '@/utils/geo';
import { distanceMeters } from '@/utils/geo';

/**
 * Vista previa de la geocerca en el teléfono. El resultado oficial lo decide el
 * backend con la misma regla; aquí solo sirve para avisar antes de enviar.
 */
export function previewGeofence(site: Site, position: Coordinates & { accuracyMeters?: number }) {
  const distance = distanceMeters(site, position);
  const status =
    position.accuracyMeters !== undefined && position.accuracyMeters > site.radiusMeters
      ? GeofenceStatus.Unknown
      : distance <= site.radiusMeters
        ? GeofenceStatus.Inside
        : GeofenceStatus.Outside;
  return { distance, status };
}

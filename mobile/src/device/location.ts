import * as Location from 'expo-location';

export interface DevicePosition {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  /** Android avisa si la ubicación viene de una app de ubicación falsa. */
  isMocked: boolean;
}

/** Pide permiso (si hace falta) y devuelve la posición actual con alta precisión. */
export async function getCurrentPosition(): Promise<DevicePosition> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Sin permiso de ubicación. Actívalo en los ajustes del teléfono para registrar asistencia.');
  }
  const { coords, mocked } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracyMeters: coords.accuracy == null ? undefined : Math.round(coords.accuracy),
    isMocked: mocked ?? false,
  };
}

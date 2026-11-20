import type { AttendanceType, DevicePlatform, User } from './domain';

/**
 * Datos que la app maneja para cada operación de la API (contrato en docs/api-graphql.md).
 * Las fotos se guardan como URI local del teléfono hasta que se suben a Cloudinary;
 * a la API solo llega su public_id (photoKey / fileKey).
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CheckInRequest {
  /** UUID generado en el teléfono: evita duplicados al reintentar. */
  clientId: string;
  siteId: string;
  type: AttendanceType;
  capturedAtDevice: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isMocked: boolean;
  /** Foto en el teléfono; el servicio la sube a Cloudinary antes de registrar. */
  photoUri: string;
  /** true si se capturó sin conexión y se envía al sincronizar. */
  capturedOffline: boolean;
}

export interface UploadEvidenceRequest {
  clientId: string;
  taskId: string;
  /** Foto en el teléfono; el servicio la sube a Cloudinary antes de registrar. */
  fileUri: string;
  comment?: string;
  capturedAtDevice: string;
}

export interface RegisterDeviceTokenRequest {
  /** Token de Expo Push Service (ExponentPushToken[...]). */
  token: string;
  platform: DevicePlatform;
}

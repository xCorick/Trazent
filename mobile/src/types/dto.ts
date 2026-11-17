import type { AttendanceType, User } from './domain';

/**
 * Contratos de la API que usa la app del contratista.
 * Las fotos viajan como archivo (multipart/form-data); aquí se guarda la URI local
 * del archivo en el teléfono hasta que se envía.
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
  photoUri: string;
  /** true si se capturó sin conexión y se envía al sincronizar. */
  capturedOffline: boolean;
}

export interface UploadEvidenceRequest {
  clientId: string;
  taskId: string;
  fileUri: string;
  comment?: string;
  capturedAtDevice: string;
}

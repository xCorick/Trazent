import type { AttendanceType, ReviewStatus, Role, TaskStatus, User, UserStatus } from './domain';

/** Contratos de entrada y salida de la API. */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TaskQuery {
  status?: TaskStatus;
  assignedToId?: string;
}

export interface CreateTaskRequest {
  siteId: string;
  assignedToId: string;
  title: string;
  description?: string;
  dueAt?: string;
}

export interface EvidenceQuery {
  status?: ReviewStatus;
  taskId?: string;
}

export interface UploadEvidenceRequest {
  /** UUID generado en el dispositivo: evita duplicados al reintentar. */
  clientId: string;
  taskId: string;
  /** En el prototipo es un data URL; la API real recibirá multipart/form-data. */
  fileDataUrl: string;
  comment?: string;
  capturedAtDevice: string;
}

export interface ReviewEvidenceRequest {
  evidenceId: string;
  approve: boolean;
  comment?: string;
}

export interface CheckInRequest {
  clientId: string;
  siteId: string;
  type: AttendanceType;
  capturedAtDevice: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isMocked: boolean;
  photoDataUrl: string;
  /** true si se capturó sin conexión y se envía al sincronizar. */
  capturedOffline: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  /** Solo contratistas. */
  specialty?: string;
}

export interface CreateUserResponse {
  user: User;
  /** Contraseña temporal que el administrador entrega al usuario. */
  temporaryPassword: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
  status?: UserStatus;
}

export interface SaveSiteRequest {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface UpdateSiteRequest extends Partial<SaveSiteRequest> {
  id: string;
  isActive?: boolean;
}

export interface AttendanceReportQuery {
  /** Fecha inicial (YYYY-MM-DD), incluida. */
  from: string;
  /** Fecha final (YYYY-MM-DD), incluida. */
  to: string;
  siteId?: string;
  userId?: string;
}

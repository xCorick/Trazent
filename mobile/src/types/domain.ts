/**
 * Modelos del dominio. Los enums usan los mismos valores (smallint) que la base
 * de datos, para que la API real pueda devolverlos tal cual.
 * Es una copia de web/src/types/domain.ts: cuando la API se estabilice, ambos
 * proyectos lo importarán de un workspace compartido (packages/shared).
 */

export enum Role {
  Admin = 0,
  Supervisor = 1,
  Contractor = 2,
}

export enum UserStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
}

export enum AttendanceType {
  CheckIn = 0,
  CheckOut = 1,
}

export enum GeofenceStatus {
  Inside = 0,
  Outside = 1,
  Unknown = 2,
}

export enum SyncStatus {
  Online = 0,
  SyncedFromOffline = 1,
}

export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum ReviewStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum ReviewDecision {
  Accepted = 0,
  Rejected = 1,
}

/** Plataforma del dispositivo (device_tokens.platform). */
export enum DevicePlatform {
  Android = 0,
  IOS = 1,
  Web = 2,
}

export enum VerificationMethod {
  AppEvidence = 0,
  InPerson = 1,
  Other = 2,
}

export interface User {
  id: string;
  companyId: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  email: string;
  phoneNumber?: string;
  /** Solo contratistas (tabla contractors). */
  specialty?: string;
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface AttendanceReview {
  decision: ReviewDecision;
  verificationMethod: VerificationMethod;
  comment?: string;
  reviewerName: string;
  reviewedAt: string;
}

export interface Attendance {
  id: string;
  clientId: string;
  userId: string;
  userName: string;
  siteId: string;
  siteName: string;
  type: AttendanceType;
  capturedAtDevice: string;
  receivedAtServer: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  distanceMeters: number;
  isMocked: boolean;
  photoUrl: string;
  geofenceStatus: GeofenceStatus;
  syncStatus: SyncStatus;
  requiresReview: boolean;
  review?: AttendanceReview;
}

export interface Task {
  id: string;
  siteId: string;
  siteName: string;
  assignedToId: string;
  assignedToName: string;
  createdByName: string;
  title: string;
  description?: string;
  dueAt?: string;
  status: TaskStatus;
  createdAt: string;
  evidenceCount: number;
}

export interface Evidence {
  id: string;
  clientId: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  fileUrl: string;
  comment?: string;
  capturedAtDevice: string;
  uploadedAt: string;
  reviewStatus: ReviewStatus;
  reviewerName?: string;
  reviewerComment?: string;
  reviewedAt?: string;
}

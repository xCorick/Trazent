import dayjs from 'dayjs';
import { ApiError } from '@/services/apiError';
import { GeofenceStatus, ReviewStatus, Role, SyncStatus, TaskStatus, UserStatus } from '@/types';
import type {
  Attendance,
  CheckInRequest,
  Evidence,
  LoginRequest,
  LoginResponse,
  Site,
  Task,
  UploadEvidenceRequest,
  User,
} from '@/types';
import { distanceMeters } from '@/utils/geo';
import { attendances, evidences, sites, tasks, users } from './db';
import type { MockUser } from './db';

/**
 * API simulada con las mismas reglas que tendrá el backend: solo contratistas
 * activos, idempotencia por clientId y validación de geocerca en el servidor.
 */

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const toUser = ({ password: _password, ...user }: MockUser): User => user;

let currentUserId: string | null = null;

function currentUser(): MockUser {
  const user = users.find((u) => u.id === currentUserId);
  if (!user) throw new ApiError('Tu sesión expiró. Inicia sesión de nuevo.', 401);
  return user;
}

function findTask(id: string): Task {
  const user = currentUser();
  const task = tasks.find((t) => t.id === id && t.assignedToId === user.id);
  if (!task) throw new ApiError('La tarea no existe o no está asignada a ti.', 404);
  return task;
}

const newest = <T>(items: T[], date: (item: T) => string) =>
  [...items].sort((a, b) => dayjs(date(b)).valueOf() - dayjs(date(a)).valueOf());

export const mockApi = {
  auth: {
    async login({ email, password }: LoginRequest): Promise<LoginResponse> {
      await delay(600);
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) throw new ApiError('Correo o contraseña incorrectos.', 401);
      if (user.status !== UserStatus.Active) throw new ApiError('Tu cuenta está desactivada.', 403);
      if (user.role !== Role.Contractor) {
        throw new ApiError('Esta app es para contratistas. Administradores y supervisores usan el panel web.', 403);
      }
      currentUserId = user.id;
      return { accessToken: `mock-access-${user.id}`, refreshToken: `mock-refresh-${user.id}`, user: toUser(user) };
    },
    async logout(): Promise<void> {
      await delay(150);
      currentUserId = null;
    },
    restore(userId: string) {
      currentUserId = userId;
    },
  },

  catalogs: {
    async sites(): Promise<Site[]> {
      await delay();
      return clone(sites.filter((s) => s.isActive));
    },
  },

  tasks: {
    async mine(): Promise<Task[]> {
      await delay();
      const user = currentUser();
      return clone(
        newest(
          tasks.filter((t) => t.assignedToId === user.id),
          (t) => t.createdAt,
        ),
      );
    },
    async get(id: string): Promise<Task> {
      await delay();
      return clone(findTask(id));
    },
  },

  evidences: {
    async byTask(taskId: string): Promise<Evidence[]> {
      await delay();
      findTask(taskId);
      return clone(
        newest(
          evidences.filter((e) => e.taskId === taskId),
          (e) => e.uploadedAt,
        ),
      );
    },
    async upload(request: UploadEvidenceRequest): Promise<Evidence> {
      await delay(700);
      const user = currentUser();
      const existing = evidences.find((e) => e.clientId === request.clientId);
      if (existing) return clone(existing); // Reintento: el servidor no duplica.
      const task = findTask(request.taskId);
      const evidence: Evidence = {
        id: `e-${Date.now()}`,
        clientId: request.clientId,
        taskId: task.id,
        taskTitle: task.title,
        userId: user.id,
        userName: user.fullName,
        fileUrl: request.fileUri,
        comment: request.comment?.trim() || undefined,
        capturedAtDevice: request.capturedAtDevice,
        uploadedAt: new Date().toISOString(),
        reviewStatus: ReviewStatus.Pending,
      };
      evidences.unshift(evidence);
      task.evidenceCount += 1;
      if (task.status === TaskStatus.Pending) task.status = TaskStatus.InProgress;
      return clone(evidence);
    },
  },

  attendances: {
    async mine(): Promise<Attendance[]> {
      await delay();
      const user = currentUser();
      return clone(
        newest(
          attendances.filter((a) => a.userId === user.id),
          (a) => a.capturedAtDevice,
        ),
      );
    },
    async checkIn(request: CheckInRequest): Promise<Attendance> {
      await delay(800);
      const user = currentUser();
      const existing = attendances.find((a) => a.clientId === request.clientId);
      if (existing) return clone(existing);
      const site = sites.find((s) => s.id === request.siteId && s.isActive);
      if (!site) throw new ApiError('El sitio no existe o está inactivo.', 400);

      const distance = distanceMeters(site, request);
      const unreliable = request.accuracyMeters !== undefined && request.accuracyMeters > site.radiusMeters;
      const geofenceStatus = unreliable
        ? GeofenceStatus.Unknown
        : distance <= site.radiusMeters
          ? GeofenceStatus.Inside
          : GeofenceStatus.Outside;

      const attendance: Attendance = {
        id: `a-${Date.now()}`,
        clientId: request.clientId,
        userId: user.id,
        userName: user.fullName,
        siteId: site.id,
        siteName: site.name,
        type: request.type,
        capturedAtDevice: request.capturedAtDevice,
        receivedAtServer: new Date().toISOString(),
        latitude: request.latitude,
        longitude: request.longitude,
        accuracyMeters: request.accuracyMeters,
        distanceMeters: Math.round(distance),
        isMocked: request.isMocked,
        photoUrl: request.photoUri,
        geofenceStatus,
        syncStatus: request.capturedOffline ? SyncStatus.SyncedFromOffline : SyncStatus.Online,
        requiresReview: geofenceStatus !== GeofenceStatus.Inside || request.isMocked,
      };
      attendances.unshift(attendance);
      return clone(attendance);
    },
  },
};

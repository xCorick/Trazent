import dayjs from 'dayjs';
import { ApiError } from '@/services/apiError';
import { GeofenceStatus, ReviewStatus, Role, SyncStatus, TaskStatus, UserStatus } from '@/types';
import type {
  Attendance,
  AttendanceReportQuery,
  CheckInRequest,
  CreateTaskRequest,
  CreateUserRequest,
  CreateUserResponse,
  DashboardSummary,
  Evidence,
  EvidenceQuery,
  LoginRequest,
  LoginResponse,
  ReviewEvidenceRequest,
  SaveSiteRequest,
  Site,
  Task,
  TaskQuery,
  UpdateSiteRequest,
  UpdateUserRequest,
  UploadEvidenceRequest,
  User,
} from '@/types';
import { distanceMeters } from '@/utils/geo';
import { attendances, evidences, sites, tasks, users } from './db';
import type { MockUser } from './db';

/**
 * API simulada: misma forma que los servicios reales, con una pequeña espera
 * para que la interfaz muestre sus estados de carga.
 */

const SESSION_KEY = 'trazent.mock.userId';
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => structuredClone(value);
function toUser(mockUser: MockUser): User {
  const { password, ...user } = mockUser;
  void password; // La contraseña nunca sale de la "base de datos".
  return user;
}

function readSessionUserId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionUserId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Sin almacenamiento disponible: la sesión simulada vive solo en memoria.
  }
}

let currentUserId: string | null = readSessionUserId();

function currentUser(): MockUser {
  const user = users.find((u) => u.id === currentUserId);
  if (!user) throw new ApiError('La sesión expiró. Inicia sesión de nuevo.', 401);
  return user;
}

function requireAdmin(): MockUser {
  const user = currentUser();
  if (user.role !== Role.Admin) throw new ApiError('Solo el administrador puede hacer esto.', 403);
  return user;
}

function assertUniqueEmail(email: string, exceptId?: string) {
  const taken = users.some((u) => u.id !== exceptId && u.email.toLowerCase() === email.trim().toLowerCase());
  if (taken) throw new ApiError('Ya existe un usuario con ese correo.', 409);
}

function assertSite({ latitude, longitude, radiusMeters }: Partial<SaveSiteRequest>) {
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) throw new ApiError('Latitud no válida.', 400);
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) throw new ApiError('Longitud no válida.', 400);
  if (radiusMeters !== undefined && (radiusMeters < 20 || radiusMeters > 2000)) {
    throw new ApiError('El radio debe estar entre 20 y 2000 metros.', 400);
  }
}

const temporaryPassword = () => `Tz-${Math.random().toString(36).slice(2, 8)}`;

function findTask(id: string): Task {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new ApiError('La tarea no existe.', 404);
  return task;
}

export const mockApi = {
  auth: {
    async login({ email, password }: LoginRequest): Promise<LoginResponse> {
      await delay(600);
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) {
        throw new ApiError('Correo o contraseña incorrectos.', 401);
      }
      if (user.status !== UserStatus.Active) {
        throw new ApiError('Tu cuenta está desactivada. Contacta al administrador de tu empresa.', 403);
      }
      currentUserId = user.id;
      writeSessionUserId(user.id);
      return { accessToken: `mock-access-${user.id}`, refreshToken: `mock-refresh-${user.id}`, user: toUser(user) };
    },
    async logout(): Promise<void> {
      await delay(150);
      currentUserId = null;
      writeSessionUserId(null);
    },
    restore(userId: string) {
      currentUserId = userId;
      writeSessionUserId(userId);
    },
  },

  catalogs: {
    async sites(): Promise<Site[]> {
      await delay();
      return clone(sites.filter((s) => s.isActive));
    },
    async contractors(): Promise<User[]> {
      await delay();
      return users.filter((u) => u.role === Role.Contractor && u.status === UserStatus.Active).map(toUser);
    },
  },

  tasks: {
    async list(query: TaskQuery = {}): Promise<Task[]> {
      await delay();
      return clone(
        tasks
          .filter((t) => query.status === undefined || t.status === query.status)
          .filter((t) => !query.assignedToId || t.assignedToId === query.assignedToId)
          .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
      );
    },
    async mine(): Promise<Task[]> {
      const user = currentUser();
      return mockApi.tasks.list({ assignedToId: user.id });
    },
    async get(id: string): Promise<Task> {
      await delay();
      return clone(findTask(id));
    },
    async create(request: CreateTaskRequest): Promise<Task> {
      await delay(500);
      const creator = currentUser();
      const site = sites.find((s) => s.id === request.siteId);
      const assignee = users.find((u) => u.id === request.assignedToId);
      if (!site || !assignee) throw new ApiError('Sitio o contratista no válido.', 400);
      const task: Task = {
        id: `t-${Date.now()}`,
        siteId: site.id,
        siteName: site.name,
        assignedToId: assignee.id,
        assignedToName: assignee.fullName,
        createdByName: creator.fullName,
        title: request.title.trim(),
        description: request.description?.trim() || undefined,
        dueAt: request.dueAt,
        status: TaskStatus.Pending,
        createdAt: new Date().toISOString(),
        evidenceCount: 0,
      };
      tasks.unshift(task);
      return clone(task);
    },
  },

  evidences: {
    async list(query: EvidenceQuery = {}): Promise<Evidence[]> {
      await delay();
      return clone(
        evidences
          .filter((e) => query.status === undefined || e.reviewStatus === query.status)
          .filter((e) => !query.taskId || e.taskId === query.taskId)
          .sort((a, b) => dayjs(b.uploadedAt).valueOf() - dayjs(a.uploadedAt).valueOf()),
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
        fileUrl: request.fileDataUrl,
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
    async review({ evidenceId, approve, comment }: ReviewEvidenceRequest): Promise<Evidence> {
      await delay(500);
      const reviewer = currentUser();
      const evidence = evidences.find((e) => e.id === evidenceId);
      if (!evidence) throw new ApiError('La evidencia no existe.', 404);
      if (!approve && !comment?.trim()) {
        throw new ApiError('Un rechazo debe incluir el motivo.', 400);
      }
      evidence.reviewStatus = approve ? ReviewStatus.Approved : ReviewStatus.Rejected;
      evidence.reviewerName = reviewer.fullName;
      evidence.reviewerComment = comment?.trim() || undefined;
      evidence.reviewedAt = new Date().toISOString();
      return clone(evidence);
    },
  },

  attendances: {
    async today(): Promise<Attendance[]> {
      await delay();
      return clone(
        attendances
          .filter((a) => dayjs(a.receivedAtServer).isSame(dayjs(), 'day'))
          .sort((a, b) => dayjs(b.receivedAtServer).valueOf() - dayjs(a.receivedAtServer).valueOf()),
      );
    },
    async mine(): Promise<Attendance[]> {
      await delay();
      const user = currentUser();
      return clone(
        attendances
          .filter((a) => a.userId === user.id)
          .sort((a, b) => dayjs(b.receivedAtServer).valueOf() - dayjs(a.receivedAtServer).valueOf()),
      );
    },
    async checkIn(request: CheckInRequest): Promise<Attendance> {
      await delay(800);
      const user = currentUser();
      const existing = attendances.find((a) => a.clientId === request.clientId);
      if (existing) return clone(existing);
      const site = sites.find((s) => s.id === request.siteId);
      if (!site) throw new ApiError('El sitio no existe.', 400);

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
        photoUrl: request.photoDataUrl,
        geofenceStatus,
        syncStatus: request.capturedOffline ? SyncStatus.SyncedFromOffline : SyncStatus.Online,
        requiresReview: geofenceStatus !== GeofenceStatus.Inside || request.isMocked,
      };
      attendances.unshift(attendance);
      return clone(attendance);
    },
  },

  users: {
    async list(): Promise<User[]> {
      await delay();
      requireAdmin();
      return users.map(toUser).sort((a, b) => a.role - b.role || a.fullName.localeCompare(b.fullName));
    },
    async create(request: CreateUserRequest): Promise<CreateUserResponse> {
      await delay(500);
      const admin = requireAdmin();
      assertUniqueEmail(request.email);
      const password = temporaryPassword();
      const user: MockUser = {
        id: `u-${Date.now()}`,
        companyId: admin.companyId,
        fullName: request.fullName.trim(),
        email: request.email.trim().toLowerCase(),
        role: request.role,
        status: UserStatus.Active,
        phoneNumber: request.phoneNumber?.trim() || undefined,
        specialty: request.role === Role.Contractor ? request.specialty?.trim() || undefined : undefined,
        password,
      };
      users.push(user);
      return { user: toUser(user), temporaryPassword: password };
    },
    async update({ id, ...changes }: UpdateUserRequest): Promise<User> {
      await delay(400);
      const admin = requireAdmin();
      const user = users.find((u) => u.id === id);
      if (!user) throw new ApiError('El usuario no existe.', 404);
      if (id === admin.id && changes.status !== undefined && changes.status !== UserStatus.Active) {
        throw new ApiError('No puedes desactivar tu propia cuenta.', 400);
      }
      if (changes.email) assertUniqueEmail(changes.email, id);
      Object.assign(user, {
        ...changes,
        fullName: changes.fullName?.trim() ?? user.fullName,
        email: changes.email?.trim().toLowerCase() ?? user.email,
      });
      if (user.role !== Role.Contractor) user.specialty = undefined;
      return toUser(user);
    },
  },

  sites: {
    async list(): Promise<Site[]> {
      await delay();
      requireAdmin();
      return clone([...sites].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)));
    },
    async create(request: SaveSiteRequest): Promise<Site> {
      await delay(500);
      requireAdmin();
      assertSite(request);
      const site: Site = {
        id: `s-${Date.now()}`,
        name: request.name.trim(),
        address: request.address?.trim() || undefined,
        latitude: request.latitude,
        longitude: request.longitude,
        radiusMeters: Math.round(request.radiusMeters),
        isActive: true,
      };
      sites.push(site);
      return clone(site);
    },
    async update({ id, ...changes }: UpdateSiteRequest): Promise<Site> {
      await delay(400);
      requireAdmin();
      assertSite(changes);
      const site = sites.find((s) => s.id === id);
      if (!site) throw new ApiError('El sitio no existe.', 404);
      Object.assign(site, changes);
      if (changes.name) {
        tasks.filter((t) => t.siteId === id).forEach((t) => (t.siteName = site.name));
      }
      return clone(site);
    },
  },

  reports: {
    async attendance({ from, to, siteId, userId }: AttendanceReportQuery): Promise<Attendance[]> {
      await delay(500);
      const start = dayjs(from).startOf('day');
      const end = dayjs(to).endOf('day');
      return clone(
        attendances
          .filter((a) => {
            const received = dayjs(a.receivedAtServer);
            return !received.isBefore(start) && !received.isAfter(end);
          })
          .filter((a) => !siteId || a.siteId === siteId)
          .filter((a) => !userId || a.userId === userId)
          .sort((a, b) => dayjs(b.receivedAtServer).valueOf() - dayjs(a.receivedAtServer).valueOf()),
      );
    },
  },

  dashboard: {
    async summary(): Promise<DashboardSummary> {
      await delay();
      const todays = attendances.filter((a) => dayjs(a.receivedAtServer).isSame(dayjs(), 'day'));
      return {
        attendancesToday: todays.length,
        insideGeofence: todays.filter((a) => a.geofenceStatus === GeofenceStatus.Inside).length,
        requiresReview: todays.filter((a) => a.requiresReview && !a.review).length,
        pendingEvidences: evidences.filter((e) => e.reviewStatus === ReviewStatus.Pending).length,
        activeTasks: tasks.filter((t) => t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress).length,
      };
    },
  },
};

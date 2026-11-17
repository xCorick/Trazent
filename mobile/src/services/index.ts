import { env } from '@/config/env';
import { mockApi } from '@/mocks/mockApi';
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
import { filePart, http } from './http';

/**
 * Capa de servicios. Pantallas y hooks solo usan estos métodos, así que pasar
 * de los datos simulados a la API real es poner EXPO_PUBLIC_USE_MOCKS=false.
 * Las rutas son las del análisis previo; se ajustarán a los endpoints definitivos.
 */
const useMocks = env.useMocks;

export const authService = {
  login: (request: LoginRequest): Promise<LoginResponse> =>
    useMocks ? mockApi.auth.login(request) : http.post<LoginResponse>('/api/auth/login', request),
  logout: (): Promise<void> => (useMocks ? mockApi.auth.logout() : http.post<void>('/api/auth/logout')),
  restoreSession: (user: User) => {
    if (useMocks) mockApi.auth.restore(user.id);
  },
};

export const catalogService = {
  sites: (): Promise<Site[]> => (useMocks ? mockApi.catalogs.sites() : http.get<Site[]>('/api/sites')),
};

export const taskService = {
  mine: (): Promise<Task[]> => (useMocks ? mockApi.tasks.mine() : http.get<Task[]>('/api/tasks/me')),
  get: (id: string): Promise<Task> => (useMocks ? mockApi.tasks.get(id) : http.get<Task>(`/api/tasks/${id}`)),
};

export const evidenceService = {
  byTask: (taskId: string): Promise<Evidence[]> =>
    useMocks ? mockApi.evidences.byTask(taskId) : http.get<Evidence[]>(`/api/tasks/${taskId}/evidence`),
  upload: (request: UploadEvidenceRequest): Promise<Evidence> => {
    if (useMocks) return mockApi.evidences.upload(request);
    const form = new FormData();
    form.append('clientId', request.clientId);
    form.append('capturedAtDevice', request.capturedAtDevice);
    if (request.comment) form.append('comment', request.comment);
    form.append('file', filePart(request.fileUri, `${request.clientId}.jpg`));
    return http.post<Evidence>(`/api/tasks/${request.taskId}/evidence`, form);
  },
};

export const attendanceService = {
  mine: (): Promise<Attendance[]> =>
    useMocks ? mockApi.attendances.mine() : http.get<Attendance[]>('/api/attendance/me'),
  checkIn: (request: CheckInRequest): Promise<Attendance> => {
    if (useMocks) return mockApi.attendances.checkIn(request);
    const { photoUri, ...fields } = request;
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) form.append(key, String(value));
    });
    form.append('photo', filePart(photoUri, `${request.clientId}.jpg`));
    return http.post<Attendance>('/api/attendance/check-in', form);
  },
};

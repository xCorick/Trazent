import { env } from '@/config/env';
import { mockApi } from '@/mocks/mockApi';
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
import { http } from './http';

/**
 * Capa de servicios. Las vistas solo usan estos métodos (a través de los hooks),
 * así que pasar del prototipo a la API real es cambiar VITE_USE_MOCKS=false.
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
  contractors: (): Promise<User[]> =>
    useMocks ? mockApi.catalogs.contractors() : http.get<User[]>('/api/contractors'),
};

export const taskService = {
  list: (query?: TaskQuery): Promise<Task[]> =>
    useMocks ? mockApi.tasks.list(query) : http.get<Task[]>('/api/tasks', { ...query }),
  mine: (): Promise<Task[]> => (useMocks ? mockApi.tasks.mine() : http.get<Task[]>('/api/tasks/me')),
  get: (id: string): Promise<Task> => (useMocks ? mockApi.tasks.get(id) : http.get<Task>(`/api/tasks/${id}`)),
  create: (request: CreateTaskRequest): Promise<Task> =>
    useMocks ? mockApi.tasks.create(request) : http.post<Task>('/api/tasks', request),
};

export const evidenceService = {
  list: (query?: EvidenceQuery): Promise<Evidence[]> =>
    useMocks ? mockApi.evidences.list(query) : http.get<Evidence[]>('/api/evidences', { ...query }),
  upload: (request: UploadEvidenceRequest): Promise<Evidence> =>
    useMocks
      ? mockApi.evidences.upload(request)
      : // La API real recibirá multipart/form-data; aquí se deja el contrato JSON del prototipo.
        http.post<Evidence>(`/api/tasks/${request.taskId}/evidence`, request),
  review: (request: ReviewEvidenceRequest): Promise<Evidence> =>
    useMocks
      ? mockApi.evidences.review(request)
      : http.post<Evidence>(`/api/evidences/${request.evidenceId}/review`, request),
};

export const attendanceService = {
  today: (): Promise<Attendance[]> =>
    useMocks ? mockApi.attendances.today() : http.get<Attendance[]>('/api/attendance', { date: 'today' }),
  mine: (): Promise<Attendance[]> =>
    useMocks ? mockApi.attendances.mine() : http.get<Attendance[]>('/api/attendance/me'),
  checkIn: (request: CheckInRequest): Promise<Attendance> =>
    useMocks ? mockApi.attendances.checkIn(request) : http.post<Attendance>('/api/attendance/check-in', request),
};

export const dashboardService = {
  summary: (): Promise<DashboardSummary> =>
    useMocks ? mockApi.dashboard.summary() : http.get<DashboardSummary>('/api/dashboard/summary'),
};

/** Solo administrador. */
export const userService = {
  list: (): Promise<User[]> => (useMocks ? mockApi.users.list() : http.get<User[]>('/api/users')),
  create: (request: CreateUserRequest): Promise<CreateUserResponse> =>
    useMocks ? mockApi.users.create(request) : http.post<CreateUserResponse>('/api/users', request),
  update: (request: UpdateUserRequest): Promise<User> =>
    useMocks ? mockApi.users.update(request) : http.put<User>(`/api/users/${request.id}`, request),
};

/** Solo administrador: incluye sitios inactivos. */
export const siteService = {
  list: (): Promise<Site[]> =>
    useMocks ? mockApi.sites.list() : http.get<Site[]>('/api/sites', { includeInactive: true }),
  create: (request: SaveSiteRequest): Promise<Site> =>
    useMocks ? mockApi.sites.create(request) : http.post<Site>('/api/sites', request),
  update: (request: UpdateSiteRequest): Promise<Site> =>
    useMocks ? mockApi.sites.update(request) : http.put<Site>(`/api/sites/${request.id}`, request),
};

export const reportService = {
  attendance: (query: AttendanceReportQuery): Promise<Attendance[]> =>
    useMocks ? mockApi.reports.attendance(query) : http.get<Attendance[]>('/api/reports/attendance', { ...query }),
};

import type { AttendanceReportQuery, EvidenceQuery, TaskQuery } from '@/types';

/** Llaves de caché de TanStack Query, en un solo lugar. */
export const queryKeys = {
  sites: ['sites', 'active'] as const,
  allSites: ['sites', 'all'] as const,
  users: ['users'] as const,
  contractors: ['contractors'] as const,
  tasks: (query: TaskQuery = {}) => ['tasks', 'list', query] as const,
  myTasks: ['tasks', 'mine'] as const,
  task: (id: string) => ['tasks', 'detail', id] as const,
  evidences: (query: EvidenceQuery = {}) => ['evidences', query] as const,
  attendancesToday: ['attendances', 'today'] as const,
  myAttendances: ['attendances', 'mine'] as const,
  dashboard: ['dashboard'] as const,
  attendanceReport: (query: AttendanceReportQuery) => ['attendances', 'report', query] as const,
};

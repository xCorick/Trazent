/** Llaves de TanStack Query en un solo lugar, para invalidar sin errores de dedo. */
export const queryKeys = {
  sites: ['sites'] as const,
  myTasks: ['tasks', 'me'] as const,
  task: (id: string) => ['tasks', id] as const,
  taskEvidences: (taskId: string) => ['evidences', 'task', taskId] as const,
  myAttendances: ['attendances', 'me'] as const,
};

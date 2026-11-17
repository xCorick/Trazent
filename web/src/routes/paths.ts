import { Role } from '@/types';

export const paths = {
  login: '/login',
  panel: '/panel',
  panelTasks: '/panel/tareas',
  panelEvidences: '/panel/evidencias',
  panelReports: '/panel/reportes',
  // Solo administrador
  panelUsers: '/panel/usuarios',
  panelSites: '/panel/sitios',
  // PROTOTIPO MÓVIL · App del contratista como web responsiva
  mobile: '/movil',
  mobileAttendance: '/movil/asistencia',
  mobileTasks: '/movil/tareas',
  mobileTask: (id: string) => `/movil/tareas/${id}`,
} as const;

/** Pantalla inicial de cada rol. */
export const homeFor = (role: Role) => (role === Role.Contractor ? paths.mobile : paths.panel);

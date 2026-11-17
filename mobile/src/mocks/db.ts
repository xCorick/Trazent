import dayjs from 'dayjs';
import { AttendanceType, GeofenceStatus, ReviewStatus, Role, SyncStatus, TaskStatus, UserStatus } from '@/types';
import type { Attendance, Evidence, Site, Task, User } from '@/types';
import { offsetCoordinates } from '@/utils/geo';

/**
 * Base de datos simulada en memoria (los mismos datos de demostración que el
 * panel web). Se reinicia al recargar la app. Solo la usa src/mocks/mockApi.ts.
 */

export interface MockUser extends User {
  password: string;
}

const COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';
const at = (daysAgo: number, hour: number, minute = 0) =>
  dayjs().subtract(daysAgo, 'day').hour(hour).minute(minute).second(0).toISOString();
const inDays = (days: number, hour: number) => dayjs().add(days, 'day').hour(hour).minute(0).second(0).toISOString();

/** Foto de muestra para los registros simulados. */
export const SAMPLE_PHOTO = 'https://picsum.photos/seed/trazent/480/640';

export const users: MockUser[] = [
  {
    id: 'u-sup',
    companyId: COMPANY_ID,
    fullName: 'Laura Méndez',
    role: Role.Supervisor,
    email: 'supervisor@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
  },
  {
    id: 'u-c1',
    companyId: COMPANY_ID,
    fullName: 'Carlos Ruiz',
    role: Role.Contractor,
    email: 'contratista@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
    phoneNumber: '662 555 0101',
    specialty: 'Mantenimiento eléctrico',
  },
  {
    id: 'u-c2',
    companyId: COMPANY_ID,
    fullName: 'Ana Torres',
    role: Role.Contractor,
    email: 'ana.torres@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
    specialty: 'Limpieza',
  },
];

export const sites: Site[] = [
  {
    id: 's-1',
    name: 'Obra Centro',
    address: 'Blvd. Hidalgo 120, Hermosillo',
    latitude: 29.0892,
    longitude: -110.9613,
    radiusMeters: 120,
    isActive: true,
  },
  {
    id: 's-2',
    name: 'Planta Norte',
    address: 'Parque Industrial Norte, Hermosillo',
    latitude: 29.1426,
    longitude: -110.982,
    radiusMeters: 150,
    isActive: true,
  },
  {
    id: 's-3',
    name: 'Edificio Kino',
    address: 'Blvd. Kino 305, Hermosillo',
    latitude: 29.1037,
    longitude: -110.9497,
    radiusMeters: 80,
    isActive: true,
  },
];

export const tasks: Task[] = [
  {
    id: 't-1',
    siteId: 's-1',
    siteName: 'Obra Centro',
    assignedToId: 'u-c1',
    assignedToName: 'Carlos Ruiz',
    createdByName: 'Laura Méndez',
    title: 'Revisión de tablero eléctrico, nivel 2',
    description: 'Verificar conexiones del breaker principal y etiquetar circuitos. Subir foto antes y después.',
    dueAt: dayjs().hour(17).minute(0).second(0).toISOString(),
    status: TaskStatus.InProgress,
    createdAt: at(1, 9),
    evidenceCount: 1,
  },
  {
    id: 't-4',
    siteId: 's-1',
    siteName: 'Obra Centro',
    assignedToId: 'u-c1',
    assignedToName: 'Carlos Ruiz',
    createdByName: 'Laura Méndez',
    title: 'Cambio de luminarias en estacionamiento',
    description: 'Sustituir 6 luminarias fundidas del nivel -1.',
    dueAt: inDays(2, 14),
    status: TaskStatus.Pending,
    createdAt: at(0, 8, 30),
    evidenceCount: 0,
  },
  {
    id: 't-5',
    siteId: 's-3',
    siteName: 'Edificio Kino',
    assignedToId: 'u-c1',
    assignedToName: 'Carlos Ruiz',
    createdByName: 'Laura Méndez',
    title: 'Instalar contactos en sala de juntas',
    description: 'Cuatro contactos dobles en la pared norte, a 40 cm del piso.',
    dueAt: inDays(4, 12),
    status: TaskStatus.Pending,
    createdAt: at(0, 9, 15),
    evidenceCount: 0,
  },
  {
    id: 't-6',
    siteId: 's-1',
    siteName: 'Obra Centro',
    assignedToId: 'u-c1',
    assignedToName: 'Carlos Ruiz',
    createdByName: 'Laura Méndez',
    title: 'Revisión de tierra física',
    status: TaskStatus.Completed,
    createdAt: at(4, 10),
    evidenceCount: 1,
  },
];

export const evidences: Evidence[] = [
  {
    id: 'e-1',
    clientId: 'seed-e-1',
    taskId: 't-1',
    taskTitle: 'Revisión de tablero eléctrico, nivel 2',
    userId: 'u-c1',
    userName: 'Carlos Ruiz',
    fileUrl: 'https://picsum.photos/seed/tablero/640/480',
    comment: 'Foto antes de iniciar.',
    capturedAtDevice: at(0, 9, 40),
    uploadedAt: at(0, 9, 41),
    reviewStatus: ReviewStatus.Pending,
  },
  {
    id: 'e-2',
    clientId: 'seed-e-2',
    taskId: 't-6',
    taskTitle: 'Revisión de tierra física',
    userId: 'u-c1',
    userName: 'Carlos Ruiz',
    fileUrl: 'https://picsum.photos/seed/tierra/640/480',
    capturedAtDevice: at(3, 12, 10),
    uploadedAt: at(3, 12, 11),
    reviewStatus: ReviewStatus.Approved,
    reviewerName: 'Laura Méndez',
    reviewedAt: at(3, 16),
  },
];

/** Asistencias de días anteriores para que el historial no aparezca vacío. */
function buildHistory(): Attendance[] {
  const site = sites[0];
  const history: Attendance[] = [];
  for (let day = 3; day >= 1; day--) {
    for (const [type, hour, minute] of [
      [AttendanceType.CheckIn, 8, 2 + day],
      [AttendanceType.CheckOut, 17, 10 + day],
    ] as const) {
      const point = offsetCoordinates(site, 20 + day * 5, 15);
      const time = at(day, hour, minute);
      history.push({
        id: `a-h${day}-${type}`,
        clientId: `seed-a-${day}-${type}`,
        userId: 'u-c1',
        userName: 'Carlos Ruiz',
        siteId: site.id,
        siteName: site.name,
        type,
        capturedAtDevice: time,
        receivedAtServer: time,
        ...point,
        accuracyMeters: 8,
        distanceMeters: 30 + day * 5,
        isMocked: false,
        photoUrl: SAMPLE_PHOTO,
        geofenceStatus: GeofenceStatus.Inside,
        syncStatus: SyncStatus.Online,
        requiresReview: false,
      });
    }
  }
  return history;
}

export const attendances: Attendance[] = buildHistory();

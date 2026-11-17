import dayjs from 'dayjs';
import {
  AttendanceType,
  GeofenceStatus,
  ReviewDecision,
  ReviewStatus,
  Role,
  SyncStatus,
  TaskStatus,
  UserStatus,
  VerificationMethod,
} from '@/types';
import type { Attendance, Evidence, Site, Task, User } from '@/types';
import { offsetCoordinates } from '@/utils/geo';
import { photoPlaceholder } from '@/utils/placeholder';

/**
 * Base de datos simulada en memoria. Se reinicia al recargar la página.
 * Solo la usa src/mocks/mockApi.ts; las vistas nunca la importan directamente.
 */

export interface MockUser extends User {
  password: string;
}

const COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';
const today = (hour: number, minute: number) => dayjs().hour(hour).minute(minute).second(0).toISOString();
const inDays = (days: number, hour: number) => dayjs().add(days, 'day').hour(hour).minute(0).second(0).toISOString();

export const users: MockUser[] = [
  {
    id: 'u-admin',
    companyId: COMPANY_ID,
    fullName: 'Roberto Salinas',
    role: Role.Admin,
    email: 'admin@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
  },
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
  {
    id: 'u-c3',
    companyId: COMPANY_ID,
    fullName: 'Luis Pérez',
    role: Role.Contractor,
    email: 'luis.perez@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
    specialty: 'Seguridad',
  },
  {
    id: 'u-c4',
    companyId: COMPANY_ID,
    fullName: 'Pedro Gómez',
    role: Role.Contractor,
    email: 'pedro.gomez@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Inactive,
    specialty: 'Jardinería',
  },
  {
    id: 'u-sup2',
    companyId: COMPANY_ID,
    fullName: 'Mario López',
    role: Role.Supervisor,
    email: 'mario.lopez@trazent.mx',
    password: 'demo1234',
    status: UserStatus.Active,
    phoneNumber: '662 123 4567',
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
  {
    id: 's-4',
    name: 'Bodega Sur',
    address: 'Carretera a Guaymas km 4, Hermosillo',
    latitude: 29.0421,
    longitude: -110.9338,
    radiusMeters: 200,
    isActive: false,
  },
];

export const attendances: Attendance[] = [
  {
    id: 'a-1',
    clientId: 'cl-a-1',
    userId: 'u-c1',
    userName: 'Carlos Ruiz',
    siteId: 's-1',
    siteName: 'Obra Centro',
    type: AttendanceType.CheckIn,
    capturedAtDevice: today(7, 52),
    receivedAtServer: today(7, 52),
    latitude: 29.0894,
    longitude: -110.9611,
    accuracyMeters: 8,
    distanceMeters: 34,
    isMocked: false,
    photoUrl: photoPlaceholder('Entrada · Obra Centro', 214),
    geofenceStatus: GeofenceStatus.Inside,
    syncStatus: SyncStatus.Online,
    requiresReview: false,
    review: {
      decision: ReviewDecision.Accepted,
      verificationMethod: VerificationMethod.AppEvidence,
      reviewerName: 'Laura Méndez',
      reviewedAt: today(8, 10),
    },
  },
  {
    id: 'a-2',
    clientId: 'cl-a-2',
    userId: 'u-c2',
    userName: 'Ana Torres',
    siteId: 's-3',
    siteName: 'Edificio Kino',
    type: AttendanceType.CheckIn,
    capturedAtDevice: today(8, 5),
    receivedAtServer: today(8, 5),
    latitude: 29.1038,
    longitude: -110.9495,
    accuracyMeters: 12,
    distanceMeters: 21,
    isMocked: false,
    photoUrl: photoPlaceholder('Entrada · Edificio Kino', 200),
    geofenceStatus: GeofenceStatus.Inside,
    syncStatus: SyncStatus.Online,
    requiresReview: false,
  },
  {
    id: 'a-3',
    clientId: 'cl-a-3',
    userId: 'u-c3',
    userName: 'Luis Pérez',
    siteId: 's-2',
    siteName: 'Planta Norte',
    type: AttendanceType.CheckIn,
    capturedAtDevice: today(8, 2),
    receivedAtServer: today(8, 17),
    latitude: 29.1462,
    longitude: -110.9851,
    accuracyMeters: 25,
    distanceMeters: 412,
    isMocked: false,
    photoUrl: photoPlaceholder('Entrada · Planta Norte', 228),
    geofenceStatus: GeofenceStatus.Outside,
    syncStatus: SyncStatus.SyncedFromOffline,
    requiresReview: true,
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
    dueAt: today(17, 0),
    status: TaskStatus.InProgress,
    createdAt: inDays(-1, 9),
    evidenceCount: 2,
  },
  {
    id: 't-2',
    siteId: 's-3',
    siteName: 'Edificio Kino',
    assignedToId: 'u-c2',
    assignedToName: 'Ana Torres',
    createdByName: 'Laura Méndez',
    title: 'Limpieza profunda del área de recepción',
    description: 'Incluye vidrios, mostrador y pisos. La foto debe mostrar el área completa.',
    dueAt: inDays(1, 12),
    status: TaskStatus.InProgress,
    createdAt: inDays(-1, 10),
    evidenceCount: 1,
  },
  {
    id: 't-3',
    siteId: 's-2',
    siteName: 'Planta Norte',
    assignedToId: 'u-c3',
    assignedToName: 'Luis Pérez',
    createdByName: 'Laura Méndez',
    title: 'Rondín perimetral y bitácora de acceso',
    description: 'Recorrer el perímetro y fotografiar la bitácora firmada.',
    dueAt: today(9, 0),
    status: TaskStatus.Completed,
    createdAt: inDays(-2, 8),
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
    createdAt: today(8, 30),
    evidenceCount: 0,
  },
];

export const evidences: Evidence[] = [
  {
    id: 'e-1',
    clientId: 'cl-e-1',
    taskId: 't-1',
    taskTitle: 'Revisión de tablero eléctrico, nivel 2',
    userId: 'u-c1',
    userName: 'Carlos Ruiz',
    fileUrl: photoPlaceholder('Tablero nivel 2 · antes', 214),
    comment: 'Así estaba el tablero al llegar.',
    capturedAtDevice: today(8, 40),
    uploadedAt: today(8, 41),
    reviewStatus: ReviewStatus.Approved,
    reviewerName: 'Laura Méndez',
    reviewedAt: today(9, 5),
  },
  {
    id: 'e-2',
    clientId: 'cl-e-2',
    taskId: 't-1',
    taskTitle: 'Revisión de tablero eléctrico, nivel 2',
    userId: 'u-c1',
    userName: 'Carlos Ruiz',
    fileUrl: photoPlaceholder('Tablero nivel 2 · después', 205),
    comment: 'Conexiones ajustadas y circuitos etiquetados.',
    capturedAtDevice: today(10, 15),
    uploadedAt: today(10, 16),
    reviewStatus: ReviewStatus.Pending,
  },
  {
    id: 'e-3',
    clientId: 'cl-e-3',
    taskId: 't-2',
    taskTitle: 'Limpieza profunda del área de recepción',
    userId: 'u-c2',
    userName: 'Ana Torres',
    fileUrl: photoPlaceholder('Recepción · mostrador', 196),
    comment: 'Mostrador terminado.',
    capturedAtDevice: today(9, 30),
    uploadedAt: today(9, 31),
    reviewStatus: ReviewStatus.Rejected,
    reviewerName: 'Laura Méndez',
    reviewerComment: 'La foto no muestra el área completa; incluye los vidrios y el piso.',
    reviewedAt: today(9, 50),
  },
  {
    id: 'e-4',
    clientId: 'cl-e-4',
    taskId: 't-3',
    taskTitle: 'Rondín perimetral y bitácora de acceso',
    userId: 'u-c3',
    userName: 'Luis Pérez',
    fileUrl: photoPlaceholder('Bitácora de acceso firmada', 232),
    comment: 'Rondín completo sin incidencias.',
    capturedAtDevice: today(8, 55),
    uploadedAt: today(8, 56),
    reviewStatus: ReviewStatus.Pending,
  },
];

/**
 * Historial simulado de los últimos 6 días (entradas y salidas) para la pantalla de reportes.
 * Los valores se calculan a partir del día y del contratista, para que el reporte sea estable.
 */
function buildHistory(): Attendance[] {
  const crew = [
    { userId: 'u-c1', userName: 'Carlos Ruiz', siteId: 's-1' },
    { userId: 'u-c2', userName: 'Ana Torres', siteId: 's-3' },
    { userId: 'u-c3', userName: 'Luis Pérez', siteId: 's-2' },
  ];
  const history: Attendance[] = [];

  for (let day = 1; day <= 6; day += 1) {
    crew.forEach((member, index) => {
      const site = sites.find((s) => s.id === member.siteId);
      if (!site) return;
      const date = dayjs().subtract(day, 'day');

      [AttendanceType.CheckIn, AttendanceType.CheckOut].forEach((type) => {
        const isCheckIn = type === AttendanceType.CheckIn;
        const outside = isCheckIn && (day + index) % 5 === 0;
        const offline = (day * (index + 1)) % 4 === 3;
        const distance = outside ? 180 + ((day * 37 + index * 53) % 240) : 8 + ((day * 13 + index * 17) % 60);
        const point = offsetCoordinates(site, distance * 0.6, distance * 0.8);
        const time = isCheckIn
          ? date.hour(7).minute(40 + ((day * 7 + index * 11) % 40))
          : date.hour(16).minute((day * 13 + index * 19) % 60);
        const id = `h-${day}-${member.userId}-${type}`;
        const rejected = outside && day % 2 === 0;

        history.push({
          id,
          clientId: `cl-${id}`,
          userId: member.userId,
          userName: member.userName,
          siteId: site.id,
          siteName: site.name,
          type,
          capturedAtDevice: time.second(0).toISOString(),
          receivedAtServer: time
            .add(offline ? 35 : 0, 'minute')
            .second(0)
            .toISOString(),
          latitude: point.latitude,
          longitude: point.longitude,
          accuracyMeters: 6 + ((day + index) % 12),
          distanceMeters: Math.round(distance),
          isMocked: false,
          photoUrl: photoPlaceholder(`${isCheckIn ? 'Entrada' : 'Salida'} · ${site.name}`, 200 + index * 14),
          geofenceStatus: outside ? GeofenceStatus.Outside : GeofenceStatus.Inside,
          syncStatus: offline ? SyncStatus.SyncedFromOffline : SyncStatus.Online,
          requiresReview: outside,
          review: {
            decision: rejected ? ReviewDecision.Rejected : ReviewDecision.Accepted,
            verificationMethod: outside ? VerificationMethod.InPerson : VerificationMethod.AppEvidence,
            comment: rejected ? 'No se encontraba en el sitio.' : undefined,
            reviewerName: 'Laura Méndez',
            reviewedAt: time.add(2, 'hour').toISOString(),
          },
        });
      });
    });
  }
  return history;
}

attendances.push(...buildHistory());

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Role } from '@/types';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(relativeTime);
dayjs.locale('es');

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatTime = (iso: string) => dayjs(iso).format('HH:mm');

export const formatDateTime = (iso: string) => dayjs(iso).format('D MMM, HH:mm');

export const formatRelative = (iso: string) => dayjs(iso).fromNow();

export const formatToday = () => capitalize(dayjs().format('dddd D [de] MMMM'));

export function formatDue(iso?: string): string {
  if (!iso) return 'Sin fecha límite';
  const date = dayjs(iso);
  if (date.isToday()) return `Vence hoy, ${date.format('HH:mm')}`;
  if (date.isTomorrow()) return `Vence mañana, ${date.format('HH:mm')}`;
  if (date.isBefore(dayjs())) return `Venció el ${date.format('D MMM')}`;
  return `Vence el ${date.format('D MMM, HH:mm')}`;
}

export const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const second = parts.length > 1 ? parts[1].charAt(0) : '';
  return (first + second).toUpperCase();
}

export function roleLabel(role: Role): string {
  switch (role) {
    case Role.Admin:
      return 'Administrador';
    case Role.Supervisor:
      return 'Supervisor';
    case Role.Contractor:
      return 'Contratista';
    default:
      return 'Usuario';
  }
}

export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatTime = (iso: string) => dayjs(iso).format('HH:mm');

export const formatDateTime = (iso: string) => dayjs(iso).format('D MMM, HH:mm');

export const formatRelative = (iso: string) => dayjs(iso).fromNow();

export const formatToday = () => capitalize(dayjs().format('dddd D [de] MMMM'));

export function formatDue(iso?: string): string {
  if (!iso) return 'Sin fecha límite';
  const due = dayjs(iso);
  if (due.isSame(dayjs(), 'day')) return `Hoy, ${due.format('HH:mm')}`;
  if (due.isSame(dayjs().add(1, 'day'), 'day')) return `Mañana, ${due.format('HH:mm')}`;
  return capitalize(due.format('ddd D MMM, HH:mm'));
}

export const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

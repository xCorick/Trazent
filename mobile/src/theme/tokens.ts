/** Paleta de Trazent (la misma que el panel web): blanco y azul como colores principales. */
export const colors = {
  blue950: '#071D47',
  blue900: '#0B2E6F',
  blue800: '#1340A0',
  blue700: '#1D4ED8',
  blue500: '#3B82F6',
  blue100: '#DBE7FF',
  blue50: '#EEF4FF',
  white: '#FFFFFF',
  surface: '#F4F7FC',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  success: '#15803D',
  successBg: '#E7F6EC',
  warning: '#B45309',
  warningBg: '#FFF4E0',
  danger: '#B91C1C',
  dangerBg: '#FDECEC',
  grayBg: '#EEF1F5',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12.5,
  small: 14,
  body: 16,
  heading: 18,
  title: 26,
} as const;

/** Tonos para etiquetas y avisos: el color siempre va acompañado de texto. */
export type Tone = 'blue' | 'green' | 'orange' | 'red' | 'gray';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  blue: { fg: colors.blue700, bg: colors.blue50 },
  green: { fg: colors.success, bg: colors.successBg },
  orange: { fg: colors.warning, bg: colors.warningBg },
  red: { fg: colors.danger, bg: colors.dangerBg },
  gray: { fg: colors.muted, bg: colors.grayBg },
};

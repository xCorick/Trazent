import { SymbolView } from 'expo-symbols';
import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { colors } from '@/theme/tokens';

/**
 * Íconos del sistema: SF Symbols en iOS y Material Symbols en Android.
 * Todos los íconos de la app salen de este mapa para que sean consistentes.
 */
export const icons = {
  home: { ios: 'house.fill', android: 'home' },
  camera: { ios: 'camera.fill', android: 'photo_camera' },
  tasks: { ios: 'checklist', android: 'task_alt' },
  profile: { ios: 'person.crop.circle', android: 'account_circle' },
  location: { ios: 'location.fill', android: 'location_on' },
  pin: { ios: 'mappin.and.ellipse', android: 'pin_drop' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  clock: { ios: 'clock', android: 'schedule' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  question: { ios: 'questionmark.circle', android: 'help' },
  cloud: { ios: 'icloud', android: 'cloud_done' },
  cloudOff: { ios: 'icloud.slash', android: 'cloud_off' },
  sync: { ios: 'arrow.triangle.2.circlepath', android: 'sync' },
  upload: { ios: 'arrow.up.circle.fill', android: 'upload' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  user: { ios: 'person.fill', android: 'person' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  trash: { ios: 'trash', android: 'delete' },
  photo: { ios: 'photo', android: 'image' },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = colors.text }: IconProps) {
  const icon = icons[name];
  return (
    <SymbolView name={{ ios: icon.ios, android: icon.android, web: icon.android }} size={size} tintColor={color} />
  );
}

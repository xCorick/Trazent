import { StyleSheet, View } from 'react-native';
import { radius, spacing, toneColors } from '@/theme/tokens';
import type { Tone } from '@/theme/tokens';
import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: IconName;
}

/** Etiqueta de estado: el color siempre va acompañado de texto. */
export function Badge({ label, tone = 'blue', icon }: BadgeProps) {
  const { fg, bg } = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={13} color={fg} />}
      <AppText variant="caption" style={[styles.text, { color: fg }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontWeight: '600' },
});

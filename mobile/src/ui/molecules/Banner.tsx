import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, spacing, toneColors } from '@/theme/tokens';
import type { Tone } from '@/theme/tokens';
import { AppText, Icon } from '../atoms';
import type { IconName } from '../atoms';

interface BannerProps {
  tone: Tone;
  icon: IconName;
  children: string;
  action?: ReactNode;
}

/** Aviso en línea (estado de sincronización, advertencias). */
export function Banner({ tone, icon, children, action }: BannerProps) {
  const { fg, bg } = toneColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Icon name={icon} size={18} color={fg} />
      <AppText variant="small" style={[styles.text, { color: fg }]}>
        {children}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: { flex: 1 },
});

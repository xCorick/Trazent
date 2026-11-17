import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.blue700, fg: colors.white, border: colors.blue700 },
  secondary: { bg: colors.white, fg: colors.blue800, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.blue700, border: 'transparent' },
  danger: { bg: colors.white, fg: colors.danger, border: colors.dangerBg },
  light: { bg: colors.white, fg: colors.blue800, border: colors.white },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  size = 'lg',
}: AppButtonProps) {
  const { bg, fg, border } = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg, borderColor: border },
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={fg} /> : icon && <Icon name={icon} size={18} color={fg} />}
        <AppText variant="label" style={[styles.label, { color: fg }]}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  md: { minHeight: 44 },
  lg: { minHeight: 52 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontSize: fontSize.body },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});

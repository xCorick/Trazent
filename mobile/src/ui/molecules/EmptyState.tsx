import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { AppText, Icon } from '../atoms';
import type { IconName } from '../atoms';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
}

export function EmptyState({ title, description, icon = 'tasks' }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <Icon name={icon} size={32} color={colors.muted} />
      <AppText variant="label">{title}</AppText>
      {description && (
        <AppText variant="small" tone="muted" style={styles.center}>
          {description}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  center: { textAlign: 'center' },
});

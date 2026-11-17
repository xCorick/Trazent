import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import type { Task } from '@/types';
import { AppText, Card, Icon } from '@/ui';
import { formatDue } from '@/utils/format';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <Card onPress={onPress}>
      <View style={styles.head}>
        <TaskStatusBadge status={task.status} />
        <Icon name="chevronRight" size={16} color={colors.muted} />
      </View>
      <AppText variant="label" style={styles.title} numberOfLines={2}>
        {task.title}
      </AppText>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Icon name="pin" size={14} color={colors.blue700} />
          <AppText variant="caption" tone="muted">
            {task.siteName}
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={14} color={colors.blue700} />
          <AppText variant="caption" tone="muted">
            {formatDue(task.dueAt)}
          </AppText>
        </View>
        {task.evidenceCount > 0 && (
          <View style={styles.metaItem}>
            <Icon name="photo" size={14} color={colors.blue700} />
            <AppText variant="caption" tone="muted">
              {task.evidenceCount} {task.evidenceCount === 1 ? 'evidencia' : 'evidencias'}
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

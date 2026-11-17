import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { AttendanceType, SyncStatus } from '@/types';
import type { Attendance } from '@/types';
import { AppText, Icon } from '@/ui';
import { formatDateTime } from '@/utils/format';
import { GeofenceBadge } from './GeofenceBadge';

export function AttendanceHistoryItem({ attendance }: { attendance: Attendance }) {
  const isCheckIn = attendance.type === AttendanceType.CheckIn;
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: isCheckIn ? colors.blue700 : colors.muted }]} />
      <View style={styles.body}>
        <AppText variant="label">
          {isCheckIn ? 'Entrada' : 'Salida'} · {attendance.siteName}
        </AppText>
        <View style={styles.meta}>
          <AppText variant="caption" tone="muted">
            {formatDateTime(attendance.receivedAtServer)}
          </AppText>
          {attendance.syncStatus === SyncStatus.SyncedFromOffline && (
            <Icon name="sync" size={12} color={colors.muted} />
          )}
        </View>
        <GeofenceBadge status={attendance.geofenceStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  body: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

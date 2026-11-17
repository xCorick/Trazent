import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { AttendanceType } from '@/types';
import { AppButton, AppText, Icon } from '@/ui';
import { formatTime, formatToday } from '@/utils/format';
import { useLastMovement } from '../hooks';
import { GeofenceBadge } from './GeofenceBadge';

interface TodayCardProps {
  greeting: string;
  onRegister: () => void;
}

/** Tarjeta principal del inicio: saludo, último registro y botón de asistencia. */
export function TodayCard({ greeting, onRegister }: TodayCardProps) {
  const { isLoading, last, queued, nextType } = useLastMovement();
  const label = nextType === AttendanceType.CheckIn ? 'Registrar entrada' : 'Registrar salida';

  let status: string;
  if (queued) {
    status = `${queued.type === AttendanceType.CheckIn ? 'Entrada' : 'Salida'} guardada a las ${formatTime(queued.capturedAtDevice)}, pendiente de enviar.`;
  } else if (last) {
    status = `${last.type === AttendanceType.CheckIn ? 'Entrada' : 'Salida'} registrada a las ${formatTime(last.receivedAtServer)} · ${last.siteName}`;
  } else {
    status = 'Aún no registras tu entrada.';
  }

  return (
    <View style={styles.card}>
      <AppText variant="caption" style={styles.date}>
        {formatToday()}
      </AppText>
      <AppText variant="title" tone="inverse">
        {greeting}
      </AppText>
      {isLoading ? (
        <ActivityIndicator color={colors.white} style={styles.loader} />
      ) : (
        <View style={styles.status}>
          <Icon name={queued ? 'cloudOff' : 'check'} size={16} color={colors.white} />
          <AppText variant="small" style={styles.statusText}>
            {status}
          </AppText>
        </View>
      )}
      {!queued && last && (
        <View style={styles.badge}>
          <GeofenceBadge status={last.geofenceStatus} distanceMeters={last.distanceMeters} />
        </View>
      )}
      <View style={styles.cta}>
        <AppButton label={label} icon="camera" variant="light" onPress={onRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.blue800 },
  date: { color: 'rgba(255,255,255,0.75)' },
  loader: { alignSelf: 'flex-start' },
  status: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  statusText: { flex: 1, color: 'rgba(255,255,255,0.92)' },
  badge: { marginTop: spacing.xs },
  cta: { marginTop: spacing.sm },
});

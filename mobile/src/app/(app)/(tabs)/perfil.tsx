import { Alert, StyleSheet, Switch, View } from 'react-native';
import { env } from '@/config/env';
import { useSession } from '@/features/auth';
import { useOffline } from '@/offline';
import type { OutboxItem } from '@/offline';
import { colors, spacing } from '@/theme/tokens';
import { AttendanceType } from '@/types';
import { AppButton, AppText, Avatar, Badge, Card, Screen, SectionTitle } from '@/ui';
import { formatDateTime, formatRelative } from '@/utils/format';

function describe(item: OutboxItem): string {
  if (item.kind === 'check-in') return item.payload.type === AttendanceType.CheckIn ? 'Entrada' : 'Salida';
  return 'Evidencia de tarea';
}

export default function ProfileScreen() {
  const { user, logout } = useSession();
  const { online, simulatedOffline, setSimulatedOffline, pending, syncing, lastSyncAt, syncNow, discard } =
    useOffline();

  const confirmLogout = () => {
    const warning =
      pending.length > 0
        ? `Tienes ${pending.length} registro(s) sin enviar. Se quedarán en el teléfono y se enviarán cuando vuelvas a iniciar sesión.`
        : '¿Quieres cerrar tu sesión en este teléfono?';
    Alert.alert('Cerrar sesión', warning, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const confirmDiscard = (item: OutboxItem) =>
    Alert.alert('Descartar registro', 'La API lo rechazó. ¿Quieres borrarlo del teléfono?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => void discard(item.id) },
    ]);

  return (
    <Screen>
      <AppText variant="title">Perfil</AppText>

      {user && (
        <Card style={styles.user}>
          <Avatar name={user.fullName} size={56} />
          <View style={styles.userText}>
            <AppText variant="heading">{user.fullName}</AppText>
            <AppText variant="small" tone="muted">
              {user.email}
            </AppText>
            {user.specialty && <Badge label={user.specialty} tone="blue" />}
          </View>
        </Card>
      )}

      <SectionTitle>Sincronización</SectionTitle>
      <Card>
        <View style={styles.row}>
          <AppText variant="label">Estado</AppText>
          {online ? (
            <Badge label="En línea" tone="green" icon="cloud" />
          ) : (
            <Badge label="Sin conexión" tone="orange" icon="cloudOff" />
          )}
        </View>
        <AppText variant="small" tone="muted">
          {lastSyncAt ? `Última sincronización ${formatRelative(lastSyncAt)}.` : 'Aún no se sincroniza en esta sesión.'}
        </AppText>

        {pending.length === 0 ? (
          <AppText variant="small">No tienes registros pendientes.</AppText>
        ) : (
          pending.map((item) => (
            <View key={item.id} style={styles.pending}>
              <View style={styles.pendingText}>
                <AppText variant="label">{describe(item)}</AppText>
                <AppText variant="caption" tone="muted">
                  Capturado {formatDateTime(item.payload.capturedAtDevice)}
                </AppText>
                {item.lastError && (
                  <AppText variant="caption" tone="danger">
                    Rechazado: {item.lastError}
                  </AppText>
                )}
              </View>
              {item.lastError && (
                <AppButton label="Descartar" variant="danger" size="md" onPress={() => confirmDiscard(item)} />
              )}
            </View>
          ))
        )}
        <AppButton
          label="Sincronizar ahora"
          icon="sync"
          variant="secondary"
          size="md"
          loading={syncing}
          disabled={!online || pending.length === 0}
          onPress={() => void syncNow()}
        />
      </Card>

      {(env.useMocks || __DEV__) && (
        <>
          <SectionTitle>Demostración</SectionTitle>
          <Card>
            <View style={styles.row}>
              <View style={styles.pendingText}>
                <AppText variant="label">Simular sin conexión</AppText>
                <AppText variant="caption" tone="muted">
                  Los registros se guardan en el teléfono hasta que lo desactives.
                </AppText>
              </View>
              <Switch
                value={simulatedOffline}
                onValueChange={setSimulatedOffline}
                trackColor={{ true: colors.blue500, false: colors.border }}
                thumbColor={colors.white}
                accessibilityLabel="Simular sin conexión"
              />
            </View>
          </Card>
        </>
      )}

      <AppButton label="Cerrar sesión" icon="logout" variant="danger" onPress={confirmLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  userText: { flex: 1, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pendingText: { flex: 1, gap: 2 },
});

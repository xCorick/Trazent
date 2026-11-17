import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { env } from '@/config/env';
import { getCurrentPosition } from '@/device/location';
import type { DevicePosition } from '@/device/location';
import { GeofenceBadge, previewGeofence, useCheckIn, useLastMovement, useSites } from '@/features/attendance';
import type { CheckInResult } from '@/features/attendance';
import { useOffline } from '@/offline';
import { errorMessage } from '@/services/apiError';
import { colors, spacing } from '@/theme/tokens';
import { AttendanceType } from '@/types';
import { AppButton, AppText, Banner, Card, Icon, PhotoField, Screen, SectionTitle, SegmentedControl } from '@/ui';
import { formatDistance, formatTime } from '@/utils/format';
import { offsetCoordinates } from '@/utils/geo';
import { newId } from '@/utils/id';

/** Con datos simulados se puede probar la geocerca sin estar en el sitio. */
type LocationMode = 'inside' | 'outside' | 'device';

const locationOptions: { label: string; value: LocationMode }[] = [
  { label: 'Simular dentro', value: 'inside' },
  { label: 'Simular fuera', value: 'outside' },
  { label: 'GPS real', value: 'device' },
];

export default function AttendanceScreen() {
  const { online } = useOffline();
  const sites = useSites();
  const { nextType } = useLastMovement();
  const checkIn = useCheckIn();

  const [typeChoice, setTypeChoice] = useState<AttendanceType | null>(null);
  const [siteChoice, setSiteChoice] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [mode, setMode] = useState<LocationMode>(env.useMocks ? 'inside' : 'device');
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  // Mientras el usuario no elija, se propone lo lógico: entrada o salida según el último registro.
  const type = typeChoice ?? nextType;
  const site = sites.data?.find((s) => s.id === siteChoice) ?? sites.data?.[0];
  const preview = useMemo(() => (site && position ? previewGeofence(site, position) : null), [site, position]);

  const reset = () => {
    setTypeChoice(null);
    setPhoto(null);
    setPosition(null);
    setResult(null);
  };

  const locate = async () => {
    if (!site) return;
    setPosition(null);
    setLocating(true);
    try {
      if (mode === 'device') {
        setPosition(await getCurrentPosition());
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const meters = mode === 'inside' ? site.radiusMeters * 0.3 : site.radiusMeters * 3.5;
        const point = offsetCoordinates(site, meters * 0.6, meters * 0.8);
        setPosition({ ...point, accuracyMeters: mode === 'inside' ? 9 : 14, isMocked: false });
      }
    } catch (error) {
      Alert.alert('Ubicación', errorMessage(error));
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!site || !position || !photo) return;
    try {
      const response = await checkIn.mutateAsync({
        clientId: newId(),
        siteId: site.id,
        type,
        capturedAtDevice: new Date().toISOString(),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracyMeters,
        isMocked: position.isMocked,
        photoUri: photo,
      });
      setResult(response);
    } catch (error) {
      Alert.alert('No se pudo registrar', errorMessage(error));
    }
  };

  if (result) {
    const isCheckIn = type === AttendanceType.CheckIn;
    return (
      <Screen>
        <View style={styles.result}>
          <Icon name={result.queued ? 'cloudOff' : 'check'} size={64} color={colors.blue700} />
          <AppText variant="title" style={styles.center}>
            {isCheckIn ? 'Entrada' : 'Salida'} {result.queued ? 'guardada' : 'registrada'}
          </AppText>
          <AppText tone="muted" style={styles.center}>
            {result.queued
              ? 'Se guardó en el teléfono y se enviará automáticamente al recuperar la señal.'
              : `${result.attendance.siteName} · ${formatTime(result.attendance.receivedAtServer)} (hora del servidor)`}
          </AppText>
          {!result.queued && (
            <GeofenceBadge
              status={result.attendance.geofenceStatus}
              distanceMeters={result.attendance.distanceMeters}
            />
          )}
        </View>
        <AppButton
          label="Volver al inicio"
          onPress={() => {
            reset();
            router.navigate('/');
          }}
        />
      </Screen>
    );
  }

  const ready = Boolean(site && photo && position);

  return (
    <Screen
      footer={
        <AppButton
          label={
            online ? `Registrar ${type === AttendanceType.CheckIn ? 'entrada' : 'salida'}` : 'Guardar sin conexión'
          }
          icon={online ? 'check' : 'cloudOff'}
          disabled={!ready}
          loading={checkIn.isPending}
          onPress={() => void submit()}
        />
      }
    >
      <AppText variant="title">Registrar asistencia</AppText>
      <SegmentedControl
        value={type}
        onChange={setTypeChoice}
        options={[
          { label: 'Entrada', value: AttendanceType.CheckIn },
          { label: 'Salida', value: AttendanceType.CheckOut },
        ]}
      />

      <SectionTitle>1. Sitio de trabajo</SectionTitle>
      {sites.isLoading ? (
        <ActivityIndicator color={colors.blue700} />
      ) : (
        sites.data?.map((item) => (
          <Card
            key={item.id}
            selected={item.id === site?.id}
            onPress={() => {
              setSiteChoice(item.id);
              setPosition(null);
            }}
          >
            <AppText variant="label">{item.name}</AppText>
            {item.address && (
              <AppText variant="caption" tone="muted">
                {item.address} · radio {item.radiusMeters} m
              </AppText>
            )}
          </Card>
        ))
      )}

      <SectionTitle>2. Fotografía</SectionTitle>
      <PhotoField value={photo} onChange={setPhoto} label="Tomar foto de asistencia" facing="front" />

      <SectionTitle>3. Ubicación</SectionTitle>
      {env.useMocks && (
        <SegmentedControl
          value={mode}
          onChange={(value) => {
            setMode(value);
            setPosition(null);
          }}
          options={locationOptions}
        />
      )}
      <AppButton
        label={locating ? 'Obteniendo ubicación…' : position ? 'Volver a obtener ubicación' : 'Obtener mi ubicación'}
        icon="location"
        variant="secondary"
        loading={locating}
        disabled={!site}
        onPress={() => void locate()}
      />
      {preview && position && (
        <Card>
          <GeofenceBadge status={preview.status} />
          <AppText variant="small" tone="muted">
            A {formatDistance(preview.distance)} del sitio (radio {site?.radiusMeters} m)
            {position.accuracyMeters !== undefined ? ` · precisión ±${position.accuracyMeters} m` : ''}
          </AppText>
        </Card>
      )}
      {position?.isMocked && (
        <Banner tone="orange" icon="warning">
          El teléfono reporta una ubicación simulada. El registro se enviará, pero el supervisor lo revisará.
        </Banner>
      )}
      {!ready && (
        <AppText variant="caption" tone="muted" style={styles.center}>
          Elige el sitio, toma la foto y obtén tu ubicación para continuar.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  center: { textAlign: 'center' },
});

import { AimOutlined, CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { App, Button, Result, Segmented, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeofenceTag } from '@/atoms';
import { useConnectivity } from '@/components/mobile';
import { useCheckIn, useMyAttendances } from '@/hooks/useAttendances';
import { useSites } from '@/hooks/useCatalogs';
import { PhotoPicker, SectionTitle } from '@/molecules';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services/apiError';
import { AttendanceType, GeofenceStatus } from '@/types';
import type { Attendance } from '@/types';
import { formatDistance, formatTime } from '@/utils/format';
import { distanceMeters, offsetCoordinates } from '@/utils/geo';
import { newId } from '@/utils/id';

type LocationMode = 'inside' | 'outside' | 'device';

interface Position {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

const locationOptions: { label: string; value: LocationMode }[] = [
  { label: 'Simular dentro', value: 'inside' },
  { label: 'Simular fuera', value: 'outside' },
  { label: 'GPS real', value: 'device' },
];

/** PROTOTIPO MÓVIL · Registro de entrada o salida con foto y ubicación. */
export function MobileAttendanceView() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { offline } = useConnectivity();
  const sites = useSites();
  const myAttendances = useMyAttendances();
  const checkIn = useCheckIn();

  const lastType = myAttendances.data?.[0]?.type;
  const [type, setType] = useState<AttendanceType>(AttendanceType.CheckIn);
  const [siteId, setSiteId] = useState<string>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [mode, setMode] = useState<LocationMode>('inside');
  const [position, setPosition] = useState<Position | null>(null);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<Attendance | null>(null);

  useEffect(() => {
    if (lastType === AttendanceType.CheckIn) setType(AttendanceType.CheckOut);
  }, [lastType]);

  useEffect(() => {
    if (!siteId && sites.data?.length) setSiteId(sites.data[0].id);
  }, [sites.data, siteId]);

  const site = sites.data?.find((s) => s.id === siteId);

  const preview = useMemo(() => {
    if (!site || !position) return null;
    const distance = distanceMeters(site, position);
    const status =
      position.accuracyMeters > site.radiusMeters
        ? GeofenceStatus.Unknown
        : distance <= site.radiusMeters
          ? GeofenceStatus.Inside
          : GeofenceStatus.Outside;
    return { distance, status };
  }, [site, position]);

  const locate = () => {
    if (!site) return;
    setPosition(null);
    setLocating(true);

    if (mode === 'device') {
      if (!('geolocation' in navigator)) {
        message.error('Este dispositivo no permite obtener la ubicación.');
        setLocating(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracyMeters: Math.round(coords.accuracy),
          });
          setLocating(false);
        },
        () => {
          message.warning('Permiso de ubicación denegado. Actívalo o usa una ubicación simulada.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10_000 },
      );
      return;
    }

    // Ubicación simulada para presentar el prototipo sin estar en el sitio.
    window.setTimeout(() => {
      const meters = mode === 'inside' ? site.radiusMeters * 0.3 : site.radiusMeters * 3.5;
      const point = offsetCoordinates(site, meters * 0.6, meters * 0.8);
      setPosition({ ...point, accuracyMeters: mode === 'inside' ? 9 : 14 });
      setLocating(false);
    }, 700);
  };

  const submit = async () => {
    if (!site || !position || !photo) return;
    try {
      const attendance = await checkIn.mutateAsync({
        clientId: newId(),
        siteId: site.id,
        type,
        capturedAtDevice: new Date().toISOString(),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracyMeters,
        isMocked: false,
        photoDataUrl: photo,
        capturedOffline: offline,
      });
      setResult(attendance);
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  if (result) {
    const isCheckIn = result.type === AttendanceType.CheckIn;
    return (
      <div className="tz-m-page">
        <Result
          status="success"
          icon={<CheckCircleFilled className="tz-m-result-icon" />}
          title={`${isCheckIn ? 'Entrada' : 'Salida'} registrada`}
          subTitle={
            offline
              ? 'Se guardó en el teléfono y se enviará automáticamente al recuperar la señal.'
              : `${result.siteName} · ${formatTime(result.receivedAtServer)} (hora del servidor)`
          }
          extra={[
            <div key="tag" className="tz-m-result-tag">
              <GeofenceTag status={result.geofenceStatus} distanceMeters={result.distanceMeters} />
            </div>,
            <Button key="home" type="primary" block size="large" onClick={() => navigate(paths.mobile)}>
              Volver al inicio
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="tz-m-page">
      <h1 className="tz-m-title">Registrar asistencia</h1>

      <Segmented
        block
        size="large"
        value={type}
        onChange={(value) => setType(value as AttendanceType)}
        options={[
          { label: 'Entrada', value: AttendanceType.CheckIn },
          { label: 'Salida', value: AttendanceType.CheckOut },
        ]}
      />

      <SectionTitle>1. Sitio de trabajo</SectionTitle>
      <Select
        size="large"
        value={siteId}
        loading={sites.isLoading}
        onChange={(value: string) => {
          setSiteId(value);
          setPosition(null);
        }}
        options={(sites.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
        className="tz-full"
      />

      <SectionTitle>2. Fotografía</SectionTitle>
      <PhotoPicker
        value={photo}
        onChange={setPhoto}
        label="Tomar foto de asistencia"
        sampleLabel={`Asistencia · ${site?.name ?? 'Sitio'}`}
      />

      <SectionTitle>3. Ubicación</SectionTitle>
      <Segmented
        block
        value={mode}
        onChange={(value) => {
          setMode(value as LocationMode);
          setPosition(null);
        }}
        options={locationOptions}
      />
      <Button
        block
        size="large"
        icon={locating ? <LoadingOutlined /> : <AimOutlined />}
        onClick={locate}
        disabled={locating || !site}
      >
        {locating ? 'Obteniendo ubicación…' : position ? 'Volver a obtener ubicación' : 'Obtener mi ubicación'}
      </Button>
      {preview && position && (
        <div className="tz-m-location">
          <GeofenceTag status={preview.status} />
          <span>
            A {formatDistance(preview.distance)} del sitio (radio {site?.radiusMeters} m) · precisión ±
            {position.accuracyMeters} m
          </span>
        </div>
      )}

      <Button
        type="primary"
        size="large"
        block
        className="tz-m-submit"
        disabled={!photo || !position}
        loading={checkIn.isPending}
        onClick={() => void submit()}
      >
        {offline ? 'Guardar sin conexión' : `Registrar ${type === AttendanceType.CheckIn ? 'entrada' : 'salida'}`}
      </Button>
      {(!photo || !position) && <p className="tz-m-hint">Toma la foto y obtén tu ubicación para continuar.</p>}
    </div>
  );
}

import {
  CheckCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  LoginOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Row, Select } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { AttendanceReportTable } from '@/components';
import { useContractors, useSites } from '@/features/catalogs';
import { useAttendanceReport } from '@/features/reports';
import { PageHeader, StatCard } from '@/molecules';
import { AttendanceType, GeofenceStatus, ReviewDecision, SyncStatus } from '@/types';
import type { Attendance, AttendanceReportQuery } from '@/types';
import { downloadCsv, toCsv } from '@/utils/csv';

const DATE_FORMAT = 'YYYY-MM-DD';

const geofenceLabel: Record<GeofenceStatus, string> = {
  [GeofenceStatus.Inside]: 'Dentro',
  [GeofenceStatus.Outside]: 'Fuera',
  [GeofenceStatus.Unknown]: 'Poco precisa',
};

function reviewLabel(row: Attendance): string {
  if (row.review) return row.review.decision === ReviewDecision.Accepted ? 'Aceptada' : 'Rechazada';
  return row.requiresReview ? 'Por revisar' : '';
}

function exportRows(rows: Attendance[], from: string, to: string) {
  const csv = toCsv([
    [
      'Fecha',
      'Hora servidor',
      'Hora dispositivo',
      'Contratista',
      'Sitio',
      'Tipo',
      'Geocerca',
      'Distancia (m)',
      'Sin conexión',
      'Revisión',
    ],
    ...rows.map((row) => [
      dayjs(row.receivedAtServer).format('DD/MM/YYYY'),
      dayjs(row.receivedAtServer).format('HH:mm'),
      dayjs(row.capturedAtDevice).format('HH:mm'),
      row.userName,
      row.siteName,
      row.type === AttendanceType.CheckIn ? 'Entrada' : 'Salida',
      geofenceLabel[row.geofenceStatus],
      Math.round(row.distanceMeters),
      row.syncStatus === SyncStatus.SyncedFromOffline ? 'Sí' : 'No',
      reviewLabel(row),
    ]),
  ]);
  downloadCsv(`asistencias_${from}_${to}.csv`, csv);
}

/** Reporte de asistencias por rango de fechas, sitio y contratista. */
export function ReportsView() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [dayjs().subtract(6, 'day'), dayjs()]);
  const [siteId, setSiteId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const sites = useSites();
  const contractors = useContractors();

  const query = useMemo<AttendanceReportQuery>(
    () => ({ from: range[0].format(DATE_FORMAT), to: range[1].format(DATE_FORMAT), siteId, userId }),
    [range, siteId, userId],
  );
  const report = useAttendanceReport(query);
  const rows = useMemo(() => report.data ?? [], [report.data]);

  const stats = useMemo(() => {
    const checkIns = rows.filter((row) => row.type === AttendanceType.CheckIn).length;
    const outside = rows.filter((row) => row.geofenceStatus !== GeofenceStatus.Inside).length;
    const pending = rows.filter((row) => row.requiresReview && !row.review).length;
    const insideRate = rows.length ? Math.round(((rows.length - outside) / rows.length) * 100) : 0;
    return { checkIns, outside, pending, insideRate };
  }, [rows]);

  return (
    <div className="tz-page">
      <PageHeader
        title="Reportes"
        subtitle="Asistencias registradas por los contratistas, con su validación de ubicación."
        extra={
          <Button
            icon={<DownloadOutlined />}
            disabled={rows.length === 0}
            onClick={() => exportRows(rows, query.from, query.to)}
          >
            Exportar CSV
          </Button>
        }
      />

      <Card className="tz-card">
        <div className="tz-filters">
          <DatePicker.RangePicker
            value={range}
            format="DD/MM/YYYY"
            allowClear={false}
            disabledDate={(date) => date.isAfter(dayjs(), 'day')}
            presets={[
              { label: 'Hoy', value: [dayjs(), dayjs()] },
              { label: 'Últimos 7 días', value: [dayjs().subtract(6, 'day'), dayjs()] },
              { label: 'Este mes', value: [dayjs().startOf('month'), dayjs()] },
            ]}
            onChange={(value) => {
              if (value?.[0] && value[1]) setRange([value[0], value[1]]);
            }}
          />
          <Select
            allowClear
            placeholder="Todos los sitios"
            value={siteId}
            onChange={setSiteId}
            loading={sites.isLoading}
            options={(sites.data ?? []).map((site) => ({ value: site.id, label: site.name }))}
            className="tz-filters__select"
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Todos los contratistas"
            value={userId}
            onChange={setUserId}
            loading={contractors.isLoading}
            options={(contractors.data ?? []).map((user) => ({ value: user.id, label: user.fullName }))}
            className="tz-filters__select"
          />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<LoginOutlined />}
            label="Entradas"
            value={stats.checkIns}
            hint={`${rows.length} registros en total`}
            loading={report.isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            tone="green"
            label="Dentro de geocerca"
            value={`${stats.insideRate}%`}
            loading={report.isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<EnvironmentOutlined />}
            tone="orange"
            label="Fuera o poco precisas"
            value={stats.outside}
            loading={report.isLoading}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<WarningOutlined />}
            tone="red"
            label="Por revisar"
            value={stats.pending}
            loading={report.isLoading}
          />
        </Col>
      </Row>

      <Card className="tz-card">
        <AttendanceReportTable rows={rows} loading={report.isFetching} />
      </Card>
    </div>
  );
}

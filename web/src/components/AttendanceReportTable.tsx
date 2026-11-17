import { CloudSyncOutlined } from '@ant-design/icons';
import { Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { GeofenceTag, StatusTag } from '@/atoms';
import { EmptyState } from '@/molecules';
import { AttendanceType, ReviewDecision, SyncStatus } from '@/types';
import type { Attendance } from '@/types';
import { formatDistance } from '@/utils/format';

interface AttendanceReportTableProps {
  rows: Attendance[];
  loading: boolean;
}

const columns: TableColumnsType<Attendance> = [
  {
    title: 'Fecha',
    dataIndex: 'receivedAtServer',
    width: 120,
    render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
  },
  {
    title: 'Hora (servidor)',
    dataIndex: 'receivedAtServer',
    key: 'time',
    width: 130,
    render: (value: string, row) => (
      <span className="tz-cell-time">
        {dayjs(value).format('HH:mm')}
        {row.syncStatus === SyncStatus.SyncedFromOffline && (
          <Tooltip title={`Capturada sin conexión a las ${dayjs(row.capturedAtDevice).format('HH:mm')}`}>
            <CloudSyncOutlined className="tz-muted" />
          </Tooltip>
        )}
      </span>
    ),
  },
  { title: 'Contratista', dataIndex: 'userName', width: 170 },
  { title: 'Sitio', dataIndex: 'siteName', width: 150 },
  {
    title: 'Tipo',
    dataIndex: 'type',
    width: 100,
    render: (type: AttendanceType) => (type === AttendanceType.CheckIn ? 'Entrada' : 'Salida'),
  },
  {
    title: 'Geocerca',
    dataIndex: 'geofenceStatus',
    width: 190,
    render: (_, row) => <GeofenceTag status={row.geofenceStatus} />,
  },
  {
    title: 'Distancia',
    dataIndex: 'distanceMeters',
    width: 110,
    align: 'right',
    render: (value: number) => formatDistance(value),
  },
  {
    title: 'Revisión',
    key: 'review',
    width: 130,
    render: (_, row) =>
      row.review ? (
        row.review.decision === ReviewDecision.Accepted ? (
          <StatusTag tone="blue">Aceptada</StatusTag>
        ) : (
          <StatusTag tone="red">Rechazada</StatusTag>
        )
      ) : row.requiresReview ? (
        <StatusTag tone="orange">Por revisar</StatusTag>
      ) : (
        <span className="tz-muted">—</span>
      ),
  },
];

export function AttendanceReportTable({ rows, loading }: AttendanceReportTableProps) {
  return (
    <Table<Attendance>
      rowKey="id"
      columns={columns}
      dataSource={rows}
      loading={loading}
      size="middle"
      pagination={{ pageSize: 12, hideOnSinglePage: true, showSizeChanger: false }}
      scroll={{ x: 1100 }}
      className="tz-table"
      locale={{ emptyText: <EmptyState title="Sin registros" description="No hay asistencias con estos filtros." /> }}
    />
  );
}

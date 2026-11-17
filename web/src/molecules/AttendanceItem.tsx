import { CloudSyncOutlined, LoginOutlined, LogoutOutlined, WarningOutlined } from '@ant-design/icons';
import { GeofenceTag, StatusTag, UserAvatar } from '@/atoms';
import { AttendanceType, ReviewDecision, SyncStatus } from '@/types';
import type { Attendance } from '@/types';
import { formatTime } from '@/utils/format';

interface AttendanceItemProps {
  attendance: Attendance;
  /** En la app móvil no se muestra el nombre (es el propio contratista). */
  showUser?: boolean;
}

export function AttendanceItem({ attendance, showUser = true }: AttendanceItemProps) {
  const isCheckIn = attendance.type === AttendanceType.CheckIn;

  return (
    <div className="tz-attendance">
      <img
        className="tz-attendance__photo"
        src={attendance.photoUrl}
        alt={`Foto de ${attendance.userName}`}
        loading="lazy"
      />
      <div className="tz-attendance__body">
        <div className="tz-attendance__head">
          {showUser && <UserAvatar name={attendance.userName} size={24} />}
          <span className="tz-attendance__name">{showUser ? attendance.userName : attendance.siteName}</span>
          <span className="tz-attendance__time">
            {isCheckIn ? <LoginOutlined /> : <LogoutOutlined />} {isCheckIn ? 'Entrada' : 'Salida'} ·{' '}
            {formatTime(attendance.receivedAtServer)}
          </span>
        </div>
        {showUser && <div className="tz-attendance__site">{attendance.siteName}</div>}
        <div className="tz-attendance__tags">
          <GeofenceTag status={attendance.geofenceStatus} distanceMeters={attendance.distanceMeters} />
          {attendance.isMocked && (
            <StatusTag tone="red" icon={<WarningOutlined />}>
              Ubicación falsificada
            </StatusTag>
          )}
          {attendance.syncStatus === SyncStatus.SyncedFromOffline && (
            <StatusTag tone="gray" icon={<CloudSyncOutlined />}>
              Capturada sin conexión
            </StatusTag>
          )}
          {attendance.review ? (
            attendance.review.decision === ReviewDecision.Accepted ? (
              <StatusTag tone="blue">Aceptada</StatusTag>
            ) : (
              <StatusTag tone="red">Rechazada</StatusTag>
            )
          ) : (
            attendance.requiresReview && <StatusTag tone="orange">Requiere revisión</StatusTag>
          )}
        </div>
      </div>
    </div>
  );
}

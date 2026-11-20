import {
  CarryOutOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Row, Skeleton } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EvidenceReviewModal } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useTodayAttendances } from '@/features/attendance';
import { useDashboardSummary } from '@/features/dashboard';
import { useEvidences, useReviewEvidence } from '@/features/evidences';
import { AttendanceItem, EmptyState, EvidenceCard, PageHeader, SectionTitle, StatCard } from '@/molecules';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services/apiError';
import { ReviewStatus } from '@/types';
import type { Evidence } from '@/types';
import { firstName, formatToday } from '@/utils/format';

export function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const summary = useDashboardSummary();
  const attendances = useTodayAttendances();
  const pending = useEvidences({ status: ReviewStatus.Pending });
  const review = useReviewEvidence();
  const [selected, setSelected] = useState<Evidence | null>(null);

  const stats = summary.data;

  const handleReview = async (approve: boolean, comment?: string) => {
    if (!selected) return;
    try {
      await review.mutateAsync({ evidenceId: selected.id, approve, comment });
      message.success(approve ? 'Evidencia aprobada.' : 'Evidencia rechazada; se notificó al contratista.');
      setSelected(null);
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  return (
    <div className="tz-page">
      <PageHeader
        title={`Hola, ${user ? firstName(user.fullName) : ''}`}
        subtitle={`${formatToday()} · Resumen de hoy`}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<TeamOutlined />}
            label="Asistencias de hoy"
            value={stats?.attendancesToday}
            hint={stats ? `${stats.insideGeofence} dentro de geocerca` : undefined}
            loading={summary.isLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<EnvironmentOutlined />}
            tone="orange"
            label="Requieren revisión"
            value={stats?.requiresReview}
            hint="Fuera de geocerca o ubicación dudosa"
            loading={summary.isLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<PictureOutlined />}
            label="Evidencias por revisar"
            value={stats?.pendingEvidences}
            hint="Aprueba o rechaza con comentario"
            loading={summary.isLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CarryOutOutlined />}
            tone="green"
            label="Tareas activas"
            value={stats?.activeTasks}
            hint="Pendientes y en progreso"
            loading={summary.isLoading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="tz-section">
        <Col xs={24} xl={14}>
          <Card className="tz-card">
            <SectionTitle
              action={
                <span className="tz-muted">
                  <ClockCircleOutlined /> Tiempo real
                </span>
              }
            >
              Asistencias de hoy
            </SectionTitle>
            {attendances.isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : attendances.data && attendances.data.length > 0 ? (
              <div className="tz-list">
                {attendances.data.map((attendance) => (
                  <AttendanceItem key={attendance.id} attendance={attendance} />
                ))}
              </div>
            ) : (
              <EmptyState title="Sin registros todavía" description="Las asistencias aparecerán aquí al registrarse." />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="tz-card">
            <SectionTitle
              action={
                <Button type="link" onClick={() => navigate(paths.panelEvidences)}>
                  Ver todas
                </Button>
              }
            >
              Evidencias por revisar
            </SectionTitle>
            {pending.isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : pending.data && pending.data.length > 0 ? (
              <div className="tz-evidence-grid tz-evidence-grid--compact">
                {pending.data.slice(0, 4).map((evidence) => (
                  <EvidenceCard key={evidence.id} evidence={evidence} onClick={() => setSelected(evidence)} />
                ))}
              </div>
            ) : (
              <EmptyState title="Todo revisado" description="No hay evidencias pendientes." />
            )}
          </Card>
        </Col>
      </Row>

      <EvidenceReviewModal
        evidence={selected}
        loading={review.isPending}
        onClose={() => setSelected(null)}
        onReview={handleReview}
      />
    </div>
  );
}

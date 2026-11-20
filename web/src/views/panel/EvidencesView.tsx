import { App, Card, Segmented, Skeleton } from 'antd';
import { useState } from 'react';
import { EvidenceReviewModal } from '@/components';
import { useEvidences, useReviewEvidence } from '@/features/evidences';
import { EmptyState, EvidenceCard, PageHeader } from '@/molecules';
import { errorMessage } from '@/services/apiError';
import { ReviewStatus } from '@/types';
import type { Evidence } from '@/types';

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

const filterOptions: { label: string; value: Filter }[] = [
  { label: 'Por revisar', value: 'pending' },
  { label: 'Aprobadas', value: 'approved' },
  { label: 'Rechazadas', value: 'rejected' },
  { label: 'Todas', value: 'all' },
];

const statusByFilter: Record<Filter, ReviewStatus | undefined> = {
  pending: ReviewStatus.Pending,
  approved: ReviewStatus.Approved,
  rejected: ReviewStatus.Rejected,
  all: undefined,
};

export function EvidencesView() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState<Filter>('pending');
  const [selected, setSelected] = useState<Evidence | null>(null);
  const evidences = useEvidences({ status: statusByFilter[filter] });
  const review = useReviewEvidence();

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
      <PageHeader title="Evidencias" subtitle="Revisa las fotos que entregan los contratistas en cada tarea." />

      <Card className="tz-card">
        <div className="tz-toolbar">
          <Segmented options={filterOptions} value={filter} onChange={(value) => setFilter(value as Filter)} />
        </div>
        {evidences.isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : evidences.data && evidences.data.length > 0 ? (
          <div className="tz-evidence-grid">
            {evidences.data.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} onClick={() => setSelected(evidence)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No hay evidencias" description="Cambia el filtro para ver otras evidencias." />
        )}
      </Card>

      <EvidenceReviewModal
        evidence={selected}
        loading={review.isPending}
        onClose={() => setSelected(null)}
        onReview={handleReview}
      />
    </div>
  );
}
